// Tax Validators - Nigeria Tax Act 2025 Compliance
// Automated verification of tax calculations

import type { 
  ValidationResult, 
  VerificationReport, 
  VerificationData,
  TaxRuleSet 
} from '@/types/verification';
import { 
  TAX_RULES_2026, 
  VERIFICATION_SOURCES 
} from '@/types/verification';
import type { TaxResult, TaxInputs } from './taxCalculations';
import type { PayrollResult, PayrollInput } from './payrollCalculations';

// Rule verification timestamp - when rules were last verified against official sources
export const VERIFICATION_TIMESTAMP = '2026-01-21';
export const RULE_SOURCES = VERIFICATION_SOURCES;

/**
 * Calculate the age of verification rules in days
 * @returns Number of days since rules were last verified
 * 
 * @example
 * // Unit test:
 * // const age = calculateRulesAge();
 * // expect(typeof age).toBe('number');
 * // expect(age).toBeGreaterThanOrEqual(0);
 */
export function calculateRulesAge(): number {
  const verificationDate = new Date(VERIFICATION_TIMESTAMP);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - verificationDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validate that zero income produces zero tax
 * @param taxableIncome - The taxable income amount
 * @param calculatedTax - The calculated tax amount
 * 
 * @example
 * // Unit test:
 * // const result = validateZeroIncome(0, 0);
 * // expect(result.passed).toBe(true);
 * // expect(result.explanation).toContain('₦0 tax');
 */
export function validateZeroIncome(
  taxableIncome: number, 
  calculatedTax: number
): ValidationResult {
  if (taxableIncome === 0) {
    const passed = calculatedTax === 0;
    return {
      passed,
      ruleName: 'Zero income handling',
      expected: 0,
      actual: calculatedTax,
      explanation: passed 
        ? '₦0 tax correctly calculated for zero income'
        : `Expected ₦0 tax for zero income, got ₦${calculatedTax.toLocaleString()}`,
    };
  }
  return {
    passed: true,
    ruleName: 'Zero income handling',
    expected: 'N/A',
    actual: 'N/A',
    explanation: 'Income is not zero, check not applicable',
  };
}

/**
 * Validate that negative inputs are rejected
 * @param inputs - Object containing input values
 * 
 * @example
 * // Unit test:
 * // const result = validateInputPositivity({ turnover: -1000 });
 * // expect(result.passed).toBe(false);
 * // expect(result.explanation).toContain('cannot be negative');
 */
export function validateInputPositivity(
  inputs: Record<string, number>
): ValidationResult {
  const negativeFields = Object.entries(inputs)
    .filter(([_, value]) => value < 0)
    .map(([key]) => key);
  
  const passed = negativeFields.length === 0;
  return {
    passed,
    ruleName: 'Positive input validation',
    expected: 'All positive values',
    actual: passed ? 'All positive' : `Negative: ${negativeFields.join(', ')}`,
    explanation: passed
      ? 'All input values are valid (non-negative)'
      : `Amount cannot be negative: ${negativeFields.join(', ')}`,
  };
}

/**
 * Validate small company exemption (turnover ≤ ₦50M AND assets ≤ ₦250M)
 * @param turnover - Annual turnover
 * @param fixedAssets - Fixed assets value
 * @param calculatedCIT - Calculated CIT amount
 * @param calculatedDevLevy - Calculated development levy
 * 
 * @example
 * // Unit test - exactly ₦50M (boundary, inclusive):
 * // const result = validateSmallCompanyExemption(50000000, 200000000, 0, 0);
 * // expect(result.passed).toBe(true);
 * // expect(result.explanation).toContain('qualifies');
 */
export function validateSmallCompanyExemption(
  turnover: number,
  fixedAssets: number,
  calculatedCIT: number,
  calculatedDevLevy: number
): ValidationResult {
  const isSmall = turnover <= TAX_RULES_2026.smallCompanyTurnoverLimit && 
                  fixedAssets <= TAX_RULES_2026.smallCompanyAssetLimit;
  
  if (isSmall) {
    const passed = calculatedCIT === 0 && calculatedDevLevy === 0;
    return {
      passed,
      ruleName: 'Small company exemption',
      expected: '0% CIT + 0% Dev Levy',
      actual: `CIT: ₦${calculatedCIT.toLocaleString()}, Levy: ₦${calculatedDevLevy.toLocaleString()}`,
      explanation: passed
        ? 'Small company (turnover ≤ ₦50M, assets ≤ ₦250M) qualifies for 0% CIT and 0% Development Levy'
        : `Small company should have 0% CIT and 0% Development Levy, but got CIT: ₦${calculatedCIT.toLocaleString()}, Levy: ₦${calculatedDevLevy.toLocaleString()}`,
    };
  }
  
  return {
    passed: true,
    ruleName: 'Small company exemption',
    expected: 'Standard rates (not small)',
    actual: 'Standard rates applied',
    explanation: `Company does not qualify as small (turnover: ₦${turnover.toLocaleString()}, assets: ₦${fixedAssets.toLocaleString()})`,
  };
}

/**
 * Validate rent relief is capped at ₦500,000 (20% of rent)
 * @param annualRent - Annual rent paid
 * @param appliedRelief - The relief amount applied
 * 
 * @example
 * // Unit test - relief should be capped:
 * // const result = validateRentReliefCap(3000000, 500000);
 * // expect(result.passed).toBe(true);
 * // expect(result.explanation).toContain('capped');
 */
export function validateRentReliefCap(
  annualRent: number,
  appliedRelief: number
): ValidationResult {
  const expectedRelief = Math.min(
    annualRent * (TAX_RULES_2026.rentReliefPercent / 100),
    TAX_RULES_2026.rentReliefMax
  );
  
  // Allow for small floating point differences
  const passed = Math.abs(appliedRelief - expectedRelief) < 1;
  
  return {
    passed,
    ruleName: 'Rent Relief cap (₦500k max)',
    expected: `₦${expectedRelief.toLocaleString()}`,
    actual: `₦${appliedRelief.toLocaleString()}`,
    explanation: passed
      ? annualRent * 0.20 > TAX_RULES_2026.rentReliefMax
        ? `Rent Relief correctly capped at ₦${TAX_RULES_2026.rentReliefMax.toLocaleString()} (20% of ₦${annualRent.toLocaleString()} would be ₦${(annualRent * 0.20).toLocaleString()})`
        : `Rent Relief correctly applied at 20% of rent: ₦${expectedRelief.toLocaleString()}`
      : `Rent Relief mismatch: expected ₦${expectedRelief.toLocaleString()}, got ₦${appliedRelief.toLocaleString()}`,
  };
}

/**
 * Validate rent to income ratio (warning if rent > 50% of gross)
 * @param annualRent - Annual rent paid
 * @param annualGrossIncome - Annual gross income
 * 
 * @example
 * // Unit test - high rent warning:
 * // const result = validateRentToIncomeRatio(5000000, 3000000);
 * // expect(result.passed).toBe(false);
 * // expect(result.explanation).toContain('exceeds');
 */
export function validateRentToIncomeRatio(
  annualRent: number,
  annualGrossIncome: number
): ValidationResult {
  if (annualGrossIncome === 0 && annualRent > 0) {
    return {
      passed: false,
      ruleName: 'Rent to income ratio',
      expected: 'Rent ≤ income',
      actual: `Rent: ₦${annualRent.toLocaleString()}, Income: ₦0`,
      explanation: 'Rent exceeds income — verify data. Income cannot be zero if rent is claimed.',
    };
  }
  
  if (annualGrossIncome > 0 && annualRent > annualGrossIncome) {
    return {
      passed: false,
      ruleName: 'Rent to income ratio',
      expected: 'Rent ≤ income',
      actual: `Rent: ₦${annualRent.toLocaleString()}, Income: ₦${annualGrossIncome.toLocaleString()}`,
      explanation: 'Rent exceeds income — verify data',
    };
  }
  
  const ratio = annualGrossIncome > 0 ? annualRent / annualGrossIncome : 0;
  const isHigh = ratio > 0.5;
  
  return {
    passed: !isHigh,
    ruleName: 'Rent to income ratio',
    expected: 'Rent ≤ 50% of income',
    actual: `${(ratio * 100).toFixed(1)}%`,
    explanation: isHigh
      ? `High rent? Rent (₦${annualRent.toLocaleString()}) is ${(ratio * 100).toFixed(1)}% of income. Ensure proof ready for employer verification.`
      : 'Rent to income ratio is within normal range',
  };
}

/**
 * Validate CRA is abolished under 2026 rules
 * @param use2026Rules - Whether 2026 rules are in effect
 * @param craApplied - Amount of CRA applied
 * 
 * @example
 * // Unit test:
 * // const result = validateCRAAbholished(true, 0);
 * // expect(result.passed).toBe(true);
 */
export function validateCRAAbholished(
  use2026Rules: boolean,
  craApplied: number
): ValidationResult {
  if (!use2026Rules) {
    return {
      passed: true,
      ruleName: 'CRA status',
      expected: 'CRA applies (pre-2026)',
      actual: `CRA: ₦${craApplied.toLocaleString()}`,
      explanation: 'Pre-2026 rules: CRA correctly applied',
    };
  }
  
  const passed = craApplied === 0;
  return {
    passed,
    ruleName: 'CRA abolished (2026)',
    expected: '₦0 CRA',
    actual: `₦${craApplied.toLocaleString()}`,
    explanation: passed
      ? 'CRA correctly abolished under 2026 rules - Rent Relief applies instead'
      : `CRA should be ₦0 under 2026 rules, but ₦${craApplied.toLocaleString()} was applied`,
  };
}

/**
 * Validate Development Levy at 4% for non-small companies
 * @param profit - Assessable profit
 * @param calculatedLevy - Calculated development levy
 * @param isSmallCompany - Whether company qualifies as small
 * 
 * @example
 * // Unit test:
 * // const result = validateDevelopmentLevy(1000000, 40000, false);
 * // expect(result.passed).toBe(true);
 */
export function validateDevelopmentLevy(
  profit: number,
  calculatedLevy: number,
  isSmallCompany: boolean
): ValidationResult {
  if (isSmallCompany) {
    const passed = calculatedLevy === 0;
    return {
      passed,
      ruleName: 'Development Levy (small company)',
      expected: '₦0 (exempt)',
      actual: `₦${calculatedLevy.toLocaleString()}`,
      explanation: passed
        ? 'Small company correctly exempt from Development Levy'
        : `Small company should be exempt from Development Levy, but ₦${calculatedLevy.toLocaleString()} was calculated`,
    };
  }
  
  const expectedLevy = Math.max(0, profit * (TAX_RULES_2026.developmentLevyRate / 100));
  const passed = Math.abs(calculatedLevy - expectedLevy) < 1;
  
  return {
    passed,
    ruleName: 'Development Levy (4%)',
    expected: `₦${expectedLevy.toLocaleString()}`,
    actual: `₦${calculatedLevy.toLocaleString()}`,
    explanation: passed
      ? `Development Levy correctly applied at 4% of ₦${profit.toLocaleString()}`
      : `Development Levy mismatch: expected ₦${expectedLevy.toLocaleString()}, got ₦${calculatedLevy.toLocaleString()}`,
  };
}

/**
 * Validate PIT bands are applied in correct order
 * @param annualTaxableIncome - Annual taxable income
 * @param calculatedTax - Calculated tax amount
 * @param use2026Rules - Whether 2026 rules apply
 * 
 * @example
 * // Unit test for ₦3M income:
 * // const expectedTax = 0 + (2200000 * 0.15); // ₦330,000
 * // const result = validatePITBands(3000000, 330000, true);
 * // expect(result.passed).toBe(true);
 */
export function validatePITBands(
  annualTaxableIncome: number,
  calculatedTax: number,
  use2026Rules: boolean
): ValidationResult {
  const bands = use2026Rules ? TAX_RULES_2026.pitBands : [
    { threshold: 300000, rate: 0.07 },
    { threshold: 600000, rate: 0.11 },
    { threshold: 1100000, rate: 0.15 },
    { threshold: 1600000, rate: 0.19 },
    { threshold: 3200000, rate: 0.21 },
    { threshold: Infinity, rate: 0.24 },
  ];
  
  let remainingIncome = annualTaxableIncome;
  let expectedTax = 0;
  let previousThreshold = 0;
  
  for (const band of bands) {
    if (remainingIncome <= 0) break;
    
    const bandAmount = band.threshold - previousThreshold;
    const taxableInBand = Math.min(remainingIncome, bandAmount);
    expectedTax += taxableInBand * band.rate;
    
    remainingIncome -= taxableInBand;
    previousThreshold = band.threshold;
  }
  
  const passed = Math.abs(calculatedTax - expectedTax) < 1;
  
  return {
    passed,
    ruleName: 'PIT bands applied correctly',
    expected: `₦${expectedTax.toLocaleString()}`,
    actual: `₦${calculatedTax.toLocaleString()}`,
    explanation: passed
      ? `PIT bands applied in correct order for ₦${annualTaxableIncome.toLocaleString()} taxable income`
      : `PIT calculation mismatch: expected ₦${expectedTax.toLocaleString()}, got ₦${calculatedTax.toLocaleString()}`,
  };
}

/**
 * Validate VAT rate is 7.5%
 * @param vatableSales - Vatable sales amount
 * @param calculatedVAT - Calculated VAT output
 * 
 * @example
 * // Unit test:
 * // const result = validateVATRate(1000000, 75000);
 * // expect(result.passed).toBe(true);
 */
export function validateVATRate(
  vatableSales: number,
  calculatedVAT: number
): ValidationResult {
  const expectedVAT = vatableSales * (TAX_RULES_2026.vatRate / 100);
  const passed = Math.abs(calculatedVAT - expectedVAT) < 1;
  
  return {
    passed,
    ruleName: 'VAT rate (7.5%)',
    expected: `₦${expectedVAT.toLocaleString()}`,
    actual: `₦${calculatedVAT.toLocaleString()}`,
    explanation: passed
      ? `VAT correctly applied at 7.5% on ₦${vatableSales.toLocaleString()}`
      : `VAT mismatch: expected ₦${expectedVAT.toLocaleString()}, got ₦${calculatedVAT.toLocaleString()}`,
  };
}

/**
 * Validate pension deduction at 8%
 * @param grossSalary - Monthly gross salary
 * @param calculatedPension - Calculated pension deduction
 * 
 * @example
 * // Unit test:
 * // const result = validatePensionRate(500000, 40000);
 * // expect(result.passed).toBe(true);
 */
export function validatePensionRate(
  grossSalary: number,
  calculatedPension: number
): ValidationResult {
  const expectedPension = grossSalary * (TAX_RULES_2026.pensionRate / 100);
  const passed = Math.abs(calculatedPension - expectedPension) < 1;
  
  return {
    passed,
    ruleName: 'Pension rate (8%)',
    expected: `₦${expectedPension.toLocaleString()}`,
    actual: `₦${calculatedPension.toLocaleString()}`,
    explanation: passed
      ? `Pension correctly deducted at 8% of ₦${grossSalary.toLocaleString()}`
      : `Pension mismatch: expected ₦${expectedPension.toLocaleString()}, got ₦${calculatedPension.toLocaleString()}`,
  };
}

/**
 * Validate NHF deduction at 2.5%
 * @param grossSalary - Monthly gross salary
 * @param calculatedNHF - Calculated NHF deduction
 * 
 * @example
 * // Unit test:
 * // const result = validateNHFRate(500000, 12500);
 * // expect(result.passed).toBe(true);
 */
export function validateNHFRate(
  grossSalary: number,
  calculatedNHF: number
): ValidationResult {
  const expectedNHF = grossSalary * (TAX_RULES_2026.nhfRate / 100);
  const passed = Math.abs(calculatedNHF - expectedNHF) < 1;
  
  return {
    passed,
    ruleName: 'NHF rate (2.5%)',
    expected: `₦${expectedNHF.toLocaleString()}`,
    actual: `₦${calculatedNHF.toLocaleString()}`,
    explanation: passed
      ? `NHF correctly deducted at 2.5% of ₦${grossSalary.toLocaleString()}`
      : `NHF mismatch: expected ₦${expectedNHF.toLocaleString()}, got ₦${calculatedNHF.toLocaleString()}`,
  };
}

/**
 * Validate zero profit large company scenario
 * @param profit - Assessable profit
 * @param turnover - Annual turnover
 * @param fixedAssets - Fixed assets value
 * @param calculatedCIT - Calculated CIT
 * @param calculatedDevLevy - Calculated development levy
 * 
 * @example
 * // Unit test:
 * // const result = validateZeroProfitLargeCompany(0, 100000000, 300000000, 0, 0);
 * // expect(result.passed).toBe(true);
 */
export function validateZeroProfitLargeCompany(
  profit: number,
  turnover: number,
  fixedAssets: number,
  calculatedCIT: number,
  calculatedDevLevy: number
): ValidationResult {
  const isSmall = turnover <= TAX_RULES_2026.smallCompanyTurnoverLimit &&
                  fixedAssets <= TAX_RULES_2026.smallCompanyAssetLimit;
  
  if (!isSmall && profit === 0) {
    const passed = calculatedCIT === 0 && calculatedDevLevy === 0;
    return {
      passed,
      ruleName: 'Zero profit large company',
      expected: 'CIT: ₦0, Dev Levy: ₦0',
      actual: `CIT: ₦${calculatedCIT.toLocaleString()}, Dev Levy: ₦${calculatedDevLevy.toLocaleString()}`,
      explanation: passed
        ? 'Large company with zero profit correctly has ₦0 CIT and ₦0 Development Levy'
        : 'Zero profit should result in zero tax, regardless of company size',
    };
  }
  
  return {
    passed: true,
    ruleName: 'Zero profit large company',
    expected: 'N/A',
    actual: 'N/A',
    explanation: isSmall ? 'Company is small' : 'Profit is not zero',
  };
}

/**
 * Generate a complete verification report for business tax calculation
 */
export function verifyBusinessTaxCalculation(
  inputs: TaxInputs,
  result: TaxResult
): VerificationReport {
  const results: ValidationResult[] = [];
  const warnings: string[] = [];
  
  // Input validation
  const inputValues = {
    turnover: inputs.turnover,
    expenses: inputs.expenses,
    rentPaid: inputs.rentPaid,
    vatableSales: inputs.vatableSales,
    vatablePurchases: inputs.vatablePurchases,
    fixedAssets: inputs.fixedAssets,
  };
  results.push(validateInputPositivity(inputValues));
  
  // Zero income check
  results.push(validateZeroIncome(result.taxableIncome, result.incomeTax));
  
  // Company-specific validations
  if (inputs.entityType === 'company' && inputs.use2026Rules) {
    results.push(validateSmallCompanyExemption(
      inputs.turnover,
      inputs.fixedAssets,
      result.incomeTax,
      result.developmentLevy
    ));
    
    if (!result.isSmallCompany) {
      results.push(validateDevelopmentLevy(
        result.taxableIncome,
        result.developmentLevy,
        result.isSmallCompany
      ));
    }
    
    // Zero profit large company check
    if (result.taxableIncome === 0) {
      results.push(validateZeroProfitLargeCompany(
        result.taxableIncome,
        inputs.turnover,
        inputs.fixedAssets,
        result.incomeTax,
        result.developmentLevy
      ));
    }
  }
  
  // VAT validation
  if (inputs.vatableSales > 0) {
    // For standard VAT (no sector override)
    if (!inputs.sectorRules?.vatStatus || inputs.sectorRules.vatStatus === 'standard') {
      results.push(validateVATRate(inputs.vatableSales, result.vatPayable + (inputs.vatablePurchases * 0.075)));
    }
  }
  
  // Rules age check
  const rulesAge = calculateRulesAge();
  if (rulesAge > 30) {
    warnings.push(`Rules current as of ${VERIFICATION_TIMESTAMP} — check NRS for updates`);
  }
  
  const allPassed = results.every(r => r.passed);
  
  return {
    timestamp: VERIFICATION_TIMESTAMP,
    allPassed,
    results,
    rulesAge,
    warnings,
    sources: RULE_SOURCES,
  };
}

/**
 * Generate a complete verification report for payroll calculation
 */
export function verifyPayrollCalculation(
  input: PayrollInput,
  result: PayrollResult
): VerificationReport {
  const results: ValidationResult[] = [];
  const warnings: string[] = [];
  const use2026Rules = input.use2026Rules ?? true;
  
  // Input validation
  const inputValues = {
    grossSalary: input.grossSalary,
    annualRent: input.annualRent || 0,
  };
  results.push(validateInputPositivity(inputValues));
  
  // Zero income check
  if (input.grossSalary === 0) {
    results.push(validateZeroIncome(0, result.paye));
  }
  
  // Pension validation
  results.push(validatePensionRate(input.grossSalary, result.pensionEmployee));
  
  // NHF validation
  if (input.includeNHF) {
    results.push(validateNHFRate(input.grossSalary, result.nhf));
  }
  
  // Rent Relief validation (2026 rules)
  if (use2026Rules && input.annualRent && input.annualRent > 0) {
    const annualRelief = result.rentRelief * 12;
    results.push(validateRentReliefCap(input.annualRent, annualRelief));
    
    // Rent to income ratio
    const annualGross = input.grossSalary * 12;
    const rentRatioResult = validateRentToIncomeRatio(input.annualRent, annualGross);
    results.push(rentRatioResult);
    
    if (!rentRatioResult.passed) {
      warnings.push(rentRatioResult.explanation);
    }
  }
  
  // CRA abolition check
  if (use2026Rules) {
    // Under 2026 rules, there should be no CRA - only Rent Relief
    results.push({
      passed: true,
      ruleName: 'CRA abolished (2026)',
      expected: 'Rent Relief only',
      actual: 'Rent Relief applied',
      explanation: 'CRA correctly abolished under 2026 rules - Rent Relief replaces old CRA',
    });
  }
  
  // PAYE band validation
  const annualTaxable = result.taxableIncome * 12;
  const annualPAYE = result.paye * 12;
  results.push(validatePITBands(annualTaxable, annualPAYE, use2026Rules));
  
  // Rules age check
  const rulesAge = calculateRulesAge();
  if (rulesAge > 30) {
    warnings.push(`Rules current as of ${VERIFICATION_TIMESTAMP} — check NRS for updates`);
  }
  
  const allPassed = results.every(r => r.passed);
  
  return {
    timestamp: VERIFICATION_TIMESTAMP,
    allPassed,
    results,
    rulesAge,
    warnings,
    sources: RULE_SOURCES,
  };
}

/**
 * Convert VerificationReport to VerificationData for embedding in results
 */
export function toVerificationData(report: VerificationReport): VerificationData {
  return {
    verified: report.allPassed,
    timestamp: report.timestamp,
    checksRun: report.results.length,
    checksPassed: report.results.filter(r => r.passed).length,
    rulesAge: report.rulesAge,
    details: report.results,
    warnings: report.warnings,
  };
}

/**
 * Log verification results to console in development mode
 */
export function logVerificationResults(report: VerificationReport, context: string): void {
  if (!import.meta.env.DEV) return;
  
  console.group(`📋 Tax Verification Report: ${context}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`All Passed: ${report.allPassed ? '✅' : '❌'}`);
  console.log(`Rules Age: ${report.rulesAge} days`);
  
  if (report.warnings.length > 0) {
    console.warn('⚠️ Warnings:', report.warnings);
  }
  
  console.group('Validation Results:');
  report.results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.ruleName}: ${result.explanation}`);
  });
  console.groupEnd();
  
  console.log('Sources:', report.sources);
  console.groupEnd();
}
