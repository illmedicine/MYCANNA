import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase.js";

const STATS_REF = () => doc(db, "stats", "global");

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
    // Increment global user counter for the engagement display
    await setDoc(STATS_REF(), { totalUsers: increment(1) }, { merge: true });
  } else {
    await setDoc(ref, { name, email, picture, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export async function getStats() {
  const snap = await getDoc(STATS_REF());
  return snap.exists() ? snap.data() : { totalUsers: 0 };
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
