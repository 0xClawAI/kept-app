import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Animated, Alert,
} from 'react-native';
import { Colors } from '../utils/colors';
import { useData } from '../context/DataContext';
import { formatCurrency, getEnvelopeTotal, triggerHaptic } from '../utils/helpers';

const { width } = Dimensions.get('window');
const COLS = 5;
const GAP = 8;
const CELL = Math.floor((width - 40 - (COLS - 1) * GAP) / COLS);

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
    Alert.alert(
      'Reset Challenge',
      'This will clear all stuffed envelopes. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => { updateEnvelopes([]); setLastStuffed(null); } },
      ]
    );
  };

  const allDone = progress === 100;

  // Milestones
  const milestones = [10, 25, 50, 75, 100];
  const nextMilestone = milestones.find(m => progress < m) || 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Progress */}
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
          {!allDone && (
            <Text style={styles.progressNext}>Next: {nextMilestone} envelopes</Text>
          )}
        </View>
      </View>

      {allDone && (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationEmoji}>🎉🎊🎉</Text>
          <Text style={styles.celebrationTitle}>Challenge Complete!</Text>
          <Text style={styles.celebrationText}>
            You saved {formatCurrency(5050)}! Incredible discipline.
          </Text>
        </View>
      )}

      <Text style={styles.gridHint}>Tap an envelope to stuff it with cash</Text>

      {/* Grid */}
      <View style={styles.grid}>
        {Array.from({ length: 100 }, (_, i) => i + 1).map(num => {
          const stuffed = envelopes.includes(num);
          const isLast = lastStuffed === num;
          return (
            <Animated.View
              key={num}
              style={isLast ? { transform: [{ scale: scaleAnim }] } : undefined}
            >
              <TouchableOpacity
                style={[styles.envelope, stuffed && styles.envelopeStuffed]}
                onPress={() => toggleEnvelope(num)}
                activeOpacity={0.6}
              >
                {stuffed ? (
                  <Text style={styles.envelopeCheck}>✓</Text>
                ) : (
                  <Text style={styles.envelopeText}>${num}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Reset */}
      {envelopes.length > 0 && (
        <TouchableOpacity style={styles.resetBtn} onPress={resetChallenge} activeOpacity={0.7}>
          <Text style={styles.resetText}>Reset Challenge</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  progressCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.5 },
  progressValue: { fontSize: 22, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  progressBarBg: { height: 8, backgroundColor: Colors.surfaceElevated, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressPct: { fontSize: 12, color: Colors.textSecondary },
  progressNext: { fontSize: 12, color: Colors.textDisabled },
  celebrationCard: {
    backgroundColor: Colors.primaryMuted, borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: Colors.primary,
  },
  celebrationEmoji: { fontSize: 36 },
  celebrationTitle: { fontSize: 22, fontWeight: '700', color: Colors.primary, marginTop: 8 },
  celebrationText: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  gridHint: { fontSize: 13, color: Colors.textDisabled, marginBottom: 12, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  envelope: {
    width: CELL, height: CELL, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  envelopeStuffed: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  envelopeText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  envelopeCheck: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  resetBtn: {
    marginTop: 24, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.error,
  },
  resetText: { color: Colors.error, fontWeight: '600', fontSize: 14 },
});
