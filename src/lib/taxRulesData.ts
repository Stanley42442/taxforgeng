// Tax Rules Data - Centralized data for Tax Logic Reference page
// Based on Nigeria Tax Act 2025 (effective 2026)

export interface TaxBand {
  threshold: number;
  rate: number;
  label: string;
}

export interface TaxRuleComparison {
  id: string;
  title: string;
  description: string;
  rule2026: string;
  rulePre2026: string;
  change: 'better' | 'same' | 'different';
  source: string;
}

// PIT Bands - 2026
export const PIT_BANDS_2026: TaxBand[] = [
  { threshold: 800000, rate: 0, label: 'First ₦800,000' },
  { threshold: 3000000, rate: 15, label: '₦800,001 - ₦3,000,000' },
  { threshold: 12000000, rate: 18, label: '₦3,000,001 - ₦12,000,000' },
  { threshold: 25000000, rate: 21, label: '₦12,000,001 - ₦25,000,000' },
  { threshold: 50000000, rate: 23, label: '₦25,000,001 - ₦50,000,000' },
  { threshold: Infinity, rate: 25, label: 'Above ₦50,000,000' },
];

// PIT Bands - Pre-2026
export const PIT_BANDS_PRE2026: TaxBand[] = [
  { threshold: 300000, rate: 7, label: 'First ₦300,000' },
  { threshold: 600000, rate: 11, label: '₦300,001 - ₦600,000' },
  { threshold: 1100000, rate: 15, label: '₦600,001 - ₦1,100,000' },
  { threshold: 1600000, rate: 19, label: '₦1,100,001 - ₦1,600,000' },
  { threshold: 3200000, rate: 21, label: '₦1,600,001 - ₦3,200,000' },
  { threshold: Infinity, rate: 24, label: 'Above ₦3,200,000' },
];

// Key Changes Summary
export const KEY_CHANGES: TaxRuleComparison[] = [
  {
    id: 'pit-exemption',
    title: 'Tax-Free Threshold',
    description: 'First portion of income exempt from tax',
    rule2026: 'First ₦800,000 exempt (0%)',
    rulePre2026: 'No exemption - 7% from ₦1',
    change: 'better',
    source: 'Nigeria Tax Act 2025 Section 23',
  },
  {
    id: 'max-rate',
    title: 'Maximum PIT Rate',
    description: 'Top marginal tax rate for highest earners',
    rule2026: '25% (above ₦50M)',
    rulePre2026: '24% (above ₦3.2M)',
    change: 'different',
    source: 'PwC Tax Summaries',
  },
  {
    id: 'cra-abolished',
    title: 'CRA Status',
    description: 'Consolidated Relief Allowance',
    rule2026: 'ABOLISHED - Replaced with Rent Relief',
    rulePre2026: 'Higher of ₦200k or 1% + 20% of gross',
    change: 'different',
    source: 'EY Global Tax Alert',
  },
  {
    id: 'rent-relief',
    title: 'Rent Relief',
    description: 'Deduction for rent payments',
    rule2026: '20% of rent, max ₦500,000 (requires proof)',
    rulePre2026: 'Included in CRA (automatic)',
    change: 'different',
    source: 'KPMG Nigeria Tax Alert',
  },
  {
    id: 'small-company',
    title: 'Small Company Exemption',
    description: 'CIT exemption for qualifying small companies',
    rule2026: '0% CIT if turnover ≤₦50M AND assets ≤₦250M',
    rulePre2026: 'No exemption - 30% CIT for all',
    change: 'better',
    source: 'Nigeria Tax Act 2025 Section 56',
  },
  {
    id: 'dev-levy',
    title: 'Development Levy / TET',
    description: 'Additional levy on company profits',
    rule2026: '4% Development Levy (large companies)',
    rulePre2026: '3% Tertiary Education Tax',
    change: 'different',
    source: 'Finance Act 2021-2025',
  },
  {
    id: 'loss-of-office',
    title: 'Loss of Office Exemption',
    description: 'Tax-free severance/gratuity threshold',
    rule2026: 'First ₦50,000,000 exempt',
    rulePre2026: 'First ₦10,000,000 exempt',
    change: 'better',
    source: 'Baker Tilly / EY',
  },
  {
    id: 'small-investor-cgt',
    title: 'Small Investor CGT Exemption',
    description: 'Capital gains exemption for small investors',
    rule2026: 'Gains ≤₦10M exempt (if proceeds <₦150M)',
    rulePre2026: 'No exemption - flat 10%',
    change: 'better',
    source: 'Nigeria Tax Act 2025',
  },
];

