import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Alert, LayoutAnimation, Platform, UIManager,
  KeyboardAvoidingView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius, CardStyle, HeaderStyle } from '../utils/colors';
import { useData } from '../context/DataContext';
import { triggerHaptic, formatCurrency, uuid, getDateKey } from '../utils/helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = ['Food & Drink', 'Shopping', 'Entertainment', 'Clothing', 'Tech', 'Home', 'Other'];
const CATEGORY_EMOJI = {
  'Food & Drink': '☕', 'Shopping': '🛒', 'Entertainment': '🎬',
  'Clothing': '👗', 'Tech': '📱', 'Home': '🏠', 'Other': '📦',
};

// Animated FAB with scale on press
function FAB({ onPress, color = Colors.primary }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, friction: 5 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3 }).start();
  };

  return (
    <Animated.View style={[styles.fabWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: color }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── TAB: Didn't Buy It ─────────────────────────────
function DidntBuyTab() {
  const { didntBuyItems, updateDidntBuyItems } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('Other');

  const total = didntBuyItems.reduce((s, i) => s + (i.price || 0), 0);

  const openAdd = () => {
    setEditingItem(null); setItemName(''); setItemPrice(''); setItemCategory('Other');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item); setItemName(item.name);
    setItemPrice(String(item.price)); setItemCategory(item.category || 'Other');
    setShowModal(true);
  };

  const saveItem = () => {
    if (!itemName.trim()) return;
    const price = parseFloat(itemPrice) || 0;
    if (editingItem) {
      updateDidntBuyItems(didntBuyItems.map(i =>
        i.id === editingItem.id ? { ...i, name: itemName.trim(), price, category: itemCategory } : i
      ));
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      updateDidntBuyItems([{
        id: uuid(), name: itemName.trim(), price,
        category: itemCategory, date: getDateKey(new Date()),
      }, ...didntBuyItems]);
    }
    triggerHaptic('success');
    setItemName(''); setItemPrice(''); setItemCategory('Other');
    setEditingItem(null); setShowModal(false);
  };

  const deleteItem = (id) => {
    Alert.alert('Delete Item', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        updateDidntBuyItems(didntBuyItems.filter(i => i.id !== id));
        triggerHaptic('medium');
      }},
    ]);
  };

  const groupedItems = useMemo(() => {
    const groups = {};
    didntBuyItems.forEach(item => {
      const date = item.date || 'Unknown';
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  }, [didntBuyItems]);

  const sortedDates = useMemo(() =>
    Object.keys(groupedItems).sort((a, b) => b.localeCompare(a)),
    [groupedItems]
  );

  const formatDate = (dateStr) => {
    const todayKey = getDateKey(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getDateKey(yesterday);
    if (dateStr === todayKey) return 'Today';
    if (dateStr === yesterdayKey) return 'Yesterday';
    const parts = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}`;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>Saved by not buying</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        <Text style={styles.totalCount}>
          {didntBuyItems.length} item{didntBuyItems.length !== 1 ? 's' : ''} resisted
        </Text>
      </View>

      {didntBuyItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTitle}>Nothing yet!</Text>
          <Text style={styles.emptyText}>
            Resisted buying something? Tap + to log it and watch your savings grow.
          </Text>
        </View>
      ) : (
        <View style={styles.itemList}>
          {sortedDates.map(date => (
            <View key={date}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>{formatDate(date)}</Text>
                <Text style={styles.dateHeaderAmount}>
                  {formatCurrency(groupedItems[date].reduce((s, i) => s + (i.price || 0), 0))}
                </Text>
              </View>
              {groupedItems[date].map(item => (
                <TouchableOpacity
                  key={item.id} style={styles.itemRow}
                  onPress={() => openEdit(item)}
                  onLongPress={() => deleteItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryDot}>
                    <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[item.category] || '📦'}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>{item.category || 'Other'}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <Text style={styles.longPressHint}>Tap to edit • Long-press to delete</Text>
        </View>
      )}

      <FAB onPress={() => { openAdd(); triggerHaptic('light'); }} />

      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Didn\'t Buy It! 🛡️'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {editingItem ? 'Update this item' : 'What did you resist buying?'}
            </Text>

            <TextInput style={styles.input} placeholder="Item name (e.g., Coffee, Shoes)" placeholderTextColor={Colors.textDisabled} value={itemName} onChangeText={setItemName} autoFocus />
            <TextInput style={styles.input} placeholder="Price ($)" placeholderTextColor={Colors.textDisabled} value={itemPrice} onChangeText={setItemPrice} keyboardType="decimal-pad" />

            <Text style={styles.categoryLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, itemCategory === cat && styles.categoryChipActive]}
                  onPress={() => setItemCategory(cat)} activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, itemCategory === cat && styles.categoryChipTextActive]}>
                    {CATEGORY_EMOJI[cat]} {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowModal(false); setEditingItem(null); setItemName(''); setItemPrice(''); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, !itemName.trim() && styles.saveBtnDisabled]} onPress={saveItem} disabled={!itemName.trim()}>
                <Text style={styles.saveBtnText}>{editingItem ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── TAB: No-Buy Rules ─────────────────────────────
function RulesTab() {
  const { rules, updateRules } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleText, setRuleText] = useState('');

  const openAdd = () => { setEditingRule(null); setRuleText(''); setShowAdd(true); };
  const openEdit = (rule) => { setEditingRule(rule); setRuleText(rule.text); setShowAdd(true); };

  const saveRule = () => {
    if (!ruleText.trim()) return;
    if (editingRule) {
      updateRules(rules.map(r => r.id === editingRule.id ? { ...r, text: ruleText.trim() } : r));
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      updateRules([...rules, { id: uuid(), text: ruleText.trim(), active: true }]);
    }
    triggerHaptic('success');
    setRuleText(''); setEditingRule(null); setShowAdd(false);
  };

  const toggleRule = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    triggerHaptic('light');
  };

  const deleteRule = (id) => {
    Alert.alert('Delete Rule', 'Remove this rule?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        updateRules(rules.filter(r => r.id !== id));
        triggerHaptic('medium');
      }},
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {rules.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No rules yet</Text>
          <Text style={styles.emptyText}>
            Define your personal no-buy rules. What are you committing to not buy?
          </Text>
        </View>
      ) : (
        <View style={styles.itemList}>
          {rules.map(rule => (
            <TouchableOpacity
              key={rule.id}
              style={[styles.ruleRow, !rule.active && styles.ruleRowInactive]}
              onPress={() => toggleRule(rule.id)}
              onLongPress={() => deleteRule(rule.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.ruleCheck, rule.active && styles.ruleCheckActive]}>
                {rule.active && <Text style={styles.ruleCheckText}>✓</Text>}
              </View>
              <Text style={[styles.ruleText, !rule.active && styles.ruleTextInactive]}>
                {rule.text}
              </Text>
              <TouchableOpacity onPress={() => openEdit(rule)} style={styles.editBtn} activeOpacity={0.6}>
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <Text style={styles.longPressHint}>Tap to toggle • ✏️ to edit • Long-press to delete</Text>
        </View>
      )}

      <FAB onPress={() => { openAdd(); triggerHaptic('light'); }} color={Colors.secondary} />

      <Modal visible={showAdd} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingRule ? 'Edit Rule' : 'New Rule 📋'}</Text>
            <Text style={styles.modalSubtitle}>{editingRule ? 'Update this rule' : 'What are you committing to not buy?'}</Text>

            <TextInput style={styles.input} placeholder="e.g., No Amazon purchases, No takeout" placeholderTextColor={Colors.textDisabled} value={ruleText} onChangeText={setRuleText} autoFocus />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowAdd(false); setRuleText(''); setEditingRule(null); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: Colors.secondary }, !ruleText.trim() && styles.saveBtnDisabled]}
                onPress={saveRule} disabled={!ruleText.trim()}
              >
                <Text style={styles.saveBtnText}>{editingRule ? 'Update' : 'Add Rule'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────
export default function LogScreen() {
  const { loaded } = useData();
  const [activeTab, setActiveTab] = useState('didntbuy');

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screenHeader}>
        <Text style={styles.title}>Log</Text>
        <Text style={styles.screenSubtitle}>Track what you didn't buy</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'didntbuy' && styles.tabActive]}
          onPress={() => setActiveTab('didntbuy')}
        >
          <Text style={[styles.tabText, activeTab === 'didntbuy' && styles.tabTextActive]}>
            Didn't Buy It
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rules' && styles.tabActiveSecondary]}
          onPress={() => setActiveTab('rules')}
        >
          <Text style={[styles.tabText, activeTab === 'rules' && styles.tabTextActiveSecondary]}>
            My Rules
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'didntbuy' ? <DidntBuyTab /> : <RulesTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 100, flexGrow: 1 },
  screenHeader: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  title: HeaderStyle.title,
  screenSubtitle: HeaderStyle.subtitle,
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.body },

  tabBar: {
    flexDirection: 'row', marginHorizontal: Spacing.lg,
    marginTop: Spacing.md, marginBottom: Spacing.lg,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.xs,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm + 2, borderRadius: Radius.sm + 2, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  tabActive: { backgroundColor: Colors.primaryMuted },
  tabActiveSecondary: { backgroundColor: 'rgba(129, 140, 248, 0.2)' },
  tabText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textDisabled },
  tabTextActive: { color: Colors.primary },
  tabTextActiveSecondary: { color: Colors.secondary },

  totalBanner: {
    ...CardStyle,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderColor: Colors.primaryMuted,
  },
  totalLabel: { fontSize: FontSize.caption, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { fontSize: 36, fontWeight: '800', color: Colors.primary, marginTop: Spacing.xs },
  totalCount: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: Spacing.xs },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl, paddingHorizontal: Spacing.lg },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.section, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  dateHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm, marginTop: Spacing.sm,
  },
  dateHeaderText: { fontSize: FontSize.small + 1, fontWeight: '600', color: Colors.textSecondary },
  dateHeaderAmount: { fontSize: FontSize.small + 1, fontWeight: '600', color: Colors.primary },

  itemList: { gap: Spacing.sm - 2 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md + 2,
    padding: Spacing.md, minHeight: 64,
  },
  categoryDot: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  categoryEmoji: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textPrimary },
  itemMeta: { fontSize: FontSize.caption + 1, color: Colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: FontSize.section, fontWeight: '700', color: Colors.primary },

  longPressHint: { fontSize: FontSize.caption + 1, color: Colors.textDisabled, textAlign: 'center', marginTop: Spacing.md },

  ruleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, gap: Spacing.md, minHeight: 56,
  },
  ruleRowInactive: { opacity: 0.5 },
  ruleCheck: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  ruleCheckActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  ruleCheckText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  ruleText: { flex: 1, fontSize: FontSize.body, fontWeight: '500', color: Colors.textPrimary },
  ruleTextInactive: { textDecorationLine: 'line-through', color: Colors.textDisabled },
  editBtn: { padding: Spacing.sm, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  editBtnText: { fontSize: 16 },

  fabWrap: {
    position: 'absolute', bottom: Spacing.lg, right: 0,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 10,
  },
  fabText: { fontSize: 28, fontWeight: '400', color: '#000' },

  categoryLabel: { fontSize: FontSize.small, color: Colors.textSecondary, marginBottom: Spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  categoryChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    minHeight: 36,
  },
  categoryChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  categoryChipText: { fontSize: FontSize.caption + 1, color: Colors.textSecondary },
  categoryChipTextActive: { color: Colors.primary, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl + 4, borderTopRightRadius: Radius.xl + 4,
    padding: Spacing.lg, paddingBottom: Spacing.xxl,
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: FontSize.section, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  modalSubtitle: { fontSize: FontSize.body, color: Colors.textSecondary, marginBottom: Spacing.lg },

  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.body, color: Colors.textPrimary,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    minHeight: 48,
  },

  modalButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  cancelBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md,
    backgroundColor: Colors.surface, alignItems: 'center', minHeight: 48, justifyContent: 'center',
  },
  cancelBtnText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md,
    backgroundColor: Colors.primary, alignItems: 'center', minHeight: 48, justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: FontSize.body, fontWeight: '600', color: '#000' },
});
