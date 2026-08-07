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

// Known Google sign-in count as of 2026-08-06 (from firebase auth:export).
// Used to seed the stats doc on first run so the counter doesn't start at 0.
const AUTH_BACKFILL_COUNT = 4;

// ── User document ──────────────────────────────────────────────────────────
// Path: /users/{uid}
// Shape:
//   uid, name, email, picture, createdAt, updatedAt
//   profile: { effect, thc_sensitivity, cbd_importance, anxiety,
//              experience, terpene, context, purpose }
//   profileCompletedAt: Timestamp | null

export async function ensureUserDoc(uid, { name, email, picture }) {
  const ref = doc(db, "users", uid);
  const [snap, statsSnap] = await Promise.all([getDoc(ref), getDoc(STATS_REF())]);

  // Seed the stats doc on first run, backfilling the real auth count.
  if (!statsSnap.exists()) {
    await setDoc(STATS_REF(), { totalUsers: AUTH_BACKFILL_COUNT, backfilled: true });
  }

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
    // New user — increment from the backfilled baseline
    await setDoc(STATS_REF(), { totalUsers: increment(1) }, { merge: true });
    return { isNew: true };
  } else {
    await setDoc(ref, { name, email, picture, updatedAt: serverTimestamp() }, { merge: true });
    return { isNew: false };
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

export async function saveHealthData(uid, healthData) {
  await setDoc(
    doc(db, "users", uid),
    { healthData, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getHealthData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().healthData ?? null) : null;
}
