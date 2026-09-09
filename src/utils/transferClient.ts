/**
 * PureDrop - Lossless Encrypted Media Transfer
 * Transfer Client: WebRTC DataChannel (P2P) + WebSocket Fallback Relay
 * Zero-Knowledge & Lossless Integrity Verification
 */

import {
  EncryptedChunkPayload,
  PeerInfo,
  ProtocolType,
  TransferHeader,
  TransferProgress,
} from '../types';
import {
  bufferToBase64,
  base64ToBytes,
  bufferToHex,
  hexToBytes,
  calculateSha256,
  decryptChunk,
  encryptChunk,
} from './crypto';
import { assembleChunksToBlob } from './fileUtils';

export interface TransferClientCallbacks {
  onPeersUpdated?: (peers: PeerInfo[]) => void;
  onIncomingHeader?: (header: TransferHeader) => void;
  onProgress?: (progress: TransferProgress) => void;
  onTransferCompleted?: (blob: Blob, header: TransferHeader, verified: boolean) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: string) => void;
}

export class PureDropClient {
  public peerId: string;
  public roomId: string | null = null;
  public deviceName: string;
  public isSender: boolean;
  public preferP2P: boolean = true;
  public chunkSize: number = 128 * 1024; // 128 KB chunks

  private ws: WebSocket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private isDataChannelOpen: boolean = false;
  private currentKey: CryptoKey | null = null;

  // Active incoming transfer state
  private incomingHeader: TransferHeader | null = null;
  private receivedChunks: Map<number, ArrayBuffer> = new Map();
  private incomingBytesReceived: number = 0;
  private transferStartTime: number = 0;
  private lastProgressUpdate: number = 0;

  // Active outgoing transfer state
  private isTransferring: boolean = false;
  private cancelRequested: boolean = false;

  private callbacks: TransferClientCallbacks = {};

  constructor(
    peerId: string,
    deviceName: string,
    isSender: boolean,
    callbacks: TransferClientCallbacks = {}
  ) {
    this.peerId = peerId;
    this.deviceName = deviceName;
    this.isSender = isSender;
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: TransferClientCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setEncryptionKey(key: CryptoKey) {
    this.currentKey = key;
  }

  /**
   * Connect to WebSocket Signaling / Relay server
   */
  public connect(roomId: string): Promise<void> {
    this.roomId = roomId;
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.ws?.send(
            JSON.stringify({
              type: 'join-room',
              roomId: this.roomId,
              peerId: this.peerId,
              deviceName: this.deviceName,
              isSender: this.isSender,
            })
          );
          resolve();
        };

        this.ws.onmessage = async (event) => {
          await this.handleWsMessage(event.data);
        };

        this.ws.onerror = (err) => {
          console.warn('WebSocket connection notice:', err);
          this.callbacks.onError?.('خطأ في الاتصال بخادم الإشارات. جاري إعادة المحاولة...');
        };

        this.ws.onclose = () => {
          this.callbacks.onStatusChange?.('تم قطع الاتصال');
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * WebRTC P2P initialization
   */
  public async initP2P(targetPeerId: string, isInitiator: boolean): Promise<void> {
    if (!this.preferP2P) return;

    try {
      const config: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };

      this.peerConnection = new RTCPeerConnection(config);

      this.peerConnection.onicecandidate = (e) => {
        if (e.candidate && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: 'signal',
              roomId: this.roomId,
              targetPeerId,
              fromPeerId: this.peerId,
              signalData: { candidate: e.candidate },
            })
          );
        }
      };

