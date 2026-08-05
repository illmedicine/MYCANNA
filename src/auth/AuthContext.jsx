import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { ensureUserDoc, getUserDoc } from "../services/userService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = Firebase hasn't resolved yet | null = signed out | object = signed in
  const [user, setUser] = useState(undefined);
  const [savedProfile, setSavedProfile] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          picture: firebaseUser.photoURL,
        };
        setUser(profile);

        // Load any previously saved assessment from Firestore
        try {
          const userDoc = await getUserDoc(firebaseUser.uid);
          if (userDoc?.profile) setSavedProfile(userDoc.profile);
        } catch (err) {
          console.error("Failed to load user doc", err);
        }
      } else {
        setUser(null);
        setSavedProfile(null);
      }
    });
    return unsub;
  }, []);

  const signIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    await ensureUserDoc(u.uid, {
      name: u.displayName,
      email: u.email,
      picture: u.photoURL,
    });
    return result;
  };

  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        savedProfile,
        setSavedProfile,
        signIn,
        signOut,
        loading: user === undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