// CIT Rules
export const CIT_RULES = {
  rule2026: {
    smallCompany: {
      turnoverLimit: 50000000,
      assetLimit: 250000000,
      citRate: 0,
      devLevy: 0,
    },
    largeCompany: {
      citRate: 30,
      devLevy: 4,
    },
  },
  rulePre2026: {
    allCompanies: {
      citRate: 30,
      tertiaryEducationTax: 3, // Corrected from 2%
    },
  },
};

// VAT Rules
export const VAT_RULES = {
  standardRate: 7.5,
  registrationThreshold: 25000000,
  filingFrequency: 'Monthly (by 21st)',
  inputRecovery2026: 'Full recovery on services AND capital assets',
  inputRecoveryPre2026: 'Only goods purchases (services excluded)',
};

// Deduction Rules
export const DEDUCTION_RULES = {
  rule2026: [
    { name: 'Rent Relief', calculation: '20% of actual rent', cap: '₦500,000/year', requiresProof: true },
    { name: 'Pension', calculation: '8% of gross', cap: 'None', requiresProof: false },
    { name: 'NHF', calculation: '2.5% of basic', cap: 'None', requiresProof: false },
    { name: 'NHIS', calculation: 'Actual premiums', cap: 'None', requiresProof: true },
    { name: 'Life Insurance', calculation: 'Actual premiums', cap: 'None', requiresProof: true },
  ],
  rulePre2026: [
    { name: 'CRA', calculation: 'Max(₦200k, 1%) + 20%', cap: 'None', requiresProof: false },
    { name: 'Pension', calculation: '8% of gross', cap: 'None', requiresProof: false },
    { name: 'NHF', calculation: '2.5% of basic', cap: 'None', requiresProof: false },
    { name: 'Life Insurance', calculation: 'Actual premiums', cap: 'None', requiresProof: true },
  ],
};

// WHT Rates
export const WHT_RATES = [
  { incomeType: 'Rental Income', rate: 10, treatment: 'Credit against PIT/CIT' },
  { incomeType: 'Consultancy/Professional Fees', rate: 10, treatment: 'Credit against PIT/CIT' },
  { incomeType: 'Construction Contracts', rate: 5, treatment: 'Credit against CIT' },
  { incomeType: 'Dividends', rate: 10, treatment: 'Final (franked exempt)' },
  { incomeType: 'Interest', rate: 10, treatment: 'Final for most cases' },
  { incomeType: 'Directors Fees', rate: 10, treatment: 'Credit against PIT' },
];

// Payroll Rates
export const PAYROLL_RATES = {
  pensionEmployee: 8,
  pensionEmployer: 10,
  nhf: 2.5,
  defaultOvertimeMultiplier: 1.5,
  weekendOvertimeMultiplier: 2.0,
};

// Calculate progressive tax
export function calculateProgressiveTax(
  income: number,
  bands: TaxBand[]
): { totalTax: number; effectiveRate: number; breakdown: { band: string; tax: number }[] } {
  let remainingIncome = income;
  let totalTax = 0;
  let previousThreshold = 0;
  const breakdown: { band: string; tax: number }[] = [];

  for (const band of bands) {
    if (remainingIncome <= 0) break;
    
    const bandAmount = band.threshold - previousThreshold;
    const taxableInBand = Math.min(remainingIncome, bandAmount);
    const taxInBand = taxableInBand * (band.rate / 100);
    
    if (taxableInBand > 0) {
      breakdown.push({
        band: band.label,
        tax: taxInBand,
      });
    }
    
    totalTax += taxInBand;
    remainingIncome -= taxableInBand;
    previousThreshold = band.threshold;
  }

  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
  
  return { totalTax, effectiveRate, breakdown };
}

// Format currency for display
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000000) {
    return `₦${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(0)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}