      if (isInitiator) {
        // Create reliable DataChannel
        this.dataChannel = this.peerConnection.createDataChannel('puredrop-lossless', {
          ordered: true,
        });
        this.setupDataChannel(this.dataChannel);

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.ws?.send(
          JSON.stringify({
            type: 'signal',
            roomId: this.roomId,
            targetPeerId,
            fromPeerId: this.peerId,
            signalData: { sdp: this.peerConnection.localDescription },
          })
        );
      } else {
        this.peerConnection.ondatachannel = (e) => {
          this.dataChannel = e.channel;
          this.setupDataChannel(this.dataChannel);
        };
      }
    } catch (err) {
      console.warn('WebRTC P2P setup warning (falling back to encrypted relay):', err);
    }
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.binaryType = 'arraybuffer';
    channel.onopen = () => {
      this.isDataChannelOpen = true;
      this.callbacks.onStatusChange?.('متصل مباشر P2P (WebRTC)');
    };
    channel.onclose = () => {
      this.isDataChannelOpen = false;
    };
    channel.onmessage = async (e) => {
      if (typeof e.data === 'string') {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === 'transfer-header') {
            this.handleIncomingHeader(parsed.header);
          } else if (parsed.type === 'encrypted-chunk') {
            await this.handleIncomingChunk(parsed.chunk);
          }
        } catch (err) {
          console.error('DataChannel JSON parse error:', err);
        }
      }
    };
  }

  private async handleWsMessage(raw: string) {
    try {
      const msg = JSON.parse(raw);

      switch (msg.type) {
        case 'room-peers': {
          const peers = (msg.peers as PeerInfo[]).filter((p) => p.peerId !== this.peerId);
          this.callbacks.onPeersUpdated?.(peers);

          // If we are sender and a receiver just joined, optionally initiate P2P
          if (this.isSender && peers.length > 0 && !this.peerConnection) {
            const firstReceiver = peers.find((p) => !p.isSender);
            if (firstReceiver) {
              await this.initP2P(firstReceiver.peerId, true);
            }
          }
          break;
        }

        case 'peer-left': {
          this.callbacks.onStatusChange?.('غادر الطرف الآخر الغرفة');
          break;
        }

        case 'signal': {
          const { signalData, fromPeerId } = msg;
          if (!this.peerConnection) {
            await this.initP2P(fromPeerId, false);
          }
          if (signalData.sdp) {
            await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
            if (signalData.sdp.type === 'offer') {
              const answer = await this.peerConnection?.createAnswer();
              if (answer) {
                await this.peerConnection?.setLocalDescription(answer);
                this.ws?.send(
                  JSON.stringify({
                    type: 'signal',
                    roomId: this.roomId,
                    targetPeerId: fromPeerId,
                    fromPeerId: this.peerId,
                    signalData: { sdp: this.peerConnection?.localDescription },
                  })
                );
              }
            }
          } else if (signalData.candidate) {
            await this.peerConnection?.addIceCandidate(new RTCIceCandidate(signalData.candidate));
          }
          break;
        }

        case 'transfer-control': {
          const { controlData } = msg;
          if (controlData.action === 'header') {
            this.handleIncomingHeader(controlData.header);
          } else if (controlData.action === 'cancel') {
            this.callbacks.onError?.('تم إلغاء النقل من قبل الطرف الآخر');
          }
          break;
        }

        case 'relay-chunk': {
          await this.handleIncomingChunk(msg.chunkPacket);
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('WS message handling error:', err);
    }
  }

  private handleIncomingHeader(header: TransferHeader) {
    this.incomingHeader = header;
    this.receivedChunks.clear();
    this.incomingBytesReceived = 0;
    this.transferStartTime = Date.now();
    this.lastProgressUpdate = Date.now();

    this.callbacks.onIncomingHeader?.(header);
    this.callbacks.onProgress?.({
      transferId: header.transferId,
      fileName: header.fileName,
      fileSize: header.fileSize,
      mimeType: header.mimeType,
      status: 'transferring',
      statusText: 'جاري استلام الحزم وتفكيك التشفير AES-256-GCM...',
      progressPercent: 0,
      currentChunk: 0,
      totalChunks: header.totalChunks,
      bytesTransferred: 0,
      speedBps: 0,
      speedMbps: 0,
      elapsedSeconds: 0,
      etaSeconds: 0,
      protocol: this.isDataChannelOpen ? 'webrtc-direct' : 'websocket-relay',
      originalSha256: header.originalSha256,
    });
  }

  private async handleIncomingChunk(chunkPayload: EncryptedChunkPayload) {
    if (!this.incomingHeader || !this.currentKey) return;

    try {
      const iv = hexToBytes(chunkPayload.ivHex);
      const ciphertextBytes = base64ToBytes(chunkPayload.encryptedBase64);

      // Decrypt chunk on the fly
      const decryptedBuffer = await decryptChunk(ciphertextBytes.buffer, this.currentKey, iv);

      this.receivedChunks.set(chunkPayload.chunkIndex, decryptedBuffer);
      this.incomingBytesReceived += decryptedBuffer.byteLength;

      const now = Date.now();
      const elapsed = Math.max(0.1, (now - this.transferStartTime) / 1000);
      const speedBps = this.incomingBytesReceived / elapsed;
      const speedMbps = (speedBps * 8) / (1000 * 1000);
      const remainingBytes = Math.max(0, this.incomingHeader.fileSize - this.incomingBytesReceived);
      const etaSeconds = speedBps > 0 ? remainingBytes / speedBps : 0;
      const percent = Math.min(
        100,
        Math.round((this.receivedChunks.size / this.incomingHeader.totalChunks) * 100)
      );

      // Throttle UI update slightly for peak 60fps performance
      if (now - this.lastProgressUpdate > 60 || this.receivedChunks.size === this.incomingHeader.totalChunks) {
        this.lastProgressUpdate = now;
        this.callbacks.onProgress?.({
          transferId: this.incomingHeader.transferId,
          fileName: this.incomingHeader.fileName,
          fileSize: this.incomingHeader.fileSize,
          mimeType: this.incomingHeader.mimeType,
          status: this.receivedChunks.size === this.incomingHeader.totalChunks ? 'verifying' : 'transferring',
          statusText:
            this.receivedChunks.size === this.incomingHeader.totalChunks
              ? 'التحقق الرياضي من مطابقة البايتات SHA-256...'
              : `استلام الحزمة ${this.receivedChunks.size} من ${this.incomingHeader.totalChunks}`,
          progressPercent: percent,
          currentChunk: this.receivedChunks.size,
          totalChunks: this.incomingHeader.totalChunks,
          bytesTransferred: this.incomingBytesReceived,
          speedBps,
          speedMbps,
          elapsedSeconds: elapsed,
          etaSeconds,
          protocol: this.isDataChannelOpen ? 'webrtc-direct' : 'websocket-relay',
          originalSha256: this.incomingHeader.originalSha256,
        });
      }

      // If all chunks received, assemble and verify bit-for-bit lossless integrity
      if (this.receivedChunks.size === this.incomingHeader.totalChunks) {
        const sortedBuffers: ArrayBuffer[] = [];
        for (let i = 0; i < this.incomingHeader.totalChunks; i++) {
          const buf = this.receivedChunks.get(i);
          if (buf) sortedBuffers.push(buf);
        }

        const assembledBlob = assembleChunksToBlob(sortedBuffers, this.incomingHeader.mimeType);

        // Verification step: calculate SHA-256 on the decrypted assembled binary blob
        const assembledArrayBuffer = await assembledBlob.arrayBuffer();
        const receivedSha256 = await calculateSha256(assembledArrayBuffer);

        const verified = receivedSha256.toLowerCase() === this.incomingHeader.originalSha256.toLowerCase();

        this.callbacks.onProgress?.({
          transferId: this.incomingHeader.transferId,
          fileName: this.incomingHeader.fileName,
          fileSize: this.incomingHeader.fileSize,
          mimeType: this.incomingHeader.mimeType,
          status: 'completed',
          statusText: verified
            ? 'اكتمل النقل بنجاح! تم تأكيد التطابق التام للبايتات 100% (Lossless SHA-256 Match)'
            : 'تحذير: عدم تطابق تجزئة التشفير للملف',
          progressPercent: 100,
          currentChunk: this.incomingHeader.totalChunks,
          totalChunks: this.incomingHeader.totalChunks,
          bytesTransferred: this.incomingHeader.fileSize,
          speedBps,
          speedMbps,
          elapsedSeconds: elapsed,
          etaSeconds: 0,
          protocol: this.isDataChannelOpen ? 'webrtc-direct' : 'websocket-relay',
          originalSha256: this.incomingHeader.originalSha256,
          receivedSha256,
          verifiedLossless: verified,
          downloadBlob: assembledBlob,
        });

        this.callbacks.onTransferCompleted?.(assembledBlob, this.incomingHeader, verified);
      }
    } catch (err) {
      console.error('Error processing received chunk:', err);
      this.callbacks.onError?.('خطأ في فك تشفير حزمة البيانات المستلمة');
    }
  }

  /**
   * Send a File with Zero-Loss guarantee and AES-256-GCM encryption
   */
  public async sendFile(
    file: File,
    originalSha256: string,
    width?: number,
    height?: number,
    duration?: number
  ): Promise<void> {
    if (!this.currentKey) {
      throw new Error('مفتاح التشفير غير جاهز. يرجى التأكد من كلمة المرور أو رمز الغرفة');
    }

    this.isTransferring = true;
    this.cancelRequested = false;

    const transferId = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const fileSize = file.size;
    const totalChunks = Math.ceil(fileSize / this.chunkSize);

    const header: TransferHeader = {
      transferId,
      fileName: file.name,
      fileSize,
      mimeType: file.type || 'application/octet-stream',
      width,
      height,
      duration,
      originalSha256,
      totalChunks,
      chunkSize: this.chunkSize,
      senderDevice: this.deviceName,
      saltHex: '',
      timestamp: Date.now(),
    };

    // 1. Broadcast Header to Receiver
    if (this.isDataChannelOpen && this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({ type: 'transfer-header', header }));
    } else if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'transfer-control',
          roomId: this.roomId,
          controlData: { action: 'header', header },
        })
      );
    }

    // 2. Stream & Encrypt Chunks
    const startTime = Date.now();
    let bytesSent = 0;
    const fileBuffer = await file.arrayBuffer();

    for (let i = 0; i < totalChunks; i++) {
      if (this.cancelRequested) {
        this.isTransferring = false;
        return;
      }

      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, fileSize);
      const rawChunk = fileBuffer.slice(start, end);

      // Encrypt chunk using AES-256-GCM
      const { ciphertext, iv } = await encryptChunk(rawChunk, this.currentKey);

      const chunkPayload: EncryptedChunkPayload = {
        transferId,
        chunkIndex: i,
        totalChunks,
        encryptedBase64: bufferToBase64(ciphertext),
        ivHex: bufferToHex(iv),
      };

      // Send chunk via DataChannel or WebSocket Relay
      if (this.isDataChannelOpen && this.dataChannel?.readyState === 'open') {
        // Backpressure flow control for DataChannel
        while (this.dataChannel.bufferedAmount > 2 * 1024 * 1024) {
          await new Promise((r) => setTimeout(r, 20));
        }
        this.dataChannel.send(JSON.stringify({ type: 'encrypted-chunk', chunk: chunkPayload }));
      } else if (this.ws?.readyState === WebSocket.OPEN) {
        // Backpressure check for WebSocket
        while (this.ws.bufferedAmount > 2 * 1024 * 1024) {
          await new Promise((r) => setTimeout(r, 20));
        }
        this.ws.send(
          JSON.stringify({
            type: 'relay-chunk',
            roomId: this.roomId,
            chunkPacket: chunkPayload,
          })
        );
      }

      bytesSent += rawChunk.byteLength;

      const now = Date.now();
      const elapsed = Math.max(0.1, (now - startTime) / 1000);
      const speedBps = bytesSent / elapsed;
      const speedMbps = (speedBps * 8) / (1000 * 1000);
      const remainingBytes = Math.max(0, fileSize - bytesSent);
      const etaSeconds = speedBps > 0 ? remainingBytes / speedBps : 0;
      const percent = Math.min(100, Math.round(((i + 1) / totalChunks) * 100));

      this.callbacks.onProgress?.({
        transferId,
        fileName: file.name,
        fileSize,
        mimeType: file.type,
        status: i + 1 === totalChunks ? 'completed' : 'transferring',
        statusText:
          i + 1 === totalChunks
            ? 'تم إرسال جميع البايتات المشفرة بنجاح!'
            : `إرسال مشفر: حزمة ${i + 1} من ${totalChunks}`,
        progressPercent: percent,
        currentChunk: i + 1,
        totalChunks,
        bytesTransferred: bytesSent,
        speedBps,
        speedMbps,
        elapsedSeconds: elapsed,
        etaSeconds,
        protocol: this.isDataChannelOpen ? 'webrtc-direct' : 'websocket-relay',
        originalSha256,
      });

      // Small tick yielding to prevent blocking UI render loop
      if (i % 3 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 8));
      }
    }

    this.isTransferring = false;
  }

  public cancelTransfer() {
    this.cancelRequested = true;
    this.isTransferring = false;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'transfer-control',
          roomId: this.roomId,
          controlData: { action: 'cancel' },
        })
      );
    }
  }

  public disconnect() {
    this.cancelTransfer();
    try {
      this.dataChannel?.close();
      this.peerConnection?.close();
      this.ws?.close();
    } catch {
      // ignore
    }
    this.dataChannel = null;
    this.peerConnection = null;
    this.ws = null;
  }
}
