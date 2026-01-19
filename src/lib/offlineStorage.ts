/**
 * IndexedDB Storage Layer with compression, integrity checks, and cleanup
 */

import { compressData, decompressData, formatBytes } from './compression';
import { generateChecksum, verifyChecksum, validateSchema, repairData, SCHEMAS, IntegrityReport, IntegrityLog, generateLogId, createEmptyReport } from './dataIntegrity';

const DB_NAME = 'taxforge-offline';
const DB_VERSION = 1;

export interface StoredRecord {
  id: string;
  data: string; // Compressed data
  checksum: string;
  originalSize: number;
  compressedSize: number;
  updatedAt: number;
  syncedAt: number | null;
  integrityVerifiedAt: number;
}

export interface QuarantinedRecord {
  id: string;
  table: string;
  originalData: unknown;
  error: string;
  quarantinedAt: number;
}

export interface PendingAction {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
  retryCount: number;
}

export interface SyncConflict {
  id: string;
  table: string;
  localData: unknown;
  serverData: unknown;
  localTimestamp: number;
  serverTimestamp: number;
  detectedAt: number;
}

export interface RetentionConfig {
  calculationRetentionDays: number;
  expenseArchiveDays: number;
  autoCleanupEnabled: boolean;
  lastCleanupTime: number;
  cleanupIntervalHours: number;
}

export interface CleanupStats {
  calculationsRemoved: number;
  expensesArchived: number;
  spaceFreed: number;
  spaceFreedFormatted: string;
  lastCleanupTime: Date;
}

export interface StorageStats {
  totalRecords: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  compressionRatio: number;
  byTable: Record<string, { count: number; size: number }>;
}

const STORES = {
  businesses: 'businesses',
  expenses: 'expenses',
  personalExpenses: 'personalExpenses',
  calculations: 'calculations',
  syncQueue: 'syncQueue',
  conflicts: 'conflicts',
  metadata: 'metadata',
  quarantine: 'quarantine',
  integrityLogs: 'integrityLogs',
};

const DEFAULT_RETENTION_CONFIG: RetentionConfig = {
  calculationRetentionDays: 90,
  expenseArchiveDays: 365,
  autoCleanupEnabled: true,
  lastCleanupTime: 0,
  cleanupIntervalHours: 24,
};

let dbInstance: IDBDatabase | null = null;

/**
 * Open the IndexedDB database
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' });
          
          // Add indexes for common queries
          if (storeName === STORES.syncQueue) {
            store.createIndex('timestamp', 'timestamp');
          }
          if (storeName === STORES.integrityLogs) {
            store.createIndex('timestamp', 'timestamp');
          }
        }
      });
    };
  });
};

/**
 * Generic function to save data with compression and checksum
 */
