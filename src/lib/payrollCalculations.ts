// Nigerian Payroll Calculations - 2026 Rules
// Based on Nigeria Tax Act 2025

import {
  verifyPayrollCalculation,
  toVerificationData,
  logVerificationResults,
} from './taxValidators';
// Standard working hours per month (44 hours/week × 4 weeks)
export const STANDARD_MONTHLY_HOURS = 176;

// 2026 PIT Bands
export const PIT_BANDS_2026 = [
  { threshold: 800000, rate: 0 },
  { threshold: 3000000, rate: 0.15 },
  { threshold: 12000000, rate: 0.18 },
  { threshold: 25000000, rate: 0.21 },
  { threshold: 50000000, rate: 0.23 },
  { threshold: Infinity, rate: 0.25 },
];

// Pre-2026 PIT Bands
export const PIT_BANDS_PRE2026 = [
  { threshold: 300000, rate: 0.07 },
  { threshold: 600000, rate: 0.11 },
  { threshold: 1100000, rate: 0.15 },
  { threshold: 1600000, rate: 0.19 },
  { threshold: 3200000, rate: 0.21 },
  { threshold: Infinity, rate: 0.24 },
];

export interface PayrollInput {
  grossSalary: number;
  annualRent?: number;
  includeNHF?: boolean;
  use2026Rules?: boolean;
  overtimeHours?: number;
  overtimeMultiplier?: number;
  bonusAmount?: number;
  bonusIsTaxable?: boolean;
  unpaidLeaveDays?: number;
  workingDaysInMonth?: number;
}

export interface PayrollResult {
  grossSalary: number;
  adjustedGross: number;
  pensionEmployee: number;
  pensionEmployer: number;
  nhf: number;
  rentRelief: number;
  taxableIncome: number;
  paye: number;
  netSalary: number;
  totalCostToCompany: number;
  overtimeAmount: number;
  bonusAmount: number;
  leaveDeduction: number;
  breakdown: PayrollBreakdownItem[];
  verification?: import('@/types/verification').VerificationData;
}

export interface PayrollBreakdownItem {
  label: string;
  amount: number;
  type: 'earning' | 'deduction' | 'contribution' | 'tax' | 'relief';
}

/**
 * Calculate annual PIT using progressive bands
 */
