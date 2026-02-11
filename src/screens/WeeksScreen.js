import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors, Spacing, FontSize, Radius, CardStyle } from '../utils/colors';
import { useData } from '../context/DataContext';
import { formatCurrency, getWeeksTotal, triggerHaptic } from '../utils/helpers';

export default function WeeksScreen() {
  const { weeks, updateWeeks } = useData();

  const total = useMemo(() => getWeeksTotal(weeks), [weeks]);
  const pct = Math.round((total / 1378) * 100);

  const toggleWeek = useCallback((num) => {
    const done = weeks.includes(num);
    const updated = done ? weeks.filter(n => n !== num) : [...weeks, num];
    triggerHaptic(done ? 'light' : 'success');
    updateWeeks(updated);
  }, [weeks, updateWeeks]);

  const resetChallenge = () => {
    Alert.alert('Reset Challenge', 'This will clear all completed weeks. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => updateWeeks([]) },
    ]);
  };

  const allDone = weeks.length === 52;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.progressLabel}>SAVED</Text>
            <Text style={styles.progressValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.progressLabel}>WEEKS DONE</Text>
            <Text style={styles.progressValue}>{weeks.length}/52</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressPct}>{pct}% complete • {formatCurrency(1378 - total)} to go</Text>
      </View>

      {allDone && (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationEmoji}>🏆</Text>
          <Text style={styles.celebrationTitle}>Challenge Complete!</Text>
          <Text style={styles.celebrationText}>You saved {formatCurrency(1378)}! A full year of discipline.</Text>
        </View>
      )}

      {Array.from({ length: 52 }, (_, i) => i + 1).map(num => {
        const done = weeks.includes(num);
        return (
          <TouchableOpacity
            key={num}
            style={[styles.weekRow, done && styles.weekRowDone]}
            onPress={() => toggleWeek(num)} activeOpacity={0.6}
          >
            <View style={[styles.weekCheck, done && styles.weekCheckDone]}>
              {done && <Text style={styles.weekCheckMark}>✓</Text>}
            </View>
            <Text style={[styles.weekLabel, done && styles.weekLabelDone]}>Week {num}</Text>
            <Text style={[styles.weekAmount, done && styles.weekAmountDone]}>{formatCurrency(num)}</Text>
          </TouchableOpacity>
        );
      })}

      {weeks.length > 0 && (
        <TouchableOpacity style={styles.resetBtn} onPress={resetChallenge} activeOpacity={0.7}>
          <Text style={styles.resetText}>Reset Challenge</Text>
        </TouchableOpacity>
      )}
      <View style={{ height: Spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xxl },
  progressCard: {
    ...CardStyle,
    marginBottom: Spacing.md,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  progressLabel: { fontSize: FontSize.caption, color: Colors.textSecondary, letterSpacing: 0.5 },
  progressValue: { fontSize: FontSize.section, fontWeight: '700', color: Colors.secondary, marginTop: 2 },
  progressBarBg: { height: Spacing.sm, backgroundColor: Colors.surfaceElevated, borderRadius: Spacing.xs, overflow: 'hidden' },
  progressBarFill: { height: Spacing.sm, borderRadius: Spacing.xs, backgroundColor: Colors.secondary },
  progressPct: { fontSize: FontSize.caption + 1, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  celebrationCard: {
    backgroundColor: 'rgba(129,140,248,0.15)', borderRadius: Radius.lg, padding: Spacing.lg,
    alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.secondary,
  },
  celebrationEmoji: { fontSize: 48 },
  celebrationTitle: { fontSize: FontSize.section, fontWeight: '700', color: Colors.secondary, marginTop: Spacing.sm },
  celebrationText: { fontSize: FontSize.small + 1, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  weekRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm - 2, borderWidth: 1, borderColor: Colors.border,
    minHeight: 48,
  },
  weekRowDone: { borderColor: Colors.secondary, backgroundColor: 'rgba(129,140,248,0.08)' },
  weekCheck: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  weekCheckDone: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  weekCheckMark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  weekLabel: { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, fontWeight: '500' },
  weekLabelDone: { color: Colors.textSecondary },
  weekAmount: { fontSize: FontSize.body, fontWeight: '700', color: Colors.textPrimary },
  weekAmountDone: { color: Colors.secondary },
  resetBtn: {
    marginTop: Spacing.lg, alignSelf: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.error, minHeight: 44, justifyContent: 'center',
  },
  resetText: { color: Colors.error, fontWeight: '600', fontSize: FontSize.small + 1 },
});
