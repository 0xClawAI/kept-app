import * as Haptics from 'expo-haptics';

export function triggerHaptic(type = 'medium') {
  try {
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.success);
    } else if (type === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    }
  } catch {}
}

export function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getDateKey(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function calculateStreak(noSpendDays) {
  let streak = 0;
  const today = new Date();
  const d = new Date(today);
  
  while (true) {
    const key = getDateKey(d);
    if (noSpendDays[key] === 'no-spend') {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (getDateKey(d) === getDateKey(today) && !noSpendDays[key]) {
      // Today not marked yet — check yesterday
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calculateLongestStreak(noSpendDays) {
  const keys = Object.keys(noSpendDays).filter(k => noSpendDays[k] === 'no-spend').sort();
  if (keys.length === 0) return 0;
  
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < keys.length; i++) {
    const prev = new Date(keys[i - 1]);
    const curr = new Date(keys[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export function getEnvelopeTotal(envelopes) {
  return envelopes.reduce((sum, n) => sum + n, 0);
}

export function getWeeksTotal(weeks) {
  return weeks.reduce((sum, n) => sum + n, 0);
}

export function getDidntBuyTotal(items) {
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
