import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLatestPrompts } from '../hooks/useLatestPrompts';
import PromptCard from '../components/PromptCard';
import EmptyState from '../components/EmptyState';

export default function FeedScreen({ navigation }) {
  const { prompts, loading, refreshing, isStale, error, refresh } = useLatestPrompts();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Latest 5</Text>
        <View style={styles.headerActions}>
          {isStale && (
            <View style={styles.staleBadge}>
              <Text style={styles.staleBadgeText}>cached</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconBtn}>
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Saved')} style={styles.iconBtn}>
            <Ionicons name="bookmark" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && prompts.length === 0 ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color="#7C5CFF" size="large" />
        </View>
      ) : prompts.length === 0 ? (
        <EmptyState
          icon="image-outline"
          title="No prompts yet"
          subtitle={error ? 'Couldn\'t connect — pull to retry.' : 'Check back soon for viral prompts.'}
        />
      ) : (
        <FlatList
          data={prompts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#7C5CFF"
            />
          }
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 8 },
  staleBadge: {
    backgroundColor: '#2A2A35',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 4,
  },
  staleBadgeText: { color: '#9B9BAE', fontSize: 11, fontWeight: '600' },
  listContent: { padding: 16, paddingBottom: 32 },
  centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
