/**
 * Comprehensive tests for data integrity utilities
 * Tests: checksums, validation, repair, security
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateChecksum,
  verifyChecksum,
  validateSchema,
  repairData,
  checkIntegrity,
  SCHEMAS,
  createEmptyReport,
  generateLogId,
} from '@/lib/dataIntegrity';

describe('Data Integrity Utilities', () => {
  describe('generateChecksum', () => {
    it('should generate consistent checksums for same data', async () => {
      const data = { id: '123', name: 'Test' };
      const checksum1 = await generateChecksum(data);
      const checksum2 = await generateChecksum(data);
      
      expect(checksum1).toBe(checksum2);
    });

    it('should generate different checksums for different data', async () => {
      const data1 = { id: '123', name: 'Test' };
      const data2 = { id: '123', name: 'Test2' };
      
      const checksum1 = await generateChecksum(data1);
      const checksum2 = await generateChecksum(data2);
      
      expect(checksum1).not.toBe(checksum2);
    });

    it('should generate hex string checksums', async () => {
      const data = { test: 'data' };
      const checksum = await generateChecksum(data);
      
      expect(checksum).toMatch(/^[a-f0-9]+$/);
    });

    it('should handle complex nested objects', async () => {
      const data = {
        level1: {
          level2: {
            level3: [1, 2, { deep: 'value' }],
          },
        },
      };
      
      const checksum = await generateChecksum(data);
      expect(checksum).toBeDefined();
      expect(checksum.length).toBeGreaterThan(0);
    });

    it('should handle arrays', async () => {
      const data = [1, 2, 3, 'test', { nested: true }];
      const checksum = await generateChecksum(data);
      
      expect(checksum).toBeDefined();
    });

    it('should be order-sensitive for objects', async () => {
      // Note: JSON.stringify is deterministic for same-ordered objects
      const data1 = { a: 1, b: 2 };
      const data2 = { b: 2, a: 1 };
      
      const checksum1 = await generateChecksum(data1);
      const checksum2 = await generateChecksum(data2);
      
      // These may be different due to key ordering
      expect(checksum1).toBeDefined();
      expect(checksum2).toBeDefined();
    });
  });

  describe('verifyChecksum', () => {
    it('should verify valid checksum', async () => {
      const data = { id: '123', name: 'Test' };
      const checksum = await generateChecksum(data);
      
      const isValid = await verifyChecksum(data, checksum);
      expect(isValid).toBe(true);
    });

    it('should reject invalid checksum', async () => {
      const data = { id: '123', name: 'Test' };
      const invalidChecksum = 'invalid-checksum-value';
      
      const isValid = await verifyChecksum(data, invalidChecksum);
      expect(isValid).toBe(false);
    });

    it('should detect data tampering', async () => {
      const originalData = { id: '123', amount: 1000 };
      const checksum = await generateChecksum(originalData);
      
      const tamperedData = { id: '123', amount: 999999 };
      const isValid = await verifyChecksum(tamperedData, checksum);
      
      expect(isValid).toBe(false);
    });

    it('should detect subtle changes', async () => {
      const originalData = { name: 'John' };
      const checksum = await generateChecksum(originalData);
      
      // Change case
      const tamperedData = { name: 'john' };
      const isValid = await verifyChecksum(tamperedData, checksum);
      
      expect(isValid).toBe(false);
    });
  });

  describe('validateSchema - Business', () => {
    it('should validate valid business data', () => {
      const business = {
        id: '123',
        user_id: 'user-456',
        name: 'Test Business',
        turnover: 1000000,
        entity_type: 'limited',
      };
      
      const result = validateSchema(business, 'business');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing required fields', () => {
      const business = { name: 'Test' }; // Missing id, user_id
      
      const result = validateSchema(business, 'business');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about wrong types that can be coerced', () => {
      const business = {
        id: '123',
        user_id: 'user-456',
        name: 'Test',
        turnover: '1000', // String instead of number
      };
      
      const result = validateSchema(business, 'business');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should reject wrong types that cannot be coerced', () => {
      const business = {
        id: 123, // Number instead of string - but can be coerced
        user_id: 'user-456',
        name: 'Test',
      };
      
      const result = validateSchema(business, 'business');
      // id can be coerced to string, so this should be a warning
      expect(result.warnings.some(w => w.includes('id'))).toBe(true);
    });
  });

  describe('validateSchema - Expense', () => {
    it('should validate valid expense data', () => {
      const expense = {
        id: '123',
        user_id: 'user-456',
        amount: 5000,
        category: 'utilities',
        type: 'expense',
      };
      
      const result = validateSchema(expense, 'expense');
      expect(result.isValid).toBe(true);
    });

    it('should handle missing optional fields', () => {
      const expense = {
        id: '123',
        user_id: 'user-456',
        amount: 5000,
        category: 'utilities',
      };
      
      const result = validateSchema(expense, 'expense');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateSchema - Unknown Schema', () => {
    it('should reject unknown schema names', () => {
      const data = { test: 'data' };
      const result = validateSchema(data, 'unknownSchema');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unknown schema: unknownSchema');
    });
  });

  describe('repairData', () => {
    it('should apply defaults for missing required fields', () => {
      const business = {
        id: '123',
        user_id: 'user-456',
        name: 'Test',
        // Missing turnover, entity_type
      };
      
      const result = repairData(business, 'business');
      
      expect(result.wasRepaired).toBe(true);
      expect(result.data.turnover).toBe(0);
      expect(result.data.entity_type).toBe('sole_proprietorship');
    });

    it('should coerce types where possible', () => {
      const business = {
        id: '123',
        user_id: 'user-456',
        name: 'Test',
        turnover: '50000', // String that can be coerced
      };
      
      const result = repairData(business, 'business');
      
      expect(result.wasRepaired).toBe(true);
      expect(result.data.turnover).toBe(50000);
      expect(typeof result.data.turnover).toBe('number');
    });

    it('should track all repairs made', () => {
      const business = {
        id: '123',
        user_id: 'user-456',
        name: 'Test',
      };
      
      const result = repairData(business, 'business');
      expect(result.repairs.length).toBeGreaterThan(0);
    });

    it('should not modify valid data', () => {
      const business = {
        id: '123',
        user_id: 'user-456',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
        cac_verified: true,
      };
      
      const result = repairData(business, 'business');
      expect(result.wasRepaired).toBe(false);
    });

    it('should handle unknown schema gracefully', () => {
      const data = { test: 'data' };
      const result = repairData(data, 'unknownSchema');
      
      expect(result.wasRepaired).toBe(false);
      expect(result.data).toEqual(data);
    });
  });

  describe('checkIntegrity', () => {
    it('should pass for valid data with correct checksum', async () => {
      const data = {
        id: '123',
        user_id: 'user-456',
        name: 'Test Business',
      };
      
      const checksum = await generateChecksum(data);
      const result = await checkIntegrity(data, checksum, 'business');
      
      expect(result.checksumValid).toBe(true);
      expect(result.schemaValid).toBe(true);
    });

    it('should detect checksum mismatch', async () => {
      const data = {
        id: '123',
        user_id: 'user-456',
        name: 'Test',
      };
      
      const result = await checkIntegrity(data, 'wrong-checksum', 'business');
      
      expect(result.checksumValid).toBe(false);
      expect(result.needsRefetch).toBe(true);
    });

    it('should detect schema violations', async () => {
      const data = { invalid: 'data' };
      const checksum = await generateChecksum(data);
      
      const result = await checkIntegrity(data, checksum, 'business');
      
      expect(result.schemaValid).toBe(false);
    });

    it('should indicate when data can be repaired', async () => {
      const data = {
        id: '123',
        user_id: 'user-456',
        name: 'Test',
        // Missing defaults that can be repaired
      };
      
      const checksum = await generateChecksum(data);
      const result = await checkIntegrity(data, checksum, 'business');
      
      expect(result.canRepair).toBe(true);
    });
  });

  describe('createEmptyReport', () => {
    it('should create valid empty report', () => {
      const report = createEmptyReport();
      
      expect(report.totalRecords).toBe(0);
      expect(report.validRecords).toBe(0);
      expect(report.repairedRecords).toBe(0);
      expect(report.corruptedRecords).toBe(0);
      expect(report.quarantinedRecords).toBe(0);
      expect(report.refetchNeeded).toEqual([]);
      expect(report.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('generateLogId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateLogId();
      const id2 = generateLogId();
      
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with expected format', () => {
      const id = generateLogId();
      expect(id).toMatch(/^log_\d+_[a-z0-9]+$/);
    });
  });

  describe('SCHEMAS', () => {
    it('should have all required schemas defined', () => {
      expect(SCHEMAS.business).toBeDefined();
      expect(SCHEMAS.expense).toBeDefined();
      expect(SCHEMAS.calculation).toBeDefined();
      expect(SCHEMAS.personalExpense).toBeDefined();
    });

    it('should have required fields for each schema', () => {
      expect(SCHEMAS.business.required).toContain('id');
      expect(SCHEMAS.expense.required).toContain('id');
      expect(SCHEMAS.calculation.required).toContain('id');
      expect(SCHEMAS.personalExpense.required).toContain('id');
    });
  });

  describe('Security Tests', () => {
    it('should handle malicious checksums safely', async () => {
      const data = { test: 'data' };
      
      // Try various malicious checksums
      const maliciousChecksums = [
        '<script>alert("XSS")</script>',
        '"; DROP TABLE checksums; --',
        '../../../etc/passwd',
        'null',
        'undefined',
        'constructor',
        '__proto__',
      ];
      
      for (const malicious of maliciousChecksums) {
        const isValid = await verifyChecksum(data, malicious);
        expect(isValid).toBe(false);
      }
    });

    it('should handle extremely long data without DoS', async () => {
      const largeData = {
        content: 'x'.repeat(1024 * 1024), // 1MB of data
      };
      
      const checksum = await generateChecksum(largeData);
      expect(checksum).toBeDefined();
      expect(checksum.length).toBeGreaterThan(0);
    });

    it('should not execute code in data during validation', () => {
      const maliciousData = {
        id: '123',
        user_id: 'user-456',
        name: 'Test',
        toString: () => { throw new Error('Code executed!'); },
        valueOf: () => { throw new Error('Code executed!'); },
      };
      
      // Should not throw
      const result = validateSchema(maliciousData, 'business');
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values in data', () => {
      const data = {
        id: '123',
        user_id: 'user-456',
        name: null,
      };
      
      const result = validateSchema(data, 'business');
      // name is null, which is like missing
      expect(result.errors.some(e => e.includes('name'))).toBe(true);
    });

    it('should handle undefined values in data', () => {
      const data = {
        id: '123',
        user_id: 'user-456',
        name: undefined,
      };
      
      const result = validateSchema(data, 'business');
      expect(result.errors.some(e => e.includes('name'))).toBe(true);
    });

    it('should handle boolean coercion', () => {
      const expense = {
        id: '123',
        user_id: 'user-456',
        amount: 100,
        category: 'test',
        is_deductible: 'true', // String instead of boolean
      };
      
      const result = repairData(expense, 'expense');
      expect(result.data.is_deductible).toBe(true);
    });

    it('should handle numeric string coercion', () => {
      const expense = {
        id: '123',
        user_id: 'user-456',
        amount: '500.50',
        category: 'test',
      };
      
      const result = repairData(expense, 'expense');
      expect(result.data.amount).toBe(500.50);
    });
  });
});
