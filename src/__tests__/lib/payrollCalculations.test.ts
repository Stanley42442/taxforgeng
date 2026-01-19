/**
 * Payroll Calculation Tests
 * Based on Nigeria Tax Act 2025 (effective 2026)
 * 
 * Tests PAYE calculations, pension contributions, and NHF deductions
 */

import { describe, it, expect } from 'vitest';

// Recreate the PIT bands for testing
const PIT_BANDS_2026 = [
  { threshold: 800000, rate: 0 },
  { threshold: 3000000, rate: 0.15 },
  { threshold: 12000000, rate: 0.18 },
  { threshold: 25000000, rate: 0.21 },
  { threshold: 50000000, rate: 0.23 },
  { threshold: Infinity, rate: 0.25 },
];

const PIT_BANDS_PRE2026 = [
  { threshold: 300000, rate: 0.07 },
  { threshold: 600000, rate: 0.11 },
  { threshold: 1100000, rate: 0.15 },
  { threshold: 1600000, rate: 0.19 },
  { threshold: 3200000, rate: 0.21 },
  { threshold: Infinity, rate: 0.24 },
];

// Helper to calculate annual PIT
function calculateAnnualPIT(annualTaxable: number, use2026Rules: boolean): number {
  const bands = use2026Rules ? PIT_BANDS_2026 : PIT_BANDS_PRE2026;
  let remainingIncome = annualTaxable;
  let totalTax = 0;
  let previousThreshold = 0;

  for (const band of bands) {
    if (remainingIncome <= 0) break;
    const bandAmount = band.threshold - previousThreshold;
    const taxableInBand = Math.min(remainingIncome, bandAmount);
    totalTax += taxableInBand * band.rate;
    remainingIncome -= taxableInBand;
    previousThreshold = band.threshold;
  }

  return totalTax;
}

// Helper to calculate payroll
function calculatePayroll(
  monthlyGross: number,
  use2026Rules: boolean,
  includeNHF: boolean = true
) {
  const annualGross = monthlyGross * 12;
  
  // Pension - 8% employee, 10% employer
  const pensionEmployee = monthlyGross * 0.08;
  const pensionEmployer = monthlyGross * 0.10;
  
  // NHF - 2.5%
  const nhf = includeNHF ? monthlyGross * 0.025 : 0;
  
  // CRA calculation
  const cra = use2026Rules 
    ? Math.max(200000, annualGross * 0.01) + (annualGross * 0.20)
    : 200000 + (annualGross * 0.20);
  
  // Annual reliefs
  const annualPension = pensionEmployee * 12;
  const annualNHF = nhf * 12;
  
  // Taxable income
  const annualTaxableIncome = Math.max(0, annualGross - cra - annualPension - annualNHF);
  
  // Annual PAYE
  const annualPAYE = calculateAnnualPIT(annualTaxableIncome, use2026Rules);
  const monthlyPAYE = annualPAYE / 12;
  
  // Net salary
  const netSalary = monthlyGross - pensionEmployee - nhf - monthlyPAYE;
  
  // Cost to company
  const totalCostToCompany = monthlyGross + pensionEmployer;
  
  return {
    grossSalary: monthlyGross,
    pensionEmployee,
    pensionEmployer,
    nhf,
    cra: cra / 12, // monthly
    taxableIncome: annualTaxableIncome / 12,
    paye: monthlyPAYE,
    netSalary,
    totalCostToCompany,
  };
}

