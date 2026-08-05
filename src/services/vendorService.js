import {
  doc, collection, addDoc, getDoc, getDocs, setDoc, query,
  where, orderBy, serverTimestamp, limit,
} from "firebase/firestore";
import { db } from "../firebase.js";

export async function registerVendor(uid, data) {
  const ref = doc(db, "vendors", uid);
  await setDoc(ref, {
    ...data,
    ownerId: uid,
    status: "pending_verification", // admin flips to 'approved' in console
    tier: "free",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return uid;
}

export async function getVendor(vendorId) {
  const snap = await getDoc(doc(db, "vendors", vendorId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getApprovedVendors(region = "WNY") {
  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    where("region", "==", region),
    orderBy("tier", "desc"), // premium first
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addProduct(vendorId, productData) {
  const ref = collection(db, "products");
  const docRef = await addDoc(ref, {
    ...productData,
    vendorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getVendorProducts(vendorId) {
  const q = query(
    collection(db, "products"),
    where("vendorId", "==", vendorId),
    where("inStock", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllProducts(region = "WNY") {
  const q = query(
    collection(db, "products"),
    where("region", "==", region),
    where("inStock", "==", true),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
