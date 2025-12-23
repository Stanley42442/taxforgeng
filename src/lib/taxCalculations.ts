// Nigerian Tax Calculations - Pre-2026 and 2026+ Rules

export interface TaxInputs {
  entityType: 'business_name' | 'company';
  turnover: number;
  expenses: number;
  rentPaid: number;
  vatableSales: number;
  vatablePurchases: number;
  rentalIncome: number;
  consultancyIncome: number;
  dividendIncome: number;
  capitalGains: number;
  foreignIncome: number;
  fixedAssets: number;
  use2026Rules: boolean;
}

export interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  incomeTax: number;
  developmentLevy: number;
  vatPayable: number;
  whtCredits: number;
  totalTaxPayable: number;
  effectiveRate: number;
  breakdown: TaxBreakdownItem[];
  alerts: TaxAlert[];
  entityType: string;
  isSmallCompany: boolean;
}

export interface TaxBreakdownItem {
  label: string;
  amount: number;
  description?: string;
}

export interface TaxAlert {
  type: 'info' | 'warning' | 'success';
  message: string;
}

// Personal Income Tax bands (2026 rules)
const PIT_BANDS = [
  { threshold: 800000, rate: 0 },      // First ₦800k exempt
  { threshold: 3000000, rate: 0.15 },  // Next ₦2.2m at 15%
  { threshold: 10000000, rate: 0.19 }, // Next ₦7m at 19%
  { threshold: 50000000, rate: 0.21 }, // Next ₦40m at 21%
  { threshold: Infinity, rate: 0.25 }, // Above ₦50m at 25%
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

export function calculatePersonalIncomeTax(
  taxableIncome: number,
  use2026Rules: boolean
): { tax: number; breakdown: TaxBreakdownItem[] } {
  const bands = use2026Rules ? PIT_BANDS : PIT_BANDS_PRE2026;
  let remainingIncome = taxableIncome;
  let totalTax = 0;
  let previousThreshold = 0;
  const breakdown: TaxBreakdownItem[] = [];

  for (const band of bands) {
    if (remainingIncome <= 0) break;

    const bandAmount = band.threshold - previousThreshold;
    const taxableInBand = Math.min(remainingIncome, bandAmount);
    const taxInBand = taxableInBand * band.rate;

    if (taxableInBand > 0) {
      breakdown.push({
        label: `₦${formatNumber(previousThreshold)} - ₦${band.threshold === Infinity ? '∞' : formatNumber(band.threshold)}`,
        amount: taxInBand,
        description: `${(band.rate * 100).toFixed(0)}% on ₦${formatNumber(taxableInBand)}`,
      });
    }

    totalTax += taxInBand;
    remainingIncome -= taxableInBand;
    previousThreshold = band.threshold;
  }

  return { tax: totalTax, breakdown };
}

export function calculateCompanyTax(
  profit: number,
  turnover: number,
  fixedAssets: number,
  use2026Rules: boolean
): { cit: number; devLevy: number; isSmall: boolean } {
  if (use2026Rules) {
    // 2026 Rules: Small companies (turnover ≤ ₦50m AND fixed assets ≤ ₦250m)
    const isSmall = turnover <= 50000000 && fixedAssets <= 250000000;
    
    if (isSmall) {
      return { cit: 0, devLevy: 0, isSmall: true };
    }
    
    // Regular company: 25% CIT + 4% Development Levy
    const cit = Math.max(0, profit * 0.25);
    const devLevy = Math.max(0, profit * 0.04);
    return { cit, devLevy, isSmall: false };
  } else {
    // Pre-2026 Rules: 30% CIT
    const cit = Math.max(0, profit * 0.30);
    const devLevy = Math.max(0, profit * 0.02); // 2% education levy
    return { cit, devLevy, isSmall: false };
  }
}

export function calculateVAT(
  vatableSales: number,
  vatablePurchases: number
): { outputVat: number; inputVat: number; netVat: number } {
  const vatRate = 0.075; // 7.5%
  const outputVat = vatableSales * vatRate;
  const inputVat = vatablePurchases * vatRate;
  const netVat = Math.max(0, outputVat - inputVat);
  
  return { outputVat, inputVat, netVat };
}

export function calculateWHTCredits(
  rentalIncome: number,
  consultancyIncome: number
): number {
  // WHT on rental income: 10%
  const rentalWHT = rentalIncome * 0.10;
  // WHT on consultancy: 10% for companies, 5% for individuals
  const consultancyWHT = consultancyIncome * 0.10;
  
  return rentalWHT + consultancyWHT;
}

export function calculateTax(inputs: TaxInputs): TaxResult {
  const alerts: TaxAlert[] = [];
  const breakdown: TaxBreakdownItem[] = [];
  
  const grossIncome = inputs.turnover + inputs.rentalIncome + 
    inputs.consultancyIncome + inputs.dividendIncome + 
    inputs.capitalGains + inputs.foreignIncome;
  
  let taxableIncome = grossIncome - inputs.expenses;
  let incomeTax = 0;
  let developmentLevy = 0;
  let isSmallCompany = false;

  if (inputs.entityType === 'company') {
    // Company Tax Calculation
    const companyResult = calculateCompanyTax(
      taxableIncome,
      inputs.turnover,
      inputs.fixedAssets,
      inputs.use2026Rules
    );
    
    incomeTax = companyResult.cit;
    developmentLevy = companyResult.devLevy;
    isSmallCompany = companyResult.isSmall;

    if (isSmallCompany) {
      alerts.push({
        type: 'success',
        message: 'Qualifies as Small Company - 0% CIT rate applies!',
      });
    }

    breakdown.push({
      label: 'Company Income Tax',
      amount: incomeTax,
      description: inputs.use2026Rules ? '25% CIT' : '30% CIT (Pre-2026)',
    });

    if (developmentLevy > 0) {
      breakdown.push({
        label: inputs.use2026Rules ? 'Development Levy' : 'Education Levy',
        amount: developmentLevy,
        description: inputs.use2026Rules ? '4% of profits' : '2% of profits',
      });
    }
  } else {
    // Business Name (Personal Income Tax)
    // Apply rent relief (2026 rules)
    if (inputs.use2026Rules && inputs.rentPaid > 0) {
      const rentRelief = Math.min(inputs.rentPaid * 0.20, 500000);
      taxableIncome = Math.max(0, taxableIncome - rentRelief);
      
      breakdown.push({
        label: 'Rent Relief',
        amount: -rentRelief,
        description: 'Min of 20% rent paid or ₦500k',
      });
    }

    const pitResult = calculatePersonalIncomeTax(taxableIncome, inputs.use2026Rules);
    incomeTax = pitResult.tax;

    pitResult.breakdown.forEach(item => breakdown.push(item));
  }

  // VAT Calculation
  const vatResult = calculateVAT(inputs.vatableSales, inputs.vatablePurchases);
  
  if (vatResult.netVat > 0) {
    breakdown.push({
      label: 'VAT Payable',
      amount: vatResult.netVat,
      description: '7.5% on vatable supplies',
    });
  }

  // VAT Registration Alert
  if (inputs.turnover > 25000000) {
    alerts.push({
      type: 'warning',
      message: 'VAT registration is mandatory (turnover > ₦25m)',
    });
  }

  // WHT Credits
  const whtCredits = calculateWHTCredits(inputs.rentalIncome, inputs.consultancyIncome);
  
  if (whtCredits > 0) {
    breakdown.push({
      label: 'WHT Credits',
      amount: -whtCredits,
      description: 'Withholding tax already deducted',
    });
  }

  // Dividend Income (Franked - exempt)
  if (inputs.dividendIncome > 0) {
    alerts.push({
      type: 'info',
      message: 'Franked dividends from Nigerian companies are tax-exempt',
    });
  }

  // Capital Gains
  if (inputs.capitalGains > 0) {
    const cgt = inputs.capitalGains * 0.10;
    breakdown.push({
      label: 'Capital Gains Tax',
      amount: cgt,
      description: '10% on capital gains',
    });
    incomeTax += cgt;
  }

  const totalTaxPayable = Math.max(0, incomeTax + developmentLevy + vatResult.netVat - whtCredits);
  const effectiveRate = grossIncome > 0 ? (totalTaxPayable / grossIncome) * 100 : 0;

  return {
    grossIncome,
    taxableIncome,
    incomeTax,
    developmentLevy,
    vatPayable: vatResult.netVat,
    whtCredits,
    totalTaxPayable,
    effectiveRate,
    breakdown,
    alerts,
    entityType: inputs.entityType === 'company' ? 'Limited Liability Company' : 'Business Name',
    isSmallCompany,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-NG').format(num);
}
