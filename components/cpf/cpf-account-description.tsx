import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { CPFAccountType, getCPFAccountDescription } from '@/lib/cpf-constants';

interface CPFAccountDescriptionProps {
  accountType: CPFAccountType;
}

export function CPFAccountDescription({ accountType }: CPFAccountDescriptionProps) {
  const colors = useAppColors();
  const [expanded, setExpanded] = useState(false);
  const account = getCPFAccountDescription(accountType);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={({ pressed }) => [styles.header, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{account.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.foreground }]}>{account.name}</Text>
            <Text style={[styles.description, { color: colors.muted }]}>{account.description}</Text>
          </View>
        </View>
        <Text style={[styles.expandIcon, { color: colors.muted }]}>
          {expanded ? '▼' : '▶'}
        </Text>
      </Pressable>

      {/* Expanded Content */}
      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
          {/* Uses */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Uses</Text>
            {account.uses.map((use, idx) => (
              <View key={idx} style={styles.useItem}>
                <Text style={[styles.useBullet, { color: colors.primary }]}>•</Text>
                <Text style={[styles.useText, { color: colors.muted }]}>{use}</Text>
              </View>
            ))}
          </View>

          {/* Note */}
          {'note' in account && account.note && (
            <View style={[styles.noteBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
              <Text style={[styles.noteText, { color: colors.primary }]}>ℹ️ {account.note}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginTop: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  expandIcon: {
    fontSize: 12,
    marginTop: 4,
  },
  expandedContent: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  useItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  useBullet: {
    fontSize: 12,
    marginTop: 2,
  },
  useText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  noteBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
