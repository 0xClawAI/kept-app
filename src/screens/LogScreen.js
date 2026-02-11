import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Alert, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/colors';
import { useData } from '../context/DataContext';
import { triggerHaptic, formatCurrency, uuid, getDateKey } from '../utils/helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── TAB: Didn't Buy It ─────────────────────────────
function DidntBuyTab() {
  const { didntBuyItems, updateDidntBuyItems } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const total = didntBuyItems.reduce((s, i) => s + (i.price || 0), 0);

  const addItem = () => {
    if (!itemName.trim()) return;
    const price = parseFloat(itemPrice) || 0;
    const newItem = { id: uuid(), name: itemName.trim(), price, date: getDateKey(new Date()) };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateDidntBuyItems([newItem, ...didntBuyItems]);
    setItemName('');
    setItemPrice('');
    setShowAdd(false);
    triggerHaptic('success');
  };

  const deleteItem = (id) => {
    Alert.alert('Delete Item', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          updateDidntBuyItems(didntBuyItems.filter(i => i.id !== id));
          triggerHaptic('medium');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Total Banner */}
      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>Saved by not buying</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>

      {didntBuyItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTitle}>Nothing yet!</Text>
          <Text style={styles.emptyText}>
            Resisted buying something? Log it here to see how much you're saving.
          </Text>
        </View>
      ) : (
        <View style={styles.itemList}>
          {didntBuyItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onLongPress={() => deleteItem(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDate}>{item.date}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.longPressHint}>Long-press to delete an item</Text>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setShowAdd(true); triggerHaptic('light'); }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Didn't Buy It! 🛡️</Text>
            <Text style={styles.modalSubtitle}>What did you resist buying?</Text>

            <TextInput
              style={styles.input}
              placeholder="Item name (e.g., Coffee, Shoes)"
              placeholderTextColor={Colors.textDisabled}
              value={itemName}
              onChangeText={setItemName}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="Price ($)"
              placeholderTextColor={Colors.textDisabled}
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="decimal-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowAdd(false); setItemName(''); setItemPrice(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !itemName.trim() && styles.saveBtnDisabled]}
                onPress={addItem}
                disabled={!itemName.trim()}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── TAB: No-Buy Rules ─────────────────────────────
function RulesTab() {
  const { rules, updateRules } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [ruleText, setRuleText] = useState('');

  const addRule = () => {
    if (!ruleText.trim()) return;
    const newRule = { id: uuid(), text: ruleText.trim(), active: true };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateRules([...rules, newRule]);
    setRuleText('');
    setShowAdd(false);
    triggerHaptic('success');
  };

  const toggleRule = (id) => {
    updateRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    triggerHaptic('light');
  };

  const deleteRule = (id) => {
    Alert.alert('Delete Rule', 'Remove this rule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          updateRules(rules.filter(r => r.id !== id));
          triggerHaptic('medium');
        },
      },
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
            </TouchableOpacity>
          ))}
          <Text style={styles.longPressHint}>Tap to toggle • Long-press to delete</Text>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.secondary }]}
        onPress={() => { setShowAdd(true); triggerHaptic('light'); }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Rule 📋</Text>
            <Text style={styles.modalSubtitle}>What are you committing to not buy?</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g., No Amazon purchases, No takeout"
              placeholderTextColor={Colors.textDisabled}
              value={ruleText}
              onChangeText={setRuleText}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowAdd(false); setRuleText(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: Colors.secondary }, !ruleText.trim() && styles.saveBtnDisabled]}
                onPress={addRule}
                disabled={!ruleText.trim()}
              >
                <Text style={styles.saveBtnText}>Add Rule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────
export default function LogScreen() {
  const [activeTab, setActiveTab] = useState('didntbuy');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Log</Text>

      {/* Tab Switcher */}
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'didntbuy' ? <DidntBuyTab /> : <RulesTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 100, flexGrow: 1 },
  title: {
    fontSize: 28, fontWeight: '800', color: Colors.textPrimary,
    letterSpacing: -0.5, paddingHorizontal: 20, paddingTop: 8,
  },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.primaryMuted },
  tabActiveSecondary: { backgroundColor: 'rgba(129, 140, 248, 0.2)' },
  tabText: { fontSize: 15, fontWeight: '600', color: Colors.textDisabled },
  tabTextActive: { color: Colors.primary },
  tabTextActiveSecondary: { color: Colors.secondary },

  totalBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  totalLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { fontSize: 36, fontWeight: '800', color: Colors.primary, marginTop: 4 },

  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  itemList: { gap: 6 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  itemDate: { fontSize: 13, color: Colors.textDisabled, marginTop: 2 },
  itemPrice: { fontSize: 18, fontWeight: '700', color: Colors.primary },

  longPressHint: { fontSize: 12, color: Colors.textDisabled, textAlign: 'center', marginTop: 12 },

  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  ruleRowInactive: { opacity: 0.5 },
  ruleCheck: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  ruleCheckActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  ruleCheckText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  ruleText: { flex: 1, fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  ruleTextInactive: { textDecorationLine: 'line-through', color: Colors.textDisabled },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { fontSize: 28, fontWeight: '400', color: '#000' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 20 },

  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#000' },
});
