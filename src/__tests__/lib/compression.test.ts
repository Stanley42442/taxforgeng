/**
 * Comprehensive tests for compression utilities
 * Tests: compression, decompression, edge cases, security
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  compressData,
  decompressData,
  isCompressed,
  getDataSize,
  formatBytes,
  compressBatch,
  estimateCompressionSavings,
} from '@/lib/compression';

describe('Compression Utilities', () => {
  describe('compressData', () => {
    it('should compress string data', () => {
      const data = 'Hello, World!';
      const result = compressData(data);
      
      expect(result.compressed).toBeDefined();
      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.compressedSize).toBeGreaterThan(0);
      expect(typeof result.compressionRatio).toBe('number');
    });

    it('should compress complex objects', () => {
      const data = {
        id: '123',
        user_id: 'user-456',
        name: 'Test Business',
        turnover: 1000000,
        expenses: [
          { category: 'utilities', amount: 5000 },
          { category: 'rent', amount: 20000 },
        ],
        metadata: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      
      const result = compressData(data);
      expect(result.compressed).toBeDefined();
      expect(result.originalSize).toBeGreaterThan(0);
    });

    it('should compress arrays efficiently', () => {
      const data = Array(100).fill(null).map((_, i) => ({
        id: `item-${i}`,
        value: Math.random() * 1000,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      }));
      
      const result = compressData(data);
      expect(result.compressionRatio).toBeGreaterThan(0);
    });

    it('should handle empty objects', () => {
      const result = compressData({});
      expect(result.compressed).toBeDefined();
      expect(result.originalSize).toBeGreaterThan(0);
    });

    it('should handle empty arrays', () => {
      const result = compressData([]);
      expect(result.compressed).toBeDefined();
    });

    it('should handle null values in objects', () => {
      const data = { id: '123', name: null, value: undefined };
      const result = compressData(data);
      expect(result.compressed).toBeDefined();
    });

    it('should handle special characters', () => {
      const data = {
        name: 'Test with émojis 🎉 and spëcial châräctérs',
        arabic: 'مرحبا',
        chinese: '你好',
        symbols: '!@#$%^&*()_+-=[]{}|;:",.<>?',
      };
      
      const result = compressData(data);
      expect(result.compressed).toBeDefined();
    });

    it('should handle large data sets', () => {
      const largeData = Array(1000).fill(null).map((_, i) => ({
        id: `item-${i}`,
        data: 'x'.repeat(100),
      }));
      
      const result = compressData(largeData);
      expect(result.compressionRatio).toBeGreaterThan(30); // At least 30% compression
    });
  });

  describe('decompressData', () => {
    it('should decompress to original data', () => {
      const original = { id: '123', name: 'Test', value: 42 };
      const { compressed } = compressData(original);
      const decompressed = decompressData<typeof original>(compressed);
      
      expect(decompressed).toEqual(original);
    });

    it('should preserve data types after decompression', () => {
      const original = {
        string: 'hello',
        number: 42,
        float: 3.14159,
        boolean: true,
        nullValue: null,
        array: [1, 2, 3],
        nested: { a: 1, b: 2 },
      };
      
      const { compressed } = compressData(original);
      const decompressed = decompressData<typeof original>(compressed);
      
      expect(typeof decompressed.string).toBe('string');
      expect(typeof decompressed.number).toBe('number');
      expect(typeof decompressed.float).toBe('number');
      expect(typeof decompressed.boolean).toBe('boolean');
      expect(decompressed.nullValue).toBeNull();
      expect(Array.isArray(decompressed.array)).toBe(true);
      expect(typeof decompressed.nested).toBe('object');
    });

    it('should handle deeply nested objects', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: { value: 'deep' },
              },
            },
          },
        },
      };
      
      const { compressed } = compressData(original);
      const decompressed = decompressData<typeof original>(compressed);
      
      expect(decompressed.level1.level2.level3.level4.level5.value).toBe('deep');
    });

    it('should throw error for corrupted data', () => {
      expect(() => decompressData('invalid-compressed-data')).toThrow();
    });

    it('should throw error for empty string', () => {
      expect(() => decompressData('')).toThrow();
    });
  });

  describe('isCompressed', () => {
    it('should detect compressed data', () => {
      const { compressed } = compressData({ test: 'data' });
      expect(isCompressed(compressed)).toBe(true);
    });

    it('should return false for plain strings', () => {
      expect(isCompressed('Hello, World!')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isCompressed(42)).toBe(false);
      expect(isCompressed(null)).toBe(false);
      expect(isCompressed(undefined)).toBe(false);
      expect(isCompressed({ key: 'value' })).toBe(false);
      expect(isCompressed([1, 2, 3])).toBe(false);
    });

    it('should return false for JSON strings', () => {
      expect(isCompressed('{"test": "data"}')).toBe(false);
    });
  });

  describe('getDataSize', () => {
    it('should calculate string size', () => {
      const size = getDataSize('Hello');
      expect(size).toBeGreaterThan(0);
    });

    it('should calculate object size', () => {
      const size = getDataSize({ id: '123', name: 'Test' });
      expect(size).toBeGreaterThan(0);
    });

    it('should handle empty values', () => {
      expect(getDataSize('')).toBe(0);
      expect(getDataSize({})).toBeGreaterThan(0); // "{}" has size 2
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should handle decimal places', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1536, 0)).toBe('2 KB');
    });

    it('should handle large values', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });
  });

  describe('compressBatch', () => {
    it('should compress multiple items as batch', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];
      
      const result = compressBatch(items);
      expect(result.compressed).toBeDefined();
    });

    it('should be more efficient than individual compression', () => {
      const items = Array(50).fill(null).map((_, i) => ({
        id: `item-${i}`,
        name: 'Same structure repeated many times',
        value: 100,
      }));
      
      const batchResult = compressBatch(items);
      
      // Individual compression
      let individualTotal = 0;
      items.forEach(item => {
        individualTotal += compressData(item).compressedSize;
      });
      
      // Batch should be more efficient due to pattern repetition
      expect(batchResult.compressedSize).toBeLessThan(individualTotal);
    });
  });

  describe('estimateCompressionSavings', () => {
    it('should estimate savings correctly', () => {
      const data = Array(100).fill({ message: 'Repeated content for compression' });
      const estimate = estimateCompressionSavings(data);
      
      expect(estimate.originalSize).toBeGreaterThan(0);
      expect(estimate.estimatedCompressedSize).toBeGreaterThan(0);
      expect(estimate.estimatedSavings).toBeGreaterThan(0);
      expect(estimate.savingsPercent).toBeGreaterThan(0);
    });
  });

  describe('Security Tests', () => {
    it('should handle potential XSS payloads safely', () => {
      const maliciousData = {
        script: '<script>alert("XSS")</script>',
        onclick: 'onclick="evil()"',
        href: 'javascript:void(0)',
      };
      
      const { compressed } = compressData(maliciousData);
      const decompressed = decompressData<typeof maliciousData>(compressed);
      
      // Data should be preserved as-is (no execution)
      expect(decompressed.script).toBe('<script>alert("XSS")</script>');
    });

    it('should handle SQL injection payloads', () => {
      const maliciousData = {
        query: "'; DROP TABLE users; --",
        name: "Robert'); DROP TABLE students;--",
      };
      
      const { compressed } = compressData(maliciousData);
      const decompressed = decompressData<typeof maliciousData>(compressed);
      
      expect(decompressed.query).toBe("'; DROP TABLE users; --");
    });

    it('should handle prototype pollution attempts', () => {
      const maliciousData = {
        '__proto__': { polluted: true },
        'constructor': { prototype: { polluted: true } },
      };
      
      const { compressed } = compressData(maliciousData);
      const decompressed = decompressData<typeof maliciousData>(compressed);
      
      // Verify no prototype pollution occurred
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });

    it('should handle extremely long strings (DoS prevention)', () => {
      const longString = 'x'.repeat(10 * 1024 * 1024); // 10MB string
      
      // Should not crash
      const result = compressData({ data: longString });
      expect(result.compressed).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular reference attempts', () => {
      // JSON.stringify will throw for circular references
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;
      
      expect(() => compressData(circular)).toThrow();
    });

    it('should handle Date objects', () => {
      const data = { date: new Date('2024-01-01') };
      const { compressed } = compressData(data);
      const decompressed = decompressData<{ date: string }>(compressed);
      
      // Dates are serialized to ISO strings
      expect(typeof decompressed.date).toBe('string');
    });

    it('should handle RegExp objects', () => {
      const data = { regex: /test/gi };
      const { compressed } = compressData(data);
      const decompressed = decompressData<{ regex: Record<string, unknown> }>(compressed);
      
      // RegExp becomes empty object in JSON
      expect(decompressed.regex).toEqual({});
    });

    it('should handle functions (they get stripped)', () => {
      const data = {
        name: 'test',
        fn: () => 'hello',
      };
      
      const { compressed } = compressData(data);
      const decompressed = decompressData<{ name: string; fn?: unknown }>(compressed);
      
      expect(decompressed.name).toBe('test');
      expect(decompressed.fn).toBeUndefined();
    });

    it('should handle Infinity and NaN', () => {
      const data = { infinity: Infinity, nan: NaN };
      const { compressed } = compressData(data);
      const decompressed = decompressData<{ infinity: unknown; nan: unknown }>(compressed);
      
      // These become null in JSON
      expect(decompressed.infinity).toBeNull();
      expect(decompressed.nan).toBeNull();
    });
  });
});
