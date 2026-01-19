/**
 * Security-focused tests for the PWA system
 * Tests: XSS, injection, data tampering, DoS prevention
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressData, decompressData } from '@/lib/compression';
import { generateChecksum, verifyChecksum, validateSchema } from '@/lib/dataIntegrity';
import {
  saveBusinesses,
  getBusinesses,
  saveExpenses,
  getExpenses,
  clearAllCache,
} from '@/lib/offlineStorage';

describe('PWA Security Tests', () => {
  beforeEach(async () => {
    await clearAllCache().catch(() => {});
  });

  describe('XSS Prevention', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(1)">',
      '<svg onload="alert(1)">',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)">',
      '<body onload="alert(1)">',
      '<input onfocus="alert(1)" autofocus>',
      '<marquee onstart="alert(1)">',
      '<video><source onerror="alert(1)">',
      '<details open ontoggle="alert(1)">',
    ];

    xssPayloads.forEach((payload, index) => {
      it(`should safely store XSS payload #${index + 1}`, async () => {
        const business = {
          id: `xss-${index}`,
          user_id: 'user-1',
          name: payload,
          turnover: 100000,
          entity_type: 'limited',
        };

        await saveBusinesses([business]);
        const retrieved = await getBusinesses<typeof business>();

        // Data should be stored as-is without execution
        expect(retrieved[0].name).toBe(payload);
      });
    });

    it('should handle XSS in all fields', async () => {
      const xssBusiness = {
        id: '<script>evil()</script>',
        user_id: '<img onerror="hack()">',
        name: 'javascript:void(0)',
        turnover: 100000,
        entity_type: '<svg onload="attack()">',
        sector: '<iframe src="evil.com">',
      };

      await saveBusinesses([xssBusiness]);
      const retrieved = await getBusinesses<typeof xssBusiness>();

      expect(retrieved[0].id).toBe('<script>evil()</script>');
    });
  });

  describe('SQL Injection Prevention', () => {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "1 OR 1=1",
      "1; DELETE FROM expenses WHERE 1=1",
      "admin'--",
      "1 UNION SELECT * FROM users",
      "'; TRUNCATE TABLE businesses; --",
      "1' AND '1'='1",
      "Robert'); DROP TABLE Students;--",
    ];

    sqlPayloads.forEach((payload, index) => {
      it(`should safely store SQL injection payload #${index + 1}`, async () => {
        const expense = {
          id: `sql-${index}`,
          user_id: 'user-1',
          amount: 5000,
          category: payload,
          type: 'expense',
        };

        // IndexedDB is NoSQL, so these are just stored as strings
        await saveExpenses([expense]);
        const retrieved = await getExpenses<typeof expense>();

        expect(retrieved[0].category).toBe(payload);
      });
    });
  });

  describe('NoSQL Injection Prevention', () => {
    const nosqlPayloads = [
      { $gt: '' },
      { $ne: null },
      { $where: 'function() { return true; }' },
      { $regex: '.*' },
    ];

    nosqlPayloads.forEach((payload, index) => {
      it(`should safely handle NoSQL injection payload #${index + 1}`, async () => {
        const business = {
          id: `nosql-${index}`,
          user_id: 'user-1',
          name: JSON.stringify(payload),
          turnover: 100000,
          entity_type: 'limited',
        };

        await saveBusinesses([business]);
        const retrieved = await getBusinesses<typeof business>();

        // Should store as string, not execute
        expect(typeof retrieved[0].name).toBe('string');
      });
    });
  });

  describe('Prototype Pollution Prevention', () => {
    it('should not allow prototype pollution via __proto__', async () => {
      const maliciousBusiness = {
        id: 'proto-1',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
        '__proto__': { polluted: true },
      };

      await saveBusinesses([maliciousBusiness]);
      
      // Check that Object prototype is not polluted
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });

    it('should not allow prototype pollution via constructor', async () => {
      const maliciousBusiness = {
        id: 'proto-2',
        user_id: 'user-1',
        name: 'Test',
        turnover: 100000,
        entity_type: 'limited',
        constructor: { prototype: { polluted: true } },
      };

      await saveBusinesses([maliciousBusiness]);
      
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  describe('Path Traversal Prevention', () => {
    const pathPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '/etc/passwd%00.jpg',
    ];

    pathPayloads.forEach((payload, index) => {
      it(`should safely store path traversal payload #${index + 1}`, async () => {
        const business = {
          id: `path-${index}`,
          user_id: 'user-1',
          name: payload,
          turnover: 100000,
          entity_type: 'limited',
        };

        await saveBusinesses([business]);
        const retrieved = await getBusinesses<typeof business>();

        // Should store as-is
        expect(retrieved[0].name).toBe(payload);
      });
    });
  });

  describe('Command Injection Prevention', () => {
    const commandPayloads = [
      '; rm -rf /',
      '| cat /etc/passwd',
      '`rm -rf /`',
      '$(whoami)',
      '& ping -c 10 attacker.com',
    ];

    commandPayloads.forEach((payload, index) => {
      it(`should safely store command injection payload #${index + 1}`, async () => {
        const expense = {
          id: `cmd-${index}`,
          user_id: 'user-1',
          amount: 5000,
          category: payload,
          type: 'expense',
        };

        await saveExpenses([expense]);
        const retrieved = await getExpenses<typeof expense>();

        expect(retrieved[0].category).toBe(payload);
      });
    });
  });

  describe('Data Tampering Detection', () => {
    it('should detect modified data via checksum', async () => {
      const original = { id: '1', amount: 1000 };
      const checksum = await generateChecksum(original);
      
      const tampered = { id: '1', amount: 999999 };
      const isValid = await verifyChecksum(tampered, checksum);

      expect(isValid).toBe(false);
    });

    it('should detect subtle modifications', async () => {
      const original = { name: 'John Doe' };
      const checksum = await generateChecksum(original);
      
      const tampered = { name: 'John  Doe' }; // Extra space
      const isValid = await verifyChecksum(tampered, checksum);

      expect(isValid).toBe(false);
    });

    it('should detect type changes', async () => {
      const original = { value: 100 };
      const checksum = await generateChecksum(original);
      
      const tampered = { value: '100' }; // String instead of number
      const isValid = await verifyChecksum(tampered, checksum);

      expect(isValid).toBe(false);
    });
  });

  describe('DoS Prevention', () => {
    it('should handle extremely long strings', async () => {
      const longString = 'x'.repeat(10 * 1024 * 1024); // 10MB
      
      const { compressed } = compressData({ data: longString });
      expect(compressed).toBeDefined();
    });

    it('should handle deeply nested objects', async () => {
      let nested: Record<string, unknown> = { value: 'deep' };
      for (let i = 0; i < 100; i++) {
        nested = { level: nested };
      }

      const { compressed } = compressData(nested);
      const decompressed = decompressData<typeof nested>(compressed);
      
      expect(decompressed).toBeDefined();
    });

    it('should handle arrays with many elements', async () => {
      const largeArray = Array(10000).fill({ id: '1', value: 'test' });
      
      const { compressed } = compressData(largeArray);
      expect(compressed).toBeDefined();
    });
  });

  describe('Malicious Checksum Handling', () => {
    it('should reject malicious checksum values', async () => {
      const data = { test: 'data' };
      
      const maliciousChecksums = [
        'null',
        'undefined',
        'NaN',
        '__proto__',
        'constructor',
        '${7*7}',
        '{{constructor.constructor("return this")()}}',
      ];

      for (const malicious of maliciousChecksums) {
        const isValid = await verifyChecksum(data, malicious);
        expect(isValid).toBe(false);
      }
    });
  });

  describe('CSV Formula Injection Prevention', () => {
    const formulaPayloads = [
      '=SUM(A1:A100)',
      '+cmd|"/C calc"!A0',
      '-cmd|"/C calc"!A0',
      '@SUM(A1:A100)',
      '=HYPERLINK("http://evil.com")',
      '=IMPORTDATA("http://evil.com/data")',
    ];

    formulaPayloads.forEach((payload, index) => {
      it(`should safely store CSV formula payload #${index + 1}`, async () => {
        const expense = {
          id: `csv-${index}`,
          user_id: 'user-1',
          amount: 5000,
          category: payload,
          type: 'expense',
        };

        await saveExpenses([expense]);
        const retrieved = await getExpenses<typeof expense>();

        // Should store as-is (export should escape)
        expect(retrieved[0].category).toBe(payload);
      });
    });
  });

  describe('Unicode Security', () => {
    it('should handle RTL override characters safely', async () => {
      const rtlBusiness = {
        id: 'rtl-1',
        user_id: 'user-1',
        name: 'test\u202Etset', // RTL override
        turnover: 100000,
        entity_type: 'limited',
      };

      await saveBusinesses([rtlBusiness]);
      const retrieved = await getBusinesses<typeof rtlBusiness>();

      expect(retrieved[0].name).toBe('test\u202Etset');
    });

    it('should handle zero-width characters safely', async () => {
      const zwBusiness = {
        id: 'zw-1',
        user_id: 'user-1',
        name: 'test\u200B\u200Ctest', // Zero-width space and non-joiner
        turnover: 100000,
        entity_type: 'limited',
      };

      await saveBusinesses([zwBusiness]);
      const retrieved = await getBusinesses<typeof zwBusiness>();

      expect(retrieved[0].name).toBe('test\u200B\u200Ctest');
    });

    it('should handle homograph attacks', async () => {
      const homographBusiness = {
        id: 'homo-1',
        user_id: 'user-1',
        name: 'аpple', // Cyrillic 'а' instead of Latin 'a'
        turnover: 100000,
        entity_type: 'limited',
      };

      await saveBusinesses([homographBusiness]);
      const retrieved = await getBusinesses<typeof homographBusiness>();

      expect(retrieved[0].name).toBe('аpple');
    });
  });
});
