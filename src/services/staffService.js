import {
  doc, collection, getDoc, getDocs, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

const staffRef = (vendorId, userId) =>
  doc(db, "vendors", vendorId, "staff", userId);

export async function registerStaffMember(vendorId, user) {
  const ref = staffRef(vendorId, user.id);
  const snap = await getDoc(ref);
  if (snap.exists()) return { _isNew: false, id: snap.id, ...snap.data() };
  const record = {
    userId: user.id,
    name: user.name || user.email || "Staff Member",
    email: user.email || "",
    photoURL: user.picture || null,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    xp: 0,
    completedModules: [],
    quizScores: {},
    completedSidequests: [],
    certEarned: false,
  };
  await setDoc(ref, record);
  return { _isNew: true, id: user.id, ...record, joinedAt: new Date(), updatedAt: new Date() };
}

export async function getStaffProgress(vendorId, userId) {
  const snap = await getDoc(staffRef(vendorId, userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getStaffMembers(vendorId) {
  const snap = await getDocs(collection(db, "vendors", vendorId, "staff"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateStaffProgress(vendorId, userId, updates) {
  await updateDoc(staffRef(vendorId, userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