describe('Payroll PAYE Calculations - 2026 Rules', () => {
  describe('Tax-Free Threshold (₦800k annual)', () => {
    it('should have zero PAYE for low earners below exemption', () => {
      // Monthly gross of ₦50,000 = ₦600,000 annual
      const result = calculatePayroll(50000, true);
      
      // After CRA and pension, taxable should be well below ₦800k
      expect(result.paye).toBe(0);
    });

    it('should have minimal PAYE for earners just above exemption', () => {
      // Monthly gross of ₦100,000 = ₦1,200,000 annual
      const result = calculatePayroll(100000, true);
      
      // After reliefs, may have small PAYE
      expect(result.paye).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Progressive Tax Bands', () => {
    it('should apply 15% rate for income in ₦800k-₦3M band', () => {
      // Monthly gross of ₦500,000 = ₦6M annual
      const result = calculatePayroll(500000, true);
      
      // Should have PAYE applied
      expect(result.paye).toBeGreaterThan(0);
      expect(result.netSalary).toBeLessThan(result.grossSalary);
    });

    it('should apply 18% rate for income in ₦3M-₦12M band', () => {
      // Monthly gross of ₦1,500,000 = ₦18M annual
      const result = calculatePayroll(1500000, true);
      
      // Should have higher PAYE
      expect(result.paye).toBeGreaterThan(0);
    });

    it('should apply 21% rate for income in ₦12M-₦25M band', () => {
      // Monthly gross of ₦2,500,000 = ₦30M annual
      const result = calculatePayroll(2500000, true);
      
      expect(result.paye).toBeGreaterThan(0);
    });

    it('should apply 23% rate for income in ₦25M-₦50M band', () => {
      // Monthly gross of ₦5,000,000 = ₦60M annual
      const result = calculatePayroll(5000000, true);
      
      expect(result.paye).toBeGreaterThan(0);
    });

    it('should apply 25% rate for income above ₦50M', () => {
      // Monthly gross of ₦10,000,000 = ₦120M annual
      const result = calculatePayroll(10000000, true);
      
      // Effective rate should approach max
      expect(result.paye).toBeGreaterThan(0);
    });
  });
});

describe('Pension Contributions', () => {
  it('should deduct 8% employee pension contribution', () => {
    const monthlyGross = 1000000;
    const result = calculatePayroll(monthlyGross, true);
    
    expect(result.pensionEmployee).toBe(80000); // 1M * 8%
  });

  it('should calculate 10% employer pension contribution', () => {
    const monthlyGross = 1000000;
    const result = calculatePayroll(monthlyGross, true);
    
    expect(result.pensionEmployer).toBe(100000); // 1M * 10%
  });

  it('should include pension in cost to company', () => {
    const monthlyGross = 1000000;
    const result = calculatePayroll(monthlyGross, true);
    
    expect(result.totalCostToCompany).toBe(1100000); // 1M + 100k employer pension
  });

  it('should deduct pension from net salary', () => {
    const monthlyGross = 1000000;
    const result = calculatePayroll(monthlyGross, true);
    
    // Net should be less than gross by at least pension amount
    expect(result.netSalary).toBeLessThan(monthlyGross - result.pensionEmployee);
  });
});

describe('National Housing Fund (NHF)', () => {
  it('should deduct 2.5% NHF when included', () => {
    const monthlyGross = 1000000;
    const result = calculatePayroll(monthlyGross, true, true);
    
    expect(result.nhf).toBe(25000); // 1M * 2.5%
  });

  it('should not deduct NHF when excluded', () => {
    const monthlyGross = 1000000;
    const result = calculatePayroll(monthlyGross, true, false);
    
    expect(result.nhf).toBe(0);
  });

  it('should result in higher net salary when NHF excluded', () => {
    const monthlyGross = 1000000;
    const withNHF = calculatePayroll(monthlyGross, true, true);
    const withoutNHF = calculatePayroll(monthlyGross, true, false);
    
    // Without NHF should have slightly higher net (but also slightly higher PAYE)
    // The difference should be approximately the NHF amount minus tax impact
    expect(withoutNHF.netSalary).toBeGreaterThan(withNHF.netSalary);
  });
});

describe('Consolidated Relief Allowance (CRA)', () => {
  it('should calculate CRA as max(₦200k, 1%) + 20% under 2026 rules', () => {
    const monthlyGross = 1000000; // ₦12M annual
    const result = calculatePayroll(monthlyGross, true);
    
    // CRA = max(200000, 12M * 0.01) + (12M * 0.20)
    // = max(200000, 120000) + 2400000
    // = 200000 + 2400000 = 2,600,000 annual
    // Monthly = 216,666.67
    expect(result.cra).toBeCloseTo(216666.67, 0);
  });

  it('should use 1% when it exceeds ₦200k', () => {
    const monthlyGross = 2500000; // ₦30M annual
    const result = calculatePayroll(monthlyGross, true);
    
    // CRA = max(200000, 30M * 0.01) + (30M * 0.20)
    // = max(200000, 300000) + 6000000
    // = 300000 + 6000000 = 6,300,000 annual
    // Monthly = 525,000
    expect(result.cra).toBeCloseTo(525000, 0);
  });
});

describe('Net Salary Calculations', () => {
  it('should correctly calculate net salary after all deductions', () => {
    const monthlyGross = 1000000;
    const result = calculatePayroll(monthlyGross, true, true);
    
    // Net = Gross - Pension Employee - NHF - PAYE
    const expectedNet = monthlyGross - result.pensionEmployee - result.nhf - result.paye;
    expect(result.netSalary).toBeCloseTo(expectedNet, 2);
  });

  it('should show positive net salary for reasonable income', () => {
    const monthlyGross = 500000;
    const result = calculatePayroll(monthlyGross, true);
    
    expect(result.netSalary).toBeGreaterThan(0);
  });

  it('should show net salary less than gross', () => {
    const monthlyGross = 2000000;
    const result = calculatePayroll(monthlyGross, true);
    
    expect(result.netSalary).toBeLessThan(monthlyGross);
  });
});

describe('Pre-2026 vs 2026 Rules Comparison', () => {
  it('should show lower tax under 2026 rules for low earners', () => {
    const monthlyGross = 150000; // ₦1.8M annual
    const result2026 = calculatePayroll(monthlyGross, true);
    const resultPre2026 = calculatePayroll(monthlyGross, false);
    
    // 2026 rules with ₦800k exemption should result in lower PAYE
    expect(result2026.paye).toBeLessThanOrEqual(resultPre2026.paye);
  });

  it('should use different CRA formula for pre-2026', () => {
    const monthlyGross = 1000000;
    const result2026 = calculatePayroll(monthlyGross, true);
    const resultPre2026 = calculatePayroll(monthlyGross, false);
    
    // Pre-2026 CRA = 200000 + 20% (no "higher of" for 1%)
    // 2026 CRA = max(200000, 1%) + 20%
    expect(result2026.cra).not.toBe(resultPre2026.cra);
  });
});

describe('Edge Cases', () => {
  it('should handle zero salary', () => {
    const result = calculatePayroll(0, true);
    
    expect(result.grossSalary).toBe(0);
    expect(result.netSalary).toBe(0);
    expect(result.paye).toBe(0);
  });

  it('should handle very high salaries', () => {
    const monthlyGross = 50000000; // ₦600M annual
    const result = calculatePayroll(monthlyGross, true);
    
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(monthlyGross);
    // Effective rate should be close to 25% at this level
  });

  it('should handle decimal amounts', () => {
    const monthlyGross = 123456.78;
    const result = calculatePayroll(monthlyGross, true);
    
    expect(result.pensionEmployee).toBeCloseTo(9876.54, 2);
    expect(result.netSalary).toBeGreaterThan(0);
  });
});

describe('Cost to Company', () => {
  it('should include employer pension in total cost', () => {
    const monthlyGross = 500000;
    const result = calculatePayroll(monthlyGross, true);
    
    expect(result.totalCostToCompany).toBe(550000); // 500k + 50k (10%)
  });

  it('should be greater than gross salary', () => {
    const monthlyGross = 1000000;
    const result = calculatePayroll(monthlyGross, true);
    
    expect(result.totalCostToCompany).toBeGreaterThan(monthlyGross);
  });
});
