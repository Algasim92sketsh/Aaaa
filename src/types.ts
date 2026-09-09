/**
 * PureDrop - Lossless Encrypted Media Transfer
 * TypeScript Types & Interfaces
 */

export type ProtocolType = 'webrtc-direct' | 'websocket-relay' | 'hotspot-direct' | 'wifi-lan' | 'remote-internet';

export type TransferChannel = 'local' | 'remote';

export type NetworkTransferMode = 'auto' | 'hotspot' | 'wifi-lan' | 'webrtc-p2p';

export interface BatchFileItem {
  id: string;
  file: File;
  metadata: FileMetadata;
  status: 'pending' | 'encrypting' | 'transferring' | 'completed' | 'error';
  progress: number;
}

export type TransferStatus =
  | 'idle'
  | 'preparing'
  | 'encrypting'
  | 'connecting'
  | 'transferring'
  | 'decrypting'
  | 'verifying'
  | 'completed'
  | 'error'
  | 'cancelled';

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  width?: number;
  height?: number;
  duration?: number;
  sha256?: string;
  previewUrl?: string;
}

export interface TransferHeader {
  transferId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  originalSha256: string;
  totalChunks: number;
  chunkSize: number;
  senderDevice: string;
  saltHex: string;
  timestamp: number;
}

export interface EncryptedChunkPayload {
  transferId: string;
  chunkIndex: number;
  totalChunks: number;
  encryptedBase64: string;
  ivHex: string;
}

export interface PeerInfo {
  peerId: string;
  deviceName: string;
  isSender?: boolean;
  status?: string;
}

export interface TransferProgress {
  transferId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: TransferStatus;
  statusText: string;
  progressPercent: number;
  currentChunk: number;
  totalChunks: number;
  bytesTransferred: number;
  speedBps: number;
  speedMbps: number;
  elapsedSeconds: number;
  etaSeconds: number;
  protocol: ProtocolType;
  originalSha256?: string;
  receivedSha256?: string;
  verifiedLossless?: boolean;
  error?: string;
  previewUrl?: string;
  downloadBlob?: Blob;
}

export interface TransferHistoryItem {
  id: string;
  direction: 'sent' | 'received';
  fileName: string;
  fileSize: number;
  mimeType: string;
  sha256: string;
  timestamp: number;
  peerDevice: string;
  durationSeconds: number;
  avgSpeedMbps: number;
  verifiedBitIdentical: boolean;
  blobUrl?: string;
  dimensions?: string;
}

export interface SecurityFingerprint {
  hexSafetyCode: string;
  emojiSequence: string;
  cipherAlgorithm: string;
  keySizeBits: number;
}

export interface ReceivedMediaItem {
  id: string;
  blob: Blob;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  originalSha256: string;
  receivedSha256: string;
  verified: boolean;
  previewUrl: string;
  receivedAt?: number;
}

export interface DeviceSettings {
  deviceName: string;
  chunkSizeKb: number; // 64, 128, 256
  preferP2P: boolean;
  darkOledMode: boolean;
  autoSaveToDevice: boolean;
  language: 'ar' | 'en';
  hapticFeedback: boolean;
  soundEffectsEnabled: boolean;
  buttonClicksSoundEnabled: boolean;
}

export type AvatarFilterId =
  | 'normal'
  | 'cyberpunk'
  | 'noir'
  | 'vintage'
  | 'crimson'
  | 'matrix'
  | 'dramatic'
  | 'violet';

export interface UserProfile {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  avatarFilter: AvatarFilterId;
  deviceAlias?: string;
  email?: string;
  phoneNumber?: string;
  phoneNumberClean?: string;
  countryCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfile {
  uid: string;
  displayName: string;
  displayNameLower: string;
  avatarUrl?: string;
  avatarFilter: AvatarFilterId;
  deviceAlias?: string;
  isPublic: boolean;
  phoneNumber?: string;
  phoneNumberClean?: string;
  countryCode?: string;
  updatedAt: string;
}

export interface DirectChat {
  chatId: string;
  participants: string[];
  participantDetails: {
    [uid: string]: {
      displayName: string;
      avatarUrl?: string;
      avatarFilter?: AvatarFilterId;
      phoneNumber?: string;
    };
  };
  lastMessage?: string;
  lastMessageAt?: string;
  updatedAt: string;
}

export interface DirectChatMessage {
  id: string;
  chatId: string;
  senderUid: string;
  senderName: string;
  senderAvatarUrl?: string;
  senderAvatarFilter?: AvatarFilterId;
  text: string;
  type: 'text' | 'media_invite' | 'transfer_notice';
  roomId?: string;
  mediaCount?: number;
  createdAt: string;
}

export interface RemoteTransfer {
  transferId: string;
  senderUid: string;
  senderName: string;
  senderAvatarUrl?: string;
  senderAvatarFilter?: AvatarFilterId;
  receiverUid: string;
  receiverName: string;
  roomId: string;
  fileCount?: number;
  totalBytes?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'transferring' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

