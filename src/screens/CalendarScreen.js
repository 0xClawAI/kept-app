import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { Colors } from '../utils/colors';
import { useData } from '../context/DataContext';
import {
  getDateKey, getDaysInMonth, getFirstDayOfMonth,
  calculateStreak, calculateLongestStreak, triggerHaptic,
} from '../utils/helpers';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 40 - 6 * 8) / 7);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function CalendarScreen() {
  const { noSpendDays, updateNoSpendDays } = useData();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayKey = getDateKey(today);

  const streak = useMemo(() => calculateStreak(noSpendDays), [noSpendDays]);
  const longestStreak = useMemo(() => calculateLongestStreak(noSpendDays), [noSpendDays]);

  const monthNoSpend = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (noSpendDays[key] === 'no-spend') count++;
    }
    return count;
  }, [noSpendDays, viewYear, viewMonth, daysInMonth]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const toggleDay = useCallback((day) => {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Don't allow future dates
    const cellDate = new Date(viewYear, viewMonth, day);
    if (cellDate > today) return;

    const current = noSpendDays[key];
    const updated = { ...noSpendDays };
    if (!current) {
      updated[key] = 'no-spend';
      triggerHaptic('success');
    } else if (current === 'no-spend') {
      updated[key] = 'spend';
      triggerHaptic('light');
    } else {
      delete updated[key];
      triggerHaptic('light');
    }
    updateNoSpendDays(updated);
  }, [noSpendDays, viewYear, viewMonth, updateNoSpendDays]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const isFutureMonth = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>No-Spend Calendar</Text>

      {/* Streak bar */}
      <View style={styles.streakRow}>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{streak} 🔥</Text>
          <Text style={styles.streakLabel}>Current</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>Best</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakItem}>
          <Text style={[styles.streakValue, { color: Colors.primary }]}>{monthNoSpend}</Text>
          <Text style={styles.streakLabel}>This Month</Text>
        </View>
      </View>

      {/* Month nav */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {DAYS.map(d => (
          <View key={d} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={`e-${i}`} style={styles.cell} />;
          const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const status = noSpendDays[key];
          const isToday = key === todayKey;
          const cellDate = new Date(viewYear, viewMonth, day);
          const isFuture = cellDate > today;

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.cell,
                status === 'no-spend' && styles.cellNoSpend,
                status === 'spend' && styles.cellSpend,
                isToday && styles.cellToday,
                isFuture && styles.cellFuture,
              ]}
              onPress={() => toggleDay(day)}
              activeOpacity={isFuture ? 1 : 0.6}
            >
              <Text style={[
                styles.cellText,
                status === 'no-spend' && styles.cellTextNoSpend,
                status === 'spend' && styles.cellTextSpend,
                isFuture && styles.cellTextFuture,
              ]}>
                {day}
              </Text>
              {status === 'no-spend' && <Text style={styles.cellCheck}>✓</Text>}
              {status === 'spend' && <View style={styles.cellDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>No-Spend</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
          <Text style={styles.legendText}>Spent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.surfaceElevated }]} />
          <Text style={styles.legendText}>Not Logged</Text>
        </View>
      </View>

      <Text style={styles.hint}>Tap a day to cycle: No-Spend → Spent → Clear</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 16 },
  streakRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  streakItem: { flex: 1, alignItems: 'center' },
  streakValue: { fontSize: 24, fontWeight: '700', color: Colors.streakFire },
  streakLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  streakDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  navBtn: { padding: 8 },
  navBtnText: { fontSize: 28, color: Colors.textPrimary, fontWeight: '300' },
  monthLabel: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeaderCell: { width: CELL_SIZE, marginRight: 8, alignItems: 'center' },
  dayHeaderText: { fontSize: 12, color: Colors.textDisabled, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: CELL_SIZE, height: CELL_SIZE, marginRight: 8, marginBottom: 8,
    borderRadius: 8, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cellNoSpend: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  cellSpend: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: Colors.error },
  cellToday: { borderColor: Colors.secondary, borderWidth: 2 },
  cellFuture: { opacity: 0.3 },
  cellText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  cellTextNoSpend: { color: Colors.primary },
  cellTextSpend: { color: Colors.error },
  cellTextFuture: { color: Colors.textDisabled },
  cellCheck: { fontSize: 8, color: Colors.primary, position: 'absolute', bottom: 3 },
  cellDot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.error,
    position: 'absolute', bottom: 5,
  },
  legend: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: Colors.textSecondary },
  hint: { textAlign: 'center', fontSize: 12, color: Colors.textDisabled, marginTop: 12 },
});
