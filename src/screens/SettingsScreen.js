import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch,
  TextInput, Modal,
} from 'react-native';
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
  const [newRuleText, setNewRuleText] = useState('');

  const addRule = useCallback(() => {
    if (!newRuleText.trim()) return;
    const newRule = { id: uuid(), text: newRuleText.trim(), active: true };
    updateRules([...rules, newRule]);
    triggerHaptic('success');
    setNewRuleText('');
    setRuleModalVisible(false);
  }, [newRuleText, rules, updateRules]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* No-Buy Rules Section */}
      <Text style={styles.sectionTitle}>My No-Buy Rules</Text>
      <Text style={styles.sectionSubtitle}>Define what you're not buying</Text>

      {rules.length === 0 ? (
        <View style={styles.emptyRules}>
          <Text style={styles.emptyText}>No rules yet. Add your personal no-buy rules!</Text>
        </View>
      ) : (
        rules.map((rule) => (
          <TouchableOpacity
            key={rule.id}
            style={styles.ruleRow}
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
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={styles.addRuleBtn}
        onPress={() => setRuleModalVisible(true)}
      >
        <Text style={styles.addRuleBtnText}>+ Add Rule</Text>
      </TouchableOpacity>

      {rules.length > 0 && (
        <Text style={styles.hint}>Long-press a rule to delete</Text>
      )}

      {/* About */}
      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>About</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutName}>Kept</Text>
        <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        <Text style={styles.aboutDesc}>
          Track no-spend days, savings challenges, and purchases you resisted. Built for the #nobuy community.
        </Text>
      </View>

      {/* Danger Zone */}
      <Text style={[styles.sectionTitle, { marginTop: 32, color: Colors.error }]}>Danger Zone</Text>
      <TouchableOpacity style={styles.dangerBtn} onPress={resetAllData}>
        <Text style={styles.dangerBtnText}>Reset All Data</Text>
        <Text style={styles.dangerBtnSub}>Permanently delete all progress</Text>
      </TouchableOpacity>

      {/* Add Rule Modal */}
      <Modal visible={ruleModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add No-Buy Rule</Text>
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
                onPress={() => { setRuleModalVisible(false); setNewRuleText(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !newRuleText.trim() && styles.saveBtnDisabled]}
                onPress={addRule}
              >
                <Text style={styles.saveBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  emptyRules: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  ruleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    marginBottom: 6, borderWidth: 1, borderColor: Colors.border,
  },
  ruleText: { flex: 1, fontSize: 16, color: Colors.textPrimary, marginLeft: 12 },
  ruleTextInactive: { color: Colors.textDisabled, textDecorationLine: 'line-through' },
  addRuleBtn: {
    marginTop: 12, padding: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed',
  },
  addRuleBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  hint: { textAlign: 'center', fontSize: 12, color: Colors.textDisabled, marginTop: 8 },
  aboutCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.border, marginTop: 8,
  },
  aboutName: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  aboutVersion: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  aboutDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 12, lineHeight: 22 },
  dangerBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 16,
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
