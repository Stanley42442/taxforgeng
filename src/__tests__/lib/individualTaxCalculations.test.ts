/**
 * Individual Tax Calculation Tests
 * Based on Nigeria Tax Act 2025 (effective 2026)
 */

import { describe, it, expect } from 'vitest';
import { 
  calculateIndividualTax,
  calculatePersonalIncomeTax,
  calculateCryptoTax,
  calculateInformalTax,
  calculateInvestmentTax,
  type IndividualTaxInputs 
} from '@/lib/individualTaxCalculations';

describe('Individual Personal Income Tax (PIT)', () => {
  describe('2026 Tax Bands Verification', () => {
    it('should exempt income up to ₦800,000', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 800000,
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      // After CRA relief, taxable income should be very low or zero
      expect(result.taxPayable).toBeLessThanOrEqual(0);
    });

    it('should apply 15% for ₦800k - ₦3M band', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 5000000,
        pensionContribution: 400000, // 8%
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      expect(result.taxPayable).toBeGreaterThan(0);
      // Check that breakdown includes 15% rate
      const has15Percent = result.breakdown.some(b => 
        b.description?.includes('15%')
      );
      expect(has15Percent).toBe(true);
    });

    it('should apply 18% for ₦3M - ₦12M band', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 20000000,
        pensionContribution: 1600000,
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      // Check that breakdown includes 18% rate
      const has18Percent = result.breakdown.some(b => 
        b.description?.includes('18%')
      );
      expect(has18Percent).toBe(true);
    });

    it('should apply 21% for ₦12M - ₦25M band', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 40000000,
        pensionContribution: 3200000,
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      const has21Percent = result.breakdown.some(b => 
        b.description?.includes('21%')
      );
      expect(has21Percent).toBe(true);
    });

    it('should apply 23% for ₦25M - ₦50M band', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 80000000,
        pensionContribution: 6400000,
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      const has23Percent = result.breakdown.some(b => 
        b.description?.includes('23%')
      );
      expect(has23Percent).toBe(true);
    });

    it('should apply 25% for income above ₦50M', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 100000000,
        pensionContribution: 8000000,
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      const has25Percent = result.breakdown.some(b => 
        b.description?.includes('25%')
      );
      expect(has25Percent).toBe(true);
    });
  });

  describe('Consolidated Relief Allowance (CRA)', () => {
    it('should calculate CRA as higher of ₦200k or 1% + 20% of gross', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 10000000,
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      // CRA = max(200000, 10M * 0.01) + (10M * 0.20) = 100000 + 2000000 = 2,100,000
      // But max(200000, 100000) = 200000, so CRA = 200000 + 2000000 = 2,200,000
      const craRelief = result.reliefs.find(r => r.name === 'Consolidated Relief Allowance');
      expect(craRelief).toBeDefined();
      expect(craRelief!.amount).toBe(2200000);
    });

    it('should use ₦200k minimum when 1% is less', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 5000000, // 1% = ₦50k < ₦200k
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      const craRelief = result.reliefs.find(r => r.name === 'Consolidated Relief Allowance');
      // CRA = 200000 + (5M * 0.20) = 200000 + 1000000 = 1,200,000
      expect(craRelief!.amount).toBe(1200000);
    });
  });

  describe('Pension Relief', () => {
    it('should allow pension contribution up to 8% of gross', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 10000000,
        pensionContribution: 1000000, // 10% of gross
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      const pensionRelief = result.reliefs.find(r => r.name === 'Pension Contribution');
      // Max allowed = 10M * 8% = 800000
      expect(pensionRelief!.amount).toBe(800000);
    });

    it('should allow full pension if within 8% limit', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 10000000,
        pensionContribution: 500000, // 5% of gross
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      const pensionRelief = result.reliefs.find(r => r.name === 'Pension Contribution');
      expect(pensionRelief!.amount).toBe(500000);
    });
  });

  describe('NHF and Life Insurance Reliefs', () => {
    it('should allow NHF contribution as relief', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 10000000,
        nhfContribution: 250000, // 2.5%
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      const nhfRelief = result.reliefs.find(r => r.name === 'NHF Contribution');
      expect(nhfRelief).toBeDefined();
      expect(nhfRelief!.amount).toBe(250000);
    });

    it('should allow life insurance premium as relief', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: 10000000,
        lifeInsurancePremium: 300000,
      };
      
      const result = calculatePersonalIncomeTax(inputs);
      const insuranceRelief = result.reliefs.find(r => r.name === 'Life Insurance Premium');
      expect(insuranceRelief).toBeDefined();
      expect(insuranceRelief!.amount).toBe(300000);
    });
  });
});

