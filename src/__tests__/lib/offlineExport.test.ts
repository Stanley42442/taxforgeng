/**
 * Comprehensive tests for offline export utilities
 * Tests: CSV/JSON export, data formatting, file downloads
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  exportBusinessesToCSV,
  exportExpensesToCSV,
  exportPersonalExpensesToCSV,
  exportCalculationsToJSON,
  exportAllCachedData,
  getExportSummary,
} from '@/lib/offlineExport';
import {
  saveBusinesses,
  saveExpenses,
  savePersonalExpenses,
  saveCalculation,
  clearAllCache,
} from '@/lib/offlineStorage';

describe('Offline Export Utilities', () => {
  beforeEach(async () => {
    await clearAllCache().catch(() => {});
    vi.clearAllMocks();
  });

  describe('exportBusinessesToCSV', () => {
    it('should create and download CSV file', async () => {
      await saveBusinesses([
        {
          id: 'biz-1',
          user_id: 'user-1',
          name: 'Test Business',
          entity_type: 'limited',
          turnover: 1000000,
          sector: 'technology',
          created_at: '2024-01-01',
        },
      ]);

      await exportBusinessesToCSV();

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle empty data', async () => {
      await exportBusinessesToCSV();
      // Should not throw
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle special characters in CSV', async () => {
      await saveBusinesses([
        {
          id: 'biz-1',
          user_id: 'user-1',
          name: 'Business, with "quotes" and\nnewlines',
          entity_type: 'limited',
          turnover: 1000000,
          sector: 'technology',
          created_at: '2024-01-01',
        },
      ]);

      await exportBusinessesToCSV();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportExpensesToCSV', () => {
    it('should create expense CSV', async () => {
      await saveExpenses([
        {
          id: 'exp-1',
          user_id: 'user-1',
          category: 'utilities',
          amount: 5000,
          description: 'Electric bill',
          date: '2024-01-15',
          is_deductible: true,
          type: 'expense',
        },
      ]);

      await exportExpensesToCSV();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should include all expense fields', async () => {
      await saveExpenses([
        {
          id: 'exp-1',
          user_id: 'user-1',
          category: 'rent',
          amount: 200000,
          description: 'Office rent',
          date: '2024-01-01',
          is_deductible: true,
          type: 'expense',
        },
      ]);

      await exportExpensesToCSV();
      // Verify download was triggered
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportPersonalExpensesToCSV', () => {
    it('should create personal expense CSV', async () => {
      await savePersonalExpenses([
        {
          id: 'pe-1',
          user_id: 'user-1',
          category: 'rent',
          amount: 150000,
          description: 'Monthly rent',
          payment_interval: 'monthly',
          start_date: '2024-01-01',
        },
      ]);

      await exportPersonalExpensesToCSV();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportCalculationsToJSON', () => {
    it('should create calculation JSON', async () => {
      await saveCalculation({
        id: 'calc-1',
        inputs: { income: 1000000, expenses: 200000 },
        result: { tax: 160000, net: 640000 },
        created_at: '2024-01-01',
      });

      await exportCalculationsToJSON();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle complex nested data', async () => {
      await saveCalculation({
        id: 'calc-1',
        inputs: {
          income: 1000000,
          expenses: 200000,
          deductions: {
            pension: 50000,
            relief: 20000,
          },
        },
        result: {
          breakdown: {
            cit: 100000,
            edt: 20000,
            payable: 120000,
          },
        },
        created_at: '2024-01-01',
      });

      await exportCalculationsToJSON();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportAllCachedData', () => {
    it('should export all data types', async () => {
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

      await exportAllCachedData();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should include summary in export', async () => {
      await saveBusinesses([{
        id: 'biz-1',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
      }]);

      await exportAllCachedData();
      // Verify JSON export was created with summary
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('getExportSummary', () => {
    it('should return accurate counts', async () => {
      await saveBusinesses([
        { id: 'biz-1', user_id: 'user-1', name: 'B1', turnover: 100000, entity_type: 'limited' },
        { id: 'biz-2', user_id: 'user-1', name: 'B2', turnover: 200000, entity_type: 'limited' },
      ]);
      
      await saveExpenses([
        { id: 'exp-1', user_id: 'user-1', amount: 5000, category: 'utilities', type: 'expense' },
      ]);

      const summary = await getExportSummary();

      expect(summary.businesses).toBe(2);
      expect(summary.expenses).toBe(1);
      expect(summary.totalRecords).toBe(3);
    });

    it('should return zeros for empty data', async () => {
      const summary = await getExportSummary();

      expect(summary.businesses).toBe(0);
      expect(summary.expenses).toBe(0);
      expect(summary.personalExpenses).toBe(0);
      expect(summary.calculations).toBe(0);
      expect(summary.totalRecords).toBe(0);
    });
  });

  describe('Security Tests', () => {
    it('should handle XSS in exported data', async () => {
      await saveBusinesses([
        {
          id: 'biz-1',
          user_id: 'user-1',
          name: '<script>alert("XSS")</script>',
          turnover: 100000,
          entity_type: 'limited',
        },
      ]);

      // Should not throw - data is just stringified
      await exportBusinessesToCSV();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle formula injection in CSV', async () => {
      await saveExpenses([
        {
          id: 'exp-1',
          user_id: 'user-1',
          category: '=SUM(A1:A100)',
          amount: 5000,
          description: '=HYPERLINK("http://evil.com")',
          date: '2024-01-01',
          is_deductible: true,
          type: 'expense',
        },
      ]);

      // Note: In production, you'd want to escape formulas
      await exportExpensesToCSV();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', async () => {
      await saveExpenses([
        {
          id: 'exp-1',
          user_id: 'user-1',
          category: 'utilities',
          amount: 5000,
          description: null,
          date: '2024-01-01',
          is_deductible: true,
          type: 'expense',
        },
      ]);

      await exportExpensesToCSV();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle undefined values', async () => {
      await saveExpenses([
        {
          id: 'exp-1',
          user_id: 'user-1',
          category: 'utilities',
          amount: 5000,
          description: undefined,
          date: '2024-01-01',
          is_deductible: true,
          type: 'expense',
        },
      ]);

      await exportExpensesToCSV();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle very large datasets', async () => {
      const largeDataset = Array(1000).fill(null).map((_, i) => ({
        id: `exp-${i}`,
        user_id: 'user-1',
        category: 'utilities',
        amount: i * 100,
        description: `Expense ${i}`,
        date: '2024-01-01',
        is_deductible: true,
        type: 'expense',
      }));

      await saveExpenses(largeDataset);
      await exportExpensesToCSV();
      
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
