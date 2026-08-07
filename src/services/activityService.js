import {
  collection, addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

const ACTIVITY_REF = () => collection(db, "activity");

/**
 * Write a real platform event to /activity.
 * Fire-and-forget — never throws to the caller.
 */
export function logActivity(type, data = {}) {
  addDoc(ACTIVITY_REF(), {
    type,
    ...data,
    createdAt: serverTimestamp(),
  }).catch(() => {});
}

/**
 * Subscribe to the activity feed.
 *
 * - onInitial(event)  — called once with the most recent event (if < 2 hours old)
 *                       so returning visitors see something on page load.
 * - onLive(event)     — called for every new event written in real time.
 *
 * Returns an unsubscribe function.
 */
export function subscribeActivity({ onInitial, onLive }) {
  const q = query(ACTIVITY_REF(), orderBy("createdAt", "desc"), limit(20));
  let isFirstSnapshot = true;

  const unsub = onSnapshot(q, (snap) => {
    if (isFirstSnapshot) {
      isFirstSnapshot = false;
      // Show the most recent event only if it happened within the last 2 hours
      const doc = snap.docs[0];
      if (doc) {
        const data = doc.data();
        const ageMs = Date.now() - (data.createdAt?.toMillis() ?? 0);
        if (ageMs < 2 * 60 * 60 * 1000) {
          onInitial?.({ id: doc.id, ...data });
        }
      }
      return;
    }

    // Real-time additions only
    snap.docChanges().forEach((change) => {
      if (change.type === "added") {
        onLive?.({ id: change.doc.id, ...change.doc.data() });
      }
    });
  }, () => {}); // ignore snapshot errors silently

  return unsub;
}

/** Human-readable label + icon for each event type. */
export function formatActivity(event) {
  switch (event.type) {
    case "user_joined":
      return {
        icon: "🌿",
        text: `${event.firstName || "Someone"} just joined Mycana`,
      };
    case "assessment_completed":
      return {
        icon: "📊",
        text: `A member just completed their cannabis profile${event.archetype ? ` · ${event.archetype}` : ""}`,
      };
    case "experience_logged":
      return {
        icon: "📝",
        text: `A member logged ${event.productName || "an experience"}${event.rating ? ` · ${event.rating}/5 ⭐` : ""}`,
      };
    case "product_added":
      return {
        icon: "🛍️",
        text: `${event.vendorName || "A dispensary"} just added ${event.productName || "a new product"}`,
      };
    case "vendor_approved":
      return {
        icon: "🏪",
        text: `${event.storeName || "A new dispensary"} just joined Mycana${event.city ? ` in ${event.city}` : ""}`,
      };
    default:
      return null;
  }
}
