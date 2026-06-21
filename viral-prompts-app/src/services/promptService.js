import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  where,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const PROMPTS_COLLECTION = 'prompts';
const LATEST_COUNT = 5;

function docToPrompt(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title ?? '',
    promptText: data.promptText ?? '',
    category: data.category ?? 'general',
    aiTool: data.aiTool ?? '',
    thumbnailUrl: data.thumbnailUrl ?? null,
    exampleImages: data.exampleImages ?? [],
    viewCount: data.viewCount ?? 0,
    downloadCount: data.downloadCount ?? 0,
    // Firestore Timestamp -> millis, easy to store/compare in cache
    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
  };
}

export const PromptService = {
  /**
   * Subscribes to the latest N prompts in real time.
   * Fires immediately with current data, then again on every change
   * (new prompt added, edited, deleted) for as long as the app is open.
   * Returns an unsubscribe function — always call it on screen unmount.
   */
  subscribeToLatest(callback, onError, count = LATEST_COUNT) {
    const q = query(
      collection(db, PROMPTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(count)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const prompts = snapshot.docs.map(docToPrompt);
        callback(prompts);
      },
      (error) => {
        console.warn('Firestore subscription error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  },

  /** One-off fetch (used as a fallback if real-time listener isn't desired) */
  async fetchLatestOnce(count = LATEST_COUNT) {
    const q = query(
      collection(db, PROMPTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToPrompt);
  },

  async fetchById(id) {
    const ref = doc(db, PROMPTS_COLLECTION, id);
    const snap = await getDoc(ref);
    return snap.exists() ? docToPrompt(snap) : null;
  },

  async fetchByCategory(category, count = 30) {
    const q = query(
      collection(db, PROMPTS_COLLECTION),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToPrompt);
  },

  /** Fetches a larger batch for client-side search/filter (simple MVP approach) */
  async fetchAll(count = 100) {
    const q = query(
      collection(db, PROMPTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToPrompt);
  },

  async incrementViewCount(id) {
    try {
      await updateDoc(doc(db, PROMPTS_COLLECTION, id), {
        viewCount: increment(1),
      });
    } catch (e) {
      // Non-critical, fail silently
      console.warn('viewCount increment failed:', e);
    }
  },

  async incrementDownloadCount(id) {
    try {
      await updateDoc(doc(db, PROMPTS_COLLECTION, id), {
        downloadCount: increment(1),
      });
    } catch (e) {
      console.warn('downloadCount increment failed:', e);
    }
  },
};
