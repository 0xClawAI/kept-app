import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch,
  TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/colors';
import { useData } from '../context/DataContext';
import { uuid, triggerHaptic } from '../utils/helpers';

export default function SettingsScreen() {
  const {
    rules, updateRules,
    noSpendDays, updateNoSpendDays,
    envelopes, updateEnvelopes,
    weeks, updateWeeks,
    didntBuyItems, updateDidntBuyItems,
  } = useData();

  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRuleText, setNewRuleText] = useState('');

  const openAddRule = () => {
    setEditingRule(null);
    setNewRuleText('');
    setRuleModalVisible(true);
  };

  const openEditRule = (rule) => {
    setEditingRule(rule);
    setNewRuleText(rule.text);
    setRuleModalVisible(true);
  };

  const saveRule = useCallback(() => {
    if (!newRuleText.trim()) return;
    if (editingRule) {
      const updated = rules.map(r =>
        r.id === editingRule.id ? { ...r, text: newRuleText.trim() } : r
      );
      updateRules(updated);
    } else {
      const newRule = { id: uuid(), text: newRuleText.trim(), active: true };
      updateRules([...rules, newRule]);
    }
    triggerHaptic('success');
    setNewRuleText('');
    setEditingRule(null);
    setRuleModalVisible(false);
  }, [newRuleText, rules, updateRules, editingRule]);

  const toggleRule = useCallback((id) => {
    const updated = rules.map(r => r.id === id ? { ...r, active: !r.active } : r);
    updateRules(updated);
    triggerHaptic('light');
  }, [rules, updateRules]);

  const deleteRule = useCallback((id) => {
    Alert.alert('Delete Rule', 'Remove this rule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          updateRules(rules.filter(r => r.id !== id));
          triggerHaptic('light');
        },
      },
    ]);
  }, [rules, updateRules]);

  const moveRule = useCallback((id, direction) => {
    const idx = rules.findIndex(r => r.id === id);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= rules.length) return;
    const updated = [...rules];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updateRules(updated);
    triggerHaptic('light');
  }, [rules, updateRules]);

  const resetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete ALL your progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            updateNoSpendDays({});
            updateEnvelopes([]);
            updateWeeks([]);
            updateDidntBuyItems([]);
            updateRules([]);
            triggerHaptic('success');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* No-Buy Rules Section */}
        <Text style={styles.sectionTitle}>My No-Buy Rules</Text>
        <Text style={styles.sectionSubtitle}>Define what you're not buying. Tap to edit, long-press to delete.</Text>

        {rules.length === 0 ? (
          <View style={styles.emptyRules}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No rules yet. Add your personal no-buy rules!</Text>
          </View>
        ) : (
          rules.map((rule, idx) => (
            <TouchableOpacity
              key={rule.id}
              style={styles.ruleRow}
              onPress={() => openEditRule(rule)}
              onLongPress={() => deleteRule(rule.id)}
              activeOpacity={0.7}
            >
              <Switch
                value={rule.active}
                onValueChange={() => toggleRule(rule.id)}
                trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
                thumbColor={rule.active ? Colors.primary : Colors.textDisabled}
              />
              <Text style={[styles.ruleText, !rule.active && styles.ruleTextInactive]}>
                {rule.text}
              </Text>
              <View style={styles.reorderBtns}>
                {idx > 0 && (
                  <TouchableOpacity onPress={() => moveRule(rule.id, -1)} style={styles.reorderBtn}>
                    <Text style={styles.reorderBtnText}>↑</Text>
                  </TouchableOpacity>
                )}
                {idx < rules.length - 1 && (
                  <TouchableOpacity onPress={() => moveRule(rule.id, 1)} style={styles.reorderBtn}>
                    <Text style={styles.reorderBtnText}>↓</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.addRuleBtn}
          onPress={openAddRule}
          activeOpacity={0.7}
        >
          <Text style={styles.addRuleBtnText}>+ Add Rule</Text>
        </TouchableOpacity>

        {/* Quick Stats */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Quick Stats</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Days tracked</Text>
            <Text style={styles.statValue}>{Object.keys(noSpendDays).length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Envelopes stuffed</Text>
            <Text style={styles.statValue}>{envelopes.length}/100</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Weeks completed</Text>
            <Text style={styles.statValue}>{weeks.length}/52</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Items resisted</Text>
            <Text style={styles.statValue}>{didntBuyItems.length}</Text>
          </View>
          <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.statLabel}>Active rules</Text>
            <Text style={styles.statValue}>{rules.filter(r => r.active).length}</Text>
          </View>
        </View>

        {/* About */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutName}>💚 Kept</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            Track no-spend days, savings challenges, and purchases you resisted. Built for the #nobuy community.
          </Text>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { marginTop: 32, color: Colors.error }]}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={resetAllData} activeOpacity={0.7}>
          <Text style={styles.dangerBtnText}>Reset All Data</Text>
          <Text style={styles.dangerBtnSub}>Permanently delete all progress</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Rule Modal */}
      <Modal visible={ruleModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingRule ? 'Edit Rule' : 'Add No-Buy Rule'}
            </Text>
            <TextInput
              style={styles.input}
              value={newRuleText}
              onChangeText={setNewRuleText}
              placeholder="e.g. No Amazon purchases"
              placeholderTextColor={Colors.textDisabled}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setRuleModalVisible(false); setNewRuleText(''); setEditingRule(null); }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !newRuleText.trim() && styles.saveBtnDisabled]}
                onPress={saveRule}
                activeOpacity={0.7}
              >
                <Text style={styles.saveBtnText}>{editingRule ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  emptyRules: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  ruleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    marginBottom: 6, borderWidth: 1, borderColor: Colors.border,
  },
  ruleText: { flex: 1, fontSize: 16, color: Colors.textPrimary, marginLeft: 12 },
  ruleTextInactive: { color: Colors.textDisabled, textDecorationLine: 'line-through' },
  reorderBtns: { flexDirection: 'row', gap: 4 },
  reorderBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
  },
  reorderBtnText: { fontSize: 14, color: Colors.textSecondary },
  addRuleBtn: {
    marginTop: 12, padding: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed',
  },
  addRuleBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  statsCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 4,
    borderWidth: 1, borderColor: Colors.border, marginTop: 8,
  },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  statLabel: { fontSize: 15, color: Colors.textSecondary },
  statValue: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  aboutCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.border, marginTop: 8,
  },
  aboutName: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  aboutVersion: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  aboutDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 12, lineHeight: 22 },
  dangerBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.error, marginTop: 8,
  },
  dangerBtnText: { fontSize: 16, fontWeight: '600', color: Colors.error },
  dangerBtnSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: Colors.surfaceElevated, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    fontSize: 16, color: Colors.textPrimary, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: Colors.background },
});
