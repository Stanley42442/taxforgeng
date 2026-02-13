// Reverse Salary (Net-to-Gross) Calculator - 2026 Nigeria Tax Act
// Uses iterative binary search to find gross salary from desired net pay

interface ReverseSalaryInputs {
  desiredNetPay: number;
  use2026Rules: boolean;
  pensionRate: number; // e.g. 0.08 for 8%
  includeNHF: boolean; // 2.5% of basic
  includeNHIS: boolean;
  nhisAmount: number; // fixed annual amount
  annualRent: number; // for rent relief
  lifeInsurance: number;
  mortgageInterest: number;
}

interface DeductionBreakdown {
  name: string;
  amount: number;
  description: string;
}

interface ReverseSalaryResult {
  grossSalary: number;
  netPay: number;
  totalDeductions: number;
  totalTax: number;
  effectiveRate: number;
  deductions: DeductionBreakdown[];
  taxBands: { band: string; rate: number; taxableAmount: number; tax: number }[];
  converged: boolean;
}

// 2026 PIT bands
const PIT_BANDS_2026 = [
  { threshold: 800000, rate: 0 },
  { threshold: 3000000, rate: 0.15 },
  { threshold: 12000000, rate: 0.18 },
  { threshold: 25000000, rate: 0.21 },
  { threshold: 50000000, rate: 0.23 },
  { threshold: Infinity, rate: 0.25 },
];

// Pre-2026 PIT bands
const PIT_BANDS_PRE2026 = [
  { threshold: 300000, rate: 0.07 },
  { threshold: 600000, rate: 0.11 },
  { threshold: 1100000, rate: 0.15 },
  { threshold: 1600000, rate: 0.19 },
  { threshold: 3200000, rate: 0.21 },
  { threshold: Infinity, rate: 0.24 },
];

function calculateNetFromGross(gross: number, inputs: ReverseSalaryInputs): {
  net: number;
  deductions: DeductionBreakdown[];
  taxBands: { band: string; rate: number; taxableAmount: number; tax: number }[];
  totalTax: number;
} {
  const bands = inputs.use2026Rules ? PIT_BANDS_2026 : PIT_BANDS_PRE2026;
  const deductions: DeductionBreakdown[] = [];
  let totalReliefs = 0;
  let totalStatutoryDeductions = 0;

  // Pension (employee contribution)
  const pension = gross * inputs.pensionRate;
  if (pension > 0) {
    deductions.push({ name: 'Pension (Employee)', amount: pension, description: `${(inputs.pensionRate * 100).toFixed(0)}% of gross` });
    totalStatutoryDeductions += pension;
    // Pension is also a tax relief (up to 8%)
    const pensionRelief = Math.min(pension, gross * 0.08);
    totalReliefs += pensionRelief;
  }

  // NHF
  if (inputs.includeNHF) {
    const nhf = gross * 0.025;
    deductions.push({ name: 'NHF', amount: nhf, description: '2.5% of gross' });
    totalStatutoryDeductions += nhf;
    totalReliefs += nhf;
  }

  // NHIS
  if (inputs.includeNHIS && inputs.nhisAmount > 0) {
    deductions.push({ name: 'NHIS/Health Insurance', amount: inputs.nhisAmount, description: 'Annual premium' });
    totalStatutoryDeductions += inputs.nhisAmount;
    if (inputs.use2026Rules) totalReliefs += inputs.nhisAmount;
  }

  // Life Insurance
  if (inputs.lifeInsurance > 0) {
    deductions.push({ name: 'Life Insurance', amount: inputs.lifeInsurance, description: 'Annual premium' });
    totalReliefs += inputs.lifeInsurance;
  }

  // Rent Relief (2026 only)
  if (inputs.use2026Rules && inputs.annualRent > 0) {
    const rentRelief = Math.min(inputs.annualRent * 0.20, 500000);
    totalReliefs += rentRelief;
  }

  // Mortgage Interest (2026 only)
  if (inputs.use2026Rules && inputs.mortgageInterest > 0) {
    totalReliefs += inputs.mortgageInterest;
  }

  // Pre-2026 CRA
  if (!inputs.use2026Rules) {
    const cra = Math.max(200000, gross * 0.01) + (gross * 0.20);
    totalReliefs += cra;
  }

  // Calculate taxable income
  const taxableIncome = Math.max(0, gross - totalReliefs);

  // Progressive tax
  let remainingIncome = taxableIncome;
  let totalTax = 0;
  let previousThreshold = 0;
  const taxBands: { band: string; rate: number; taxableAmount: number; tax: number }[] = [];

  for (const band of bands) {
    if (remainingIncome <= 0) break;
    const bandAmount = band.threshold - previousThreshold;
    const taxableInBand = Math.min(remainingIncome, bandAmount);
    const taxInBand = taxableInBand * band.rate;

    taxBands.push({
      band: `₦${(previousThreshold / 1000000).toFixed(1)}M - ${band.threshold === Infinity ? '∞' : `₦${(band.threshold / 1000000).toFixed(1)}M`}`,
      rate: band.rate * 100,
      taxableAmount: taxableInBand,
      tax: taxInBand,
    });

    totalTax += taxInBand;
    remainingIncome -= taxableInBand;
    previousThreshold = band.threshold;
  }

  deductions.push({ name: 'Income Tax (PIT)', amount: totalTax, description: `Progressive rates on ₦${(taxableIncome / 1000000).toFixed(2)}M taxable` });

  const net = gross - totalStatutoryDeductions - totalTax;
  return { net, deductions, taxBands, totalTax };
}

export function calculateReverseSalary(inputs: ReverseSalaryInputs): ReverseSalaryResult {
  const target = inputs.desiredNetPay;
  
  if (target <= 0) {
    return {
      grossSalary: 0, netPay: 0, totalDeductions: 0, totalTax: 0,
      effectiveRate: 0, deductions: [], taxBands: [], converged: true,
    };
  }

  // Binary search: gross is always >= net
  let low = target;
  let high = target * 3; // Upper bound estimate
  let bestGross = target;
  let converged = false;

  // Expand high if needed
  for (let i = 0; i < 5; i++) {
    const { net } = calculateNetFromGross(high, inputs);
    if (net >= target) break;
    high *= 2;
  }

  // Binary search with 50 iterations (converges to ₦1 precision)
  for (let i = 0; i < 50; i++) {
    const mid = Math.round((low + high) / 2);
    const { net } = calculateNetFromGross(mid, inputs);

    if (Math.abs(net - target) < 1) {
      bestGross = mid;
      converged = true;
      break;
    }

    if (net < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
    bestGross = mid;
  }

  const final = calculateNetFromGross(bestGross, inputs);

  return {
    grossSalary: bestGross,
    netPay: final.net,
    totalDeductions: bestGross - final.net,
    totalTax: final.totalTax,
    effectiveRate: bestGross > 0 ? (final.totalTax / bestGross) * 100 : 0,
    deductions: final.deductions,
    taxBands: final.taxBands,
    converged,
  };
}

export type { ReverseSalaryInputs, ReverseSalaryResult, DeductionBreakdown };
