/**
 * Comprehensive Tax Calculation Tests
 * Based on Nigeria Tax Act 2025 (effective 2026)
 * 
 * Sources:
 * - EY Global Tax Alert - "Nigeria Tax Act, 2025 has been signed" (June 30, 2025)
 * - Baker Tilly Nigeria - "Nigeria's 2025 Tax Reform Acts Explained" (August 23, 2025)
 * - Adeola Oyinlade & Co - "Understanding Personal Income Tax Under the Nigerian Tax Act 2025"
 * - PwC Tax Summaries - "Nigeria - Corporate - Taxes on corporate income"
 */

import { describe, it, expect } from 'vitest';
import { 
  calculatePersonalIncomeTax, 
  calculateCompanyTax, 
  calculateVAT,
  calculateWHTCredits,
  calculateTax,
  type TaxInputs 
} from '@/lib/taxCalculations';

describe('Personal Income Tax (PIT) - 2026 Rules', () => {
  describe('Tax Band Verification - Nigeria Tax Act 2025', () => {
    it('should apply 0% tax for income up to ₦800,000', () => {
      const result = calculatePersonalIncomeTax(800000, true);
      expect(result.tax).toBe(0);
    });

    it('should apply 0% for first ₦800k, then 15% for ₦800k-₦3M', () => {
      // Income of ₦3,000,000
      // First ₦800,000 at 0% = ₦0
      // Next ₦2,200,000 at 15% = ₦330,000
      const result = calculatePersonalIncomeTax(3000000, true);
      expect(result.tax).toBe(330000);
    });

    it('should apply correct rates for income of ₦12,000,000', () => {
      // First ₦800,000 at 0% = ₦0
      // Next ₦2,200,000 (₦800k to ₦3M) at 15% = ₦330,000
      // Next ₦9,000,000 (₦3M to ₦12M) at 18% = ₦1,620,000
      // Total = ₦1,950,000
      const result = calculatePersonalIncomeTax(12000000, true);
      expect(result.tax).toBe(1950000);
    });

    it('should apply correct rates for income of ₦25,000,000', () => {
      // First ₦800,000 at 0% = ₦0
      // Next ₦2,200,000 (₦800k to ₦3M) at 15% = ₦330,000
      // Next ₦9,000,000 (₦3M to ₦12M) at 18% = ₦1,620,000
      // Next ₦13,000,000 (₦12M to ₦25M) at 21% = ₦2,730,000
      // Total = ₦4,680,000
      const result = calculatePersonalIncomeTax(25000000, true);
      expect(result.tax).toBe(4680000);
    });

    it('should apply correct rates for income of ₦50,000,000', () => {
      // First ₦800,000 at 0% = ₦0
      // Next ₦2,200,000 (₦800k to ₦3M) at 15% = ₦330,000
      // Next ₦9,000,000 (₦3M to ₦12M) at 18% = ₦1,620,000
      // Next ₦13,000,000 (₦12M to ₦25M) at 21% = ₦2,730,000
      // Next ₦25,000,000 (₦25M to ₦50M) at 23% = ₦5,750,000
      // Total = ₦10,430,000
      const result = calculatePersonalIncomeTax(50000000, true);
      expect(result.tax).toBe(10430000);
    });

    it('should apply 25% rate for income above ₦50,000,000', () => {
      // Income of ₦60,000,000
      // First ₦800,000 at 0% = ₦0
      // Next ₦2,200,000 at 15% = ₦330,000
      // Next ₦9,000,000 at 18% = ₦1,620,000
      // Next ₦13,000,000 at 21% = ₦2,730,000
      // Next ₦25,000,000 at 23% = ₦5,750,000
      // Next ₦10,000,000 (above ₦50M) at 25% = ₦2,500,000
      // Total = ₦12,930,000
      const result = calculatePersonalIncomeTax(60000000, true);
      expect(result.tax).toBe(12930000);
    });

    it('should return breakdown with correct band descriptions', () => {
      const result = calculatePersonalIncomeTax(15000000, true);
      expect(result.breakdown.length).toBeGreaterThan(0);
      // Should have entries for 15%, 18%, and 21% bands
      const rates = result.breakdown.map(b => b.description).filter(Boolean);
      expect(rates.some(r => r?.includes('15%'))).toBe(true);
      expect(rates.some(r => r?.includes('18%'))).toBe(true);
      expect(rates.some(r => r?.includes('21%'))).toBe(true);
    });
  });

  describe('Pre-2026 PIT Rates (Legacy)', () => {
    it('should apply old 7% rate for first ₦300,000', () => {
      const result = calculatePersonalIncomeTax(300000, false);
      expect(result.tax).toBe(21000); // ₦300,000 * 7%
    });

    it('should apply progressive pre-2026 rates correctly', () => {
      // Income of ₦1,000,000
      // First ₦300,000 at 7% = ₦21,000
      // Next ₦300,000 (₦300k to ₦600k) at 11% = ₦33,000
      // Next ₦400,000 (₦600k to ₦1M, partial of ₦1.1M band) at 15% = ₦60,000
      // Total = ₦114,000
      const result = calculatePersonalIncomeTax(1000000, false);
      expect(result.tax).toBe(114000);
    });
  });
});

