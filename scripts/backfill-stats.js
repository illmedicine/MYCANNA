/**
 * One-time backfill: counts all Firebase Auth users and sets /stats/global.totalUsers
 * Run: node scripts/backfill-stats.js
 * Requires: npm install firebase-admin  (or uses existing project deps)
 */
const admin = require("firebase-admin");

admin.initializeApp({ projectId: "mycanna-b2284" });

const auth = admin.auth();
const db   = admin.firestore();

async function main() {
  let total = 0;
  let pageToken;
  do {
    const result = await auth.listUsers(1000, pageToken);
    total    += result.users.length;
    pageToken = result.pageToken;
  } while (pageToken);

  await db.doc("stats/global").set({ totalUsers: total }, { merge: true });
  console.log(`✅  Set stats/global.totalUsers = ${total}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
