import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyState({ icon = 'alert-circle-outline', title, subtitle }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color="#3A3A48" />
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  subtitle: { color: '#9B9BAE', fontSize: 13, marginTop: 6, textAlign: 'center' },
});
