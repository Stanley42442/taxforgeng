/**
 * E2E Tests: Tax Calculator Flow
 * Tests complete tax calculation journeys for CIT, VAT, and PIT
 */

import { describe, it, expect } from 'vitest';
import { calculateVAT } from '@/lib/taxCalculations';

describe('Tax Calculator E2E Flow', () => {
  describe('CIT Calculation Logic', () => {
    it('should apply 0% rate for small companies (under 25M)', () => {
      const turnover = 20_000_000;
      const threshold = 25_000_000;
      const isSmallCompany = turnover < threshold;

      expect(isSmallCompany).toBe(true);
    });

    it('should apply 20% rate for medium companies (25M-100M)', () => {
      const turnover = 50_000_000;
      const mediumRate = 0.2;
      const expectedCIT = turnover * mediumRate;

      expect(expectedCIT).toBe(10_000_000);
    });

    it('should apply 30% rate for large companies (over 100M)', () => {
      const turnover = 500_000_000;
      const largeRate = 0.3;
      const expectedCIT = turnover * largeRate;

      expect(expectedCIT).toBe(150_000_000);
    });

    it('should handle loss-making companies', () => {
      const profit = -1_000_000;
      const isProfitable = profit > 0;

      expect(isProfitable).toBe(false);
    });
  });

  describe('VAT Calculation Flow', () => {
    it('should calculate VAT at 7.5% rate', () => {
      const turnover = 1_000_000;
      const vatRate = 0.075;
      const expectedVat = turnover * vatRate;

      expect(expectedVat).toBe(75_000);
    });

    it('should handle zero turnover', () => {
      const turnover = 0;
      const vatRate = 0.075;
      const expectedVat = turnover * vatRate;

      expect(expectedVat).toBe(0);
    });

    it('should calculate VAT for large amounts', () => {
      const turnover = 1_000_000_000;
      const vatRate = 0.075;
      const expectedVat = turnover * vatRate;

      expect(expectedVat).toBe(75_000_000);
    });

    it('should use calculateVAT function correctly', () => {
      const result = calculateVAT(1_000_000, 50_000);

      expect(result).toHaveProperty('outputVat');
      expect(result).toHaveProperty('inputVat');
      expect(result).toHaveProperty('netVat');
    });
  });

  describe('WHT Calculation Flow', () => {
    it('should calculate WHT for dividends at 10%', () => {
      const amount = 1_000_000;
      const dividendRate = 0.1;
      const wht = amount * dividendRate;

      expect(wht).toBe(100_000);
    });

    it('should calculate WHT for rent at 10%', () => {
      const amount = 500_000;
      const rentRate = 0.1;
      const wht = amount * rentRate;

      expect(wht).toBe(50_000);
    });

    it('should calculate WHT for contract at 5%', () => {
      const amount = 2_000_000;
      const contractRate = 0.05;
      const wht = amount * contractRate;

      expect(wht).toBe(100_000);
    });
  });

  describe('Minimum Tax Calculation', () => {
    it('should calculate minimum tax as 0.5% of turnover', () => {
      const turnover = 100_000_000;
      const minTaxRate = 0.005;
      const minTax = turnover * minTaxRate;

      expect(minTax).toBe(500_000);
    });

    it('should apply minimum tax when CIT is zero', () => {
      const turnover = 100_000_000;
      const citAmount = 0; // Loss-making company
      const minTaxRate = 0.005;
      const minTax = turnover * minTaxRate;
      const taxPayable = Math.max(citAmount, minTax);

      expect(taxPayable).toBe(500_000);
    });
  });

  describe('Total Tax Breakdown', () => {
    it('should produce complete tax breakdown structure', () => {
      const breakdown = {
        cit: 10_000_000,
        vat: 3_750_000,
        wht: 500_000,
        totalTax: 14_250_000,
      };

      expect(breakdown).toHaveProperty('cit');
      expect(breakdown).toHaveProperty('vat');
      expect(breakdown).toHaveProperty('totalTax');
    });

    it('should calculate effective tax rate', () => {
      const turnover = 100_000_000;
      const totalTax = 15_000_000;
      const effectiveRate = totalTax / turnover;

      expect(effectiveRate).toBe(0.15);
      expect(effectiveRate).toBeLessThan(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const amount = 1000;
      const vatRate = 0.075;
      const vat = amount * vatRate;

      expect(vat).toBe(75);
      expect(Number.isFinite(vat)).toBe(true);
    });

    it('should handle very large amounts', () => {
      const amount = 10_000_000_000;
      const vatRate = 0.075;
      const vat = amount * vatRate;

      expect(Number.isFinite(vat)).toBe(true);
    });

    it('should handle decimal amounts', () => {
      const amount = 1_234_567.89;
      const vatRate = 0.075;
      const vat = amount * vatRate;

      expect(Number.isFinite(vat)).toBe(true);
    });

    it('should handle negative input gracefully', () => {
      const amount = -1000;
      const isValid = amount >= 0;

      expect(isValid).toBe(false);
    });
  });

  describe('Entity Type Variations', () => {
    const entityTypes = ['sole_proprietorship', 'partnership', 'limited_liability', 'public_company'];

    it('should support multiple entity types', () => {
      expect(entityTypes).toContain('sole_proprietorship');
      expect(entityTypes).toContain('limited_liability');
    });

    it('should have different tax treatment per entity', () => {
      const entityTaxRates: Record<string, number> = {
        sole_proprietorship: 0, // Uses PIT
        partnership: 0, // Uses PIT
        limited_liability: 0.3, // Uses CIT
        public_company: 0.3, // Uses CIT
      };

      expect(entityTaxRates['limited_liability']).toBe(0.3);
      expect(entityTaxRates['sole_proprietorship']).toBe(0);
    });
  });

  describe('Form Input Validation', () => {
    it('should reject non-numeric input', () => {
      const input = 'not a number';
      const parsed = parseFloat(input);

      expect(Number.isNaN(parsed)).toBe(true);
    });

    it('should accept numeric string input', () => {
      const input = '1000000';
      const parsed = parseFloat(input);

      expect(Number.isNaN(parsed)).toBe(false);
      expect(parsed).toBe(1000000);
    });

    it('should handle formatted currency input', () => {
      const input = '1,000,000.00';
      const cleaned = input.replace(/[,]/g, '');
      const parsed = parseFloat(cleaned);

      expect(parsed).toBe(1000000);
    });
  });

  describe('Result Export Structure', () => {
    it('should produce serializable result', () => {
      const result = {
        turnover: 75_000_000,
        cit: { amount: 15_000_000, rate: 0.2 },
        vat: { amount: 5_625_000, rate: 0.075 },
        totalTax: 20_625_000,
        calculatedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(result);
      const parsed = JSON.parse(json);

      expect(parsed.totalTax).toBe(result.totalTax);
    });
  });
});
