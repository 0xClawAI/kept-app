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
    } else {
      updated = [...envelopes, num];
      triggerHaptic('success');
      setLastStuffed(num);
      // Bounce animation
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
        { text: 'Reset', style: 'destructive', onPress: () => updateEnvelopes([]) },
      ]
    );
  };

  const allDone = progress === 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>100 Envelope Challenge</Text>
      <Text style={styles.subtitle}>
        Stuff envelopes numbered 1–100. Save {formatCurrency(5050)} total!
      </Text>

      {/* Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.progressLabel}>Saved</Text>
            <Text style={styles.progressValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{progress}/100</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressPct}>{pct}% complete</Text>
      </View>

      {allDone && (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>Challenge Complete!</Text>
          <Text style={styles.celebrationText}>
            You saved {formatCurrency(5050)}! Incredible discipline.
          </Text>
        </View>
      )}

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
                <Text style={[styles.envelopeText, stuffed && styles.envelopeTextStuffed]}>
                  {stuffed ? '✓' : `$${num}`}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Reset */}
      {envelopes.length > 0 && (
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
  progressValue: { fontSize: 22, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  progressBarBg: { height: 8, backgroundColor: Colors.surfaceElevated, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  progressPct: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  celebrationCard: {
    backgroundColor: Colors.primaryMuted, borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 20,
  },
  celebrationEmoji: { fontSize: 48 },
  celebrationTitle: { fontSize: 22, fontWeight: '700', color: Colors.primary, marginTop: 8 },
  celebrationText: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  envelope: {
    width: CELL, height: CELL, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  envelopeStuffed: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  envelopeText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  envelopeTextStuffed: { color: Colors.primary, fontSize: 16 },
  resetBtn: {
    marginTop: 24, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.error,
  },
  resetText: { color: Colors.error, fontWeight: '600', fontSize: 14 },
});
