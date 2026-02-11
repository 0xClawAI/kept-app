import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Animated, Alert,
} from 'react-native';
import { Colors, Spacing, FontSize, Radius, CardStyle } from '../utils/colors';
import { useData } from '../context/DataContext';
import { formatCurrency, getEnvelopeTotal, triggerHaptic } from '../utils/helpers';

const { width } = Dimensions.get('window');
const COLS = 5;
const GAP = Spacing.sm;
const CELL = Math.floor((width - Spacing.xxl - (COLS - 1) * GAP) / COLS);

export default function EnvelopeScreen() {
  const { envelopes, updateEnvelopes } = useData();
  const [lastStuffed, setLastStuffed] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const total = useMemo(() => getEnvelopeTotal(envelopes), [envelopes]);
  const progress = envelopes.length;
  const pct = Math.round((progress / 100) * 100);

  const toggleEnvelope = useCallback((num) => {
    const isStuffed = envelopes.includes(num);
    let updated;
    if (isStuffed) {
      updated = envelopes.filter(n => n !== num);
      triggerHaptic('light');
      setLastStuffed(null);
    } else {
      updated = [...envelopes, num];
      triggerHaptic('success');
      setLastStuffed(num);
      scaleAnim.setValue(1.3);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 3 }).start();
    }
    updateEnvelopes(updated);
  }, [envelopes, updateEnvelopes]);

  const resetChallenge = () => {
    Alert.alert('Reset Challenge', 'This will clear all stuffed envelopes. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { updateEnvelopes([]); setLastStuffed(null); } },
    ]);
  };

  const allDone = progress === 100;
  const milestones = [10, 25, 50, 75, 100];
  const nextMilestone = milestones.find(m => progress < m) || 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.progressLabel}>SAVED</Text>
            <Text style={styles.progressValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.progressLabel}>PROGRESS</Text>
            <Text style={styles.progressValue}>{progress}/100</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.progressMeta}>
          <Text style={styles.progressPct}>{pct}%</Text>
          {!allDone && <Text style={styles.progressNext}>Next: {nextMilestone} envelopes</Text>}
        </View>
      </View>

      {allDone && (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationEmoji}>🎉🎊🎉</Text>
          <Text style={styles.celebrationTitle}>Challenge Complete!</Text>
          <Text style={styles.celebrationText}>You saved {formatCurrency(5050)}! Incredible discipline.</Text>
        </View>
      )}

      <Text style={styles.gridHint}>Tap an envelope to stuff it with cash</Text>

      <View style={styles.grid}>
        {Array.from({ length: 100 }, (_, i) => i + 1).map(num => {
          const stuffed = envelopes.includes(num);
          const isLast = lastStuffed === num;
          return (
            <Animated.View key={num} style={isLast ? { transform: [{ scale: scaleAnim }] } : undefined}>
              <TouchableOpacity
                style={[styles.envelope, stuffed && styles.envelopeStuffed]}
                onPress={() => toggleEnvelope(num)} activeOpacity={0.6}
              >
                {stuffed
                  ? <Text style={styles.envelopeCheck}>✓</Text>
                  : <Text style={styles.envelopeText}>${num}</Text>
                }
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {envelopes.length > 0 && (
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
  progressValue: { fontSize: FontSize.section, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  progressBarBg: { height: Spacing.sm, backgroundColor: Colors.surfaceElevated, borderRadius: Spacing.xs, overflow: 'hidden' },
  progressBarFill: { height: Spacing.sm, borderRadius: Spacing.xs, backgroundColor: Colors.primary },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  progressPct: { fontSize: FontSize.caption + 1, color: Colors.textSecondary },
  progressNext: { fontSize: FontSize.caption + 1, color: Colors.textDisabled },
  celebrationCard: {
    backgroundColor: Colors.primaryMuted, borderRadius: Radius.lg, padding: Spacing.lg,
    alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.primary,
  },
  celebrationEmoji: { fontSize: 36 },
  celebrationTitle: { fontSize: FontSize.section, fontWeight: '700', color: Colors.primary, marginTop: Spacing.sm },
  celebrationText: { fontSize: FontSize.small + 1, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  gridHint: { fontSize: FontSize.small, color: Colors.textDisabled, marginBottom: Spacing.md, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  envelope: {
    width: CELL, height: CELL, borderRadius: Radius.md,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border, minWidth: 44, minHeight: 44,
  },
  envelopeStuffed: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  envelopeText: { fontSize: FontSize.caption + 1, fontWeight: '600', color: Colors.textSecondary },
  envelopeCheck: { color: Colors.primary, fontSize: FontSize.section, fontWeight: '700' },
  resetBtn: {
    marginTop: Spacing.lg, alignSelf: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.error, minHeight: 44, justifyContent: 'center',
  },
  resetText: { color: Colors.error, fontWeight: '600', fontSize: FontSize.small + 1 },
});
