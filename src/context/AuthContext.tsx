import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  updatePassword as fbUpdatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserModel } from '../types';

interface AuthContextType {
  currentUser: UserModel | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, bank: string, accNum: string, accHolder: string) => Promise<void>;
  updateProfile: (data: Partial<UserModel>) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser({
              uid: fbUser.uid,
              email: data.email || fbUser.email || '',
              displayName: data.displayName || 'Pengajar',
              bankName: data.bankName || '',
              accountNumber: data.accountNumber || '',
              accountHolderName: data.accountHolderName || '',
              photoUrl: data.photoUrl || null,
            });
          } else {
            // Fallback jika doc belum ada
            const newUser: UserModel = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Pengajar',
              bankName: '',
              accountNumber: '',
              accountHolderName: '',
              photoUrl: null,
            };
            await setDoc(doc(db, 'users', fbUser.uid), newUser);
            setCurrentUser(newUser);
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, name: string, bank: string, accNum: string, accHolder: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser: UserModel = {
      uid: cred.user.uid,
      email: email,
      displayName: name,
      bankName: bank,
      accountNumber: accNum,
      accountHolderName: accHolder,
      photoUrl: null,
    };
    await setDoc(doc(db, 'users', cred.user.uid), newUser);
    setCurrentUser(newUser);
  };

  const updateProfile = async (data: Partial<UserModel>) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid);
    await updateDoc(ref, data);
    setCurrentUser({ ...currentUser, ...data });
  };

  const changePassword = async (newPass: string) => {
    if (!auth.currentUser) throw new Error("Tidak ada sesi login");
    await fbUpdatePassword(auth.currentUser, newPass);
  };

  const logout = async () => {
    await fbSignOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      loading,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
