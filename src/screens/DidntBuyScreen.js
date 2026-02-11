import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors } from '../utils/colors';
import { useData } from '../context/DataContext';
import { formatCurrency, getDidntBuyTotal, uuid, triggerHaptic, getDateKey } from '../utils/helpers';

const CATEGORIES = ['Food & Drink', 'Shopping', 'Entertainment', 'Clothing', 'Tech', 'Other'];

export default function DidntBuyScreen() {
  const { didntBuyItems, updateDidntBuyItems } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('Other');

  const total = getDidntBuyTotal(didntBuyItems);

  const addItem = useCallback(() => {
    if (!itemName.trim() || !itemPrice.trim()) return;
    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) return;

    const newItem = {
      id: uuid(),
      name: itemName.trim(),
      price,
      category: itemCategory,
      date: getDateKey(new Date()),
    };
    updateDidntBuyItems([newItem, ...didntBuyItems]);
    triggerHaptic('success');
    setItemName('');
    setItemPrice('');
    setItemCategory('Other');
    setModalVisible(false);
  }, [itemName, itemPrice, itemCategory, didntBuyItems, updateDidntBuyItems]);

  const deleteItem = useCallback((id) => {
    Alert.alert('Delete Item', 'Remove this item from your log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          updateDidntBuyItems(didntBuyItems.filter(i => i.id !== id));
          triggerHaptic('light');
        },
      },
    ]);
  }, [didntBuyItems, updateDidntBuyItems]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Didn't Buy It</Text>
        <Text style={styles.subtitle}>Track items you resisted buying</Text>

        {/* Total card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Money Kept by Not Buying</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          <Text style={styles.totalCount}>{didntBuyItems.length} items resisted</Text>
        </View>

        {didntBuyItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🛍️</Text>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Next time you resist a purchase, tap + to log it and watch your savings grow!
            </Text>
          </View>
        ) : (
          didntBuyItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onLongPress={() => deleteItem(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.category} • {item.date}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </TouchableOpacity>
          ))
        )}
        {didntBuyItems.length > 0 && (
          <Text style={styles.hint}>Long-press an item to delete</Text>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Item You Didn't Buy</Text>

            <Text style={styles.inputLabel}>What did you resist?</Text>
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder="e.g. Coffee, New shoes..."
              placeholderTextColor={Colors.textDisabled}
              autoFocus
            />

            <Text style={styles.inputLabel}>How much was it?</Text>
            <TextInput
              style={styles.input}
              value={itemPrice}
              onChangeText={setItemPrice}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, itemCategory === cat && styles.categoryChipActive]}
                  onPress={() => setItemCategory(cat)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    itemCategory === cat && styles.categoryChipTextActive,
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!itemName.trim() || !itemPrice.trim()) && styles.saveBtnDisabled]}
                onPress={addItem}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 20 },
  totalCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  totalLabel: { fontSize: 13, color: Colors.textSecondary },
  totalValue: { fontSize: 36, fontWeight: '700', color: Colors.warning, marginTop: 4 },
  totalCount: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    marginBottom: 6, borderWidth: 1, borderColor: Colors.border,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  itemMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: 18, fontWeight: '700', color: Colors.warning },
  hint: { textAlign: 'center', fontSize: 12, color: Colors.textDisabled, marginTop: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 28, fontWeight: '600', color: Colors.background },
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
  inputLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    fontSize: 16, color: Colors.textPrimary, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  categoryChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  categoryChipText: { fontSize: 13, color: Colors.textSecondary },
  categoryChipTextActive: { color: Colors.primary, fontWeight: '600' },
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
