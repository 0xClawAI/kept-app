import React, { useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { Colors } from '../utils/colors';
import { useData } from '../context/DataContext';
import { formatCurrency, getWeeksTotal, triggerHaptic } from '../utils/helpers';

export default function WeeksScreen() {
  const { weeks, updateWeeks } = useData();

  const total = useMemo(() => getWeeksTotal(weeks), [weeks]);
  const pct = Math.round((total / 1378) * 100);

  const toggleWeek = useCallback((num) => {
    const done = weeks.includes(num);
    let updated;
    if (done) {
      updated = weeks.filter(n => n !== num);
      triggerHaptic('light');
    } else {
      updated = [...weeks, num];
      triggerHaptic('success');
    }
    updateWeeks(updated);
  }, [weeks, updateWeeks]);

  const resetChallenge = () => {
    Alert.alert(
      'Reset Challenge',
      'This will clear all completed weeks. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => updateWeeks([]) },
      ]
    );
  };

  const allDone = weeks.length === 52;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>52-Week Challenge</Text>
      <Text style={styles.subtitle}>
        Save $1 in week 1, $2 in week 2… {formatCurrency(1378)} total!
      </Text>

      {/* Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.progressLabel}>Saved</Text>
            <Text style={styles.progressValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.progressLabel}>Weeks Done</Text>
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
          <Text style={styles.celebrationText}>
            You saved {formatCurrency(1378)}! A full year of discipline.
          </Text>
        </View>
      )}

      {/* Week list */}
      {Array.from({ length: 52 }, (_, i) => i + 1).map(num => {
        const done = weeks.includes(num);
        return (
          <TouchableOpacity
            key={num}
            style={[styles.weekRow, done && styles.weekRowDone]}
            onPress={() => toggleWeek(num)}
            activeOpacity={0.6}
          >
            <View style={[styles.weekCheck, done && styles.weekCheckDone]}>
              {done && <Text style={styles.weekCheckMark}>✓</Text>}
            </View>
            <Text style={[styles.weekLabel, done && styles.weekLabelDone]}>
              Week {num}
            </Text>
            <Text style={[styles.weekAmount, done && styles.weekAmountDone]}>
              {formatCurrency(num)}
            </Text>
          </TouchableOpacity>
        );
      })}

      {weeks.length > 0 && (
        <TouchableOpacity style={styles.resetBtn} onPress={resetChallenge}>
          <Text style={styles.resetText}>Reset Challenge</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 20 },
  progressCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 12, color: Colors.textSecondary },
  progressValue: { fontSize: 22, fontWeight: '700', color: Colors.secondary, marginTop: 2 },
  progressBarBg: { height: 8, backgroundColor: Colors.surfaceElevated, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4, backgroundColor: Colors.secondary },
  progressPct: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  celebrationCard: {
    backgroundColor: 'rgba(129,140,248,0.15)', borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 20,
  },
  celebrationEmoji: { fontSize: 48 },
  celebrationTitle: { fontSize: 22, fontWeight: '700', color: Colors.secondary, marginTop: 8 },
  celebrationText: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  weekRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    marginBottom: 6, borderWidth: 1, borderColor: Colors.border,
  },
  weekRowDone: { borderColor: Colors.secondary, backgroundColor: 'rgba(129,140,248,0.08)' },
  weekCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  weekCheckDone: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  weekCheckMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  weekLabel: { flex: 1, fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
  weekLabelDone: { color: Colors.textSecondary },
  weekAmount: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  weekAmountDone: { color: Colors.secondary },
  resetBtn: {
    marginTop: 20, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.error,
  },
  resetText: { color: Colors.error, fontWeight: '600', fontSize: 14 },
});
