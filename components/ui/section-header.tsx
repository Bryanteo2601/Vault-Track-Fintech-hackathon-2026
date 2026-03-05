import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  const colors = useAppColors();
  return (
    <View style={styles.container}>
      <View style={styles.textGroup}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}>
          <Text style={[styles.actionText, { color: colors.accent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  textGroup: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 2 },
  action: { paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { fontSize: 14, fontWeight: '600' },
});
