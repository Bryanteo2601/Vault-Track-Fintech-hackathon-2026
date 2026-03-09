import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { CPF_MILESTONES, CPF_AGE_MILESTONES } from '@/lib/cpf-constants';

interface CPFMilestonesTimelineProps {
  currentAge: number;
}

export function CPFMilestonesTimeline({ currentAge }: CPFMilestonesTimelineProps) {
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>CPF Milestones</Text>

      {CPF_MILESTONES.map((milestone, idx) => {
        const isPassed = currentAge >= milestone.age;
        const isCurrent = currentAge === milestone.age;
        const yearsAway = milestone.age - currentAge;

        return (
          <View key={idx} style={styles.milestoneRow}>
            {/* Timeline dot and line */}
            <View style={styles.timelineColumn}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isPassed ? colors.success : isCurrent ? colors.primary : colors.border,
                    borderColor: isPassed ? colors.success : isCurrent ? colors.primary : colors.muted,
                  },
                ]}
              />
              {idx < CPF_MILESTONES.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: isPassed ? colors.success : colors.border },
                  ]}
                />
              )}
            </View>

            {/* Content */}
            <View style={styles.contentColumn}>
              <View style={styles.headerRow}>
                <Text style={styles.icon}>{milestone.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.age, { color: colors.muted }]}>Age {milestone.age}</Text>
                  <Text style={[styles.title, { color: colors.foreground }]}>{milestone.title}</Text>
                </View>
                {isPassed && <Text style={[styles.badge, { color: colors.success }]}>✓ Passed</Text>}
                {isCurrent && <Text style={[styles.badge, { color: colors.primary }]}>Now</Text>}
                {!isPassed && !isCurrent && (
                  <Text style={[styles.badge, { color: colors.muted }]}>In {yearsAway} yr{yearsAway !== 1 ? 's' : ''}</Text>
                )}
              </View>
              <Text style={[styles.description, { color: colors.muted }]}>
                {milestone.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  milestoneRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineColumn: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  contentColumn: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  icon: {
    fontSize: 18,
  },
  age: {
    fontSize: 11,
    marginBottom: 2,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
});
