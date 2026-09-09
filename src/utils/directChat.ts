import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DirectChat, DirectChatMessage, PublicProfile, UserProfile, AvatarFilterId } from '../types';

/**
 * Returns a deterministic, canonical chat ID for any pair of user UIDs.
 */
export function getChatId(uid1: string, uid2: string): string {
  const sorted = [uid1, uid2].sort();
  // Safe ID sanitized for Firestore document ID constraints
  const safe1 = sorted[0].replace(/[^a-zA-Z0-9_\-]/g, '');
  const safe2 = sorted[1].replace(/[^a-zA-Z0-9_\-]/g, '');
  return `chat_${safe1}_${safe2}`;
}

/**
 * Gets or creates the direct chat session between sender and recipient.
 */
export async function getOrCreateDirectChat(
  currentUser: UserProfile,
  recipient: PublicProfile
): Promise<string> {
  const chatId = getChatId(currentUser.uid, recipient.uid);
  const chatRef = doc(db, 'directChats', chatId);
  const now = new Date().toISOString();

  try {
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
      const newChat: DirectChat = {
        chatId,
        participants: [currentUser.uid, recipient.uid],
        participantDetails: {
          [currentUser.uid]: {
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl,
            avatarFilter: currentUser.avatarFilter || 'normal',
            phoneNumber: currentUser.phoneNumber,
          },
          [recipient.uid]: {
            displayName: recipient.displayName,
            avatarUrl: recipient.avatarUrl,
            avatarFilter: recipient.avatarFilter || 'normal',
            phoneNumber: recipient.phoneNumber,
          },
        },
        updatedAt: now,
      };
      await setDoc(chatRef, newChat);
    }
    return chatId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `directChats/${chatId}`);
  }
}

/**
 * Sends a real-time message inside a direct chat room.
 */
export async function sendDirectChatMessage(params: {
  chatId: string;
  senderUid: string;
  senderName: string;
  senderAvatarUrl?: string;
  senderAvatarFilter?: AvatarFilterId;
  text: string;
  type?: 'text' | 'media_invite' | 'transfer_notice';
  roomId?: string;
  mediaCount?: number;
}): Promise<string> {
  const now = new Date().toISOString();
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const messageDocRef = doc(db, 'directChats', params.chatId, 'messages', messageId);
  const chatDocRef = doc(db, 'directChats', params.chatId);

  const messagePayload: DirectChatMessage = {
    id: messageId,
    chatId: params.chatId,
    senderUid: params.senderUid,
    senderName: params.senderName,
    senderAvatarUrl: params.senderAvatarUrl || '',
    senderAvatarFilter: params.senderAvatarFilter || 'normal',
    text: params.text.trim(),
    type: params.type || 'text',
    roomId: params.roomId || '',
    mediaCount: params.mediaCount || 0,
    createdAt: now,
  };

  try {
    await setDoc(messageDocRef, messagePayload);

    // Update parent directChat lastMessage
    await updateDoc(chatDocRef, {
      lastMessage: params.text.slice(0, 500),
      lastMessageAt: now,
      updatedAt: now,
    });

    return messageId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `directChats/${params.chatId}/messages/${messageId}`);
  }
}

/**
 * Subscribes to real-time messages in a direct chat.
 */
export function listenToDirectChatMessages(
  chatId: string,
  onMessages: (msgs: DirectChatMessage[]) => void
): () => void {
  const messagesCol = collection(db, 'directChats', chatId, 'messages');
  const q = query(messagesCol, limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: DirectChatMessage[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as DirectChatMessage);
      });
      // Sort client-side by createdAt ascending for reliable order
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onMessages(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `directChats/${chatId}/messages`);
    }
  );
}
