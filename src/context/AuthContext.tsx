import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, testConnection, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, AvatarFilterId } from '../types';
import { cleanPhoneNumber, formatFullPhoneNumber } from '../utils/countryCodes';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDbConnected: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  registerWithPhone: (params: {
    dialCode: string;
    nationalNumber: string;
    displayName: string;
    avatarUrl?: string;
    avatarFilter?: AvatarFilterId;
    deviceAlias?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (data: {
    displayName: string;
    avatarUrl?: string;
    avatarFilter: AvatarFilterId;
    deviceAlias?: string;
    phoneNumber?: string;
    countryCode?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // 1. Initial Firestore connectivity verification
  useEffect(() => {
    testConnection().then((connected) => {
      setIsDbConnected(connected);
    });
  }, []);

  // 2. Listen to Auth State Changes & Attach Firestore Realtime Profile Sync
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);

        // Fetch or create profile if needed
        try {
          const snapshot = await getDoc(userDocRef);
          let currentProf: UserProfile;
          if (!snapshot.exists()) {
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || (currentUser.isAnonymous ? 'مستخدم ضيف' : 'مستخدم PureDrop'),
              avatarUrl: currentUser.photoURL || undefined,
              avatarFilter: 'normal',
              deviceAlias: 'PureDrop Device',
              email: currentUser.email || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, initialProfile);
            currentProf = initialProfile;
            setUserProfile(initialProfile);
          } else {
            currentProf = snapshot.data() as UserProfile;
            setUserProfile(currentProf);
          }

          // Ensure Public Profile document exists for user discovery across borders
          const publicDocRef = doc(db, 'publicProfiles', currentUser.uid);
          const publicSnap = await getDoc(publicDocRef);
          if (!publicSnap.exists()) {
            await setDoc(publicDocRef, {
              uid: currentUser.uid,
              displayName: currentProf.displayName,
              displayNameLower: currentProf.displayName.toLowerCase(),
              avatarUrl: currentProf.avatarUrl || '',
              avatarFilter: currentProf.avatarFilter || 'normal',
              deviceAlias: currentProf.deviceAlias || 'PureDrop Device',
              isPublic: true,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }

        // Setup real-time listener for profile changes
        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          }
        );
      } else {
        setUserProfile(null);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      // If popup was closed by user, don't crash
      if (err?.code !== 'auth/popup-closed-by-user') {
        console.error('Google Sign-In Error:', err);
        throw err;
      }
    }
  };

  const loginAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Anonymous Sign-In Error:', err);
      throw err;
    }
  };

  const registerWithPhone = async (params: {
    dialCode: string;
    nationalNumber: string;
    displayName: string;
    avatarUrl?: string;
    avatarFilter?: AvatarFilterId;
    deviceAlias?: string;
  }) => {
    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const cred = await signInAnonymously(auth);
        currentUser = cred.user;
      }

      const formattedPhone = formatFullPhoneNumber(params.dialCode, params.nationalNumber);
      const cleanPhone = cleanPhoneNumber(formattedPhone);

      try {
        localStorage.setItem('puredrop_registered_phone', formattedPhone);
        localStorage.setItem('puredrop_country_code', params.dialCode);
        localStorage.setItem('puredrop_display_name', params.displayName.trim());
      } catch {}

      const userDocRef = doc(db, 'users', currentUser.uid);
      const now = new Date().toISOString();

      const userPayload: UserProfile = {
        uid: currentUser.uid,
        displayName: params.displayName.trim() || 'مستخدم هاتف PureDrop',
        avatarUrl: params.avatarUrl || undefined,
        avatarFilter: params.avatarFilter || 'normal',
        deviceAlias: params.deviceAlias?.trim().slice(0, 60) || 'PureDrop Device',
        email: currentUser.email || undefined,
        phoneNumber: formattedPhone,
        phoneNumberClean: cleanPhone,
        countryCode: params.dialCode,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(userDocRef, userPayload);
      setUserProfile(userPayload);

      // Publish in public discovery directory with phone number for remote transfers
      const publicDocRef = doc(db, 'publicProfiles', currentUser.uid);
      const publicPayload: Record<string, any> = {
        uid: currentUser.uid,
        displayName: userPayload.displayName,
        displayNameLower: userPayload.displayName.toLowerCase(),
        avatarFilter: userPayload.avatarFilter,
        deviceAlias: userPayload.deviceAlias,
        isPublic: true,
        phoneNumber: formattedPhone,
        phoneNumberClean: cleanPhone,
        countryCode: params.dialCode,
        updatedAt: now,
      };
      if (userPayload.avatarUrl) {
        publicPayload.avatarUrl = userPayload.avatarUrl;
      }

      await setDoc(publicDocRef, publicPayload, { merge: true });
    } catch (err) {
      console.error('Phone registration error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (err) {
      console.error('Sign-Out Error:', err);
      throw err;
    }
  };

  const saveProfile = async (data: {
    displayName: string;
    avatarUrl?: string;
    avatarFilter: AvatarFilterId;
    deviceAlias?: string;
    phoneNumber?: string;
    countryCode?: string;
  }) => {
    if (!user) {
      throw new Error('User must be signed in to save profile');
    }

    const trimmedName = data.displayName.trim();
    if (!trimmedName) {
      throw new Error('Display name cannot be empty');
    }

    const userDocRef = doc(db, 'users', user.uid);
    const now = new Date().toISOString();

    const cleanPhone = data.phoneNumber ? cleanPhoneNumber(data.phoneNumber) : undefined;

    const payload: Partial<UserProfile> = {
      displayName: trimmedName.slice(0, 50),
      avatarFilter: data.avatarFilter,
      updatedAt: now,
    };

    if (data.avatarUrl !== undefined) {
      payload.avatarUrl = data.avatarUrl;
    }
    if (data.deviceAlias !== undefined) {
      payload.deviceAlias = data.deviceAlias.trim().slice(0, 60);
    }
    if (data.phoneNumber !== undefined) {
      payload.phoneNumber = data.phoneNumber.trim().slice(0, 30);
      payload.phoneNumberClean = cleanPhone ? cleanPhone.slice(0, 30) : '';
    }
    if (data.countryCode !== undefined) {
      payload.countryCode = data.countryCode.trim().slice(0, 10);
    }

    try {
      const existing = await getDoc(userDocRef);
      if (existing.exists()) {
        await updateDoc(userDocRef, payload);
      } else {
        const fullProfile: UserProfile = {
          uid: user.uid,
          displayName: trimmedName.slice(0, 50),
          avatarUrl: data.avatarUrl,
          avatarFilter: data.avatarFilter,
          deviceAlias: data.deviceAlias?.trim().slice(0, 60) || 'PureDrop Device',
          email: user.email || undefined,
          phoneNumber: data.phoneNumber?.trim().slice(0, 30),
          phoneNumberClean: cleanPhone ? cleanPhone.slice(0, 30) : undefined,
          countryCode: data.countryCode?.trim().slice(0, 10),
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(userDocRef, fullProfile);
      }

      // Synchronize public discovery card with phone details
      const publicDocRef = doc(db, 'publicProfiles', user.uid);
      const publicData: Record<string, any> = {
        uid: user.uid,
        displayName: trimmedName.slice(0, 50),
        displayNameLower: trimmedName.slice(0, 50).toLowerCase(),
        avatarFilter: data.avatarFilter,
        isPublic: true,
        updatedAt: now,
      };
      if (data.avatarUrl !== undefined) {
        publicData.avatarUrl = data.avatarUrl;
      }
      if (data.deviceAlias !== undefined) {
        publicData.deviceAlias = data.deviceAlias.trim().slice(0, 60);
      }
      if (data.phoneNumber !== undefined) {
        publicData.phoneNumber = data.phoneNumber.trim().slice(0, 30);
        publicData.phoneNumberClean = cleanPhone ? cleanPhone.slice(0, 30) : '';
      }
      if (data.countryCode !== undefined) {
        publicData.countryCode = data.countryCode.trim().slice(0, 10);
      }
      await setDoc(publicDocRef, publicData, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isDbConnected,
        loginWithGoogle,
        loginAsGuest,
        registerWithPhone,
        logout,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
