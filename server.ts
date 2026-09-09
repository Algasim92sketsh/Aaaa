import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

interface ClientConnection {
  ws: WebSocket;
  roomId: string;
  peerId: string;
  deviceName?: string;
  isSender?: boolean;
}

// In-memory room manager (Zero persistence - completely ephemeral)
const rooms = new Map<string, Map<string, ClientConnection>>();

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Attach WebSocket server on /ws
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    let currentRoomId: string | null = null;
    let currentPeerId: string | null = null;

    ws.on('message', (data: Buffer | string) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case 'join-room': {
            const { roomId, peerId, deviceName, isSender } = msg;
            currentRoomId = roomId;
            currentPeerId = peerId;

            if (!rooms.has(roomId)) {
              rooms.set(roomId, new Map());
            }

            const room = rooms.get(roomId)!;
            room.set(peerId, { ws, roomId, peerId, deviceName, isSender });

            // Notify others in the room
            const peers = Array.from(room.values()).map((p) => ({
              peerId: p.peerId,
              deviceName: p.deviceName,
              isSender: p.isSender,
            }));

            // Broadcast peer list to everyone in room
            for (const client of room.values()) {
              if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(
                  JSON.stringify({
                    type: 'room-peers',
                    peers,
                    joinedPeer: { peerId, deviceName, isSender },
                  })
                );
              }
            }
            break;
          }

          case 'leave-room': {
            if (currentRoomId && currentPeerId && rooms.has(currentRoomId)) {
              const room = rooms.get(currentRoomId)!;
              room.delete(currentPeerId);
              if (room.size === 0) {
                rooms.delete(currentRoomId);
              } else {
                for (const client of room.values()) {
                  if (client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(
                      JSON.stringify({
                        type: 'peer-left',
                        peerId: currentPeerId,
                      })
                    );
                  }
                }
              }
            }
            currentRoomId = null;
            currentPeerId = null;
            break;
          }

          // WebRTC Signaling (offer, answer, candidate)
          case 'signal': {
            const { roomId, targetPeerId, signalData, fromPeerId } = msg;
            if (rooms.has(roomId)) {
              const room = rooms.get(roomId)!;
              const target = room.get(targetPeerId);
              if (target && target.ws.readyState === WebSocket.OPEN) {
                target.ws.send(
                  JSON.stringify({
                    type: 'signal',
                    fromPeerId,
                    signalData,
                  })
                );
              }
            }
            break;
          }

          // Fallback Encrypted Chunk Relay (Zero-knowledge: server never stores or decrypts)
          case 'relay-chunk': {
            const { roomId, targetPeerId, chunkPacket } = msg;
            if (rooms.has(roomId)) {
              const room = rooms.get(roomId)!;
              if (targetPeerId) {
                const target = room.get(targetPeerId);
                if (target && target.ws.readyState === WebSocket.OPEN) {
                  target.ws.send(
                    JSON.stringify({
                      type: 'relay-chunk',
                      chunkPacket,
                    })
                  );
                }
              } else {
                // Broadcast to all other peers in room
                for (const [pId, client] of room.entries()) {
                  if (pId !== currentPeerId && client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(
                      JSON.stringify({
                        type: 'relay-chunk',
                        chunkPacket,
                      })
                    );
                  }
                }
              }
            }
            break;
          }

          // Transfer control messages (meta, ack, cancel, complete)
          case 'transfer-control': {
            const { roomId, targetPeerId, controlData } = msg;
            if (rooms.has(roomId)) {
              const room = rooms.get(roomId)!;
              for (const [pId, client] of room.entries()) {
                if (pId !== currentPeerId && (!targetPeerId || pId === targetPeerId)) {
                  if (client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(
                      JSON.stringify({
                        type: 'transfer-control',
                        fromPeerId: currentPeerId,
                        controlData,
                      })
                    );
                  }
                }
              }
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && currentPeerId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId)!;
        room.delete(currentPeerId);
        if (room.size === 0) {
          rooms.delete(currentRoomId);
        } else {
          for (const client of room.values()) {
            if (client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(
                JSON.stringify({
                  type: 'peer-left',
                  peerId: currentPeerId,
                })
              );
            }
          }
        }
      }
    });
  });

  // REST API health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      activeRooms: rooms.size,
      zeroKnowledge: true,
      e2ee: 'AES-256-GCM',
      timestamp: Date.now(),
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`PureDrop Lossless Server running on http://0.0.0.0:${PORT}`);
    console.log(`WebSocket Signaling on ws://0.0.0.0:${PORT}/ws`);
  });
}

startServer().catch((err) => {
  console.error('Server initialization failure:', err);
});
