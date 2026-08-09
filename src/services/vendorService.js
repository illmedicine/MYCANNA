import {
  doc, collection, addDoc, getDoc, getDocs, setDoc, updateDoc,
  deleteDoc, query, where, orderBy, serverTimestamp, limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase.js";

export async function registerVendor(uid, data) {
  const ref = doc(db, "vendors", uid);
  await setDoc(ref, {
    ...data,
    ownerId: uid,
    region: "WNY",
    status: "pending_verification",
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

export async function getApprovedVendors() {
  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
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
    region: "WNY",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getVendorProducts(vendorId) {
  const q = query(
    collection(db, "products"),
    where("vendorId", "==", vendorId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllProducts(_region = "WNY") {
  // No Firestore-level filter — fetch all products and let the caller filter.
  // Avoids composite index requirements and missing-field issues on older docs.
  const snap = await getDocs(query(collection(db, "products"), limit(200)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ── Vendor self-service ─────────────────────────────────────────── */

export async function getVendorByOwner(uid) {
  const q = query(collection(db, "vendors"), where("ownerId", "==", uid), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function updateVendorProfile(vendorId, data) {
  await updateDoc(doc(db, "vendors", vendorId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(productId, data) {
  await updateDoc(doc(db, "products", productId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(productId, imageStoragePath) {
  await deleteDoc(doc(db, "products", productId));
  if (imageStoragePath) {
    try { await deleteObject(ref(storage, imageStoragePath)); } catch (_) {}
  }
}

export async function uploadProductImage(vendorId, file) {
  const ext = file.name.split(".").pop();
  const path = `products/${vendorId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

/* ── Admin functions ─────────────────────────────────────────────── */

export async function getPendingVendors() {
  const q = query(
    collection(db, "vendors"),
    where("status", "==", "pending_verification"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllVendorsAdmin() {
  const q = query(collection(db, "vendors"), orderBy("createdAt", "desc"), limit(200));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateVendorTier(vendorId, tier) {
  await updateDoc(doc(db, "vendors", vendorId), {
    tier,
    updatedAt: serverTimestamp(),
  });
}

export async function bulkAddProducts(vendorId, productList) {
  const results = [];
  for (const productData of productList) {
    const docRef = await addDoc(collection(db, "products"), {
      ...productData,
      vendorId,
      region: "WNY",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    results.push(docRef.id);
  }
  return results;
}

export async function approveVendor(vendorId) {
  await updateDoc(doc(db, "vendors", vendorId), {
    status: "approved",
    region: "WNY",
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function rejectVendor(vendorId, reason = "") {
  await updateDoc(doc(db, "vendors", vendorId), {
    status: "rejected",
    rejectionReason: reason,
    updatedAt: serverTimestamp(),
  });
}
