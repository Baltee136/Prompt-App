import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PromptService } from '../services/promptService';
import PromptCard from '../components/PromptCard';
import EmptyState from '../components/EmptyState';

const TOOL_FILTERS = ['All', 'Midjourney', 'ChatGPT', 'Nano Banana', 'Other'];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [activeTool, setActiveTool] = useState('All');
  const [allPrompts, setAllPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await PromptService.fetchAll(100);
      setAllPrompts(data);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return allPrompts.filter((p) => {
      const matchesQuery =
        query.trim() === '' ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.promptText.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase());
      const matchesTool = activeTool === 'All' || p.aiTool === activeTool;
      return matchesQuery && matchesTool;
    });
  }, [allPrompts, query, activeTool]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#9B9BAE" />
        <TextInput
          style={styles.input}
          placeholder="Search prompts…"
          placeholderTextColor="#6B6B7E"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#6B6B7E" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TOOL_FILTERS}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeTool === item && styles.filterChipActive]}
            onPress={() => setActiveTool(item)}
          >
            <Text style={[styles.filterChipText, activeTool === item && styles.filterChipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color="#7C5CFF" size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState icon="search-outline" title="No matches" subtitle="Try a different search or filter." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PromptCard
              prompt={item}
              onPress={() => navigation.navigate('PromptDetail', { promptId: item.id, prompt: item })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F14' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191920',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#24242E',
  },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filterChip: {
    backgroundColor: '#191920',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#24242E',
  },
  filterChipActive: { backgroundColor: '#7C5CFF', borderColor: '#7C5CFF' },
  filterChipText: { color: '#9B9BAE', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
