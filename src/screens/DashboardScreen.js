import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { Colors } from '../utils/colors';
import { useData } from '../context/DataContext';
import {
  calculateStreak, calculateLongestStreak, formatCurrency,
  getEnvelopeTotal, getWeeksTotal, getDidntBuyTotal, getDateKey,
} from '../utils/helpers';

const { width } = Dimensions.get('window');

function StatCard({ label, value, icon, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>  
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ChallengeCard({ title, icon, progress, total, onPress, color }) {
  const pct = total > 0 ? Math.min(progress / total, 1) : 0;
  return (
    <TouchableOpacity style={styles.challengeCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.challengeTitle}>{title}</Text>
          <Text style={styles.challengeProgress}>
            {formatCurrency(progress)} of {formatCurrency(total)}
          </Text>
        </View>
        <Text style={styles.challengePct}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }) {
  const { noSpendDays, envelopes, weeks, didntBuyItems } = useData();

  const streak = useMemo(() => calculateStreak(noSpendDays), [noSpendDays]);
  const longestStreak = useMemo(() => calculateLongestStreak(noSpendDays), [noSpendDays]);
  const envelopeTotal = useMemo(() => getEnvelopeTotal(envelopes), [envelopes]);
  const weeksTotal = useMemo(() => getWeeksTotal(weeks), [weeks]);
  const didntBuyTotal = useMemo(() => getDidntBuyTotal(didntBuyItems), [didntBuyItems]);
  const totalSaved = envelopeTotal + weeksTotal + didntBuyTotal;

  const todayKey = getDateKey(new Date());
  const todayStatus = noSpendDays[todayKey];
  const noSpendCount = Object.values(noSpendDays).filter(v => v === 'no-spend').length;

  const hasActivity = envelopes.length > 0 || weeks.length > 0 || didntBuyItems.length > 0 || Object.keys(noSpendDays).length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.greeting}>Kept</Text>
      <Text style={styles.subtitle}>Your savings dashboard</Text>

      {/* Total Saved Hero */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Money Kept</Text>
        <Text style={styles.heroValue}>{formatCurrency(totalSaved)}</Text>
        {todayStatus === 'no-spend' && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>✓ No-spend day logged</Text>
          </View>
        )}
        {!todayStatus && (
          <TouchableOpacity
            style={styles.todayPrompt}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Text style={styles.todayPromptText}>📅 Log today's spending status</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard label="Current Streak" value={`${streak} 🔥`} icon="" color={Colors.streakFire} />
        <StatCard label="Longest Streak" value={`${longestStreak}`} icon="" color={Colors.secondary} />
        <StatCard label="No-Spend Days" value={`${noSpendCount}`} icon="" color={Colors.primary} />
        <StatCard label="Items Resisted" value={`${didntBuyItems.length}`} icon="" color={Colors.warning} />
      </View>

      {/* Active Challenges */}
      {hasActivity ? (
        <>
          <Text style={styles.sectionTitle}>Challenges</Text>
          <ChallengeCard
            title="100 Envelope Challenge"
            icon="✉️"
            progress={envelopeTotal}
            total={5050}
            color={Colors.primary}
            onPress={() => navigation.navigate('Challenges', { screen: 'Envelopes' })}
          />
          <ChallengeCard
            title="52-Week Savings"
            icon="📊"
            progress={weeksTotal}
            total={1378}
            color={Colors.secondary}
            onPress={() => navigation.navigate('Challenges', { screen: 'Weeks' })}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🚀</Text>
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptyText}>
            Tap the Calendar to log no-spend days, or explore Challenges to start saving!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  greeting: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24,
  },
  heroLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  heroValue: { fontSize: 42, fontWeight: '700', color: Colors.primary },
  todayBadge: {
    marginTop: 12, backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  todayBadgeText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  todayPrompt: {
    marginTop: 12, backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  todayPromptText: { color: Colors.textSecondary, fontSize: 13 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2, backgroundColor: Colors.surface,
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 3,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  challengeCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  challengeIcon: { fontSize: 28, marginRight: 12 },
  challengeTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  challengeProgress: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  challengePct: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  progressBarBg: {
    height: 6, backgroundColor: Colors.surfaceElevated, borderRadius: 3, overflow: 'hidden',
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
