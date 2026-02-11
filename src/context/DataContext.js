import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Storage from '../utils/storage';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [noSpendDays, setNoSpendDaysState] = useState({});
  const [envelopes, setEnvelopesState] = useState([]);
  const [weeks, setWeeksState] = useState([]);
  const [didntBuyItems, setDidntBuyItemsState] = useState([]);
  const [rules, setRulesState] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [d, e, w, b, r] = await Promise.all([
        Storage.getNoSpendDays(),
        Storage.getEnvelopes(),
        Storage.getWeeks(),
        Storage.getDidntBuyItems(),
        Storage.getRules(),
      ]);
      setNoSpendDaysState(d);
      setEnvelopesState(e);
      setWeeksState(w);
      setDidntBuyItemsState(b);
      setRulesState(r);
      setLoaded(true);
    })();
  }, []);

  const updateNoSpendDays = useCallback(async (days) => {
    setNoSpendDaysState(days);
    await Storage.setNoSpendDays(days);
  }, []);

  const updateEnvelopes = useCallback(async (env) => {
    setEnvelopesState(env);
    await Storage.setEnvelopes(env);
  }, []);

  const updateWeeks = useCallback(async (w) => {
    setWeeksState(w);
    await Storage.setWeeks(w);
  }, []);

  const updateDidntBuyItems = useCallback(async (items) => {
    setDidntBuyItemsState(items);
    await Storage.setDidntBuyItems(items);
  }, []);

  const updateRules = useCallback(async (r) => {
    setRulesState(r);
    await Storage.setRules(r);
  }, []);

  return (
    <DataContext.Provider value={{
      loaded,
      noSpendDays, updateNoSpendDays,
      envelopes, updateEnvelopes,
      weeks, updateWeeks,
      didntBuyItems, updateDidntBuyItems,
      rules, updateRules,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