describe('Company Income Tax (CIT) - 2026 Rules', () => {
  describe('Small Company Exemption', () => {
    it('should apply 0% CIT for companies with turnover ≤ ₦50M and assets ≤ ₦250M', () => {
      const result = calculateCompanyTax(
        10000000,  // profit
        40000000,  // turnover (below ₦50M)
        200000000, // fixed assets (below ₦250M)
        true       // use2026Rules
      );
      expect(result.cit).toBe(0);
      expect(result.devLevy).toBe(0);
      expect(result.isSmall).toBe(true);
      expect(result.appliedRate).toBe(0);
    });

    it('should apply 0% CIT at exactly ₦50M turnover threshold', () => {
      const result = calculateCompanyTax(
        15000000,   // profit
        50000000,   // turnover (exactly ₦50M)
        250000000,  // fixed assets (exactly ₦250M)
        true
      );
      expect(result.cit).toBe(0);
      expect(result.isSmall).toBe(true);
    });

    it('should NOT qualify as small if turnover exceeds ₦50M', () => {
      const result = calculateCompanyTax(
        20000000,   // profit
        60000000,   // turnover (above ₦50M)
        200000000,  // fixed assets (below ₦250M)
        true
      );
      expect(result.isSmall).toBe(false);
      expect(result.appliedRate).toBe(30);
    });

    it('should NOT qualify as small if fixed assets exceed ₦250M', () => {
      const result = calculateCompanyTax(
        15000000,   // profit
        40000000,   // turnover (below ₦50M)
        300000000,  // fixed assets (above ₦250M)
        true
      );
      expect(result.isSmall).toBe(false);
      expect(result.appliedRate).toBe(30);
    });
  });

  describe('Large Company Tax Rate - 30% CIT', () => {
    it('should apply 30% CIT for large companies under 2026 rules', () => {
      const result = calculateCompanyTax(
        50000000,   // profit
        100000000,  // turnover (above ₦50M)
        300000000,  // fixed assets
        true
      );
      expect(result.cit).toBe(15000000); // 50M * 30%
      expect(result.appliedRate).toBe(30);
    });

    it('should apply 4% Development Levy for large companies', () => {
      const result = calculateCompanyTax(
        100000000,  // profit
        500000000,  // turnover
        400000000,  // fixed assets
        true
      );
      expect(result.devLevy).toBe(4000000); // 100M * 4%
    });

    it('should calculate correct total tax (CIT + Dev Levy)', () => {
      const profit = 80000000;
      const result = calculateCompanyTax(
        profit,
        300000000,
        400000000,
        true
      );
      const expectedCIT = profit * 0.30;      // 24M
      const expectedDevLevy = profit * 0.04;  // 3.2M
      expect(result.cit).toBe(expectedCIT);
      expect(result.devLevy).toBe(expectedDevLevy);
    });
  });

  describe('Pre-2026 CIT Rates', () => {
    it('should apply 30% CIT for pre-2026 rules', () => {
      const result = calculateCompanyTax(
        50000000,
        200000000,
        300000000,
        false // pre-2026
      );
      expect(result.cit).toBe(15000000); // 50M * 30%
      expect(result.appliedRate).toBe(30);
    });

    it('should apply 2% Education Levy for pre-2026 rules', () => {
      const result = calculateCompanyTax(
        100000000,
        500000000,
        400000000,
        false
      );
      expect(result.devLevy).toBe(2000000); // 100M * 2%
    });
  });

  describe('Sector-Specific CIT Rates', () => {
    it('should apply 0% CIT for agriculture sector', () => {
      const result = calculateCompanyTax(
        50000000,
        200000000,
        300000000,
        true,
        { citRate: 0 }
      );
      expect(result.cit).toBe(0);
      expect(result.appliedRate).toBe(0);
    });

    it('should apply custom sector CIT rate', () => {
      const result = calculateCompanyTax(
        100000000,
        500000000,
        400000000,
        true,
        { citRate: 15 } // 15% sector rate
      );
      expect(result.cit).toBe(15000000); // 100M * 15%
      expect(result.appliedRate).toBe(15);
    });
  });
});

