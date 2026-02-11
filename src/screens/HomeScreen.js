import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/colors';
import { useData } from '../context/DataContext';
import Confetti from '../components/Confetti';
import {
  calculateStreak, calculateLongestStreak, formatCurrency,
  getEnvelopeTotal, getWeeksTotal, getDidntBuyTotal, getDateKey,
} from '../utils/helpers';

function StatCard({ label, value, subtitle, color, icon }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function ChallengeProgress({ title, current, total, color, icon }) {
  const pct = total > 0 ? Math.min(current / total, 1) : 0;
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressIcon}>{icon}</Text>
        <Text style={styles.progressTitle}>{title}</Text>
        <Text style={[styles.progressPct, { color }]}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.progressSubtext}>
        {formatCurrency(current)} of {formatCurrency(total)}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { noSpendDays, envelopes, weeks, didntBuyItems, loaded } = useData();

  const stats = useMemo(() => {
    const streak = calculateStreak(noSpendDays);
    const longest = calculateLongestStreak(noSpendDays);
    const envTotal = getEnvelopeTotal(envelopes);
    const weekTotal = getWeeksTotal(weeks);
    const dbiTotal = getDidntBuyTotal(didntBuyItems);
    const totalSaved = envTotal + weekTotal + dbiTotal;
    const noSpendCount = Object.values(noSpendDays).filter(v => v === 'no-spend').length;
    const todayStatus = noSpendDays[getDateKey(new Date())];
    return { streak, longest, envTotal, weekTotal, dbiTotal, totalSaved, noSpendCount, todayStatus };
  }, [noSpendDays, envelopes, weeks, didntBuyItems]);

  const [showConfetti, setShowConfetti] = useState(false);
  const prevTotalRef = useRef(stats.totalSaved);

  useEffect(() => {
    if (stats.totalSaved > prevTotalRef.current && stats.totalSaved > 0) {
      // Check milestones
      const milestones = [100, 500, 1000, 2500, 5050];
      for (const m of milestones) {
        if (prevTotalRef.current < m && stats.totalSaved >= m) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          break;
        }
      }
    }
    prevTotalRef.current = stats.totalSaved;
  }, [stats.totalSaved]);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasAnyData = stats.noSpendCount > 0 || envelopes.length > 0 || weeks.length > 0 || didntBuyItems.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Confetti trigger={showConfetti} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kept</Text>
          <Text style={styles.headerSubtitle}>Your money. Your rules.</Text>
        </View>

        {!hasAnyData ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyTitle}>Welcome to Kept!</Text>
            <Text style={styles.emptyText}>
              Start tracking your no-spend days, take on savings challenges, and watch your savings grow.
            </Text>
            <Text style={styles.emptyHint}>
              Head to the Calendar to mark your first no-spend day, or try a Challenge!
            </Text>
          </View>
        ) : (
          <>
            {/* Total Saved Hero */}
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Total Saved</Text>
              <Text style={styles.heroValue}>{formatCurrency(stats.totalSaved)}</Text>
              {stats.todayStatus === 'no-spend' && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>✓ No-spend today</Text>
                </View>
              )}
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Current Streak"
                value={`${stats.streak}`}
                subtitle="days"
                color={Colors.streakFire}
                icon="🔥"
              />
              <StatCard
                label="Longest Streak"
                value={`${stats.longest}`}
                subtitle="days"
                color={Colors.warning}
                icon="🏆"
              />
              <StatCard
                label="No-Spend Days"
                value={`${stats.noSpendCount}`}
                subtitle="total"
                color={Colors.primary}
                icon="📅"
              />
              <StatCard
                label="Items Resisted"
                value={`${didntBuyItems.length}`}
                subtitle={formatCurrency(stats.dbiTotal) + ' saved'}
                color={Colors.secondary}
                icon="🛡️"
              />
            </View>

            {/* Challenge Progress */}
            {envelopes.length > 0 && (
              <ChallengeProgress
                title="100 Envelope Challenge"
                current={stats.envTotal}
                total={5050}
                color={Colors.primary}
                icon="✉️"
              />
            )}
            {weeks.length > 0 && (
              <ChallengeProgress
                title="52-Week Challenge"
                current={stats.weekTotal}
                total={1378}
                color={Colors.secondary}
                icon="📊"
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary, fontSize: 16 },

  header: { marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 },
  headerSubtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },

  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  heroLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5 },
  heroValue: { fontSize: 48, fontWeight: '800', color: Colors.primary, marginTop: 8, letterSpacing: -1 },
  todayBadge: {
    marginTop: 12,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayBadgeText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    width: '47%',
    flexGrow: 1,
    borderLeftWidth: 3,
  },
  statIcon: { fontSize: 20, marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: '700' },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  statSubtitle: { fontSize: 12, color: Colors.textDisabled, marginTop: 2 },

  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progressIcon: { fontSize: 18, marginRight: 8 },
  progressTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  progressPct: { fontSize: 16, fontWeight: '700' },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressSubtext: { fontSize: 13, color: Colors.textSecondary, marginTop: 8 },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 16 },
  emptyHint: { fontSize: 14, color: Colors.primary, textAlign: 'center', fontWeight: '600' },
});