const saveWithIntegrity = async <T extends { id: string }>(
  storeName: string,
  items: T[],
  schemaName?: string
): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  const now = Date.now();

  for (const item of items) {
    // Validate schema if provided
    if (schemaName) {
      const validation = validateSchema(item, schemaName);
      if (!validation.isValid) {
        console.warn(`[OfflineStorage] Skipping invalid item:`, validation.errors);
        continue;
      }
    }

    const checksum = await generateChecksum(item);
    const { compressed, originalSize, compressedSize } = compressData(item);

    const record: StoredRecord = {
      id: item.id,
      data: compressed,
      checksum,
      originalSize,
      compressedSize,
      updatedAt: now,
      syncedAt: now,
      integrityVerifiedAt: now,
    };

    store.put(record);
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

/**
 * Generic function to get data with decompression and integrity check
 */
const getWithIntegrity = async <T>(
  storeName: string,
  schemaName?: string,
  verifyIntegrity = false
): Promise<T[]> => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    
    request.onsuccess = async () => {
      const records: StoredRecord[] = request.result;
      const items: T[] = [];

      for (const record of records) {
        try {
          const data = decompressData<T>(record.data);
          
          if (verifyIntegrity) {
            const isValid = await verifyChecksum(data, record.checksum);
            if (!isValid) {
              console.warn(`[OfflineStorage] Checksum mismatch for ${record.id}`);
              // Try to repair
              if (schemaName) {
                const repaired = repairData(data as Record<string, unknown>, schemaName);
                if (repaired.wasRepaired) {
                  items.push(repaired.data as T);
                  continue;
                }
              }
            }
          }
          
          items.push(data);
        } catch (error) {
          console.error(`[OfflineStorage] Failed to decompress ${record.id}:`, error);
        }
      }
      
      resolve(items);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Business operations
export const saveBusinesses = async (businesses: unknown[]): Promise<void> => {
  return saveWithIntegrity(STORES.businesses, businesses as { id: string }[], 'business');
};

export const getBusinesses = async <T>(verifyIntegrity = false): Promise<T[]> => {
  return getWithIntegrity<T>(STORES.businesses, 'business', verifyIntegrity);
};

// Expense operations
export const saveExpenses = async (expenses: unknown[]): Promise<void> => {
  return saveWithIntegrity(STORES.expenses, expenses as { id: string }[], 'expense');
};

export const getExpenses = async <T>(verifyIntegrity = false): Promise<T[]> => {
  return getWithIntegrity<T>(STORES.expenses, 'expense', verifyIntegrity);
};

// Personal expense operations
export const savePersonalExpenses = async (expenses: unknown[]): Promise<void> => {
  return saveWithIntegrity(STORES.personalExpenses, expenses as { id: string }[], 'personalExpense');
};

export const getPersonalExpenses = async <T>(verifyIntegrity = false): Promise<T[]> => {
  return getWithIntegrity<T>(STORES.personalExpenses, 'personalExpense', verifyIntegrity);
};

// Calculation operations
export const saveCalculation = async (calculation: unknown): Promise<void> => {
  return saveWithIntegrity(STORES.calculations, [calculation as { id: string }], 'calculation');
};

export const getCalculations = async <T>(verifyIntegrity = false): Promise<T[]> => {
  return getWithIntegrity<T>(STORES.calculations, 'calculation', verifyIntegrity);
};

// Sync queue operations
export const addToSyncQueue = async (action: PendingAction): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.syncQueue, 'readwrite');
  const store = transaction.objectStore(STORES.syncQueue);
  store.put(action);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getSyncQueue = async (): Promise<PendingAction[]> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.syncQueue, 'readonly');
  const store = transaction.objectStore(STORES.syncQueue);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const removeFromSyncQueue = async (id: string): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.syncQueue, 'readwrite');
  const store = transaction.objectStore(STORES.syncQueue);
  store.delete(id);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const clearSyncQueue = async (): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.syncQueue, 'readwrite');
  const store = transaction.objectStore(STORES.syncQueue);
  store.clear();
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Conflict operations
export const addConflict = async (conflict: SyncConflict): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.conflicts, 'readwrite');
  const store = transaction.objectStore(STORES.conflicts);
  store.put(conflict);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getConflicts = async (): Promise<SyncConflict[]> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.conflicts, 'readonly');
  const store = transaction.objectStore(STORES.conflicts);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const resolveConflict = async (id: string): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.conflicts, 'readwrite');
  const store = transaction.objectStore(STORES.conflicts);
  store.delete(id);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Retention config operations
export const getRetentionConfig = async (): Promise<RetentionConfig> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.metadata, 'readonly');
  const store = transaction.objectStore(STORES.metadata);
  
  return new Promise((resolve, reject) => {
    const request = store.get('retentionConfig');
    request.onsuccess = () => {
      resolve(request.result?.data || DEFAULT_RETENTION_CONFIG);
    };
    request.onerror = () => reject(request.error);
  });
};

export const setRetentionConfig = async (config: Partial<RetentionConfig>): Promise<void> => {
  const current = await getRetentionConfig();
  const updated = { ...current, ...config };
  
  const db = await openDatabase();
  const transaction = db.transaction(STORES.metadata, 'readwrite');
  const store = transaction.objectStore(STORES.metadata);
  store.put({ id: 'retentionConfig', data: updated });
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Cleanup operations
export const shouldRunCleanup = async (): Promise<boolean> => {
  const config = await getRetentionConfig();
  if (!config.autoCleanupEnabled) return false;
  
  const hoursSinceLastCleanup = (Date.now() - config.lastCleanupTime) / (1000 * 60 * 60);
  return hoursSinceLastCleanup >= config.cleanupIntervalHours;
};

export const runAutomaticCleanup = async (): Promise<CleanupStats> => {
  const config = await getRetentionConfig();
  let spaceFreed = 0;
  let calculationsRemoved = 0;
  let expensesArchived = 0;

  // Clean old calculations
  const cutoffDate = Date.now() - (config.calculationRetentionDays * 24 * 60 * 60 * 1000);
  const db = await openDatabase();
  
  // Get and filter calculations
  const calcTransaction = db.transaction(STORES.calculations, 'readwrite');
  const calcStore = calcTransaction.objectStore(STORES.calculations);
  
  const calcRequest = calcStore.getAll();
  await new Promise<void>((resolve, reject) => {
    calcRequest.onsuccess = () => {
      const records: StoredRecord[] = calcRequest.result;
      for (const record of records) {
        if (record.updatedAt < cutoffDate && record.syncedAt) {
          spaceFreed += record.compressedSize;
          calculationsRemoved++;
          calcStore.delete(record.id);
        }
      }
      resolve();
    };
    calcRequest.onerror = () => reject(calcRequest.error);
  });

  // Update last cleanup time
  await setRetentionConfig({ lastCleanupTime: Date.now() });

  return {
    calculationsRemoved,
    expensesArchived,
    spaceFreed,
    spaceFreedFormatted: formatBytes(spaceFreed),
    lastCleanupTime: new Date(),
  };
};

// Quarantine operations
export const quarantineRecord = async (
  table: string,
  id: string,
  originalData: unknown,
  error: string
): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.quarantine, 'readwrite');
  const store = transaction.objectStore(STORES.quarantine);
  
  const record: QuarantinedRecord = {
    id: `${table}_${id}`,
    table,
    originalData,
    error,
    quarantinedAt: Date.now(),
  };
  
  store.put(record);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getQuarantinedRecords = async (): Promise<QuarantinedRecord[]> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.quarantine, 'readonly');
  const store = transaction.objectStore(STORES.quarantine);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Integrity verification
