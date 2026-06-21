import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export default function PromptCard({ prompt, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {prompt.thumbnailUrl ? (
        <Image
          source={{ uri: prompt.thumbnailUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          cachePolicy="disk"
          transition={150}
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Ionicons name="image" size={28} color="#54546B" />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{prompt.title}</Text>
        <Text style={styles.promptPreview} numberOfLines={2}>{prompt.promptText}</Text>

        <View style={styles.metaRow}>
          {!!prompt.aiTool && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{prompt.aiTool}</Text>
            </View>
          )}
          <View style={styles.statsRow}>
            <Ionicons name="download-outline" size={13} color="#9B9BAE" />
            <Text style={styles.statsText}>{prompt.downloadCount ?? 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#191920',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#24242E',
  },
  thumbnail: { width: 96, height: 96 },
  thumbnailPlaceholder: { backgroundColor: '#1F1F28', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  promptPreview: { color: '#9B9BAE', fontSize: 12.5, lineHeight: 17 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  tag: { backgroundColor: 'rgba(124,92,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { color: '#A98CFF', fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statsText: { color: '#9B9BAE', fontSize: 12 },
});
