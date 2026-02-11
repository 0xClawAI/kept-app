import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch,
  TextInput, Modal, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius, CardStyle, HeaderStyle } from '../utils/colors';
import { useData } from '../context/DataContext';
import { uuid, triggerHaptic } from '../utils/helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
  const {
    rules, updateRules,
    noSpendDays, updateNoSpendDays,
    envelopes, updateEnvelopes,
    weeks, updateWeeks,
    didntBuyItems, updateDidntBuyItems,
    loaded,
  } = useData();

  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRuleText, setNewRuleText] = useState('');

  const openAddRule = () => { setEditingRule(null); setNewRuleText(''); setRuleModalVisible(true); };
  const openEditRule = (rule) => { setEditingRule(rule); setNewRuleText(rule.text); setRuleModalVisible(true); };

  const saveRule = useCallback(() => {
    if (!newRuleText.trim()) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (editingRule) {
      updateRules(rules.map(r => r.id === editingRule.id ? { ...r, text: newRuleText.trim() } : r));
    } else {
      updateRules([...rules, { id: uuid(), text: newRuleText.trim(), active: true }]);
    }
    triggerHaptic('success');
    setNewRuleText(''); setEditingRule(null); setRuleModalVisible(false);
  }, [newRuleText, rules, updateRules, editingRule]);

  const toggleRule = useCallback((id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    triggerHaptic('light');
  }, [rules, updateRules]);

  const deleteRule = useCallback((id) => {
    Alert.alert('Delete Rule', 'Remove this rule?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        updateRules(rules.filter(r => r.id !== id));
        triggerHaptic('light');
      }},
    ]);
  }, [rules, updateRules]);

  const moveRule = useCallback((id, direction) => {
    const idx = rules.findIndex(r => r.id === id);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= rules.length) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
        { text: 'Delete Everything', style: 'destructive', onPress: () => {
          updateNoSpendDays({}); updateEnvelopes([]); updateWeeks([]);
          updateDidntBuyItems([]); updateRules([]);
          triggerHaptic('success');
        }},
      ]
    );
  };

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
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your rules and data</Text>

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
              key={rule.id} style={styles.ruleRow}
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

        <TouchableOpacity style={styles.addRuleBtn} onPress={openAddRule} activeOpacity={0.7}>
          <Text style={styles.addRuleBtnText}>+ Add Rule</Text>
        </TouchableOpacity>

        {/* Quick Stats */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Quick Stats</Text>
        <View style={styles.statsCard}>
          {[
            { label: 'Days tracked', value: Object.keys(noSpendDays).length },
            { label: 'Envelopes stuffed', value: `${envelopes.length}/100` },
            { label: 'Weeks completed', value: `${weeks.length}/52` },
            { label: 'Items resisted', value: didntBuyItems.length },
            { label: 'Active rules', value: rules.filter(r => r.active).length, last: true },
          ].map((stat, i) => (
            <View key={i} style={[styles.statRow, stat.last && { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* About */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutName}>💚 Kept</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            Track no-spend days, savings challenges, and purchases you resisted. Built for the #nobuy community.
          </Text>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl, color: Colors.error }]}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={resetAllData} activeOpacity={0.7}>
          <Text style={styles.dangerBtnText}>Reset All Data</Text>
          <Text style={styles.dangerBtnSub}>Permanently delete all progress</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
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
              style={styles.input} value={newRuleText} onChangeText={setNewRuleText}
              placeholder="e.g. No Amazon purchases" placeholderTextColor={Colors.textDisabled} autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn}
                onPress={() => { setRuleModalVisible(false); setNewRuleText(''); setEditingRule(null); }} activeOpacity={0.7}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !newRuleText.trim() && styles.saveBtnDisabled]}
                onPress={saveRule} activeOpacity={0.7}>
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
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  title: HeaderStyle.title,
  headerSubtitle: { ...HeaderStyle.subtitle, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.section, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  sectionSubtitle: { fontSize: FontSize.small, color: Colors.textSecondary, marginBottom: Spacing.md },
  emptyRules: {
    ...CardStyle,
    padding: Spacing.lg, alignItems: 'center',
  },
  emptyEmoji: { fontSize: 32, marginBottom: Spacing.sm },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.small + 1, textAlign: 'center' },
  ruleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md + 2,
    padding: Spacing.md, marginBottom: Spacing.sm - 2,
    borderWidth: 1, borderColor: Colors.border,
    minHeight: 56,
  },
  ruleText: { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, marginLeft: Spacing.md },
  ruleTextInactive: { color: Colors.textDisabled, textDecorationLine: 'line-through' },
  reorderBtns: { flexDirection: 'row', gap: Spacing.xs },
  reorderBtn: {
    width: 32, height: 32, borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
  },
  reorderBtnText: { fontSize: 14, color: Colors.textSecondary },
  addRuleBtn: {
    marginTop: Spacing.md, paddingVertical: Spacing.md, borderRadius: Radius.md,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed',
    minHeight: 48, justifyContent: 'center',
  },
  addRuleBtnText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.small + 1 },
  statsCard: {
    ...CardStyle,
    padding: Spacing.xs, marginTop: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    minHeight: 48,
  },
  statLabel: { fontSize: FontSize.body, color: Colors.textSecondary },
  statValue: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textPrimary },
  aboutCard: {
    ...CardStyle,
    padding: Spacing.lg, marginTop: Spacing.sm,
  },
  aboutName: { fontSize: FontSize.section, fontWeight: '700', color: Colors.textPrimary },
  aboutVersion: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: 2 },
  aboutDesc: { fontSize: FontSize.small + 1, color: Colors.textSecondary, marginTop: Spacing.md, lineHeight: 22 },
  dangerBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: Radius.md + 2,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.error, marginTop: Spacing.sm,
    minHeight: 56, justifyContent: 'center',
  },
  dangerBtnText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.error },
  dangerBtnSub: { fontSize: FontSize.caption + 1, color: Colors.textSecondary, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl + 4, borderTopRightRadius: Radius.xl + 4,
    padding: Spacing.lg, paddingBottom: Spacing.xxl,
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.md,
  },
  modalTitle: { fontSize: FontSize.section, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.lg },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.body, color: Colors.textPrimary,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    minHeight: 48,
  },
  modalButtons: { flexDirection: 'row', gap: Spacing.md },
  cancelBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    minHeight: 48, justifyContent: 'center',
  },
  cancelBtnText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md,
    alignItems: 'center', backgroundColor: Colors.primary,
    minHeight: 48, justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.background },
});