describe('Crypto/Digital Asset Tax', () => {
  describe('2026 CGT Exemptions', () => {
    it('should exempt gains up to ₦10M', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'crypto',
        use2026Rules: true,
        cryptoGains: 8000000,
      };
      
      const result = calculateCryptoTax(inputs);
      // Under ₦10M threshold - should have minimal or no CGT
      expect(result.alerts.some(a => a.type === 'success')).toBe(true);
    });

    it('should apply 10% CGT for gains ₦10M - ₦50M', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'crypto',
        use2026Rules: true,
        cryptoGains: 30000000,
      };
      
      const result = calculateCryptoTax(inputs);
      // Should have CGT applied
      expect(result.taxPayable).toBeGreaterThan(0);
    });
  });

  describe('Loss Carry-Forward', () => {
    it('should offset losses against gains', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'crypto',
        use2026Rules: true,
        cryptoGains: 20000000,
        cryptoLosses: 15000000,
      };
      
      const result = calculateCryptoTax(inputs);
      // Net gains = 20M - 15M = 5M
      // Should show loss offset in reliefs
      const lossOffset = result.reliefs.find(r => r.name === 'Loss Offset');
      expect(lossOffset).toBeDefined();
      expect(lossOffset!.amount).toBe(15000000);
    });

    it('should carry forward unused losses', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'crypto',
        use2026Rules: true,
        cryptoGains: 10000000,
        cryptoLosses: 20000000,
      };
      
      const result = calculateCryptoTax(inputs);
      // Unused losses = 20M - 10M = 10M
      expect(result.alerts.some(a => a.message.includes('carried forward'))).toBe(true);
    });

    it('should include previous year losses', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'crypto',
        use2026Rules: true,
        cryptoGains: 30000000,
        previousLosses: 10000000,
      };
      
      const result = calculateCryptoTax(inputs);
      // Net gains should be 30M - 10M = 20M
      expect(result.taxableIncome).toBe(20000000);
    });
  });

  describe('Crypto Income (Regular PIT)', () => {
    it('should apply PIT rates to crypto income', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'crypto',
        use2026Rules: true,
        cryptoIncome: 5000000,
        cryptoGains: 0,
      };
      
      const result = calculateCryptoTax(inputs);
      expect(result.taxPayable).toBeGreaterThan(0);
      // Should have PIT breakdown entries
      expect(result.breakdown.some(b => b.label.includes('Crypto Income'))).toBe(true);
    });
  });
});

describe('Informal/Micro-Enterprise Tax', () => {
  describe('Presumptive Tax by Location', () => {
    it('should apply Lagos presumptive rates', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'informal',
        use2026Rules: true,
        estimatedTurnover: 3000000,
        location: 'lagos',
      };
      
      const result = calculateInformalTax(inputs);
      // Lagos: ₦20,000 - ₦50,000
      expect(result.taxPayable).toBeGreaterThanOrEqual(20000);
      expect(result.taxPayable).toBeLessThanOrEqual(50000);
    });

    it('should apply Abuja presumptive rates', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'informal',
        use2026Rules: true,
        estimatedTurnover: 3000000,
        location: 'abuja',
      };
      
      const result = calculateInformalTax(inputs);
      // Abuja: ₦15,000 - ₦40,000
      expect(result.taxPayable).toBeGreaterThanOrEqual(15000);
      expect(result.taxPayable).toBeLessThanOrEqual(40000);
    });

    it('should apply other urban presumptive rates', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'informal',
        use2026Rules: true,
        estimatedTurnover: 3000000,
        location: 'other_urban',
      };
      
      const result = calculateInformalTax(inputs);
      // Other urban: ₦5,000 - ₦20,000
      expect(result.taxPayable).toBeGreaterThanOrEqual(5000);
      expect(result.taxPayable).toBeLessThanOrEqual(20000);
    });
  });

  describe('Turnover-Based Brackets', () => {
    it('should apply minimum rate for low turnover', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'informal',
        use2026Rules: true,
        estimatedTurnover: 1000000,
        location: 'other_urban',
      };
      
      const result = calculateInformalTax(inputs);
      expect(result.taxPayable).toBe(5000); // Minimum
    });

    it('should apply maximum rate for high turnover', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'informal',
        use2026Rules: true,
        estimatedTurnover: 10000000,
        location: 'other_urban',
      };
      
      const result = calculateInformalTax(inputs);
      expect(result.taxPayable).toBe(20000); // Maximum
    });
  });

  describe('VAT Registration Warning', () => {
    it('should warn about VAT registration for turnover > ₦25M', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'informal',
        use2026Rules: true,
        estimatedTurnover: 30000000,
        location: 'lagos',
      };
      
      const result = calculateInformalTax(inputs);
      expect(result.alerts.some(a => 
        a.type === 'warning' && a.message.includes('VAT registration')
      )).toBe(true);
    });
  });
});

