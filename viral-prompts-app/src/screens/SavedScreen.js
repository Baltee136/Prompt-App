import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PromptCache } from '../services/promptCache';
import { PromptService } from '../services/promptService';
import PromptCard from '../components/PromptCard';
import EmptyState from '../components/EmptyState';

export default function SavedScreen({ navigation }) {
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reload every time the screen is focused, so unsaving in detail view
  // is reflected immediately when coming back here.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        setLoading(true);
        const ids = await PromptCache.getSavedIds();

        // Try cache first (works offline), fall back to network fetch by id
        const results = await Promise.all(
          ids.map(async (id) => {
            const cached = await PromptCache.getPromptById(id);
            if (cached) return cached;
            try {
              return await PromptService.fetchById(id);
            } catch {
              return null;
            }
          })
        );

        if (mounted) {
          setSavedPrompts(results.filter(Boolean));
          setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centerFill}>
        <ActivityIndicator color="#7C5CFF" size="large" />
      </View>
    );
  }

  if (savedPrompts.length === 0) {
    return (
      <EmptyState
        icon="bookmark-outline"
        title="No saved prompts"
        subtitle="Tap the bookmark icon on any prompt to save it here."
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedPrompts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PromptCard
            prompt={item}
            onPress={() => navigation.navigate('PromptDetail', { promptId: item.id, prompt: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F14' },
  listContent: { padding: 16, paddingBottom: 32 },
  centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F14' },
});