export const verifyAllIntegrity = async (): Promise<IntegrityReport> => {
  const report = createEmptyReport();
  const stores = ['businesses', 'expenses', 'personalExpenses', 'calculations'] as const;
  const schemaMap: Record<string, string> = {
    businesses: 'business',
    expenses: 'expense',
    personalExpenses: 'personalExpense',
    calculations: 'calculation',
  };

  for (const storeName of stores) {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    const records: StoredRecord[] = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const record of records) {
      report.totalRecords++;
      
      try {
        const data = decompressData(record.data);
        const isChecksumValid = await verifyChecksum(data, record.checksum);
        const schemaResult = validateSchema(data, schemaMap[storeName]);
        
        if (isChecksumValid && schemaResult.isValid) {
          report.validRecords++;
        } else if (schemaResult.warnings.length > 0 && schemaResult.errors.length === 0) {
          // Can be repaired
          report.repairedRecords++;
        } else {
          report.corruptedRecords++;
          report.refetchNeeded.push(`${storeName}:${record.id}`);
        }
      } catch {
        report.corruptedRecords++;
        report.refetchNeeded.push(`${storeName}:${record.id}`);
      }
    }
  }

  report.quarantinedRecords = (await getQuarantinedRecords()).length;
  return report;
};

// Storage statistics
export const getStorageStats = async (): Promise<StorageStats> => {
  const stats: StorageStats = {
    totalRecords: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    compressionRatio: 0,
    byTable: {},
  };

  const stores = ['businesses', 'expenses', 'personalExpenses', 'calculations'] as const;

  for (const storeName of stores) {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    const records: StoredRecord[] = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    let tableSize = 0;
    for (const record of records) {
      stats.totalRecords++;
      stats.totalOriginalSize += record.originalSize;
      stats.totalCompressedSize += record.compressedSize;
      tableSize += record.compressedSize;
    }

    stats.byTable[storeName] = {
      count: records.length,
      size: tableSize,
    };
  }

  stats.compressionRatio = stats.totalOriginalSize > 0
    ? (1 - stats.totalCompressedSize / stats.totalOriginalSize) * 100
    : 0;

  return stats;
};

// Clear all cached data
export const clearAllCache = async (): Promise<void> => {
  const db = await openDatabase();
  const stores = ['businesses', 'expenses', 'personalExpenses', 'calculations'];
  
  for (const storeName of stores) {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.clear();
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
};

// Clear specific table cache
export const clearTableCache = async (tableName: string): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(tableName, 'readwrite');
  const store = transaction.objectStore(tableName);
  store.clear();
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Integrity logs
export const addIntegrityLog = async (log: Omit<IntegrityLog, 'id'>): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.integrityLogs, 'readwrite');
  const store = transaction.objectStore(STORES.integrityLogs);
  
  store.put({ ...log, id: generateLogId() });
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getIntegrityLogs = async (limit = 100): Promise<IntegrityLog[]> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.integrityLogs, 'readonly');
  const store = transaction.objectStore(STORES.integrityLogs);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const logs: IntegrityLog[] = request.result;
      logs.sort((a, b) => b.timestamp - a.timestamp);
      resolve(logs.slice(0, limit));
    };
    request.onerror = () => reject(request.error);
  });
};