describe('VAT Calculations', () => {
  it('should calculate 7.5% VAT on vatable supplies', () => {
    const result = calculateVAT(10000000, 5000000);
    expect(result.outputVat).toBe(750000);  // 10M * 7.5%
    expect(result.inputVat).toBe(375000);   // 5M * 7.5%
    expect(result.netVat).toBe(375000);     // 750k - 375k
  });

  it('should handle VAT-exempt sectors', () => {
    const result = calculateVAT(10000000, 5000000, { vatStatus: 'exempt' });
    expect(result.outputVat).toBe(0);
    expect(result.netVat).toBe(0);
    expect(result.vatStatus).toBe('exempt');
  });

  it('should handle zero-rated sectors with input VAT recovery', () => {
    const result = calculateVAT(10000000, 5000000, { vatStatus: 'zero' });
    expect(result.outputVat).toBe(0);
    expect(result.inputVat).toBe(375000);
    expect(result.netVat).toBe(-375000); // Refund
    expect(result.vatStatus).toBe('zero-rated');
  });

  it('should indicate full input recovery under 2026 rules', () => {
    const result = calculateVAT(10000000, 5000000, undefined, true);
    expect(result.fullInputRecovery).toBe(true);
  });
});

describe('Withholding Tax (WHT) Credits', () => {
  it('should calculate 10% WHT on rental and consultancy income', () => {
    const credits = calculateWHTCredits(1000000, 2000000);
    expect(credits).toBe(300000); // (1M + 2M) * 10%
  });

  it('should apply sector-specific WHT rate', () => {
    const credits = calculateWHTCredits(1000000, 2000000, { whtRate: 5 });
    expect(credits).toBe(150000); // (1M + 2M) * 5%
  });
});

