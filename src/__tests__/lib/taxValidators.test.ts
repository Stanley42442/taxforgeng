/**
 * Tax Validators Test Suite
 * Comprehensive tests for Nigeria Tax Act 2025 compliance verification
 * 
 * Tests cover:
 * - Edge cases (zero income, negative inputs, boundary thresholds)
 * - PIT band calculations
 * - Small company exemptions
 * - Rent Relief caps
 * - Development Levy
 * - VAT, Pension, NHF rates
 */

import { describe, it, expect } from 'vitest';
import {
  validateZeroIncome,
  validateInputPositivity,
  validateSmallCompanyExemption,
  validateRentReliefCap,
  validateRentToIncomeRatio,
  validateCRAAbholished,
  validateDevelopmentLevy,
  validatePITBands,
  validateVATRate,
  validatePensionRate,
  validateNHFRate,
  validateZeroProfitLargeCompany,
  calculateRulesAge,
  VERIFICATION_TIMESTAMP,
} from '@/lib/taxValidators';
import { TAX_RULES_2026 } from '@/types/verification';

describe('Tax Validators - Edge Cases', () => {
  describe('validateZeroIncome', () => {
    it('should pass when zero income produces zero tax', () => {
      const result = validateZeroIncome(0, 0);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('₦0 tax');
    });

    it('should fail when zero income produces non-zero tax', () => {
      const result = validateZeroIncome(0, 1000);
      expect(result.passed).toBe(false);
      expect(result.explanation).toContain('Expected ₦0 tax');
    });

    it('should pass for non-zero income (check not applicable)', () => {
      const result = validateZeroIncome(100000, 5000);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('not applicable');
    });
  });

  describe('validateInputPositivity', () => {
    it('should pass when all inputs are positive', () => {
      const result = validateInputPositivity({
        turnover: 1000000,
        expenses: 500000,
        rentPaid: 200000,
      });
      expect(result.passed).toBe(true);
    });

    it('should fail when any input is negative', () => {
      const result = validateInputPositivity({
        turnover: 1000000,
        expenses: -500000,
      });
      expect(result.passed).toBe(false);
      expect(result.explanation).toContain('cannot be negative');
      expect(result.explanation).toContain('expenses');
    });

    it('should report all negative fields', () => {
      const result = validateInputPositivity({
        turnover: -1000,
        expenses: -500,
      });
      expect(result.passed).toBe(false);
      expect(result.actual).toContain('turnover');
      expect(result.actual).toContain('expenses');
    });

    it('should pass when inputs include zero', () => {
      const result = validateInputPositivity({
        turnover: 0,
        expenses: 0,
      });
      expect(result.passed).toBe(true);
    });
  });
});

describe('Tax Validators - Small Company Exemption', () => {
  describe('validateSmallCompanyExemption', () => {
    it('should pass for small company with 0% CIT and 0% dev levy', () => {
      // Turnover ≤ ₦50M AND Assets ≤ ₦250M
      const result = validateSmallCompanyExemption(40000000, 200000000, 0, 0);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('qualifies');
    });

    it('should handle exactly ₦50M turnover (boundary inclusive)', () => {
      const result = validateSmallCompanyExemption(50000000, 200000000, 0, 0);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('qualifies');
    });

    it('should handle exactly ₦250M assets (boundary inclusive)', () => {
      const result = validateSmallCompanyExemption(40000000, 250000000, 0, 0);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('qualifies');
    });

    it('should fail if small company has non-zero CIT', () => {
      const result = validateSmallCompanyExemption(40000000, 200000000, 100000, 0);
      expect(result.passed).toBe(false);
    });

    it('should fail if small company has non-zero dev levy', () => {
      const result = validateSmallCompanyExemption(40000000, 200000000, 0, 50000);
      expect(result.passed).toBe(false);
    });

    it('should pass for large company (turnover > ₦50M)', () => {
      const result = validateSmallCompanyExemption(60000000, 200000000, 500000, 100000);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('does not qualify');
    });

    it('should pass for large company (assets > ₦250M)', () => {
      const result = validateSmallCompanyExemption(40000000, 300000000, 500000, 100000);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('does not qualify');
    });
  });
});

