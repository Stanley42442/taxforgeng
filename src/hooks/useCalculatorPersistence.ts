import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { safeLocalStorage } from '@/lib/safeStorage';

const STORAGE_KEYS = {
  individual: 'taxforge_individual_calculator',
  business: 'taxforge_business_calculator',
} as const;

type CalculatorType = keyof typeof STORAGE_KEYS;

interface StoredData<T> {
  data: T;
  timestamp: number;
}

// Simple debounce utility
function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  
  return debounced as T;
}

export function useCalculatorPersistence<T extends Record<string, unknown>>(
  calculatorType: CalculatorType,
  initialState: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void, boolean] {
  const [wasRestored, setWasRestored] = useState(false);
  const hasShownToast = useRef(false);
  
  const [state, setState] = useState<T>(() => {
    const saved = safeLocalStorage.getItem(STORAGE_KEYS[calculatorType]);
    if (saved) {
      try {
        const parsed: StoredData<T> = JSON.parse(saved);
        // Check if data is less than 24 hours old
        const isRecent = parsed.timestamp && Date.now() - parsed.timestamp < 86400000;
        if (isRecent && parsed.data) {
          setWasRestored(true);
          return { ...initialState, ...parsed.data };
        }
      } catch {
        // Ignore parse errors
      }
    }
    return initialState;
  });

  // Memoize the storage key to prevent stale closures
  const storageKey = STORAGE_KEYS[calculatorType];

  // Debounced save function - using storageKey to prevent stale closure
  const saveToStorage = useCallback(
    debounce((data: T) => {
      const storageData: StoredData<T> = {
        data,
        timestamp: Date.now(),
      };
      safeLocalStorage.setJSON(storageKey, storageData);
    }, 500),
    [storageKey]
  );

  // Auto-save on state change
  useEffect(() => {
    saveToStorage(state);
  }, [state, saveToStorage]);

  // Show restore toast once
  useEffect(() => {
    if (wasRestored && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.info('Previous session restored', {
        description: 'Your inputs from earlier have been loaded',
        action: {
          label: 'Clear',
          onClick: () => {
            safeLocalStorage.removeItem(STORAGE_KEYS[calculatorType]);
            setState(initialState);
            toast.success('Session cleared');
          },
        },
        duration: 5000,
      });
    }
  }, [wasRestored, calculatorType, initialState]);

  const clearSaved = useCallback(() => {
    safeLocalStorage.removeItem(STORAGE_KEYS[calculatorType]);
    setState(initialState);
    setWasRestored(false);
    toast.success('Saved data cleared');
  }, [calculatorType, initialState]);

  return [state, setState, clearSaved, wasRestored];
}

// Hook for individual field persistence (simpler approach)
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  expiryMs: number = 86400000 // 24 hours
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const stored = safeLocalStorage.getItem(key);
    if (stored) {
      try {
        const parsed: StoredData<T> = JSON.parse(stored);
        if (parsed.timestamp && Date.now() - parsed.timestamp < expiryMs) {
          return parsed.data;
        }
      } catch {
        // Ignore
      }
    }
    return initialValue;
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      const storageData: StoredData<T> = {
        data: newValue,
        timestamp: Date.now(),
      };
      safeLocalStorage.setJSON(key, storageData);
      return newValue;
    });
  }, [key]);

  return [state, setValue];
}
