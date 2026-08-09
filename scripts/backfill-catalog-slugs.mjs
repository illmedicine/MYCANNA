import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

function toVendorSlug(name) {
  return (name || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

// Read stored Firebase CLI token
const configPath = join(homedir(), ".config", "configstore", "firebase-tools.json");
const { tokens } = JSON.parse(readFileSync(configPath, "utf-8"));
const accessToken = tokens.access_token;

initializeApp({
  credential: {
    getAccessToken: () =>
      Promise.resolve({ access_token: accessToken, expires_in: 3600 }),
  },
  projectId: "mycanna-b2284",
});

const db = getFirestore();

const snap = await db.collection("vendors").get();
console.log(`Found ${snap.size} vendor(s).`);
let updated = 0, skipped = 0;

await Promise.all(snap.docs.map(async (d) => {
  const data = d.data();
  const slug = toVendorSlug(data.storeName);
  if (!slug) { skipped++; return; }
  if (data.catalogSlug === slug) {
    console.log(`  skip  "${data.storeName}" (already "${slug}")`);
    skipped++; return;
  }
  await d.ref.update({ catalogSlug: slug });
  console.log(`  ✓     "${data.storeName}" → "${slug}"`);
  updated++;
}));

console.log(`\nDone. ${updated} updated, ${skipped} already correct.`);
