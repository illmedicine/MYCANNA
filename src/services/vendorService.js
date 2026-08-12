import {
  doc, collection, addDoc, getDoc, getDocs, setDoc, updateDoc, arrayUnion,
  deleteDoc, query, where, orderBy, serverTimestamp, limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase.js";

export function toVendorSlug(name) {
  return (name || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export async function ensureVendorSlug(vendorId, storeName) {
  const slug = toVendorSlug(storeName);
  await updateDoc(doc(db, "vendors", vendorId), { catalogSlug: slug });
  return slug;
}

export async function registerVendor(uid, email, data) {
  const docRef = await addDoc(collection(db, "vendors"), {
    ...data,
    ownerId: uid,
    ownerEmails: [email],
    catalogSlug: toVendorSlug(data.storeName),
    region: "WNY",
    status: "pending_verification",
    tier: "free",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getVendor(vendorId) {
  const snap = await getDoc(doc(db, "vendors", vendorId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getVendorBySlug(slug) {
  const q = query(collection(db, "vendors"), where("catalogSlug", "==", slug.toUpperCase()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
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

// Returns ALL stores the user owns or co-owns (by UID or by email)
export async function getVendorsByUser(uid, email) {
  const [byOwner, byEmail] = await Promise.all([
    getDocs(query(collection(db, "vendors"), where("ownerId", "==", uid))),
    email
      ? getDocs(query(collection(db, "vendors"), where("ownerEmails", "array-contains", email)))
      : Promise.resolve({ docs: [] }),
  ]);
  const seen = new Set();
  const results = [];
  for (const snap of [...byOwner.docs, ...byEmail.docs]) {
    if (!seen.has(snap.id)) {
      seen.add(snap.id);
      results.push({ id: snap.id, ...snap.data() });
    }
  }
  return results;
}

export async function addVendorCoOwner(vendorId, email) {
  await updateDoc(doc(db, "vendors", vendorId), {
    ownerEmails: arrayUnion(email.toLowerCase().trim()),
    updatedAt: serverTimestamp(),
  });
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
    // Flag picked up by VendorDashboard to trigger the welcome celebration
    ...(tier !== "free" ? { celebrationPending: true } : { celebrationPending: false }),
  });
}

export async function clearCelebration(vendorId) {
  await updateDoc(doc(db, "vendors", vendorId), { celebrationPending: false });
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

export async function markVendorAsSupplierOnly(vendorId) {
  await updateDoc(doc(db, "vendors", vendorId), {
    isSupplierOnly: true,
    updatedAt: serverTimestamp(),
  });
}

export async function seedExampleStorefronts(adminUid, nyFarmCoProducts) {
  const allSnap = await getDocs(query(collection(db, "vendors"), limit(200)));
  const existing = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const results = {};

  const STOREFRONTS = [
    {
      slug: "LEAFPLUG",
      storeName: "Leaf Plug",
      email: "info@leafplug.com",
      phone: "(716) 259-9004",
      address: "3341 Sheridan Drive",
      city: "Amherst",
      zip: "14226",
      hours: "Mon–Sun: 10 AM – 10 PM",
      website: "https://leafplug.com",
      instagram: "@leafplug_ny",
      description: "Cannabis for Western New Yorkers by Western New Yorkers. WNY's #1 licensed cannabis dispensary — NY State license OCM-RETL-24-000010.",
      catalogWelcomeText: "Authorized retailer of NY Farm Co products — serving Amherst and the greater Buffalo area.",
      catalogThemeColor: "#38761d",
    },
    {
      slug: "MARYJANES",
      storeName: "Mary Jane's",
      email: "",
      phone: "",
      address: "440 Normal Ave",
      city: "Buffalo",
      zip: "14213",
      hours: "",
      website: "https://dutchie.com/dispensary/mary-janes-a-legacy-to-legal-dispensary",
      instagram: "",
      description: "A Legacy to Legal dispensary — social equity licensed cannabis retail serving the Buffalo community. NY State license NY-166868694.",
      catalogWelcomeText: "Authorized retailer of NY Farm Co products — serving Buffalo and the greater WNY region.",
      catalogThemeColor: "#6d28d9",
    },
  ];

  for (const sf of STOREFRONTS) {
    const exists = existing.find(v => v.catalogSlug === sf.slug);
    if (exists) {
      results[sf.slug] = { alreadyExists: true, vendorId: exists.id };
      continue;
    }

    const vendorRef = await addDoc(collection(db, "vendors"), {
      storeName: sf.storeName,
      ownerId: adminUid || "system",
      ownerEmails: sf.email ? [sf.email] : [],
      email: sf.email,
      phone: sf.phone,
      address: sf.address,
      city: sf.city,
      zip: sf.zip,
      hours: sf.hours,
      website: sf.website,
      instagram: sf.instagram,
      description: sf.description,
      catalogWelcomeText: sf.catalogWelcomeText,
      catalogThemeColor: sf.catalogThemeColor,
      licenseType: "retail",
      region: "WNY",
      status: "approved",
      tier: "premium",
      isExampleStorefront: true,
      isRetailOnly: true,
      supplierNote: "Authorized retailer of NY Farm Co products",
      catalogSlug: sf.slug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
    });

    for (const product of nyFarmCoProducts) {
      await addDoc(collection(db, "products"), {
        ...product,
        vendorId: vendorRef.id,
        supplierBrand: "NY Farm Co",
        region: "WNY",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    results[sf.slug] = { vendorId: vendorRef.id, productCount: nyFarmCoProducts.length };
  }

  // Mark any NY Farm Co supplier vendor as supplier-only so it won't appear in consumer Discover
  const nyFarmCo = existing.find(v =>
    !v.isExampleStorefront &&
    (v.storeName?.toLowerCase().includes("farm co") ||
     ["NYFARMC", "NYFARMCO", "NYFARM"].includes(v.catalogSlug))
  );
  if (nyFarmCo && !nyFarmCo.isSupplierOnly) {
    await updateDoc(doc(db, "vendors", nyFarmCo.id), {
      isSupplierOnly: true,
      updatedAt: serverTimestamp(),
    });
    results.nyFarmCoMarked = nyFarmCo.id;
  }

  return results;
}
