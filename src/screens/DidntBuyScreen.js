import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal,
  TextInput, Alert, KeyboardAvoidingView, Platform, LayoutAnimation,
  UIManager, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius, CardStyle, HeaderStyle } from '../utils/colors';
import { useData } from '../context/DataContext';
import { formatCurrency, getDidntBuyTotal, uuid, triggerHaptic, getDateKey } from '../utils/helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = ['Food & Drink', 'Shopping', 'Entertainment', 'Clothing', 'Tech', 'Home', 'Other'];
const CATEGORY_EMOJI = {
  'Food & Drink': '☕', 'Shopping': '🛒', 'Entertainment': '🎬',
  'Clothing': '👗', 'Tech': '📱', 'Home': '🏠', 'Other': '📦',
};

function FAB({ onPress }) {
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
        style={styles.fab}
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

export default function DidntBuyScreen() {
  const { didntBuyItems, updateDidntBuyItems } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('Other');

  const total = getDidntBuyTotal(didntBuyItems);

  const openAddModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemPrice('');
    setItemCategory('Other');
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(String(item.price));
    setItemCategory(item.category || 'Other');
    setModalVisible(true);
  };

  const saveItem = useCallback(() => {
    if (!itemName.trim() || !itemPrice.trim()) return;
    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) return;

    if (editingItem) {
      const updated = didntBuyItems.map(i =>
        i.id === editingItem.id
          ? { ...i, name: itemName.trim(), price, category: itemCategory }
          : i
      );
      updateDidntBuyItems(updated);
    } else {
      const newItem = {
        id: uuid(),
        name: itemName.trim(),
        price,
        category: itemCategory,
        date: getDateKey(new Date()),
      };
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      updateDidntBuyItems([newItem, ...didntBuyItems]);
    }
    triggerHaptic('success');
    setItemName('');
    setItemPrice('');
    setItemCategory('Other');
    setEditingItem(null);
    setModalVisible(false);
  }, [itemName, itemPrice, itemCategory, didntBuyItems, updateDidntBuyItems, editingItem]);

  const deleteItem = useCallback((id) => {
    Alert.alert('Delete Item', 'Remove this item from your log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          updateDidntBuyItems(didntBuyItems.filter(i => i.id !== id));
          triggerHaptic('light');
        },
      },
    ]);
  }, [didntBuyItems, updateDidntBuyItems]);

  // Group by date
  const groupedItems = didntBuyItems.reduce((groups, item) => {
    const date = item.date || 'Unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});
  const sortedDates = Object.keys(groupedItems).sort((a, b) => b.localeCompare(a));

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={HeaderStyle.title}>Didn't Buy It</Text>
          <Text style={HeaderStyle.subtitle}>Track items you resisted buying</Text>
        </View>

        {/* Total card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>MONEY KEPT BY NOT BUYING</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          <Text style={styles.totalCount}>{didntBuyItems.length} item{didntBuyItems.length !== 1 ? 's' : ''} resisted</Text>
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
          sortedDates.map(date => (
            <View key={date}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>{formatDate(date)}</Text>
                <Text style={styles.dateHeaderAmount}>
                  {formatCurrency(groupedItems[date].reduce((s, i) => s + (i.price || 0), 0))}
                </Text>
              </View>
              {groupedItems[date].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => openEditModal(item)}
                  onLongPress={() => deleteItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryDot}>
                    <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[item.category] || '📦'}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>{item.category}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        {didntBuyItems.length > 0 && (
          <Text style={styles.hint}>Tap to edit • Long-press to delete</Text>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      <FAB onPress={() => { openAddModal(); triggerHaptic('light'); }} />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add Item You Didn\'t Buy'}
            </Text>

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
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryChipText,
                    itemCategory === cat && styles.categoryChipTextActive,
                  ]}>{CATEGORY_EMOJI[cat]} {cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModalVisible(false); setEditingItem(null); }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!itemName.trim() || !itemPrice.trim()) && styles.saveBtnDisabled]}
                onPress={saveItem}
                activeOpacity={0.7}
              >
                <Text style={styles.saveBtnText}>{editingItem ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 100 },
  header: { marginBottom: Spacing.lg },

  totalCard: {
    ...CardStyle,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderColor: Colors.border,
  },
  totalLabel: { fontSize: FontSize.caption, color: Colors.textSecondary, letterSpacing: 0.5, fontWeight: '600', textTransform: 'uppercase' },
  totalValue: { fontSize: 40, fontWeight: '700', color: Colors.warning, marginTop: Spacing.xs, letterSpacing: -1 },
  totalCount: { fontSize: FontSize.small, color: Colors.textSecondary, marginTop: Spacing.xs },

  dateHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm, marginTop: Spacing.sm,
  },
  dateHeaderText: { fontSize: FontSize.small, fontWeight: '600', color: Colors.textSecondary },
  dateHeaderAmount: { fontSize: FontSize.small, fontWeight: '600', color: Colors.warning },

  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
    minHeight: 64,
  },
  categoryDot: {
    width: Spacing.xxl, height: Spacing.xxl, borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  categoryEmoji: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textPrimary },
  itemMeta: { fontSize: FontSize.caption, color: Colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: FontSize.section, fontWeight: '700', color: Colors.warning },

  hint: { textAlign: 'center', fontSize: FontSize.caption, color: Colors.textDisabled, marginTop: Spacing.md },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.section, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing.sm },

  fabWrap: {
    position: 'absolute', bottom: Spacing.lg, right: Spacing.lg,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 10,
  },
  fabText: { fontSize: 28, fontWeight: '400', color: Colors.background },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl + 4, borderTopRightRadius: Radius.xl + 4,
    padding: Spacing.lg, paddingBottom: Spacing.xxl,
  },
  modalHandle: {
    width: Spacing.xxl, height: 5, borderRadius: 3, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: FontSize.section, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSize.small, color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.body, color: Colors.textPrimary,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    minHeight: 48,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  categoryChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    minHeight: 36,
  },
  categoryChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  categoryChipText: { fontSize: FontSize.small, color: Colors.textSecondary },
  categoryChipTextActive: { color: Colors.primary, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: Spacing.md },
  cancelBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
    minHeight: 48, justifyContent: 'center',
  },
  cancelBtnText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center',
    backgroundColor: Colors.primary,
    minHeight: 48, justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.background },
});