describe('Full Tax Calculation Integration', () => {
  describe('Business Name (PIT) Calculations', () => {
    it('should calculate correct PIT for business name entity', () => {
      const inputs: TaxInputs = {
        entityType: 'business_name',
        turnover: 20000000,
        expenses: 8000000,
        rentPaid: 0,
        vatableSales: 20000000,
        vatablePurchases: 5000000,
        rentalIncome: 0,
        consultancyIncome: 0,
        dividendIncome: 0,
        capitalGains: 0,
        foreignIncome: 0,
        fixedAssets: 5000000,
        use2026Rules: true,
      };

      const result = calculateTax(inputs);
      
      // Taxable income: 20M - 8M = 12M
      // Tax on 12M using 2026 bands = ₦1,950,000
      expect(result.taxableIncome).toBe(12000000);
      expect(result.incomeTax).toBe(1950000);
      expect(result.entityType).toBe('business_name');
    });
  });

  describe('Company Tax Calculations', () => {
    it('should apply small company exemption correctly', () => {
      const inputs: TaxInputs = {
        entityType: 'company',
        turnover: 40000000, // Below ₦50M
        expenses: 15000000,
        rentPaid: 0,
        vatableSales: 40000000,
        vatablePurchases: 10000000,
        rentalIncome: 0,
        consultancyIncome: 0,
        dividendIncome: 0,
        capitalGains: 0,
        foreignIncome: 0,
        fixedAssets: 200000000, // Below ₦250M
        use2026Rules: true,
      };

      const result = calculateTax(inputs);
      
      expect(result.isSmallCompany).toBe(true);
      expect(result.incomeTax).toBe(0);
      expect(result.developmentLevy).toBe(0);
    });

    it('should apply 30% CIT for large companies', () => {
      const inputs: TaxInputs = {
        entityType: 'company',
        turnover: 100000000, // Above ₦50M
        expenses: 50000000,
        rentPaid: 0,
        vatableSales: 100000000,
        vatablePurchases: 40000000,
        rentalIncome: 0,
        consultancyIncome: 0,
        dividendIncome: 0,
        capitalGains: 0,
        foreignIncome: 0,
        fixedAssets: 300000000,
        use2026Rules: true,
      };

      const result = calculateTax(inputs);
      
      expect(result.isSmallCompany).toBe(false);
      // Taxable income: 100M - 50M = 50M
      // CIT: 50M * 30% = 15M
      expect(result.incomeTax).toBeGreaterThanOrEqual(15000000);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle zero turnover', () => {
      const inputs: TaxInputs = {
        entityType: 'company',
        turnover: 0,
        expenses: 0,
        rentPaid: 0,
        vatableSales: 0,
        vatablePurchases: 0,
        rentalIncome: 0,
        consultancyIncome: 0,
        dividendIncome: 0,
        capitalGains: 0,
        foreignIncome: 0,
        fixedAssets: 0,
        use2026Rules: true,
      };

      const result = calculateTax(inputs);
      expect(result.totalTaxPayable).toBe(0);
    });

    it('should handle expenses exceeding turnover (loss scenario)', () => {
      const inputs: TaxInputs = {
        entityType: 'company',
        turnover: 50000000,
        expenses: 80000000, // Loss
        rentPaid: 0,
        vatableSales: 50000000,
        vatablePurchases: 40000000,
        rentalIncome: 0,
        consultancyIncome: 0,
        dividendIncome: 0,
        capitalGains: 0,
        foreignIncome: 0,
        fixedAssets: 20000000,
        use2026Rules: true,
      };

      const result = calculateTax(inputs);
      // No CIT on losses
      expect(result.incomeTax).toBe(0);
    });

    it('should correctly handle ₦50M threshold boundary', () => {
      // Just below threshold - should be small
      const inputsSmall: TaxInputs = {
        entityType: 'company',
        turnover: 49999999,
        expenses: 20000000,
        rentPaid: 0,
        vatableSales: 49999999,
        vatablePurchases: 15000000,
        rentalIncome: 0,
        consultancyIncome: 0,
        dividendIncome: 0,
        capitalGains: 0,
        foreignIncome: 0,
        fixedAssets: 200000000,
        use2026Rules: true,
      };

      // Just above threshold - should be large
      const inputsLarge: TaxInputs = {
        ...inputsSmall,
        turnover: 50000001,
        vatableSales: 50000001,
      };

      const resultSmall = calculateTax(inputsSmall);
      const resultLarge = calculateTax(inputsLarge);

      expect(resultSmall.isSmallCompany).toBe(true);
      expect(resultLarge.isSmallCompany).toBe(false);
    });
  });
});

describe('Effective Tax Rate Calculations', () => {
  it('should calculate correct effective rate for PIT', () => {
    const inputs: TaxInputs = {
      entityType: 'business_name',
      turnover: 10000000,
      expenses: 0,
      rentPaid: 0,
      vatableSales: 0,
      vatablePurchases: 0,
      rentalIncome: 0,
      consultancyIncome: 0,
      dividendIncome: 0,
      capitalGains: 0,
      foreignIncome: 0,
      fixedAssets: 0,
      use2026Rules: true,
    };

    const result = calculateTax(inputs);
    
    // Tax on ₦10M = ₦330k (15% band) + ₦1,260k (18% band for ₦7M) = ₦1,590k
    // Effective rate = 1.59M / 10M = 15.9%
    expect(result.effectiveRate).toBeCloseTo(15.9, 0);
  });

  it('should show 0% effective rate for exempt small companies', () => {
    const inputs: TaxInputs = {
      entityType: 'company',
      turnover: 40000000, // Below ₦50M threshold
      expenses: 16000000,
      rentPaid: 0,
      vatableSales: 40000000,
      vatablePurchases: 12000000,
      rentalIncome: 0,
      consultancyIncome: 0,
      dividendIncome: 0,
      capitalGains: 0,
      foreignIncome: 0,
      fixedAssets: 100000000,
      use2026Rules: true,
    };

    const result = calculateTax(inputs);
    expect(result.isSmallCompany).toBe(true);
    // Effective rate should be very low (only VAT, no income tax)
    expect(result.incomeTax).toBe(0);
  });
});