describe('Tax Validators - Rent Relief', () => {
  describe('validateRentReliefCap', () => {
    it('should pass when relief is 20% of rent (under cap)', () => {
      // Rent ₦1M → Relief should be ₦200k (20%)
      const result = validateRentReliefCap(1000000, 200000);
      expect(result.passed).toBe(true);
    });

    it('should pass when relief is capped at ₦500k', () => {
      // Rent ₦3M → 20% = ₦600k, but capped at ₦500k
      const result = validateRentReliefCap(3000000, 500000);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('capped');
    });

    it('should fail when relief exceeds cap', () => {
      const result = validateRentReliefCap(3000000, 600000);
      expect(result.passed).toBe(false);
    });

    it('should handle zero rent', () => {
      const result = validateRentReliefCap(0, 0);
      expect(result.passed).toBe(true);
    });

    it('should verify exact cap amount (₦2.5M rent = ₦500k relief)', () => {
      // Rent ₦2.5M → 20% = ₦500k (exactly at cap)
      const result = validateRentReliefCap(2500000, 500000);
      expect(result.passed).toBe(true);
    });
  });

  describe('validateRentToIncomeRatio', () => {
    it('should pass when rent is under 50% of income', () => {
      const result = validateRentToIncomeRatio(400000, 1000000);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('within normal range');
    });

    it('should fail when rent exceeds 50% of income', () => {
      const result = validateRentToIncomeRatio(600000, 1000000);
      expect(result.passed).toBe(false);
      expect(result.explanation).toContain('High rent');
    });

    it('should fail when rent exceeds income', () => {
      const result = validateRentToIncomeRatio(1500000, 1000000);
      expect(result.passed).toBe(false);
      expect(result.explanation).toContain('exceeds income');
    });

    it('should fail when income is zero but rent is claimed', () => {
      const result = validateRentToIncomeRatio(500000, 0);
      expect(result.passed).toBe(false);
      expect(result.explanation).toContain('verify data');
    });

    it('should pass when exactly at 50%', () => {
      const result = validateRentToIncomeRatio(500000, 1000000);
      expect(result.passed).toBe(true);
    });
  });
});

describe('Tax Validators - CRA Abolition', () => {
  describe('validateCRAAbholished', () => {
    it('should pass when CRA is zero under 2026 rules', () => {
      const result = validateCRAAbholished(true, 0);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('abolished');
    });

    it('should fail when CRA is applied under 2026 rules', () => {
      const result = validateCRAAbholished(true, 500000);
      expect(result.passed).toBe(false);
      expect(result.explanation).toContain('should be ₦0');
    });

    it('should pass when CRA is applied under pre-2026 rules', () => {
      const result = validateCRAAbholished(false, 500000);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('correctly applied');
    });
  });
});

describe('Tax Validators - Development Levy', () => {
  describe('validateDevelopmentLevy', () => {
    it('should pass when small company has zero levy', () => {
      const result = validateDevelopmentLevy(1000000, 0, true);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('exempt');
    });

    it('should fail when small company has non-zero levy', () => {
      const result = validateDevelopmentLevy(1000000, 40000, true);
      expect(result.passed).toBe(false);
    });

    it('should pass when large company has 4% levy', () => {
      // Profit ₦1M → Levy should be ₦40k (4%)
      const result = validateDevelopmentLevy(1000000, 40000, false);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('4%');
    });

    it('should fail when large company levy is incorrect', () => {
      const result = validateDevelopmentLevy(1000000, 50000, false);
      expect(result.passed).toBe(false);
    });

    it('should handle zero profit (levy should be zero)', () => {
      const result = validateDevelopmentLevy(0, 0, false);
      expect(result.passed).toBe(true);
    });
  });
});

describe('Tax Validators - PIT Bands (2026 Rules)', () => {
  describe('validatePITBands', () => {
    it('should have zero tax for income under ₦800k', () => {
      const result = validatePITBands(500000, 0, true);
      expect(result.passed).toBe(true);
    });

    it('should have zero tax for exactly ₦800k', () => {
      const result = validatePITBands(800000, 0, true);
      expect(result.passed).toBe(true);
    });

    it('should correctly calculate tax for ₦3M income', () => {
      // First ₦800k at 0% = ₦0
      // Next ₦2.2M at 15% = ₦330,000
      // Total = ₦330,000
      const result = validatePITBands(3000000, 330000, true);
      expect(result.passed).toBe(true);
    });

    it('should correctly calculate tax for ₦12M income', () => {
      // First ₦800k at 0% = ₦0
      // Next ₦2.2M (₦800k to ₦3M) at 15% = ₦330,000
      // Next ₦9M (₦3M to ₦12M) at 18% = ₦1,620,000
      // Total = ₦1,950,000
      const result = validatePITBands(12000000, 1950000, true);
      expect(result.passed).toBe(true);
    });

    it('should fail with incorrect tax calculation', () => {
      const result = validatePITBands(3000000, 500000, true);
      expect(result.passed).toBe(false);
    });
  });
});

describe('Tax Validators - Pre-2026 PIT Bands', () => {
  describe('validatePITBands (pre-2026)', () => {
    it('should calculate 7% on first ₦300k', () => {
      // ₦300k at 7% = ₦21,000
      const result = validatePITBands(300000, 21000, false);
      expect(result.passed).toBe(true);
    });

    it('should correctly calculate tax for ₦600k income', () => {
      // First ₦300k at 7% = ₦21,000
      // Next ₦300k at 11% = ₦33,000
      // Total = ₦54,000
      const result = validatePITBands(600000, 54000, false);
      expect(result.passed).toBe(true);
    });
  });
});