export function calculateAnnualPIT(annualTaxableIncome: number, use2026Rules: boolean): number {
  const bands = use2026Rules ? PIT_BANDS_2026 : PIT_BANDS_PRE2026;
  let remainingIncome = annualTaxableIncome;
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

/**
 * Calculate monthly PAYE from annual taxable income
 */
export function calculateMonthlyPAYE(annualTaxableIncome: number, use2026Rules: boolean): number {
  return calculateAnnualPIT(annualTaxableIncome, use2026Rules) / 12;
}

/**
 * Calculate hourly rate from monthly gross
 */
export function calculateHourlyRate(monthlyGross: number): number {
  return monthlyGross / STANDARD_MONTHLY_HOURS;
}

/**
 * Calculate overtime pay
 */
export function calculateOvertimePay(
  monthlyGross: number,
  hours: number,
  multiplier: number = 1.5
): number {
  const hourlyRate = calculateHourlyRate(monthlyGross);
  return hours * hourlyRate * multiplier;
}

/**
 * Calculate pro-rated salary for partial month (leave deductions)
 */
export function calculateLeaveDeduction(
  monthlyGross: number,
  unpaidLeaveDays: number,
  workingDaysInMonth: number = 22
): number {
  const dailyRate = monthlyGross / workingDaysInMonth;
  return unpaidLeaveDays * dailyRate;
}

/**
 * Main payroll calculation function
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
  const {
    grossSalary,
    annualRent = 0,
    includeNHF = true,
    use2026Rules = true,
    overtimeHours = 0,
    overtimeMultiplier = 1.5,
    bonusAmount = 0,
    bonusIsTaxable = true,
    unpaidLeaveDays = 0,
    workingDaysInMonth = 22,
  } = input;

  const breakdown: PayrollBreakdownItem[] = [];

  // Calculate overtime
  const overtimeAmount = calculateOvertimePay(grossSalary, overtimeHours, overtimeMultiplier);
  
  // Calculate leave deduction
  const leaveDeduction = calculateLeaveDeduction(grossSalary, unpaidLeaveDays, workingDaysInMonth);
  
  // Adjusted gross (after leave deduction)
  const adjustedGross = grossSalary - leaveDeduction + overtimeAmount;
  
  // Pension only on base salary (not OT or bonus)
  const pensionEmployee = grossSalary * 0.08;
  const pensionEmployer = grossSalary * 0.10;
  
  // NHF
  const nhf = includeNHF ? grossSalary * 0.025 : 0;
  
  // Annual calculations
  const annualGross = adjustedGross * 12;
  const annualBonus = bonusIsTaxable ? bonusAmount * 12 : 0;
  
  // Rent Relief (2026 rules) or CRA (pre-2026)
  let rentRelief = 0;
  if (use2026Rules) {
    rentRelief = Math.min(annualRent * 0.20, 500000) / 12;
  } else {
    const cra = Math.max(200000, annualGross * 0.01) + (annualGross * 0.20);
    rentRelief = cra / 12;
  }
  
  // Annual reliefs
  const annualPension = pensionEmployee * 12;
  const annualNHF = nhf * 12;
  const annualRentRelief = rentRelief * 12;
  
  // Taxable income
  const annualTaxableIncome = Math.max(0, annualGross + annualBonus - annualRentRelief - annualPension - annualNHF);
  const monthlyTaxableIncome = annualTaxableIncome / 12;
  
  // PAYE
  const paye = calculateMonthlyPAYE(annualTaxableIncome, use2026Rules);
  
  // Non-taxable bonus
  const nonTaxableBonus = bonusIsTaxable ? 0 : bonusAmount;
  
  // Net salary
  const netSalary = adjustedGross + nonTaxableBonus + bonusAmount - pensionEmployee - nhf - paye;
  
  // Total cost to company
  const totalCostToCompany = adjustedGross + bonusAmount + pensionEmployer;
  
  // Build breakdown
  if (leaveDeduction > 0) {
    breakdown.push({ label: 'Leave Deduction', amount: -leaveDeduction, type: 'deduction' });
  }
  
  if (overtimeAmount > 0) {
    breakdown.push({ label: `Overtime (${overtimeHours}h × ${overtimeMultiplier}x)`, amount: overtimeAmount, type: 'earning' });
  }
  
  if (bonusAmount > 0) {
    breakdown.push({ 
      label: bonusIsTaxable ? 'Bonus (Taxable)' : 'Bonus (Non-taxable)', 
      amount: bonusAmount, 
      type: 'earning' 
    });
  }
  
  breakdown.push({ label: 'Pension (Employee 8%)', amount: pensionEmployee, type: 'deduction' });
  breakdown.push({ label: 'Pension (Employer 10%)', amount: pensionEmployer, type: 'contribution' });
  
  if (includeNHF) {
    breakdown.push({ label: 'NHF (2.5%)', amount: nhf, type: 'deduction' });
  }
  
  breakdown.push({ 
    label: use2026Rules ? 'Rent Relief (Monthly)' : 'CRA (Monthly)', 
    amount: rentRelief, 
    type: 'relief' 
  });
  
  breakdown.push({ label: 'PAYE', amount: paye, type: 'tax' });

  // Run verification
  const preliminaryResult = {
    grossSalary,
    adjustedGross,
    pensionEmployee,
    pensionEmployer,
    nhf,
    rentRelief,
    taxableIncome: monthlyTaxableIncome,
    paye,
    netSalary,
    totalCostToCompany,
    overtimeAmount,
    bonusAmount: bonusIsTaxable ? bonusAmount : nonTaxableBonus,
    leaveDeduction,
    breakdown,
  };
  
  const verificationReport = verifyPayrollCalculation(input, preliminaryResult as PayrollResult);
  logVerificationResults(verificationReport, 'Payroll');
  
  return {
    ...preliminaryResult,
    verification: toVerificationData(verificationReport),
  };
}

// Alias for backwards compatibility
export const calculatePayrollWithExtras = calculatePayroll;

/**
 * Calculate bulk payroll for multiple employees
 */
export function calculateBulkPayroll(
  employees: PayrollInput[]
): { results: PayrollResult[]; totals: PayrollTotals } {
  const results = employees.map(emp => calculatePayroll(emp));
  
  const totals = results.reduce((acc, result) => ({
    totalGross: acc.totalGross + result.grossSalary,
    totalNet: acc.totalNet + result.netSalary,
    totalPAYE: acc.totalPAYE + result.paye,
    totalPensionEmployee: acc.totalPensionEmployee + result.pensionEmployee,
    totalPensionEmployer: acc.totalPensionEmployer + result.pensionEmployer,
    totalNHF: acc.totalNHF + result.nhf,
    totalOvertime: acc.totalOvertime + result.overtimeAmount,
    totalBonuses: acc.totalBonuses + result.bonusAmount,
    totalLeaveDeductions: acc.totalLeaveDeductions + result.leaveDeduction,
    totalCostToCompany: acc.totalCostToCompany + result.totalCostToCompany,
  }), {
    totalGross: 0,
    totalNet: 0,
    totalPAYE: 0,
    totalPensionEmployee: 0,
    totalPensionEmployer: 0,
    totalNHF: 0,
    totalOvertime: 0,
    totalBonuses: 0,
    totalLeaveDeductions: 0,
    totalCostToCompany: 0,
  });
  
  return { results, totals };
}

export interface PayrollTotals {
  totalGross: number;
  totalNet: number;
  totalPAYE: number;
  totalPensionEmployee: number;
  totalPensionEmployer: number;
  totalNHF: number;
  totalOvertime: number;
  totalBonuses: number;
  totalLeaveDeductions: number;
  totalCostToCompany: number;
}

/**
 * Format currency for display
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse formatted number to raw number
 */
export function parseFormattedNumber(value: string): number {
  return Number(value.replace(/[^0-9.-]/g, '')) || 0;
}

/**
 * Format number with commas
 */
export function formatNumberWithCommas(value: number): string {
  return value.toLocaleString('en-NG');
}
