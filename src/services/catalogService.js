import {
  doc, collection, addDoc, getDoc, getDocs, updateDoc,
  query, where, orderBy, serverTimestamp, limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase.js";

export async function getCatalogData(vendorId) {
  const [vendorSnap, productsSnap] = await Promise.all([
    getDoc(doc(db, "vendors", vendorId)),
    getDocs(query(collection(db, "products"), where("vendorId", "==", vendorId))),
  ]);
  if (!vendorSnap.exists()) return null;
  const vendor = { id: vendorSnap.id, ...vendorSnap.data() };
  const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  return { vendor, products };
}

export async function getCatalogDataBySlug(slug) {
  const q = query(collection(db, "vendors"), where("catalogSlug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const vendorDoc = snap.docs[0];
  const vendor = { id: vendorDoc.id, ...vendorDoc.data() };
  const productsSnap = await getDocs(
    query(collection(db, "products"), where("vendorId", "==", vendor.id))
  );
  const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  return { vendor, products };
}

export async function updateCatalogSettings(vendorId, settings) {
  await updateDoc(doc(db, "vendors", vendorId), {
    ...settings,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadCatalogBanner(vendorId, file) {
  const ext = file.name.split(".").pop();
  const path = `catalogs/${vendorId}/banner.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function deleteCatalogBanner(path) {
  try { await deleteObject(ref(storage, path)); } catch (_) {}
}

export async function placeWholesaleOrder(vendorId, orderData) {
  const ref = await addDoc(collection(db, "orders"), {
    ...orderData,
    vendorId,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getVendorOrders(vendorId) {
  const q = query(
    collection(db, "orders"),
    where("vendorId", "==", vendorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, "orders", orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
