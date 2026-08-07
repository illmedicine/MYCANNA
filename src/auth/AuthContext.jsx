import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { ensureUserDoc, getUserDoc, saveHealthData } from "../services/userService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = Firebase hasn't resolved yet | null = signed out | object = signed in
  const [user,          setUser]          = useState(undefined);
  const [savedProfile,  setSavedProfile]  = useState(null);
  // Health data (age, weight, conditions, etc.) — lives in Firestore, tied to Google account
  const [healthData,    setHealthData]    = useState(null);
  // True only after the Firestore user doc has been read (or confirmed absent).
  // Use this — not `loading` — when you need to know health data is ready.
  const [userDocReady,  setUserDocReady]  = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = {
          id:      firebaseUser.uid,
          name:    firebaseUser.displayName,
          email:   firebaseUser.email,
          picture: firebaseUser.photoURL,
        };
        setUser(profile);

        // ensureUserDoc runs on every auth restore — creates the stats doc and
        // user doc if they don't exist yet (idempotent for existing users).
        try {
          await ensureUserDoc(firebaseUser.uid, {
            name:    firebaseUser.displayName,
            email:   firebaseUser.email,
            picture: firebaseUser.photoURL,
          });
          const userDoc = await getUserDoc(firebaseUser.uid);
          setSavedProfile(userDoc?.profile ?? null);
          setHealthData(userDoc?.healthData ?? null);
        } catch (err) {
          console.error("Failed to load user doc", err);
        } finally {
          setUserDocReady(true);
        }
      } else {
        setUser(null);
        setSavedProfile(null);
        setHealthData(null);
        setUserDocReady(true);
      }
    });
    return unsub;
  }, []);

  // Write health data to Firestore then update context — single source of truth.
  const updateHealthData = useCallback(async (uid, data) => {
    await saveHealthData(uid, data);
    setHealthData(data);
  }, []);

  const signIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    await ensureUserDoc(u.uid, {
      name:    u.displayName,
      email:   u.email,
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
        healthData,
        updateHealthData,
        userDocReady,
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
