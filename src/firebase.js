import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD7ZcoMgEyHCyr75CaILdIiFKkBw4JBn5I",
  authDomain: "mycanna-b2284.firebaseapp.com",
  projectId: "mycanna-b2284",
  storageBucket: "mycanna-b2284.firebasestorage.app",
  messagingSenderId: "1047328169849",
  appId: "1:1047328169849:web:1425a022be6cd4be7d19a8",
  measurementId: "G-8M140QVT13",
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
