/**
 * End-to-end integration tests for the PWA offline system
 * Tests: complete workflows, data flow, system interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  compressData, 
  decompressData 
} from '@/lib/compression';
import { 
  generateChecksum, 
  verifyChecksum, 
  validateSchema, 
  repairData 
} from '@/lib/dataIntegrity';
import {
  saveBusinesses,
  getBusinesses,
  saveExpenses,
  getExpenses,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  verifyAllIntegrity,
  getStorageStats,
  clearAllCache,
} from '@/lib/offlineStorage';
import {
  getStorageQuota,
  getWarningLevel,
  canStoreData,
} from '@/lib/storageQuota';
import {
  exportBusinessesToCSV,
  exportAllCachedData,
  getExportSummary,
} from '@/lib/offlineExport';

describe('PWA Integration Tests', () => {
  beforeEach(async () => {
    await clearAllCache().catch(() => {});
  });

  describe('Complete Data Flow: Save → Compress → Store → Retrieve → Verify', () => {
    it('should handle complete business data lifecycle', async () => {
      // Step 1: Create business data
      const business = {
        id: 'integration-biz-1',
        user_id: 'user-1',
        name: 'Integration Test Business',
        turnover: 5000000,
        entity_type: 'limited',
        sector: 'technology',
      };

      // Step 2: Save to IndexedDB (with automatic compression)
      await saveBusinesses([business]);

      // Step 3: Retrieve data
      const retrieved = await getBusinesses<typeof business>();

      // Step 4: Verify data integrity
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].name).toBe('Integration Test Business');
      expect(retrieved[0].turnover).toBe(5000000);

      // Step 5: Run integrity check
      const report = await verifyAllIntegrity();
      expect(report.validRecords).toBeGreaterThanOrEqual(1);
    });

    it('should handle multiple data types simultaneously', async () => {
      // Save different data types
      await Promise.all([
        saveBusinesses([
          { id: 'biz-1', user_id: 'user-1', name: 'Business 1', turnover: 1000000, entity_type: 'limited' },
          { id: 'biz-2', user_id: 'user-1', name: 'Business 2', turnover: 2000000, entity_type: 'limited' },
        ]),
        saveExpenses([
          { id: 'exp-1', user_id: 'user-1', amount: 5000, category: 'utilities', type: 'expense' },
          { id: 'exp-2', user_id: 'user-1', amount: 10000, category: 'rent', type: 'expense' },
        ]),
      ]);

      // Verify all data
      const [businesses, expenses] = await Promise.all([
        getBusinesses(),
        getExpenses(),
      ]);

      expect(businesses).toHaveLength(2);
      expect(expenses).toHaveLength(2);
    });
  });

  describe('Compression and Integrity Integration', () => {
    it('should compress data before storing and decompress after', async () => {
      const largeData = Array(100).fill(null).map((_, i) => ({
        id: `data-${i}`,
        user_id: 'user-1',
        name: `Business ${i} with repeated content for compression`,
        turnover: i * 100000,
        entity_type: 'limited',
        description: 'This is a long description that repeats across all items for better compression.',
      }));

      await saveBusinesses(largeData);

      // Check storage stats to verify compression
      const stats = await getStorageStats();
      expect(stats.compressionRatio).toBeGreaterThan(0);

      // Verify data is intact
      const retrieved = await getBusinesses<typeof largeData[0]>();
      expect(retrieved).toHaveLength(100);
      expect(retrieved[0].name).toContain('Business 0');
    });

    it('should maintain data integrity through compression cycle', async () => {
      const originalData = {
        id: 'integrity-test',
        nested: {
          deep: {
            value: 'preserved',
            numbers: [1, 2, 3, 4, 5],
          },
        },
        special: 'émojis 🎉 and spëcial châräctérs',
      };

      // Compress
      const { compressed } = compressData(originalData);
      
      // Decompress
      const decompressed = decompressData<typeof originalData>(compressed);

      // Generate and verify checksum
      const checksum = await generateChecksum(originalData);
      const isValid = await verifyChecksum(decompressed, checksum);

      expect(isValid).toBe(true);
      expect(decompressed.nested.deep.value).toBe('preserved');
      expect(decompressed.special).toBe('émojis 🎉 and spëcial châräctérs');
    });
  });

  describe('Sync Queue Integration', () => {
    it('should queue actions and retrieve them in order', async () => {
      const actions = [
        { table: 'businesses', action: 'create' as const, data: { id: '1' } },
        { table: 'expenses', action: 'update' as const, data: { id: '2' } },
        { table: 'businesses', action: 'delete' as const, data: { id: '3' } },
      ];

      for (let i = 0; i < actions.length; i++) {
        await addToSyncQueue({
          id: `sync-${i}`,
          ...actions[i],
          timestamp: Date.now() + i * 100,
          retryCount: 0,
        });
      }

      const queue = await getSyncQueue();
      expect(queue).toHaveLength(3);
      expect(queue[0].action).toBe('create');
    });

    it('should clear queue after sync', async () => {
      await addToSyncQueue({
        id: 'sync-1',
        table: 'businesses',
        action: 'create',
        data: { id: '1' },
        timestamp: Date.now(),
        retryCount: 0,
      });

      await clearSyncQueue();
      const queue = await getSyncQueue();

      expect(queue).toHaveLength(0);
    });
  });

  describe('Storage Quota Integration', () => {
    it('should monitor quota and provide warnings', async () => {
      const quota = await getStorageQuota();
      
      expect(quota.usage).toBeDefined();
      expect(quota.quota).toBeDefined();
      expect(quota.warningLevel).toBeDefined();
    });

    it('should determine if data can be stored', async () => {
      const result = await canStoreData(1024 * 1024); // 1MB
      
      expect(result.canStore).toBeDefined();
      expect(typeof result.canStore).toBe('boolean');
    });

    it('should calculate warning levels correctly', () => {
      expect(getWarningLevel(50)).toBe('none');
      expect(getWarningLevel(75)).toBe('low');
      expect(getWarningLevel(85)).toBe('medium');
      expect(getWarningLevel(92)).toBe('high');
      expect(getWarningLevel(97)).toBe('critical');
    });
  });

  describe('Export Integration', () => {
    it('should export cached data accurately', async () => {
      await saveBusinesses([
        { id: 'export-1', user_id: 'user-1', name: 'Export Test', turnover: 100000, entity_type: 'limited' },
      ]);
      await saveExpenses([
        { id: 'exp-export-1', user_id: 'user-1', amount: 5000, category: 'utilities', type: 'expense' },
      ]);

      const summary = await getExportSummary();

      expect(summary.businesses).toBe(1);
      expect(summary.expenses).toBe(1);
      expect(summary.totalRecords).toBe(2);
    });
  });

  describe('Schema Validation and Repair Integration', () => {
    it('should validate and repair data through complete flow', () => {
      const invalidBusiness = {
        id: 'repair-test',
        user_id: 'user-1',
        name: 'Test Business',
        turnover: '500000', // Wrong type - string instead of number
        // Missing entity_type
      };

      // Validate
      const validation = validateSchema(invalidBusiness, 'business');
      expect(validation.warnings.length).toBeGreaterThan(0);

      // Repair
      const repaired = repairData(invalidBusiness, 'business');
      expect(repaired.wasRepaired).toBe(true);
      expect(repaired.data.turnover).toBe(500000);
      expect(repaired.data.entity_type).toBe('sole_proprietorship');
    });
  });

  describe('Error Recovery', () => {
    it('should handle storage errors gracefully', async () => {
      // This tests that the system doesn't crash on edge cases
      await saveBusinesses([]);
      const businesses = await getBusinesses();
      expect(businesses).toHaveLength(0);
    });

    it('should handle concurrent operations', async () => {
      const operations = Array(20).fill(null).map((_, i) =>
        saveBusinesses([{
          id: `concurrent-${i}`,
          user_id: 'user-1',
          name: `Concurrent ${i}`,
          turnover: i * 10000,
          entity_type: 'limited',
        }])
      );

      await Promise.all(operations);
      const businesses = await getBusinesses();

      expect(businesses.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Security Integration', () => {
    it('should safely store and retrieve XSS payloads', async () => {
      const maliciousBusiness = {
        id: 'xss-test',
        user_id: 'user-1',
        name: '<script>alert("XSS")</script>',
        turnover: 100000,
        entity_type: '<img onerror="evil()" src="x">',
      };

      await saveBusinesses([maliciousBusiness]);
      const retrieved = await getBusinesses<typeof maliciousBusiness>();

      // Data should be preserved as strings, not executed
      expect(retrieved[0].name).toBe('<script>alert("XSS")</script>');
      expect(retrieved[0].entity_type).toBe('<img onerror="evil()" src="x">');
    });

    it('should handle SQL injection payloads safely', async () => {
      const maliciousExpense = {
        id: "exp'; DROP TABLE expenses; --",
        user_id: 'user-1',
        amount: 5000,
        category: "test'; DELETE * FROM expenses; --",
        type: 'expense',
      };

      await saveExpenses([maliciousExpense]);
      const retrieved = await getExpenses<typeof maliciousExpense>();

      expect(retrieved[0].category).toBe("test'; DELETE * FROM expenses; --");
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now();
      
      const largeDataset = Array(500).fill(null).map((_, i) => ({
        id: `perf-${i}`,
        user_id: 'user-1',
        name: `Performance Test ${i}`,
        turnover: i * 1000,
        entity_type: 'limited',
      }));

      await saveBusinesses(largeDataset);
      const retrieved = await getBusinesses();

      const duration = Date.now() - startTime;
      
      expect(retrieved).toHaveLength(500);
      // Should complete in reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000);
    });
  });
});