describe('Tax Validators - VAT Rate', () => {
  describe('validateVATRate', () => {
    it('should pass with 7.5% VAT', () => {
      // Sales ₦1M → VAT ₦75,000
      const result = validateVATRate(1000000, 75000);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('7.5%');
    });

    it('should fail with incorrect VAT', () => {
      const result = validateVATRate(1000000, 50000);
      expect(result.passed).toBe(false);
    });

    it('should handle zero sales', () => {
      const result = validateVATRate(0, 0);
      expect(result.passed).toBe(true);
    });
  });
});

describe('Tax Validators - Pension and NHF', () => {
  describe('validatePensionRate', () => {
    it('should pass with 8% pension deduction', () => {
      // Gross ₦500k → Pension ₦40k
      const result = validatePensionRate(500000, 40000);
      expect(result.passed).toBe(true);
    });

    it('should fail with incorrect pension', () => {
      const result = validatePensionRate(500000, 50000);
      expect(result.passed).toBe(false);
    });
  });

  describe('validateNHFRate', () => {
    it('should pass with 2.5% NHF deduction', () => {
      // Gross ₦500k → NHF ₦12,500
      const result = validateNHFRate(500000, 12500);
      expect(result.passed).toBe(true);
    });

    it('should fail with incorrect NHF', () => {
      const result = validateNHFRate(500000, 15000);
      expect(result.passed).toBe(false);
    });
  });
});

describe('Tax Validators - Zero Profit Large Company', () => {
  describe('validateZeroProfitLargeCompany', () => {
    it('should pass when zero profit results in zero tax', () => {
      // Large company (turnover > ₦50M) with zero profit
      const result = validateZeroProfitLargeCompany(0, 100000000, 300000000, 0, 0);
      expect(result.passed).toBe(true);
    });

    it('should fail if non-zero CIT for zero profit', () => {
      const result = validateZeroProfitLargeCompany(0, 100000000, 300000000, 50000, 0);
      expect(result.passed).toBe(false);
    });

    it('should return N/A for small company', () => {
      const result = validateZeroProfitLargeCompany(0, 40000000, 200000000, 0, 0);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('Company is small');
    });

    it('should return N/A for non-zero profit', () => {
      const result = validateZeroProfitLargeCompany(1000000, 100000000, 300000000, 300000, 40000);
      expect(result.passed).toBe(true);
      expect(result.explanation).toContain('not zero');
    });
  });
});

describe('Tax Validators - Rules Age', () => {
  describe('calculateRulesAge', () => {
    it('should return a positive number', () => {
      const age = calculateRulesAge();
      expect(typeof age).toBe('number');
      expect(age).toBeGreaterThanOrEqual(0);
    });

    it('should use the verification timestamp', () => {
      expect(VERIFICATION_TIMESTAMP).toBe('2026-01-21');
    });
  });
});

describe('Tax Rules Constants', () => {
  it('should have correct 2026 PIT bands', () => {
    expect(TAX_RULES_2026.pitBands).toHaveLength(6);
    expect(TAX_RULES_2026.pitBands[0]).toEqual({ threshold: 800000, rate: 0 });
    expect(TAX_RULES_2026.pitBands[1]).toEqual({ threshold: 3000000, rate: 0.15 });
    expect(TAX_RULES_2026.pitBands[2]).toEqual({ threshold: 12000000, rate: 0.18 });
    expect(TAX_RULES_2026.pitBands[3]).toEqual({ threshold: 25000000, rate: 0.21 });
    expect(TAX_RULES_2026.pitBands[4]).toEqual({ threshold: 50000000, rate: 0.23 });
    expect(TAX_RULES_2026.pitBands[5]).toEqual({ threshold: Infinity, rate: 0.25 });
  });

  it('should have correct small company thresholds', () => {
    expect(TAX_RULES_2026.smallCompanyTurnoverLimit).toBe(50000000);
    expect(TAX_RULES_2026.smallCompanyAssetLimit).toBe(250000000);
  });

  it('should have correct tax rates', () => {
    expect(TAX_RULES_2026.citRate).toBe(30);
    expect(TAX_RULES_2026.developmentLevyRate).toBe(4);
    expect(TAX_RULES_2026.vatRate).toBe(7.5);
    expect(TAX_RULES_2026.rentReliefPercent).toBe(20);
    expect(TAX_RULES_2026.rentReliefMax).toBe(500000);
    expect(TAX_RULES_2026.pensionRate).toBe(8);
    expect(TAX_RULES_2026.nhfRate).toBe(2.5);
  });
});
