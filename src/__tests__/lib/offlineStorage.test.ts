/**
 * Comprehensive tests for offline storage (IndexedDB)
 * Tests: CRUD operations, compression, integrity, cleanup, sync queue
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  openDatabase,
  saveBusinesses,
  getBusinesses,
  saveExpenses,
  getExpenses,
  savePersonalExpenses,
  getPersonalExpenses,
  saveCalculation,
  getCalculations,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  addConflict,
  getConflicts,
  resolveConflict,
  getRetentionConfig,
  setRetentionConfig,
  shouldRunCleanup,
  runAutomaticCleanup,
  quarantineRecord,
  getQuarantinedRecords,
  verifyAllIntegrity,
  getStorageStats,
  clearAllCache,
  clearTableCache,
} from '@/lib/offlineStorage';

describe('Offline Storage (IndexedDB)', () => {
  beforeEach(async () => {
    // Ensure clean database for each test
    await clearAllCache().catch(() => {});
  });

  describe('openDatabase', () => {
    it('should open database successfully', async () => {
      const db = await openDatabase();
      expect(db).toBeDefined();
      expect(db.name).toBe('taxforge-offline');
    });

    it('should reuse existing connection', async () => {
      const db1 = await openDatabase();
      const db2 = await openDatabase();
      expect(db1).toBe(db2);
    });
  });

  describe('Business Operations', () => {
    it('should save and retrieve businesses', async () => {
      const businesses = [
        {
          id: 'biz-1',
          user_id: 'user-1',
          name: 'Test Business 1',
          turnover: 1000000,
          entity_type: 'limited',
        },
        {
          id: 'biz-2',
          user_id: 'user-1',
          name: 'Test Business 2',
          turnover: 500000,
          entity_type: 'sole_proprietorship',
        },
      ];

      await saveBusinesses(businesses);
      const retrieved = await getBusinesses<typeof businesses[0]>();

      expect(retrieved).toHaveLength(2);
      expect(retrieved[0].name).toBe('Test Business 1');
    });

    it('should update existing businesses', async () => {
      const business = {
        id: 'biz-1',
        user_id: 'user-1',
        name: 'Original Name',
        turnover: 1000000,
        entity_type: 'limited',
      };

      await saveBusinesses([business]);
      
      const updated = { ...business, name: 'Updated Name' };
      await saveBusinesses([updated]);

      const retrieved = await getBusinesses<typeof business>();
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].name).toBe('Updated Name');
    });

    it('should compress business data', async () => {
      const largeBusinesses = Array(10).fill(null).map((_, i) => ({
        id: `biz-${i}`,
        user_id: 'user-1',
        name: `Business with a very long name that repeats ${i}`,
        turnover: 1000000,
        entity_type: 'limited',
        description: 'A '.repeat(1000),
      }));

      await saveBusinesses(largeBusinesses);
      const stats = await getStorageStats();
      
      // Compression ratio should be significant for repetitive data
      expect(stats.compressionRatio).toBeGreaterThan(0);
    });

    it('should verify integrity when requested', async () => {
      const business = {
        id: 'biz-1',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
      };

      await saveBusinesses([business]);
      const retrieved = await getBusinesses<typeof business>(true); // with integrity check

      expect(retrieved).toHaveLength(1);
    });
  });

  describe('Expense Operations', () => {
    it('should save and retrieve expenses', async () => {
      const expenses = [
        {
          id: 'exp-1',
          user_id: 'user-1',
          amount: 5000,
          category: 'utilities',
          type: 'expense',
          is_deductible: true,
        },
      ];

      await saveExpenses(expenses);
      const retrieved = await getExpenses<typeof expenses[0]>();

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].amount).toBe(5000);
    });

    it('should handle large number of expenses', async () => {
      const expenses = Array(100).fill(null).map((_, i) => ({
        id: `exp-${i}`,
        user_id: 'user-1',
        amount: Math.random() * 10000,
        category: 'utilities',
        type: 'expense',
        is_deductible: true,
      }));

      await saveExpenses(expenses);
      const retrieved = await getExpenses<typeof expenses[0]>();

      expect(retrieved).toHaveLength(100);
    });
  });

  describe('Personal Expense Operations', () => {
    it('should save and retrieve personal expenses', async () => {
      const expenses = [
        {
          id: 'pe-1',
          user_id: 'user-1',
          amount: 50000,
          category: 'rent',
          payment_interval: 'monthly',
          is_active: true,
        },
      ];

      await savePersonalExpenses(expenses);
      const retrieved = await getPersonalExpenses<typeof expenses[0]>();

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].category).toBe('rent');
    });
  });

  describe('Calculation Operations', () => {
    it('should save and retrieve calculations', async () => {
      const calculation = {
        id: 'calc-1',
        inputs: { income: 1000000, expenses: 200000 },
        result: { tax: 160000, net: 640000 },
        created_at: new Date().toISOString(),
      };

      await saveCalculation(calculation);
      const retrieved = await getCalculations<typeof calculation>();

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].inputs.income).toBe(1000000);
    });
  });

  describe('Sync Queue Operations', () => {
    it('should add items to sync queue', async () => {
      const action = {
        id: 'sync-1',
        table: 'businesses',
        action: 'create' as const,
        data: { id: 'biz-1', name: 'New Business' },
        timestamp: Date.now(),
        retryCount: 0,
      };

      await addToSyncQueue(action);
      const queue = await getSyncQueue();

      expect(queue).toHaveLength(1);
      expect(queue[0].table).toBe('businesses');
    });

    it('should remove items from sync queue', async () => {
      const action = {
        id: 'sync-1',
        table: 'businesses',
        action: 'create' as const,
        data: { id: 'biz-1' },
        timestamp: Date.now(),
        retryCount: 0,
      };

      await addToSyncQueue(action);
      await removeFromSyncQueue('sync-1');
      const queue = await getSyncQueue();

      expect(queue).toHaveLength(0);
    });

    it('should clear entire sync queue', async () => {
      for (let i = 0; i < 5; i++) {
        await addToSyncQueue({
          id: `sync-${i}`,
          table: 'businesses',
          action: 'create',
          data: { id: `biz-${i}` },
          timestamp: Date.now(),
          retryCount: 0,
        });
      }

      await clearSyncQueue();
      const queue = await getSyncQueue();

      expect(queue).toHaveLength(0);
    });

    it('should maintain order in sync queue', async () => {
      for (let i = 0; i < 3; i++) {
        await addToSyncQueue({
          id: `sync-${i}`,
          table: 'businesses',
          action: 'create',
          data: { id: `biz-${i}` },
          timestamp: Date.now() + i * 100,
          retryCount: 0,
        });
      }

      const queue = await getSyncQueue();
      expect(queue[0].id).toBe('sync-0');
    });
  });

  describe('Conflict Operations', () => {
    it('should add and retrieve conflicts', async () => {
      const conflict = {
        id: 'conflict-1',
        table: 'businesses',
        localData: { id: 'biz-1', name: 'Local Name' },
        serverData: { id: 'biz-1', name: 'Server Name' },
        localTimestamp: Date.now() - 1000,
        serverTimestamp: Date.now(),
        detectedAt: Date.now(),
      };

      await addConflict(conflict);
      const conflicts = await getConflicts();

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].table).toBe('businesses');
    });

    it('should resolve conflicts', async () => {
      const conflict = {
        id: 'conflict-1',
        table: 'businesses',
        localData: {},
        serverData: {},
        localTimestamp: Date.now(),
        serverTimestamp: Date.now(),
        detectedAt: Date.now(),
      };

      await addConflict(conflict);
      await resolveConflict('conflict-1');
      const conflicts = await getConflicts();

      expect(conflicts).toHaveLength(0);
    });
  });

  describe('Retention Config', () => {
    it('should get default retention config', async () => {
      const config = await getRetentionConfig();

      expect(config.calculationRetentionDays).toBeDefined();
      expect(config.expenseArchiveDays).toBeDefined();
      expect(config.autoCleanupEnabled).toBeDefined();
    });

    it('should update retention config', async () => {
      await setRetentionConfig({ calculationRetentionDays: 60 });
      const config = await getRetentionConfig();

      expect(config.calculationRetentionDays).toBe(60);
    });

    it('should merge config updates', async () => {
      await setRetentionConfig({ calculationRetentionDays: 60 });
      await setRetentionConfig({ autoCleanupEnabled: false });
      const config = await getRetentionConfig();

      expect(config.calculationRetentionDays).toBe(60);
      expect(config.autoCleanupEnabled).toBe(false);
    });
  });

  describe('Automatic Cleanup', () => {
    it('should determine if cleanup should run', async () => {
      await setRetentionConfig({ 
        autoCleanupEnabled: true,
        lastCleanupTime: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        cleanupIntervalHours: 24,
      });

      const shouldRun = await shouldRunCleanup();
      expect(shouldRun).toBe(true);
    });

    it('should not run cleanup if disabled', async () => {
      await setRetentionConfig({ autoCleanupEnabled: false });

      const shouldRun = await shouldRunCleanup();
      expect(shouldRun).toBe(false);
    });

    it('should run cleanup and return stats', async () => {
      // Add some old calculations
      const oldCalc = {
        id: 'old-calc-1',
        inputs: {},
        result: {},
        created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      };
      await saveCalculation(oldCalc);

      const stats = await runAutomaticCleanup();
      expect(stats).toBeDefined();
      expect(stats.lastCleanupTime).toBeInstanceOf(Date);
    });
  });

  describe('Quarantine Operations', () => {
    it('should quarantine corrupted records', async () => {
      await quarantineRecord('businesses', 'biz-1', { corrupt: 'data' }, 'Checksum mismatch');
      const quarantined = await getQuarantinedRecords();

      expect(quarantined).toHaveLength(1);
      expect(quarantined[0].error).toBe('Checksum mismatch');
    });

    it('should include table info in quarantine', async () => {
      await quarantineRecord('expenses', 'exp-1', {}, 'Schema violation');
      const quarantined = await getQuarantinedRecords();

      expect(quarantined[0].table).toBe('expenses');
    });
  });

  describe('Integrity Verification', () => {
    it('should verify all data integrity', async () => {
      await saveBusinesses([{
        id: 'biz-1',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
      }]);

      const report = await verifyAllIntegrity();

      expect(report.totalRecords).toBeGreaterThanOrEqual(1);
      expect(report.timestamp).toBeInstanceOf(Date);
    });

    it('should count valid records', async () => {
      await saveBusinesses([
        {
          id: 'biz-1',
          user_id: 'user-1',
          name: 'Business 1',
          turnover: 100000,
          entity_type: 'limited',
        },
        {
          id: 'biz-2',
          user_id: 'user-1',
          name: 'Business 2',
          turnover: 200000,
          entity_type: 'limited',
        },
      ]);

      const report = await verifyAllIntegrity();
      expect(report.validRecords).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Storage Stats', () => {
    it('should return storage statistics', async () => {
      await saveBusinesses([{
        id: 'biz-1',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
      }]);

      const stats = await getStorageStats();

      expect(stats.totalRecords).toBeGreaterThanOrEqual(1);
      expect(stats.totalOriginalSize).toBeGreaterThan(0);
      expect(stats.totalCompressedSize).toBeGreaterThan(0);
    });

    it('should track stats by table', async () => {
      await saveBusinesses([{
        id: 'biz-1',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
      }]);
      
      await saveExpenses([{
        id: 'exp-1',
        user_id: 'user-1',
        amount: 5000,
        category: 'utilities',
        type: 'expense',
      }]);

      const stats = await getStorageStats();

      expect(stats.byTable.businesses).toBeDefined();
      expect(stats.byTable.expenses).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('should clear all cache', async () => {
      await saveBusinesses([{
        id: 'biz-1',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
      }]);
      
      await clearAllCache();
      const businesses = await getBusinesses();

      expect(businesses).toHaveLength(0);
    });

    it('should clear specific table cache', async () => {
      await saveBusinesses([{
        id: 'biz-1',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
      }]);
      
      await saveExpenses([{
        id: 'exp-1',
        user_id: 'user-1',
        amount: 5000,
        category: 'utilities',
        type: 'expense',
      }]);

      await clearTableCache('businesses');

      const businesses = await getBusinesses();
      const expenses = await getExpenses();

      expect(businesses).toHaveLength(0);
      expect(expenses).toHaveLength(1);
    });
  });

  describe('Security Tests', () => {
    it('should handle malicious data without XSS', async () => {
      const maliciousBusiness = {
        id: 'biz-xss',
        user_id: 'user-1',
        name: '<script>alert("XSS")</script>',
        turnover: 100000,
        entity_type: '<img onerror="evil()" src="x">',
      };

      await saveBusinesses([maliciousBusiness]);
      const retrieved = await getBusinesses<typeof maliciousBusiness>();

      // Data should be stored as-is (not executed)
      expect(retrieved[0].name).toBe('<script>alert("XSS")</script>');
    });

    it('should handle SQL injection attempts', async () => {
      const maliciousExpense = {
        id: "exp'; DROP TABLE expenses; --",
        user_id: 'user-1',
        amount: 5000,
        category: "utilities'; DELETE FROM expenses; --",
        type: 'expense',
      };

      // IndexedDB is not SQL-based, so these should just be stored as strings
      await saveExpenses([maliciousExpense]);
      const retrieved = await getExpenses<typeof maliciousExpense>();

      expect(retrieved[0].category).toBe("utilities'; DELETE FROM expenses; --");
    });

    it('should handle prototype pollution attempts', async () => {
      const maliciousBusiness = {
        id: 'biz-proto',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
        __proto__: { polluted: true },
        constructor: { prototype: { polluted: true } },
      };

      await saveBusinesses([maliciousBusiness]);
      
      // Verify no prototype pollution
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays', async () => {
      await saveBusinesses([]);
      const businesses = await getBusinesses();
      expect(businesses).toHaveLength(0);
    });

    it('should handle Unicode in data', async () => {
      const business = {
        id: 'biz-unicode',
        user_id: 'user-1',
        name: '日本語ビジネス 🎉 مرحبا',
        turnover: 100000,
        entity_type: 'limited',
      };

      await saveBusinesses([business]);
      const retrieved = await getBusinesses<typeof business>();

      expect(retrieved[0].name).toBe('日本語ビジネス 🎉 مرحبا');
    });

    it('should handle very long strings', async () => {
      const business = {
        id: 'biz-long',
        user_id: 'user-1',
        name: 'x'.repeat(10000),
        turnover: 100000,
        entity_type: 'limited',
      };

      await saveBusinesses([business]);
      const retrieved = await getBusinesses<typeof business>();

      expect(retrieved[0].name.length).toBe(10000);
    });

    it('should handle concurrent operations', async () => {
      const operations = Array(10).fill(null).map((_, i) => 
        saveBusinesses([{
          id: `biz-concurrent-${i}`,
          user_id: 'user-1',
          name: `Business ${i}`,
          turnover: 100000,
          entity_type: 'limited',
        }])
      );

      await Promise.all(operations);
      const businesses = await getBusinesses();

      expect(businesses.length).toBeGreaterThanOrEqual(10);
    });
  });
});
