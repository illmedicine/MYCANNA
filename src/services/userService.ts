import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { CategoryId } from '../types/cannabis';
import type { UserPreferences } from '../types/user';

const userDoc = (uid: string) => doc(db, 'users', uid);

export async function getUserPreferences(uid: string): Promise<UserPreferences | null> {
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    categoryPreferences: data.preferences?.categoryPreferences ?? [],
    updatedAt: data.preferences?.updatedAt?.toDate() ?? null,
  };
}

export async function saveUserPreferences(
  uid: string,
  categoryPreferences: CategoryId[],
): Promise<void> {
  const ref = userDoc(uid);
  const snap = await getDoc(ref);

  const payload = {
    preferences: {
      categoryPreferences,
      updatedAt: serverTimestamp(),
    },
  };

  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
  }
}
