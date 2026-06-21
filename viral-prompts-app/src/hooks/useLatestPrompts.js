import { useState, useEffect, useRef, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { PromptService } from '../services/promptService';
import { PromptCache } from '../services/promptCache';

/**
 * The core "real-time + cache" hook described in the app plan:
 *
 * 1. On mount, instantly render whatever is in local cache (zero spinner).
 * 2. Open a Firestore real-time listener for the latest 5 prompts.
 * 3. Whenever new data arrives (initial load, or a live change), diff it
 *    against what's on screen — if different, update UI AND overwrite cache.
 * 4. If the device is offline, Firestore's own offline persistence plus
 *    our cache keep the last known 5 prompts visible.
 *
 * Returns: { prompts, loading, isStale, refreshing, refresh, error }
 */
export function useLatestPrompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isStale, setIsStale] = useState(false); // true = showing cache, live data not confirmed yet
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  // Step 1: load cache immediately for instant first paint
  useEffect(() => {
    let mounted = true;
    (async () => {
      const cached = await PromptCache.getLatest5();
      if (mounted && cached.length > 0) {
        setPrompts(cached);
        setIsStale(true);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Step 2: open real-time listener; reconcile with cache as data arrives
  useEffect(() => {
    const unsubscribe = PromptService.subscribeToLatest(
      async (livePrompts) => {
        setPrompts((prev) => {
          const changed = JSON.stringify(prev) !== JSON.stringify(livePrompts);
          return changed ? livePrompts : prev;
        });
        setIsStale(false);
        setLoading(false);
        setError(null);
        // Step 3: always persist the freshest confirmed data to cache
        await PromptCache.setLatest5(livePrompts);
      },
      (err) => {
        setError(err);
        setLoading(false);
        // Keep showing cached/stale data on error — don't blank the screen
      }
    );
    unsubscribeRef.current = unsubscribe;
    return () => unsubscribe && unsubscribe();
  }, []);

  // Step 4: re-sync whenever connectivity is restored ("user comes online")
  useEffect(() => {
    const netUnsub = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        // The onSnapshot listener auto-resumes and re-syncs with Firestore
        // automatically when connectivity returns — nothing extra needed.
        // We just clear the stale flag optimistically; it'll be confirmed
        // (or corrected) by the next snapshot event.
      }
    });
    return () => netUnsub();
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await PromptService.fetchLatestOnce();
      setPrompts(fresh);
      setIsStale(false);
      await PromptCache.setLatest5(fresh);
    } catch (e) {
      setError(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { prompts, loading, refreshing, isStale, error, refresh };
}
