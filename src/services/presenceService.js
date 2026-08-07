import {
  doc, setDoc, deleteDoc, collection,
  getCountFromServer, where, query, Timestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

// ── Session identity ─────────────────────────────────────────────────
// One random ID per browser tab (not shared across tabs or page reloads).
// crypto.randomUUID is available in all modern browsers + HTTPS contexts.
function _makeId() {
  return (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

let _sid = sessionStorage.getItem("_sid");
if (!_sid) {
  _sid = _makeId();
  sessionStorage.setItem("_sid", _sid);
}
const SESSION_ID = _sid;

// ── Tunables ─────────────────────────────────────────────────────────
const HEARTBEAT_MS     = 30_000;       // ping presence every 30 s
const ACTIVE_WINDOW_MS = 2 * 60_000;  // "active" = seen within last 2 min

let _timer = null;

async function _ping() {
  try {
    await setDoc(doc(db, "presence", SESSION_ID), { lastSeen: Timestamp.now() });
  } catch (_) {}
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Call once on app mount.
 * - Records a one-time visit in /visits (for total visitor count).
 * - Starts the 30-second heartbeat to /presence (for active-now count).
 * Returns a cleanup function for React effect teardown.
 */
export function startPresence() {
  // Write a visit document once per tab session (write-once — only on create)
  if (!sessionStorage.getItem("_visited")) {
    sessionStorage.setItem("_visited", "1");
    setDoc(doc(db, "visits", SESSION_ID), { at: Timestamp.now() }).catch(() => {});
  }

  // Heartbeat
  _ping();
  _timer = setInterval(_ping, HEARTBEAT_MS);

  const cleanup = () => {
    clearInterval(_timer);
    _timer = null;
    // Best-effort delete — browser may not await this on unload, which is fine;
    // stale presence docs fall out of the 2-min window query automatically.
    deleteDoc(doc(db, "presence", SESSION_ID)).catch(() => {});
  };

  window.addEventListener("beforeunload", cleanup, { once: true });
  return cleanup;
}

/** Live sessions active in the last 2 minutes. */
export async function getActiveCount() {
  const cutoff = Timestamp.fromMillis(Date.now() - ACTIVE_WINDOW_MS);
  const snap = await getCountFromServer(
    query(collection(db, "presence"), where("lastSeen", ">=", cutoff))
  );
  return snap.data().count;
}

/** All-time unique browser-session visits. */
export async function getTotalVisits() {
  const snap = await getCountFromServer(collection(db, "visits"));
  return snap.data().count;
}
