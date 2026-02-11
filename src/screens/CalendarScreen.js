import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius, CardStyle, HeaderStyle } from '../utils/colors';
import { useData } from '../context/DataContext';
import {
  getDateKey, getDaysInMonth, getFirstDayOfMonth,
  calculateStreak, calculateLongestStreak, triggerHaptic,
} from '../utils/helpers';

const { width } = Dimensions.get('window');
const GRID_PADDING = Spacing.lg;
const GAP = 6;
const CELL_SIZE = Math.floor((width - GRID_PADDING * 2 - 6 * GAP) / 7);
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function CalendarScreen() {
  const { noSpendDays, updateNoSpendDays, didntBuyItems, loaded } = useData();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayKey = getDateKey(today);

  const streak = useMemo(() => calculateStreak(noSpendDays), [noSpendDays]);
  const longestStreak = useMemo(() => calculateLongestStreak(noSpendDays), [noSpendDays]);

  const monthStats = useMemo(() => {
    let noSpend = 0, spend = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (noSpendDays[key] === 'no-spend') noSpend++;
      else if (noSpendDays[key] === 'spend') spend++;
    }
    return { noSpend, spend };
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
    const cellDate = new Date(viewYear, viewMonth, day, 23, 59, 59);
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

  const openDayDetail = useCallback((day) => {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cellDate = new Date(viewYear, viewMonth, day, 23, 59, 59);
    if (cellDate > today) return;
    setSelectedDay({ day, key });
  }, [viewYear, viewMonth]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedDayItems = selectedDay ? didntBuyItems.filter(i => i.date === selectedDay.key) : [];

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.textSecondary, fontSize: FontSize.body }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Track your no-spend days</Text>

        {/* Streak bar */}
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>{streak} 🔥</Text>
            <Text style={styles.streakLabel}>Current</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: Colors.secondary }]}>{longestStreak}</Text>
            <Text style={styles.streakLabel}>Best</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: Colors.primary }]}>{monthStats.noSpend}</Text>
            <Text style={styles.streakLabel}>This Month</Text>
          </View>
        </View>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn} activeOpacity={0.6}>
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
            activeOpacity={0.7}
          >
            <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn} activeOpacity={0.6}>
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {DAYS.map((d, i) => (
            <View key={i} style={styles.dayHeaderCell}>
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
            const cellDate = new Date(viewYear, viewMonth, day, 23, 59, 59);
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
                onLongPress={() => openDayDetail(day)}
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

        <Text style={styles.hint}>Tap to cycle: No-Spend → Spent → Clear{'\n'}Long-press for day details</Text>
      </ScrollView>

      {/* Day Detail Modal */}
      <Modal visible={!!selectedDay} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            {selectedDay && (
              <>
                <Text style={styles.modalTitle}>
                  {MONTHS[viewMonth]} {selectedDay.day}, {viewYear}
                </Text>
                <View style={styles.dayStatusRow}>
                  <Text style={styles.dayStatusLabel}>Status:</Text>
                  {noSpendDays[selectedDay.key] === 'no-spend' ? (
                    <View style={[styles.statusBadge, { backgroundColor: Colors.primaryMuted }]}>
                      <Text style={[styles.statusBadgeText, { color: Colors.primary }]}>✓ No-Spend Day</Text>
                    </View>
                  ) : noSpendDays[selectedDay.key] === 'spend' ? (
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                      <Text style={[styles.statusBadgeText, { color: Colors.error }]}>💸 Spend Day</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: Colors.surfaceElevated }]}>
                      <Text style={[styles.statusBadgeText, { color: Colors.textSecondary }]}>Not Logged</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.dayActionLabel}>Change status:</Text>
                <View style={styles.dayActions}>
                  {[
                    { key: 'no-spend', emoji: '✅', label: 'No-Spend', haptic: 'success' },
                    { key: 'spend', emoji: '💸', label: 'Spend', haptic: 'light' },
                    { key: 'clear', emoji: '⬜', label: 'Clear', haptic: 'light' },
                  ].map(action => (
                    <TouchableOpacity
                      key={action.key}
                      style={[
                        styles.dayActionBtn,
                        noSpendDays[selectedDay.key] === action.key && action.key === 'no-spend' && styles.dayActionBtnActive,
                        noSpendDays[selectedDay.key] === action.key && action.key === 'spend' && styles.dayActionBtnSpend,
                      ]}
                      onPress={() => {
                        const updated = { ...noSpendDays };
                        if (action.key === 'clear') delete updated[selectedDay.key];
                        else updated[selectedDay.key] = action.key;
                        updateNoSpendDays(updated);
                        triggerHaptic(action.haptic);
                      }}
                    >
                      <Text style={styles.dayActionEmoji}>{action.emoji}</Text>
                      <Text style={styles.dayActionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedDayItems.length > 0 && (
                  <>
                    <Text style={styles.dayItemsTitle}>Items resisted this day:</Text>
                    {selectedDayItems.map(item => (
                      <View key={item.id} style={styles.dayItemRow}>
                        <Text style={styles.dayItemName}>{item.name}</Text>
                        <Text style={styles.dayItemPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedDay(null)} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: GRID_PADDING, paddingBottom: Spacing.xxl },
  title: HeaderStyle.title,
  subtitle: { ...HeaderStyle.subtitle, marginBottom: Spacing.lg },
  streakRow: {
    ...CardStyle,
    flexDirection: 'row',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  streakItem: { flex: 1, alignItems: 'center' },
  streakValue: { fontSize: FontSize.title, fontWeight: '700', color: Colors.streakFire },
  streakLabel: { fontSize: FontSize.caption + 1, color: Colors.textSecondary, marginTop: Spacing.xs },
  streakDivider: { width: 1, height: Spacing.xl, backgroundColor: Colors.border },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  navBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 28, color: Colors.textPrimary, fontWeight: '300' },
  monthLabel: { fontSize: FontSize.section, fontWeight: '600', color: Colors.textPrimary },
  dayHeaders: { flexDirection: 'row', marginBottom: Spacing.sm, gap: GAP },
  dayHeaderCell: { width: CELL_SIZE, alignItems: 'center' },
  dayHeaderText: { fontSize: FontSize.caption + 1, color: Colors.textDisabled, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: {
    width: CELL_SIZE, height: CELL_SIZE,
    borderRadius: Radius.sm + 2, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cellNoSpend: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  cellSpend: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: Colors.error },
  cellToday: { borderColor: Colors.secondary, borderWidth: 2 },
  cellFuture: { opacity: 0.3 },
  cellText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textPrimary },
  cellTextNoSpend: { color: Colors.primary },
  cellTextSpend: { color: Colors.error },
  cellTextFuture: { color: Colors.textDisabled },
  cellCheck: { fontSize: 8, color: Colors.primary, position: 'absolute', bottom: 3 },
  cellDot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.error,
    position: 'absolute', bottom: 5,
  },
  legend: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg, gap: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.sm - 2 },
  legendText: { fontSize: FontSize.caption + 1, color: Colors.textSecondary },
  hint: { textAlign: 'center', fontSize: FontSize.caption + 1, color: Colors.textDisabled, marginTop: Spacing.md, lineHeight: 18 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    backgroundColor: Colors.surfaceElevated, borderTopLeftRadius: Radius.xl + 4, borderTopRightRadius: Radius.xl + 4,
    padding: Spacing.lg, paddingBottom: Spacing.xxl,
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.md,
  },
  modalTitle: { fontSize: FontSize.section, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  dayStatusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  dayStatusLabel: { fontSize: FontSize.body, color: Colors.textSecondary, marginRight: Spacing.sm + 2 },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm - 2, borderRadius: Radius.sm },
  statusBadgeText: { fontSize: FontSize.small + 1, fontWeight: '600' },
  dayActionLabel: { fontSize: FontSize.small, color: Colors.textSecondary, marginBottom: Spacing.sm },
  dayActions: { flexDirection: 'row', gap: Spacing.sm + 2, marginBottom: Spacing.lg },
  dayActionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.md, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    minHeight: 44,
  },
  dayActionBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  dayActionBtnSpend: { borderColor: Colors.error, backgroundColor: 'rgba(239,68,68,0.15)' },
  dayActionEmoji: { fontSize: 20, marginBottom: Spacing.xs },
  dayActionText: { fontSize: FontSize.caption + 1, color: Colors.textSecondary, fontWeight: '600' },
  dayItemsTitle: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  dayItemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dayItemName: { fontSize: FontSize.body, color: Colors.textPrimary },
  dayItemPrice: { fontSize: FontSize.body, fontWeight: '600', color: Colors.warning },
  closeBtn: {
    marginTop: Spacing.md, paddingVertical: Spacing.md, borderRadius: Radius.md,
    alignItems: 'center', backgroundColor: Colors.primary, minHeight: 48,
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.background },
});
