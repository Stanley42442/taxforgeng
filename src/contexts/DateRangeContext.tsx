import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter,
  subDays,
  parseISO
} from 'date-fns';
import { safeLocalStorage } from '@/lib/safeStorage';

export type DatePreset = 'week' | 'month' | 'quarter' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangeContextValue {
  preset: DatePreset;
  customRange: DateRange | null;
  computedRange: DateRange;
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (range: DateRange) => void;
}

const STORAGE_KEY = 'taxforge-date-range';

interface StoredState {
  preset: DatePreset;
  customRange: { start: string; end: string } | null;
}

const DateRangeContext = createContext<DateRangeContextValue | undefined>(undefined);

const computeRange = (preset: DatePreset, customRange: DateRange | null): DateRange => {
  const now = new Date();
  
  switch (preset) {
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'quarter':
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case 'custom':
      return customRange || { start: subDays(now, 30), end: now };
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
};

export const DateRangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage
  const [preset, setPresetState] = useState<DatePreset>(() => {
    const stored = safeLocalStorage.getJSON<StoredState | null>(STORAGE_KEY, null);
    return stored?.preset || 'month';
  });

  const [customRange, setCustomRangeState] = useState<DateRange | null>(() => {
    const stored = safeLocalStorage.getJSON<StoredState | null>(STORAGE_KEY, null);
    if (stored?.customRange) {
      return {
        start: parseISO(stored.customRange.start),
        end: parseISO(stored.customRange.end),
      };
    }
    return null;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    const stateToStore: StoredState = {
      preset,
      customRange: customRange
        ? { start: customRange.start.toISOString(), end: customRange.end.toISOString() }
        : null,
    };
    safeLocalStorage.setJSON(STORAGE_KEY, stateToStore);
  }, [preset, customRange]);

  const setPreset = useCallback((newPreset: DatePreset) => {
    setPresetState(newPreset);
  }, []);

  const setCustomRange = useCallback((range: DateRange) => {
    setCustomRangeState(range);
    setPresetState('custom');
  }, []);

  const computedRange = useMemo(() => computeRange(preset, customRange), [preset, customRange]);

  const value = useMemo(
    () => ({
      preset,
      customRange,
      computedRange,
      setPreset,
      setCustomRange,
    }),
    [preset, customRange, computedRange, setPreset, setCustomRange]
  );

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
};

export const useDateRange = (): DateRangeContextValue => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
};

export default DateRangeContext;