describe('Investment Income Tax', () => {
  describe('Dividend Income', () => {
    it('should treat franked dividends as exempt', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'investment',
        use2026Rules: true,
        dividendIncome: 5000000,
      };
      
      const result = calculateInvestmentTax(inputs);
      // Franked dividends are exempt
      expect(result.alerts.some(a => 
        a.message.includes('tax-exempt')
      )).toBe(true);
    });
  });

  describe('Interest Income WHT', () => {
    it('should apply 10% WHT on interest', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'investment',
        use2026Rules: true,
        interestIncome: 1000000,
      };
      
      const result = calculateInvestmentTax(inputs);
      expect(result.taxPayable).toBe(100000); // 1M * 10%
    });

    it('should show WHT as final tax for individuals', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'investment',
        use2026Rules: true,
        interestIncome: 2000000,
      };
      
      const result = calculateInvestmentTax(inputs);
      expect(result.alerts.some(a => 
        a.message.includes('final tax')
      )).toBe(true);
    });
  });

  describe('Capital Gains - Small Investor Exemption', () => {
    it('should exempt gains ≤ ₦10M under 2026 rules', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'investment',
        use2026Rules: true,
        capitalGains: 8000000,
      };
      
      const result = calculateInvestmentTax(inputs);
      // Should show exemption alert
      expect(result.alerts.some(a => 
        a.type === 'success' && a.message.includes('small investor')
      )).toBe(true);
      // CGT portion should be 0
      const cgtEntry = result.breakdown.find(b => b.label.includes('Capital Gains'));
      expect(cgtEntry?.amount).toBe(0);
    });

    it('should apply progressive rates for gains > ₦10M under 2026 rules', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'investment',
        use2026Rules: true,
        capitalGains: 20000000,
      };
      
      const result = calculateInvestmentTax(inputs);
      // Should apply progressive PIT rates
      expect(result.alerts.some(a => 
        a.message.includes('progressive')
      )).toBe(true);
    });

    it('should apply flat 10% CGT under pre-2026 rules', () => {
      const inputs: IndividualTaxInputs = {
        calculationType: 'investment',
        use2026Rules: false,
        capitalGains: 15000000,
      };
      
      const result = calculateInvestmentTax(inputs);
      // 10% flat rate
      const cgtEntry = result.breakdown.find(b => b.label.includes('Capital Gains'));
      expect(cgtEntry?.amount).toBe(1500000); // 15M * 10%
    });
  });
});

describe('Calculation Router', () => {
  it('should route to PIT calculation correctly', () => {
    const inputs: IndividualTaxInputs = {
      calculationType: 'pit',
      use2026Rules: true,
      employmentIncome: 5000000,
    };
    
    const result = calculateIndividualTax(inputs);
    expect(result.breakdown.length).toBeGreaterThan(0);
  });

  it('should route to crypto calculation correctly', () => {
    const inputs: IndividualTaxInputs = {
      calculationType: 'crypto',
      use2026Rules: true,
      cryptoGains: 15000000,
    };
    
    const result = calculateIndividualTax(inputs);
    expect(result).toBeDefined();
  });

  it('should route to informal calculation correctly', () => {
    const inputs: IndividualTaxInputs = {
      calculationType: 'informal',
      use2026Rules: true,
      estimatedTurnover: 3000000,
      location: 'lagos',
    };
    
    const result = calculateIndividualTax(inputs);
    expect(result.breakdown.some(b => b.label.includes('Presumptive'))).toBe(true);
  });

  it('should route to investment calculation correctly', () => {
    const inputs: IndividualTaxInputs = {
      calculationType: 'investment',
      use2026Rules: true,
      interestIncome: 1000000,
    };
    
    const result = calculateIndividualTax(inputs);
    expect(result.breakdown.some(b => b.label.includes('Interest'))).toBe(true);
  });
});
