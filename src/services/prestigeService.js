import {
  doc, getDoc, setDoc, collection, query, orderBy,
  limit, getDocs, serverTimestamp, increment,
} from "firebase/firestore";
import { db } from "../firebase.js";

export const LEVELS = [
  { min: 0,    title: "Curious Newcomer",      emoji: "🌱" },
  { min: 100,  title: "Profile Pioneer",        emoji: "🧭" },
  { min: 300,  title: "Effect Explorer",        emoji: "🔭" },
  { min: 600,  title: "Community Contributor",  emoji: "🤝" },
  { min: 1000, title: "Cannabis Sage",          emoji: "🧠" },
  { min: 2500, title: "Profile Master",         emoji: "🏆" },
  { min: 5000, title: "Mycana Legend",          emoji: "⭐" },
];

export function getLevelForPoints(pts) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (pts >= l.min) level = l;
  }
  return level;
}

export async function awardPrestige(uid, points, reason) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const current = snap.data().prestigePoints || 0;
  const newTotal = current + points;
  const level = getLevelForPoints(newTotal);

  await setDoc(
    ref,
    {
      prestigePoints: increment(points),
      prestigeLevel: level.title,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Sync leaderboard entry
  await setDoc(
    doc(db, "leaderboard", uid),
    {
      uid,
      displayName: snap.data().name,
      avatar: snap.data().picture,
      points: newTotal,
      levelTitle: level.title,
      levelEmoji: level.emoji,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserPrestige(uid) {
  const [userSnap, lbSnap] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDoc(doc(db, "leaderboard", uid)),
  ]);

  const userPoints = userSnap.exists() ? (userSnap.data().prestigePoints ?? 0) : 0;
  const lbPoints   = lbSnap.exists()   ? (lbSnap.data().points ?? 0)           : 0;

  // Use whichever source has the higher value (leaderboard is the write-side truth)
  const points = Math.max(userPoints, lbPoints);
  const level  = getLevelForPoints(points);

  // Heal the discrepancy if they're out of sync
  if (points > userPoints && userSnap.exists()) {
    setDoc(doc(db, "users", uid), { prestigePoints: points, prestigeLevel: level.title }, { merge: true });
  }

  return { points, level: level.title };
}

export async function getLeaderboard(n = 50) {
  const q = query(
    collection(db, "leaderboard"),
    orderBy("points", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
}

export async function getUserRank(uid) {
  const board = await getLeaderboard(200);
  const idx = board.findIndex((e) => e.uid === uid);
  return idx === -1 ? null : idx + 1;
}
