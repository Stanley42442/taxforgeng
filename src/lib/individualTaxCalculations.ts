// Individual Tax Calculations for TaxForge NG - 2026 Nigeria Tax Act

import { formatCurrency, formatNumber } from './taxCalculations';
import { CRYPTO_TAX_CONFIG, PRESUMPTIVE_TAX_RATES } from './sectorConfig';

export interface IndividualTaxInputs {
  calculationType: 'pit' | 'foreign_income' | 'crypto' | 'investment' | 'informal';
  use2026Rules: boolean;
  
  // PIT inputs
  employmentIncome?: number;
  pensionContribution?: number;
  nhfContribution?: number;
  nhisContribution?: number; // Health insurance (NHIS)
  lifeInsurancePremium?: number;
  annualRentPaid?: number; // For 2026 Rent Relief (replaces CRA)
  
  // Foreign income inputs
  foreignIncome?: number;
  foreignTaxPaid?: number;
  isResident?: boolean;
  treatyCountry?: string;
  incomeType?: 'employment' | 'dividend' | 'interest' | 'royalty' | 'business';
  
  // Crypto inputs
  cryptoIncome?: number;
  cryptoGains?: number;
  cryptoLosses?: number;
  previousLosses?: number;
  
  // Investment inputs
  dividendIncome?: number;
  interestIncome?: number;
  capitalGains?: number;
  
  // Informal inputs
  estimatedTurnover?: number;
  location?: string;
  businessActivity?: string;
}

export interface IndividualTaxResult {
  taxableIncome: number;
  reliefs: TaxReliefItem[];
  taxPayable: number;
  effectiveRate: number;
  breakdown: TaxBreakdownItem[];
  alerts: TaxAlert[];
  recommendations: string[];
}

interface TaxReliefItem {
  name: string;
  amount: number;
  description: string;
}

interface TaxBreakdownItem {
  label: string;
  amount: number;
  description?: string;
}

interface TaxAlert {
  type: 'info' | 'warning' | 'success';
  message: string;
}

