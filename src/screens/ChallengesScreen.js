import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius, CardStyle } from '../utils/colors';
import { useData } from '../context/DataContext';
import { triggerHaptic, formatCurrency, getEnvelopeTotal, getWeeksTotal } from '../utils/helpers';

function AnimatedProgressBar({ pct, color }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: pct, duration: 600, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={styles.progressBarBg}>
      <Animated.View style={[styles.progressBarFill, {
        width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        backgroundColor: color,
      }]} />
    </View>
  );
}

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
  const [activeChallenge, setActiveChallenge] = useState(null);

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
    Alert.alert('Reset Challenge', 'Are you sure? This will clear all progress.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => {
        if (type === 'envelope') updateEnvelopes([]);
        else updateWeeks([]);
        triggerHaptic('medium');
      }},
    ]);
  };

  if (activeChallenge === 'envelope') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.challengeHeader}>
            <TouchableOpacity onPress={() => setActiveChallenge(null)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetChallenge('envelope')} style={styles.resetTouchable}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.challengeTitle}>100 Envelope Challenge</Text>
          <Text style={styles.challengeDesc}>
            Tap envelopes to "stuff" them. Each envelope = its dollar amount. Complete all 100 to save $5,050!
          </Text>

          <View style={styles.progressSection}>
            <Text style={styles.progressAmount}>{formatCurrency(envTotal)}</Text>
            <Text style={styles.progressOf}>of $5,050.00</Text>
            <AnimatedProgressBar pct={(envTotal / 5050) * 100} color={Colors.primary} />
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
            <TouchableOpacity onPress={() => resetChallenge('week52')} style={styles.resetTouchable}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.challengeTitle}>52-Week Challenge</Text>
          <Text style={styles.challengeDesc}>
            Save $1 in week 1, $2 in week 2... up to $52 in week 52. Total: $1,378!
          </Text>

          <View style={styles.progressSection}>
            <Text style={[styles.progressAmount, { color: Colors.secondary }]}>{formatCurrency(weekTotal)}</Text>
            <Text style={styles.progressOf}>of $1,378.00</Text>
            <AnimatedProgressBar pct={(weekTotal / 1378) * 100} color={Colors.secondary} />
            <Text style={styles.progressCount}>{weeks.length}/52 weeks completed</Text>
          </View>

          {weeks.length === 52 && (
            <View style={[styles.completeBanner, { borderColor: Colors.secondary }]}>
              <Text style={styles.completeEmoji}>🎉</Text>
              <Text style={[styles.completeText, { color: Colors.secondary }]}>Challenge Complete! You saved $1,378!</Text>
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
          <Text style={{ color: Colors.textSecondary, fontSize: FontSize.bodyLarge }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Challenges</Text>
        <Text style={styles.subtitle}>Pick a savings challenge and track your progress</Text>

        <TouchableOpacity style={styles.challengeCard} onPress={() => setActiveChallenge('envelope')} activeOpacity={0.8}>
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

        <TouchableOpacity style={styles.challengeCard} onPress={() => setActiveChallenge('week52')} activeOpacity={0.8}>
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
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  title: { fontSize: FontSize.hero, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: FontSize.body, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.lg },

  challengeCard: {
    ...CardStyle,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  challengeCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  challengeCardIcon: { fontSize: 36, marginRight: Spacing.md },
  challengeCardInfo: { flex: 1 },
  challengeCardTitle: { fontSize: FontSize.subtitle, fontWeight: '700', color: Colors.textPrimary },
  challengeCardGoal: { fontSize: FontSize.small + 1, color: Colors.textSecondary, marginTop: 2 },
  challengeCardProgress: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: Spacing.sm },
  challengeCardCta: { fontSize: FontSize.body, color: Colors.primary, fontWeight: '600' },

  miniProgressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  miniProgressFill: { height: 6, borderRadius: 3 },

  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  backBtn: { minHeight: 44, justifyContent: 'center', paddingRight: Spacing.md },
  backBtnText: { fontSize: FontSize.subtitle, color: Colors.primary, fontWeight: '600' },
  resetTouchable: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end' },
  resetText: { fontSize: FontSize.body, color: Colors.error, fontWeight: '600' },

  challengeTitle: { fontSize: FontSize.title, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm },
  challengeDesc: { fontSize: FontSize.body, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },

  progressSection: { alignItems: 'center', marginBottom: Spacing.lg },
  progressAmount: { fontSize: 40, fontWeight: '800', color: Colors.primary },
  progressOf: { fontSize: FontSize.body, color: Colors.textSecondary, marginTop: Spacing.xs },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
    marginTop: Spacing.md,
  },
  progressBarFill: { height: 10, borderRadius: 5 },
  progressCount: { fontSize: FontSize.small + 1, color: Colors.textSecondary, marginTop: Spacing.sm },

  completeBanner: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  completeEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  completeText: { fontSize: FontSize.subtitle, fontWeight: '700', color: Colors.primary, textAlign: 'center' },

  envelopeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm - 2, justifyContent: 'center',
  },
  envelope: {
    width: '18%', aspectRatio: 1,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
    minWidth: 44, minHeight: 44,
  },
  envelopeStuffed: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  envelopeText: { fontSize: FontSize.caption + 1, fontWeight: '600', color: Colors.textSecondary },
  envelopeTextStuffed: { fontSize: FontSize.bodyLarge, color: Colors.primary },

  weekList: { gap: Spacing.xs },
  weekRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, gap: Spacing.md,
    minHeight: 48,
  },
  weekRowDone: { backgroundColor: Colors.primaryMuted },
  weekCheck: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  weekCheckDone: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  weekCheckText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  weekLabel: { flex: 1, fontSize: FontSize.bodyLarge, fontWeight: '600', color: Colors.textPrimary },
  weekLabelDone: { color: Colors.textSecondary },
  weekAmount: { fontSize: FontSize.bodyLarge, fontWeight: '700', color: Colors.textSecondary },
  weekAmountDone: { color: Colors.secondary },
});
