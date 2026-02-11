import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/colors';
import { useData } from '../context/DataContext';
import { triggerHaptic, formatCurrency, getEnvelopeTotal, getWeeksTotal } from '../utils/helpers';

function EnvelopeGrid({ envelopes, onToggle }) {
  return (
    <View style={styles.envelopeGrid}>
      {Array.from({ length: 100 }, (_, i) => i + 1).map(n => {
        const isStuffed = envelopes.includes(n);
        return (
          <TouchableOpacity
            key={n}
            style={[styles.envelope, isStuffed && styles.envelopeStuffed]}
            onPress={() => onToggle(n)}
            activeOpacity={0.7}
          >
            <Text style={[styles.envelopeText, isStuffed && styles.envelopeTextStuffed]}>
              {isStuffed ? '✓' : `$${n}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function WeekList({ weeks, onToggle }) {
  return (
    <View style={styles.weekList}>
      {Array.from({ length: 52 }, (_, i) => i + 1).map(w => {
        const isDone = weeks.includes(w);
        return (
          <TouchableOpacity
            key={w}
            style={[styles.weekRow, isDone && styles.weekRowDone]}
            onPress={() => onToggle(w)}
            activeOpacity={0.7}
          >
            <View style={[styles.weekCheck, isDone && styles.weekCheckDone]}>
              {isDone && <Text style={styles.weekCheckText}>✓</Text>}
            </View>
            <Text style={[styles.weekLabel, isDone && styles.weekLabelDone]}>Week {w}</Text>
            <Text style={[styles.weekAmount, isDone && styles.weekAmountDone]}>${w}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ChallengesScreen() {
  const { envelopes, updateEnvelopes, weeks, updateWeeks, loaded } = useData();
  const [activeChallenge, setActiveChallenge] = useState(null); // 'envelope' | 'week52' | null

  const envTotal = useMemo(() => getEnvelopeTotal(envelopes), [envelopes]);
  const weekTotal = useMemo(() => getWeeksTotal(weeks), [weeks]);

  const toggleEnvelope = useCallback((n) => {
    const next = envelopes.includes(n)
      ? envelopes.filter(e => e !== n)
      : [...envelopes, n];
    triggerHaptic(envelopes.includes(n) ? 'light' : 'success');
    updateEnvelopes(next);
  }, [envelopes, updateEnvelopes]);

  const toggleWeek = useCallback((w) => {
    const next = weeks.includes(w)
      ? weeks.filter(e => e !== w)
      : [...weeks, w];
    triggerHaptic(weeks.includes(w) ? 'light' : 'success');
    updateWeeks(next);
  }, [weeks, updateWeeks]);

  const resetChallenge = (type) => {
    Alert.alert(
      'Reset Challenge',
      'Are you sure? This will clear all progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            if (type === 'envelope') updateEnvelopes([]);
            else updateWeeks([]);
            triggerHaptic('medium');
          },
        },
      ]
    );
  };

  if (activeChallenge === 'envelope') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.challengeHeader}>
            <TouchableOpacity onPress={() => setActiveChallenge(null)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetChallenge('envelope')}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.challengeTitle}>100 Envelope Challenge</Text>
          <Text style={styles.challengeDesc}>
            Tap envelopes to "stuff" them. Each envelope = its dollar amount. Complete all 100 to save $5,050!
          </Text>

          {/* Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.progressAmount}>{formatCurrency(envTotal)}</Text>
            <Text style={styles.progressOf}>of $5,050.00</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(envTotal / 5050) * 100}%`, backgroundColor: Colors.primary }]} />
            </View>
            <Text style={styles.progressCount}>{envelopes.length}/100 envelopes stuffed</Text>
          </View>

          {envelopes.length === 100 && (
            <View style={styles.completeBanner}>
              <Text style={styles.completeEmoji}>🎉</Text>
              <Text style={styles.completeText}>Challenge Complete! You saved $5,050!</Text>
            </View>
          )}

          <EnvelopeGrid envelopes={envelopes} onToggle={toggleEnvelope} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (activeChallenge === 'week52') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.challengeHeader}>
            <TouchableOpacity onPress={() => setActiveChallenge(null)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetChallenge('week52')}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.challengeTitle}>52-Week Challenge</Text>
          <Text style={styles.challengeDesc}>
            Save $1 in week 1, $2 in week 2... up to $52 in week 52. Total: $1,378!
          </Text>

          <View style={styles.progressSection}>
            <Text style={styles.progressAmount}>{formatCurrency(weekTotal)}</Text>
            <Text style={styles.progressOf}>of $1,378.00</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(weekTotal / 1378) * 100}%`, backgroundColor: Colors.secondary }]} />
            </View>
            <Text style={styles.progressCount}>{weeks.length}/52 weeks completed</Text>
          </View>

          {weeks.length === 52 && (
            <View style={[styles.completeBanner, { borderColor: Colors.secondary }]}>
              <Text style={styles.completeEmoji}>🎉</Text>
              <Text style={styles.completeText}>Challenge Complete! You saved $1,378!</Text>
            </View>
          )}

          <WeekList weeks={weeks} onToggle={toggleWeek} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.textSecondary, fontSize: 16 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Challenge Selection
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Challenges</Text>
        <Text style={styles.subtitle}>Pick a savings challenge and track your progress</Text>

        <TouchableOpacity
          style={styles.challengeCard}
          onPress={() => setActiveChallenge('envelope')}
          activeOpacity={0.8}
        >
          <View style={styles.challengeCardHeader}>
            <Text style={styles.challengeCardIcon}>✉️</Text>
            <View style={styles.challengeCardInfo}>
              <Text style={styles.challengeCardTitle}>100 Envelope Challenge</Text>
              <Text style={styles.challengeCardGoal}>Goal: $5,050</Text>
            </View>
          </View>
          {envelopes.length > 0 ? (
            <View>
              <View style={styles.miniProgressBg}>
                <View style={[styles.miniProgressFill, { width: `${(envelopes.length / 100) * 100}%`, backgroundColor: Colors.primary }]} />
              </View>
              <Text style={styles.challengeCardProgress}>
                {envelopes.length}/100 • {formatCurrency(envTotal)} saved
              </Text>
            </View>
          ) : (
            <Text style={styles.challengeCardCta}>Tap to start →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.challengeCard}
          onPress={() => setActiveChallenge('week52')}
          activeOpacity={0.8}
        >
          <View style={styles.challengeCardHeader}>
            <Text style={styles.challengeCardIcon}>📊</Text>
            <View style={styles.challengeCardInfo}>
              <Text style={styles.challengeCardTitle}>52-Week Challenge</Text>
              <Text style={styles.challengeCardGoal}>Goal: $1,378</Text>
            </View>
          </View>
          {weeks.length > 0 ? (
            <View>
              <View style={styles.miniProgressBg}>
                <View style={[styles.miniProgressFill, { width: `${(weeks.length / 52) * 100}%`, backgroundColor: Colors.secondary }]} />
              </View>
              <Text style={styles.challengeCardProgress}>
                {weeks.length}/52 • {formatCurrency(weekTotal)} saved
              </Text>
            </View>
          ) : (
            <Text style={styles.challengeCardCta}>Tap to start →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },

  challengeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  challengeCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  challengeCardIcon: { fontSize: 36, marginRight: 16 },
  challengeCardInfo: { flex: 1 },
  challengeCardTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  challengeCardGoal: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  challengeCardProgress: { fontSize: 13, color: Colors.textSecondary, marginTop: 8 },
  challengeCardCta: { fontSize: 15, color: Colors.primary, fontWeight: '600' },

  miniProgressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  miniProgressFill: { height: 6, borderRadius: 3 },

  // Challenge Detail
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { paddingVertical: 8 },
  backBtnText: { fontSize: 18, color: Colors.primary, fontWeight: '600' },
  resetText: { fontSize: 15, color: Colors.error, fontWeight: '600' },

  challengeTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  challengeDesc: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 20 },

  progressSection: { alignItems: 'center', marginBottom: 24 },
  progressAmount: { fontSize: 40, fontWeight: '800', color: Colors.primary },
  progressOf: { fontSize: 15, color: Colors.textSecondary, marginTop: 4 },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
    marginTop: 16,
  },
  progressBarFill: { height: 10, borderRadius: 5 },
  progressCount: { fontSize: 14, color: Colors.textSecondary, marginTop: 8 },

  completeBanner: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  completeEmoji: { fontSize: 40, marginBottom: 8 },
  completeText: { fontSize: 18, fontWeight: '700', color: Colors.primary, textAlign: 'center' },

  // Envelope Grid
  envelopeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  envelope: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  envelopeStuffed: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  envelopeText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  envelopeTextStuffed: { fontSize: 16, color: Colors.primary },

  // Week List
  weekList: { gap: 4 },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  weekRowDone: { backgroundColor: Colors.primaryMuted },
  weekCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekCheckDone: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  weekCheckText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  weekLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  weekLabelDone: { color: Colors.textSecondary },
  weekAmount: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  weekAmountDone: { color: Colors.secondary },
});
