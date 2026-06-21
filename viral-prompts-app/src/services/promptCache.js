import AsyncStorage from '@react-native-async-storage/async-storage';

const LATEST_PROMPTS_KEY = '@viral_prompts/latest_5';
const CACHE_TIMESTAMP_KEY = '@viral_prompts/latest_5_updated_at';
const ALL_PROMPTS_PREFIX = '@viral_prompts/prompt_';

/**
 * Cache layer for prompts.
 * - "Latest 5" is stored as one blob for instant load on app launch.
 * - Individual prompts are also cached by id so PromptDetail can render
 *   offline even if the user opened it before going offline.
 */
export const PromptCache = {
  // ---- Latest 5 (feed) ----
  async getLatest5() {
    try {
      const raw = await AsyncStorage.getItem(LATEST_PROMPTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Cache read failed (latest5):', e);
      return [];
    }
  },

  async setLatest5(prompts) {
    try {
      await AsyncStorage.setItem(LATEST_PROMPTS_KEY, JSON.stringify(prompts));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      // Also store each one individually so detail view works offline
      await Promise.all(
        prompts.map((p) =>
          AsyncStorage.setItem(`${ALL_PROMPTS_PREFIX}${p.id}`, JSON.stringify(p))
        )
      );
    } catch (e) {
      console.warn('Cache write failed (latest5):', e);
    }
  },

  async getLastUpdatedAt() {
    const raw = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    return raw ? parseInt(raw, 10) : null;
  },

  // ---- Single prompt (detail screen, works offline) ----
  async getPromptById(id) {
    try {
      const raw = await AsyncStorage.getItem(`${ALL_PROMPTS_PREFIX}${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Cache read failed (prompt by id):', e);
      return null;
    }
  },

  async setPromptById(prompt) {
    try {
      await AsyncStorage.setItem(
        `${ALL_PROMPTS_PREFIX}${prompt.id}`,
        JSON.stringify(prompt)
      );
    } catch (e) {
      console.warn('Cache write failed (prompt by id):', e);
    }
  },

  // ---- Local-only saved/bookmarked prompts (no account needed) ----
  async getSavedIds() {
    try {
      const raw = await AsyncStorage.getItem('@viral_prompts/saved_ids');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  async toggleSaved(promptId) {
    const current = await this.getSavedIds();
    const exists = current.includes(promptId);
    const updated = exists
      ? current.filter((id) => id !== promptId)
      : [...current, promptId];
    await AsyncStorage.setItem('@viral_prompts/saved_ids', JSON.stringify(updated));
    return !exists; // returns new saved state
  },

  async clearAll() {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith('@viral_prompts/'));
    await AsyncStorage.multiRemove(ours);
  },
};
