import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  NO_SPEND_DAYS: 'kept_noSpendDays',
  ENVELOPES: 'kept_envelopes',
  WEEKS: 'kept_weeks',
  DIDNT_BUY: 'kept_didntBuyIt',
  RULES: 'kept_rules',
};

export async function getData(key) {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export async function setData(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function getNoSpendDays() {
  return (await getData(KEYS.NO_SPEND_DAYS)) || {};
}

export async function setNoSpendDays(days) {
  return setData(KEYS.NO_SPEND_DAYS, days);
}

export async function getEnvelopes() {
  return (await getData(KEYS.ENVELOPES)) || [];
}

export async function setEnvelopes(envelopes) {
  return setData(KEYS.ENVELOPES, envelopes);
}

export async function getWeeks() {
  return (await getData(KEYS.WEEKS)) || [];
}

export async function setWeeks(weeks) {
  return setData(KEYS.WEEKS, weeks);
}

export async function getDidntBuyItems() {
  return (await getData(KEYS.DIDNT_BUY)) || [];
}

export async function setDidntBuyItems(items) {
  return setData(KEYS.DIDNT_BUY, items);
}

export async function getRules() {
  return (await getData(KEYS.RULES)) || [];
}

export async function setRules(rules) {
  return setData(KEYS.RULES, rules);
}

export { KEYS };
