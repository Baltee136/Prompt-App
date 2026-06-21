import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { PromptService } from '../services/promptService';
import { PromptCache } from '../services/promptCache';

export default function PromptDetailScreen({ route, navigation }) {
  const { promptId, prompt: initialPrompt } = route.params;
  const [prompt, setPrompt] = useState(initialPrompt ?? null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load full data: prefer fresh network fetch, fall back to cache if offline
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const fresh = await PromptService.fetchById(promptId);
        if (mounted && fresh) {
          setPrompt(fresh);
          await PromptCache.setPromptById(fresh);
          PromptService.incrementViewCount(promptId);
        }
      } catch (e) {
        // Offline or error — fall back to cache, or keep initialPrompt
        const cached = await PromptCache.getPromptById(promptId);
        if (mounted && cached) setPrompt(cached);
      }
    })();
    return () => { mounted = false; };
  }, [promptId]);

  useEffect(() => {
    (async () => {
      const savedIds = await PromptCache.getSavedIds();
      setSaved(savedIds.includes(promptId));
    })();
  }, [promptId]);

  const handleCopy = useCallback(async () => {
    if (!prompt?.promptText) return;
    await Clipboard.setStringAsync(prompt.promptText);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    PromptService.incrementDownloadCount(promptId);
    setTimeout(() => setCopied(false), 1800);
  }, [prompt, promptId]);

  const handleToggleSave = useCallback(async () => {
    const newState = await PromptCache.toggleSaved(promptId);
    setSaved(newState);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [promptId]);

  if (!prompt) {
    return (
      <View style={styles.centerFill}>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {prompt.thumbnailUrl && (
        <Image
          source={{ uri: prompt.thumbnailUrl }}
          style={styles.heroImage}
          contentFit="cover"
          cachePolicy="disk"
        />
      )}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{prompt.title}</Text>
          <TouchableOpacity onPress={handleToggleSave} style={styles.saveBtn}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={saved ? '#7C5CFF' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {!!prompt.aiTool && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{prompt.aiTool}</Text>
          </View>
        )}

        <View style={styles.promptBox}>
          <Text style={styles.promptText} selectable>{prompt.promptText}</Text>
        </View>

        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.85}>
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={18}
            color="#fff"
          />
          <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Prompt'}</Text>
        </TouchableOpacity>

        {prompt.exampleImages?.length > 0 && (
          <View style={styles.examplesSection}>
            <Text style={styles.sectionLabel}>Examples</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {prompt.exampleImages.map((url, idx) => (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={styles.exampleImage}
                  contentFit="cover"
                  cachePolicy="disk"
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={14} color="#9B9BAE" />
            <Text style={styles.statText}>{prompt.viewCount ?? 0} views</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="download-outline" size={14} color="#9B9BAE" />
            <Text style={styles.statText}>{prompt.downloadCount ?? 0} copies</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F14' },
  centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F14' },
  loadingText: { color: '#9B9BAE' },
  heroImage: { width: '100%', height: 260, backgroundColor: '#191920' },
  body: { padding: 18 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { flex: 1, color: '#fff', fontSize: 22, fontWeight: '800', marginRight: 12 },
  saveBtn: { padding: 4 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124,92,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  tagText: { color: '#A98CFF', fontSize: 12, fontWeight: '700' },
  promptBox: {
    backgroundColor: '#191920',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#24242E',
  },
  promptText: { color: '#E4E4ED', fontSize: 14.5, lineHeight: 22 },
  copyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7C5CFF',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 14,
    gap: 8,
  },
  copyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  examplesSection: { marginTop: 24 },
  sectionLabel: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  exampleImage: { width: 140, height: 140, borderRadius: 12, marginRight: 10, backgroundColor: '#191920' },
  statsRow: { flexDirection: 'row', gap: 18, marginTop: 22 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { color: '#9B9BAE', fontSize: 12.5 },
});
