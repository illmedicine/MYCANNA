import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

// ── User document ──────────────────────────────────────────────────────────
// Path: /users/{uid}
// Shape:
//   uid, name, email, picture, createdAt, updatedAt
//   profile: { effect, thc_sensitivity, cbd_importance, anxiety,
//              experience, terpene, context, purpose }
//   profileCompletedAt: Timestamp | null

export async function ensureUserDoc(uid, { name, email, picture }) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      name,
      email,
      picture,
      profile: null,
      profileCompletedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Keep name/picture current (Google can change them)
    await setDoc(ref, { name, email, picture, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveProfile(uid, answers) {
  await setDoc(
    doc(db, "users", uid),
    {
      profile: answers,
      profileCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
