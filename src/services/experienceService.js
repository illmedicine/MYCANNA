import {
  collection, addDoc, getDocs, query, where,
  orderBy, serverTimestamp, limit,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { awardPrestige } from "./prestigeService.js";

export async function getRecentPublicExperiences(n = 20) {
  const q = query(
    collection(db, "experiences"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function logExperience(userId, data) {
  const ref = await addDoc(collection(db, "experiences"), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });

  // Award prestige points for logging
  const pts = data.isDetailed ? 40 : 25;
  await awardPrestige(userId, pts, "experience_logged");

  return ref.id;
}

export async function getUserExperiences(userId) {
  const q = query(
    collection(db, "experiences"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProductExperiences(productId) {
  const q = query(
    collection(db, "experiences"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