// 2026 PIT bands - Nigeria Tax Act 2025
const PIT_BANDS_2026 = [
  { threshold: 800000, rate: 0 },       // First ₦800k exempt
  { threshold: 3000000, rate: 0.15 },   // Next ₦2.2m at 15%
  { threshold: 12000000, rate: 0.18 },  // Next ₦9m at 18%
  { threshold: 25000000, rate: 0.21 },  // Next ₦13m at 21%
  { threshold: 50000000, rate: 0.23 },  // Next ₦25m at 23%
  { threshold: Infinity, rate: 0.25 },  // Above ₦50m at 25%
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

// Calculate progressive tax
function calculateProgressiveTax(
  income: number, 
  bands: typeof PIT_BANDS_2026
): { tax: number; breakdown: TaxBreakdownItem[] } {
  let remainingIncome = income;
  let totalTax = 0;
  let previousThreshold = 0;
  const breakdown: TaxBreakdownItem[] = [];

  for (const band of bands) {
    if (remainingIncome <= 0) break;

    const bandAmount = band.threshold - previousThreshold;
    const taxableInBand = Math.min(remainingIncome, bandAmount);
    const taxInBand = taxableInBand * band.rate;

    if (taxableInBand > 0 && band.rate > 0) {
      breakdown.push({
        label: `NGN ${formatNumber(previousThreshold)} - NGN ${band.threshold === Infinity ? '∞' : formatNumber(band.threshold)}`,
        amount: taxInBand,
        description: `${(band.rate * 100).toFixed(0)}% on NGN ${formatNumber(taxableInBand)}`,
      });
    }

    totalTax += taxInBand;
    remainingIncome -= taxableInBand;
    previousThreshold = band.threshold;
  }

  return { tax: totalTax, breakdown };
}

// Calculate Personal Income Tax
// 2026 Rules: CRA abolished, replaced with specific deductions (Rent Relief, Pension, NHF, NHIS, Life Insurance)
export function calculatePersonalIncomeTax(inputs: IndividualTaxInputs): IndividualTaxResult {
  const bands = inputs.use2026Rules ? PIT_BANDS_2026 : PIT_BANDS_PRE2026;
  const grossIncome = inputs.employmentIncome || 0;
  const reliefs: TaxReliefItem[] = [];
  const alerts: TaxAlert[] = [];
  const recommendations: string[] = [];

  // Calculate reliefs
  let totalReliefs = 0;

  if (inputs.use2026Rules) {
    // 2026 Rules: CRA is ABOLISHED - replaced with specific deductions
    // Per Nigeria Tax Act 2025: Rent Relief, Pension, NHF, NHIS, Life Insurance
    
    // Rent Relief: 20% of actual rent paid, capped at NGN 500,000
    const annualRent = inputs.annualRentPaid || 0;
    if (annualRent > 0) {
      const rentRelief = Math.min(annualRent * 0.20, 500000);
      reliefs.push({
        name: 'Rent Relief',
        amount: rentRelief,
        description: '20% of annual rent paid (max NGN 500,000)'
      });
      totalReliefs += rentRelief;
    }
  } else {
    // Pre-2026: Old CRA still applies
    const cra = Math.max(200000, grossIncome * 0.01) + (grossIncome * 0.20);
    reliefs.push({
      name: 'Consolidated Relief Allowance',
      amount: cra,
      description: 'Higher of NGN 200,000 or 1% of gross + 20% of gross'
    });
    totalReliefs += cra;
  }

  // Pension contribution (8% max) - applies to both rule sets
  if (inputs.pensionContribution && inputs.pensionContribution > 0) {
    const maxPension = grossIncome * 0.08;
    const allowedPension = Math.min(inputs.pensionContribution, maxPension);
    reliefs.push({
      name: 'Pension Contribution',
      amount: allowedPension,
      description: 'Up to 8% of gross income'
    });
    totalReliefs += allowedPension;
  }

  // NHF contribution - applies to both rule sets
  if (inputs.nhfContribution && inputs.nhfContribution > 0) {
    reliefs.push({
      name: 'NHF Contribution',
      amount: inputs.nhfContribution,
      description: '2.5% of basic salary'
    });
    totalReliefs += inputs.nhfContribution;
  }

  // NHIS/Health Insurance contribution (2026 rules allow this deduction)
  if (inputs.nhisContribution && inputs.nhisContribution > 0) {
    reliefs.push({
      name: 'NHIS/Health Insurance',
      amount: inputs.nhisContribution,
      description: 'Health insurance premium'
    });
    totalReliefs += inputs.nhisContribution;
  }

  // Life insurance premium - applies to both rule sets
  if (inputs.lifeInsurancePremium && inputs.lifeInsurancePremium > 0) {
    reliefs.push({
      name: 'Life Insurance Premium',
      amount: inputs.lifeInsurancePremium,
      description: 'Premium paid on own life'
    });
    totalReliefs += inputs.lifeInsurancePremium;
  }

  const taxableIncome = Math.max(0, grossIncome - totalReliefs);
  const { tax, breakdown } = calculateProgressiveTax(taxableIncome, bands);

  // Always show breakdown items including reliefs applied
  const fullBreakdown: TaxBreakdownItem[] = [
    { label: 'Gross Income', amount: grossIncome },
    { label: 'Total Reliefs', amount: -totalReliefs },
    { label: 'Taxable Income', amount: taxableIncome },
    ...breakdown
  ];

  const effectiveRate = grossIncome > 0 ? (tax / grossIncome) * 100 : 0;

  // Alerts and recommendations
  if (inputs.use2026Rules && grossIncome <= 800000) {
    alerts.push({
      type: 'success',
      message: 'Your income is below the ₦800k exemption threshold - no PIT payable!'
    });
  }

  // 2026 Rules: Alert about CRA abolition
  if (inputs.use2026Rules && (!inputs.annualRentPaid || inputs.annualRentPaid === 0)) {
    alerts.push({
      type: 'info',
      message: '2026 Rules: The old CRA is abolished. Enter your annual rent to claim Rent Relief (20%, max ₦500k).'
    });
  }

  if (!inputs.pensionContribution || inputs.pensionContribution === 0) {
    recommendations.push('Consider contributing to a pension fund to reduce taxable income');
  }

  if (inputs.use2026Rules && (!inputs.nhisContribution || inputs.nhisContribution === 0)) {
    recommendations.push('NHIS/Health insurance premiums are deductible under 2026 rules');
  }

  if (grossIncome > 50000000) {
    alerts.push({
      type: 'info',
      message: 'High-income earners (>₦50M) are subject to the maximum 25% rate'
    });
  }

  return {
    taxableIncome,
    reliefs,
    taxPayable: tax,
    effectiveRate,
    breakdown: fullBreakdown,
    alerts,
    recommendations
  };
}

// Calculate Crypto/Digital Asset Tax
export function calculateCryptoTax(inputs: IndividualTaxInputs): IndividualTaxResult {
  const cryptoIncome = inputs.cryptoIncome || 0;
  const cryptoGains = inputs.cryptoGains || 0;
  const cryptoLosses = inputs.cryptoLosses || 0;
  const previousLosses = inputs.previousLosses || 0;
  
  const reliefs: TaxReliefItem[] = [];
  const breakdown: TaxBreakdownItem[] = [];
  const alerts: TaxAlert[] = [];
  const recommendations: string[] = [];

  // Calculate net gains after loss offset
  const totalLosses = cryptoLosses + previousLosses;
  const netGains = Math.max(0, cryptoGains - totalLosses);
  const unusedLosses = Math.max(0, totalLosses - cryptoGains);

  if (totalLosses > 0) {
    reliefs.push({
      name: 'Loss Offset',
      amount: Math.min(totalLosses, cryptoGains),
      description: 'Crypto losses offset against gains'
    });
  }

  // Apply crypto income as regular PIT
  let incomeResult = { tax: 0, breakdown: [] as TaxBreakdownItem[] };
  if (cryptoIncome > 0) {
    incomeResult = calculateProgressiveTax(cryptoIncome, inputs.use2026Rules ? PIT_BANDS_2026 : PIT_BANDS_PRE2026);
    breakdown.push(...incomeResult.breakdown.map(b => ({
      ...b,
      label: `Crypto Income: ${b.label}`
    })));
  }

  // Apply CGT on gains using crypto-specific rates
  let cgt = 0;
  if (inputs.use2026Rules && netGains > 0) {
    for (const rate of CRYPTO_TAX_CONFIG.progressiveRates) {
      if (netGains <= rate.threshold) {
        cgt = netGains * (rate.rate / 100);
        if (rate.rate > 0) {
          breakdown.push({
            label: 'Capital Gains Tax',
            amount: cgt,
            description: `${rate.rate}% on ₦${formatNumber(netGains)} gains`
          });
        }
        break;
      }
    }
  } else if (netGains > 0) {
    // Pre-2026: flat 10% CGT
    cgt = netGains * 0.10;
    breakdown.push({
      label: 'Capital Gains Tax',
      amount: cgt,
      description: '10% on net gains'
    });
  }

  const totalTax = incomeResult.tax + cgt;
  const totalIncome = cryptoIncome + netGains;
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

  // Alerts
  if (inputs.use2026Rules && netGains <= CRYPTO_TAX_CONFIG.exemptionThresholdMin) {
    alerts.push({
      type: 'success',
      message: `Gains under ₦${formatNumber(CRYPTO_TAX_CONFIG.exemptionThresholdMin)} are exempt from CGT`
    });
  }

  if (unusedLosses > 0) {
    alerts.push({
      type: 'info',
      message: `₦${formatNumber(unusedLosses)} in losses can be carried forward for ${CRYPTO_TAX_CONFIG.lossCarryForwardYears} years`
    });
    recommendations.push('Keep records of all crypto transactions for loss carry-forward claims');
  }

  recommendations.push('Maintain detailed records of acquisition costs and disposal dates');

  return {
    taxableIncome: totalIncome,
    reliefs,
    taxPayable: totalTax,
    effectiveRate,
    breakdown,
    alerts,
    recommendations
  };
}

// Calculate Informal/Presumptive Tax
export function calculateInformalTax(inputs: IndividualTaxInputs): IndividualTaxResult {
  const turnover = inputs.estimatedTurnover || 0;
  const location = inputs.location || 'other_urban';
  const rates = PRESUMPTIVE_TAX_RATES[location] || PRESUMPTIVE_TAX_RATES.other_urban;
  
  const reliefs: TaxReliefItem[] = [];
  const breakdown: TaxBreakdownItem[] = [];
  const alerts: TaxAlert[] = [];
  const recommendations: string[] = [];

  // Calculate presumptive tax based on turnover bracket
  let presumptiveTax = rates.min;
  if (turnover > 5000000) {
    presumptiveTax = rates.max;
  } else if (turnover > 2000000) {
    presumptiveTax = (rates.min + rates.max) / 2;
  }

  breakdown.push({
    label: 'Presumptive Tax',
    amount: presumptiveTax,
    description: `Annual flat tax for ${rates.description}`
  });

  const effectiveRate = turnover > 0 ? (presumptiveTax / turnover) * 100 : 0;

  // Alerts
  if (turnover > 25000000) {
    alerts.push({
      type: 'warning',
      message: 'Turnover exceeds ₦25M - VAT registration may be required'
    });
    recommendations.push('Consider formalizing as a registered business for better tax planning');
  }

  if (turnover > 50000000) {
    alerts.push({
      type: 'warning',
      message: 'High turnover detected - formal business registration strongly recommended'
    });
  }

  recommendations.push('Register with CAC to access formal business benefits');
  recommendations.push('Open a dedicated business bank account for better record-keeping');

  alerts.push({
    type: 'info',
    message: `Location: ${rates.description} - Tax range: ₦${formatNumber(rates.min)} - ₦${formatNumber(rates.max)}`
  });

  return {
    taxableIncome: turnover,
    reliefs,
    taxPayable: presumptiveTax,
    effectiveRate,
    breakdown,
    alerts,
    recommendations
  };
}

// Calculate Investment Income Tax
export function calculateInvestmentTax(inputs: IndividualTaxInputs): IndividualTaxResult {
  const dividendIncome = inputs.dividendIncome || 0;
  const interestIncome = inputs.interestIncome || 0;
  const capitalGains = inputs.capitalGains || 0;
  
  const reliefs: TaxReliefItem[] = [];
  const breakdown: TaxBreakdownItem[] = [];
  const alerts: TaxAlert[] = [];
  const recommendations: string[] = [];

  let totalTax = 0;

  // Dividend income - franked dividends from Nigerian companies are exempt
  if (dividendIncome > 0) {
    alerts.push({
      type: 'success',
      message: 'Franked dividends from Nigerian companies are generally tax-exempt'
    });
    breakdown.push({
      label: 'Dividend Income',
      amount: 0,
      description: 'Exempt (franked dividends)'
    });
  }

  // Interest income - 10% WHT usually applies
  if (interestIncome > 0) {
    const wht = interestIncome * 0.10;
    totalTax += wht;
    breakdown.push({
      label: 'Interest WHT',
      amount: wht,
      description: '10% withholding tax'
    });
    reliefs.push({
      name: 'WHT Already Deducted',
      amount: wht,
      description: 'Withheld by financial institution'
    });
    alerts.push({
      type: 'info',
      message: '10% WHT on interest is usually final tax for individuals'
    });
  }

  // Capital gains - 2026 rules: progressive PIT rates for individuals, with small investor exemption
  if (capitalGains > 0) {
    if (inputs.use2026Rules) {
      // Small investor exemption: gains ≤ ₦10M AND proceeds < ₦150M are exempt
      if (capitalGains <= 10000000) {
        breakdown.push({
          label: 'Capital Gains Tax',
          amount: 0,
          description: 'Exempt (small investor - gains ≤ ₦10M)'
        });
        alerts.push({
          type: 'success',
          message: 'Your capital gains qualify for the small investor exemption (gains ≤ ₦10M)'
        });
      } else {
        // Progressive PIT rates apply for individuals under 2026 rules
        const cgtResult = calculateProgressiveTax(capitalGains, PIT_BANDS_2026);
        totalTax += cgtResult.tax;
        breakdown.push({
          label: 'Capital Gains Tax',
          amount: cgtResult.tax,
          description: 'Progressive rates (0-25%) on capital gains'
        });
        alerts.push({
          type: 'info',
          message: 'Under 2026 rules, individual CGT uses progressive PIT rates (0-25%)'
        });
      }
    } else {
      // Pre-2026: flat 10% CGT
      const cgt = capitalGains * 0.10;
      totalTax += cgt;
      breakdown.push({
        label: 'Capital Gains Tax',
        amount: cgt,
        description: '10% on gains from asset disposal'
      });
    }
    
    recommendations.push('Consider timing of asset sales for tax planning');
  }

  const totalIncome = dividendIncome + interestIncome + capitalGains;
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

  recommendations.push('Diversify investments to optimize tax efficiency');

  return {
    taxableIncome: totalIncome,
    reliefs,
    taxPayable: totalTax,
    effectiveRate,
    breakdown,
    alerts,
    recommendations
  };
}

// Main calculation router
export function calculateIndividualTax(inputs: IndividualTaxInputs): IndividualTaxResult {
  switch (inputs.calculationType) {
    case 'pit':
      return calculatePersonalIncomeTax(inputs);
    case 'crypto':
      return calculateCryptoTax(inputs);
    case 'informal':
      return calculateInformalTax(inputs);
    case 'investment':
      return calculateInvestmentTax(inputs);
    case 'foreign_income':
      // Use foreign income calculator component
      return calculatePersonalIncomeTax({
        ...inputs,
        employmentIncome: inputs.foreignIncome
      });
    default:
      return calculatePersonalIncomeTax(inputs);
  }
}

export { formatCurrency, formatNumber };
