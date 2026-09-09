import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PublicProfile, RemoteTransfer } from '../types';
import { cleanPhoneNumber } from './countryCodes';

/**
 * Searches public registered user profiles in Firebase for direct remote media transfer.
 * Allows searching by username, handle, or phone number.
 * Provides visual identity confirmation (Avatar, Photo Filter, Handle, Status).
 */
export async function searchPublicProfiles(
  searchTerm: string,
  currentUid?: string
): Promise<PublicProfile[]> {
  const collectionPath = 'publicProfiles';
  try {
    const q = query(
      collection(db, collectionPath),
      where('isPublic', '==', true),
      limit(30)
    );

    const snapshot = await getDocs(q);
    const results: PublicProfile[] = [];
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const cleanDigits = cleanPhoneNumber(searchTerm);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as PublicProfile;
      // Skip current sender themselves
      if (currentUid && data.uid === currentUid) return;

      if (!normalizedTerm) {
        results.push(data);
      } else {
        const nameMatch =
          data.displayName?.toLowerCase().includes(normalizedTerm) ||
          data.displayNameLower?.includes(normalizedTerm) ||
          data.uid?.toLowerCase().includes(normalizedTerm);

        const phoneMatch =
          (cleanDigits.length >= 4 && data.phoneNumberClean?.includes(cleanDigits)) ||
          (data.phoneNumber && data.phoneNumber.toLowerCase().includes(normalizedTerm));

        if (nameMatch || phoneMatch) {
          results.push(data);
        }
      }
    });

    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, collectionPath);
  }
}

/**
 * Searches specifically by phone number with country dial code or clean digits.
 */
export async function searchPublicProfilesByPhone(
  dialCode: string,
  nationalNumber: string,
  currentUid?: string
): Promise<PublicProfile[]> {
  const collectionPath = 'publicProfiles';
  const cleanInput = cleanPhoneNumber(nationalNumber);
  const fullClean = cleanPhoneNumber(`${dialCode}${nationalNumber}`);

  if (!cleanInput && !fullClean) return [];

  try {
    const q = query(
      collection(db, collectionPath),
      where('isPublic', '==', true),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const results: PublicProfile[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as PublicProfile;
      if (currentUid && data.uid === currentUid) return;

      const userClean = data.phoneNumberClean || cleanPhoneNumber(data.phoneNumber || '');
      if (!userClean) return;

      // Exact match with country code
      if (fullClean && userClean === fullClean) {
        results.unshift(data); // Priority exact match at top
        return;
      }

      // Ends with national number (e.g. searching 91234567 matches +96591234567 or +24991234567)
      if (cleanInput.length >= 5 && userClean.endsWith(cleanInput)) {
        if (!results.some((r) => r.uid === data.uid)) {
          results.push(data);
        }
      }
    });

    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, collectionPath);
  }
}

/**
 * Creates an instant remote transfer request in Firebase connecting the sender and receiver.
 */
export async function createRemoteTransferSession(params: {
  senderUid: string;
  senderName: string;
  senderAvatarUrl?: string;
  senderAvatarFilter?: any;
  receiver: PublicProfile;
  roomId: string;
  fileCount: number;
  totalBytes: number;
}): Promise<string> {
  const transferId = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const collectionPath = 'remoteTransfers';
  const now = new Date().toISOString();

  const payload: RemoteTransfer = {
    transferId,
    senderUid: params.senderUid,
    senderName: params.senderName,
    senderAvatarUrl: params.senderAvatarUrl || '',
    senderAvatarFilter: params.senderAvatarFilter || 'normal',
    receiverUid: params.receiver.uid,
    receiverName: params.receiver.displayName,
    roomId: params.roomId,
    fileCount: params.fileCount,
    totalBytes: params.totalBytes,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, collectionPath, transferId);
    await setDoc(docRef, payload);
    return transferId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionPath}/${transferId}`);
  }
}

/**
 * Listens for incoming remote transfers targeted at the current user.
 */
export function listenToIncomingTransfers(
  receiverUid: string,
  onIncoming: (transfers: RemoteTransfer[]) => void
): () => void {
  const collectionPath = 'remoteTransfers';
  const q = query(
    collection(db, collectionPath),
    where('receiverUid', '==', receiverUid),
    where('status', 'in', ['pending', 'accepted', 'transferring']),
    limit(10)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: RemoteTransfer[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as RemoteTransfer);
      });
      onIncoming(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, collectionPath);
    }
  );
}

/**
 * Listens to the state of a specific remote transfer session (e.g. for sender to know when receiver accepted).
 */
export function listenToTransferSession(
  transferId: string,
  onUpdate: (transfer: RemoteTransfer | null) => void
): () => void {
  const collectionPath = 'remoteTransfers';
  const docRef = doc(db, collectionPath, transferId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as RemoteTransfer);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `${collectionPath}/${transferId}`);
    }
  );
}

/**
 * Updates the lifecycle status of a remote transfer session (e.g. accepted, completed, rejected).
 */
export async function updateTransferSessionStatus(
  transferId: string,
  status: 'accepted' | 'rejected' | 'transferring' | 'completed' | 'cancelled'
): Promise<void> {
  const collectionPath = 'remoteTransfers';
  const docRef = doc(db, collectionPath, transferId);
  const now = new Date().toISOString();

  try {
    await updateDoc(docRef, {
      status,
      updatedAt: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${collectionPath}/${transferId}`);
  }
}
