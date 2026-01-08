// Nigerian Tax Calculations - Pre-2026 and 2026+ Rules

export interface SectorTaxRules {
  citRate?: number;
  vatStatus?: 'standard' | 'zero' | 'exempt' | 'reduced';
  vatRate?: number;
  edtiRate?: number;
  hydrocarbonTaxMin?: number;
  hydrocarbonTaxMax?: number;
  environmentalSurcharge?: number;
  presumptiveMin?: number;
  presumptiveMax?: number;
  whtRate?: number;
  rentReliefMax?: number;
  rentReliefPercent?: number;
  donationCap?: number;
  specialIncentives?: string[];
  pioneerStatus?: boolean;
  ediEligible?: boolean; // Economic Development Incentive (replaces Pioneer Status)
  greenHireDeduction?: number;
}

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
  sectorId?: string;
  sectorRules?: SectorTaxRules;
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
  sectorId?: string;
  sectorRules?: SectorTaxRules;
  appliedIncentives?: string[];
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
  use2026Rules: boolean,
  sectorRules?: SectorTaxRules
): { cit: number; devLevy: number; isSmall: boolean; appliedRate: number } {
  // Check for sector-specific CIT rate override
  const hasSectorCIT = sectorRules?.citRate !== undefined;
  
  if (use2026Rules) {
    // 2026 Rules: Small companies (turnover ≤ ₦50m AND fixed assets ≤ ₦250m)
    // Note: Some sources cite ₦100m, but we follow the dual threshold approach
    const isSmall = turnover <= 50000000 && fixedAssets <= 250000000;
    
    // Sector override for CIT (e.g., agriculture 0%, oil & gas 30%)
    if (hasSectorCIT) {
      const sectorRate = sectorRules!.citRate! / 100;
      const cit = Math.max(0, profit * sectorRate);
      // Small company exemption scope includes dev levy
      const devLevy = (sectorRate > 0 && !isSmall) ? Math.max(0, profit * 0.04) : 0;
      return { cit, devLevy, isSmall: sectorRate === 0 || isSmall, appliedRate: sectorRules!.citRate! };
    }
    
    if (isSmall) {
      // Small company exemption: 0% CIT AND 0% Development Levy
      return { cit: 0, devLevy: 0, isSmall: true, appliedRate: 0 };
    }
    
    // Regular company: 25% CIT + 4% Development Levy
    const cit = Math.max(0, profit * 0.25);
    const devLevy = Math.max(0, profit * 0.04);
    return { cit, devLevy, isSmall: false, appliedRate: 25 };
  } else {
    // Pre-2026 Rules: 30% CIT (or sector override)
    const rate = hasSectorCIT ? sectorRules!.citRate! / 100 : 0.30;
    const cit = Math.max(0, profit * rate);
    const devLevy = Math.max(0, profit * 0.02); // 2% education levy
    return { cit, devLevy, isSmall: false, appliedRate: hasSectorCIT ? sectorRules!.citRate! : 30 };
  }
}

export function calculateVAT(
  vatableSales: number,
  vatablePurchases: number,
  sectorRules?: SectorTaxRules,
  use2026Rules?: boolean
): { outputVat: number; inputVat: number; netVat: number; vatStatus: string; fullInputRecovery: boolean } {
  // Check sector-specific VAT rules
  if (sectorRules?.vatStatus === 'exempt') {
    return { outputVat: 0, inputVat: 0, netVat: 0, vatStatus: 'exempt', fullInputRecovery: false };
  }
  
  if (sectorRules?.vatStatus === 'zero') {
    // Zero-rated: No output VAT, but can claim input VAT credits
    const inputVat = vatablePurchases * 0.075;
    return { outputVat: 0, inputVat, netVat: -inputVat, vatStatus: 'zero-rated', fullInputRecovery: true };
  }
  
  // Standard VAT rate (or sector-specific reduced rate)
  const vatRate = sectorRules?.vatRate !== undefined ? sectorRules.vatRate / 100 : 0.075;
  const outputVat = vatableSales * vatRate;
  
  // 2026 rules: Full input VAT recovery on ALL purchases (services + capital assets), not just goods
  // Pre-2026: Only goods purchases qualified for input VAT
  const inputVat = vatablePurchases * vatRate;
  const netVat = Math.max(0, outputVat - inputVat);
  
  return { 
    outputVat, 
    inputVat, 
    netVat, 
    vatStatus: 'standard',
    fullInputRecovery: use2026Rules === true
  };
}

export function calculateWHTCredits(
  rentalIncome: number,
  consultancyIncome: number,
  sectorRules?: SectorTaxRules
): number {
  // Use sector-specific WHT rate if available
  const whtRate = sectorRules?.whtRate !== undefined ? sectorRules.whtRate / 100 : 0.10;
  
  const rentalWHT = rentalIncome * whtRate;
  const consultancyWHT = consultancyIncome * whtRate;
  
  return rentalWHT + consultancyWHT;
}

export function calculateTax(inputs: TaxInputs): TaxResult {
  const alerts: TaxAlert[] = [];
  const breakdown: TaxBreakdownItem[] = [];
  const appliedIncentives: string[] = [];
  const sectorRules = inputs.sectorRules;
  
  const grossIncome = inputs.turnover + inputs.rentalIncome + 
    inputs.consultancyIncome + inputs.dividendIncome + 
    inputs.capitalGains + inputs.foreignIncome;
  
  let taxableIncome = grossIncome - inputs.expenses;
  let incomeTax = 0;
  let developmentLevy = 0;
  let isSmallCompany = false;

  // Add sector-specific alerts and incentives
  if (sectorRules && inputs.sectorId) {
    // EDI (Economic Development Incentive) replaces Pioneer Status under 2026 rules
    if (sectorRules.ediEligible || sectorRules.pioneerStatus) {
      if (inputs.use2026Rules) {
        alerts.push({
          type: 'info',
          message: `${inputs.sectorId.replace('_', ' ')} sector may qualify for Economic Development Incentive (EDI): 5% annual tax credit for 5 years on qualifying capex`,
        });
        appliedIncentives.push('EDI eligibility (5% credit/year for 5 years)');
      } else {
        alerts.push({
          type: 'info',
          message: `${inputs.sectorId.replace('_', ' ')} sector may qualify for Pioneer Status (tax holiday)`,
        });
        appliedIncentives.push('Pioneer Status eligibility');
      }
    }
    
    if (sectorRules.edtiRate) {
      alerts.push({
        type: 'success',
        message: `EDTI ${sectorRules.edtiRate}% tax credit available for qualifying investments`,
      });
      appliedIncentives.push(`EDTI ${sectorRules.edtiRate}% credit`);
    }
    
    if (sectorRules.greenHireDeduction) {
      alerts.push({
        type: 'success',
        message: `${sectorRules.greenHireDeduction}% deduction on green technology hires`,
      });
      appliedIncentives.push(`Green hire ${sectorRules.greenHireDeduction}% deduction`);
    }
    
    if (sectorRules.specialIncentives && sectorRules.specialIncentives.length > 0) {
      appliedIncentives.push(...sectorRules.specialIncentives.slice(0, 3));
    }
  }

  if (inputs.entityType === 'company') {
    // Company Tax Calculation with sector rules
    const companyResult = calculateCompanyTax(
      taxableIncome,
      inputs.turnover,
      inputs.fixedAssets,
      inputs.use2026Rules,
      sectorRules
    );
    
    incomeTax = companyResult.cit;
    developmentLevy = companyResult.devLevy;
    isSmallCompany = companyResult.isSmall;

    if (isSmallCompany) {
      alerts.push({
        type: 'success',
        message: inputs.use2026Rules 
          ? 'Qualifies as Small Company - 0% CIT, 0% CGT, and 0% Development Levy applies!'
          : 'Qualifies as Small Company - 0% CIT rate applies!',
      });
    } else if (sectorRules?.citRate !== undefined && sectorRules.citRate !== 25) {
      alerts.push({
        type: 'info',
        message: `Sector-specific CIT rate: ${companyResult.appliedRate}%`,
      });
    }

    // Oil & Gas specific: Hydrocarbon Tax
    if (sectorRules?.hydrocarbonTaxMin !== undefined) {
      const htRate = (sectorRules.hydrocarbonTaxMin + (sectorRules.hydrocarbonTaxMax || sectorRules.hydrocarbonTaxMin)) / 2 / 100;
      const hydrocarbonTax = Math.max(0, taxableIncome * htRate);
      
      breakdown.push({
        label: 'Hydrocarbon Tax',
        amount: hydrocarbonTax,
        description: `${sectorRules.hydrocarbonTaxMin}-${sectorRules.hydrocarbonTaxMax || sectorRules.hydrocarbonTaxMin}% on profits`,
      });
      incomeTax += hydrocarbonTax;
      
      // Environmental surcharge
      if (sectorRules.environmentalSurcharge) {
        const envSurcharge = Math.max(0, taxableIncome * (sectorRules.environmentalSurcharge / 100));
        breakdown.push({
          label: 'Environmental Surcharge',
          amount: envSurcharge,
          description: `${sectorRules.environmentalSurcharge}% surcharge`,
        });
        incomeTax += envSurcharge;
      }
    }

    breakdown.push({
      label: 'Company Income Tax',
      amount: companyResult.cit,
      description: `${companyResult.appliedRate}% CIT${sectorRules?.citRate !== undefined ? ' (sector rate)' : ''}`,
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
    // Apply rent relief (2026 rules or sector-specific)
    const rentReliefPercent = sectorRules?.rentReliefPercent || 20;
    const rentReliefMax = sectorRules?.rentReliefMax || 500000;
    
    if (inputs.use2026Rules && inputs.rentPaid > 0) {
      const rentRelief = Math.min(inputs.rentPaid * (rentReliefPercent / 100), rentReliefMax);
      taxableIncome = Math.max(0, taxableIncome - rentRelief);
      
      breakdown.push({
        label: 'Rent Relief',
        amount: -rentRelief,
        description: `${rentReliefPercent}% of rent (max ₦${formatNumber(rentReliefMax)})`,
      });
    }

    // Check for presumptive tax (informal sector)
    if (sectorRules?.presumptiveMin !== undefined && inputs.turnover < 25000000) {
      const presumptiveTax = (sectorRules.presumptiveMin + (sectorRules.presumptiveMax || sectorRules.presumptiveMin)) / 2;
      incomeTax = presumptiveTax;
      
      alerts.push({
        type: 'info',
        message: `Presumptive tax applies: ₦${formatNumber(sectorRules.presumptiveMin)} - ₦${formatNumber(sectorRules.presumptiveMax || sectorRules.presumptiveMin)}/year`,
      });
      
      breakdown.push({
        label: 'Presumptive Tax',
        amount: presumptiveTax,
        description: 'Flat rate for micro-enterprises',
      });
    } else {
      const pitResult = calculatePersonalIncomeTax(taxableIncome, inputs.use2026Rules);
      incomeTax = pitResult.tax;
      pitResult.breakdown.forEach(item => breakdown.push(item));
    }
  }

  // VAT Calculation with sector rules and 2026 full input recovery
  const vatResult = calculateVAT(inputs.vatableSales, inputs.vatablePurchases, sectorRules, inputs.use2026Rules);
  
  if (vatResult.vatStatus === 'exempt') {
    alerts.push({
      type: 'success',
      message: 'VAT exempt sector - no VAT payable on supplies',
    });
  } else if (vatResult.vatStatus === 'zero-rated') {
    alerts.push({
      type: 'success',
      message: 'Zero-rated VAT - input VAT credits recoverable',
    });
    if (vatResult.netVat < 0) {
      breakdown.push({
        label: 'VAT Credit (Refundable)',
        amount: vatResult.netVat,
        description: 'Input VAT recoverable on zero-rated supplies',
      });
    }
  } else if (vatResult.netVat > 0) {
    breakdown.push({
      label: 'VAT Payable',
      amount: vatResult.netVat,
      description: `${sectorRules?.vatRate || 7.5}% on vatable supplies`,
    });
  }
  
  // 2026 Full Input VAT Recovery Alert
  if (inputs.use2026Rules && vatResult.fullInputRecovery && inputs.vatablePurchases > 0) {
    alerts.push({
      type: 'info',
      message: '2026 rule: Full input VAT recovery available on services and capital assets (not just goods)',
    });
  }

  // VAT Registration Alert
  if (inputs.turnover > 25000000 && vatResult.vatStatus === 'standard') {
    alerts.push({
      type: 'warning',
      message: 'VAT registration is mandatory (turnover > ₦25m)',
    });
  }

  // WHT Credits with sector rules
  const whtCredits = calculateWHTCredits(inputs.rentalIncome, inputs.consultancyIncome, sectorRules);
  
  if (whtCredits > 0) {
    breakdown.push({
      label: 'WHT Credits',
      amount: -whtCredits,
      description: `Withholding tax at ${sectorRules?.whtRate || 10}%`,
    });
  }

  // Dividend Income (Franked - exempt)
  if (inputs.dividendIncome > 0) {
    alerts.push({
      type: 'info',
      message: 'Franked dividends from Nigerian companies are tax-exempt',
    });
  }

  // Capital Gains Tax
  if (inputs.capitalGains > 0) {
    // 2026 rules: Small companies exempt from CGT
    if (inputs.use2026Rules && isSmallCompany && inputs.entityType === 'company') {
      breakdown.push({
        label: 'Capital Gains Tax',
        amount: 0,
        description: 'Exempt (Small Company)',
      });
      alerts.push({
        type: 'success',
        message: 'Small companies are exempt from CGT under 2026 rules',
      });
    } else {
      // 2026 rules: Companies pay 30% CGT, individuals pay 10% (or progressive PIT rates for large gains)
      let cgtRate = 0.10;
      let cgtDescription = '10% on capital gains';
      
      if (inputs.use2026Rules && inputs.entityType === 'company') {
        cgtRate = 0.30;
        cgtDescription = '30% CGT (Company rate under 2026 rules)';
      } else if (inputs.use2026Rules && inputs.entityType === 'business_name') {
        // For individuals (business names), check for small investor exemption
        // Exempt if proceeds < ₦150M AND gains ≤ ₦10M
        if (inputs.capitalGains <= 10000000) {
          breakdown.push({
            label: 'Capital Gains Tax',
            amount: 0,
            description: 'Exempt (gains ≤ ₦10M small investor exemption)',
          });
          alerts.push({
            type: 'success',
            message: 'Capital gains ≤ ₦10M are exempt under 2026 small investor rules',
          });
        } else {
          // Progressive rates same as PIT for individuals under 2026
          const cgtResult = calculatePersonalIncomeTax(inputs.capitalGains, true);
          const cgt = cgtResult.tax;
          breakdown.push({
            label: 'Capital Gains Tax',
            amount: cgt,
            description: 'Progressive PIT rates (0-25%) on capital gains',
          });
          incomeTax += cgt;
        }
      }
      
      // Apply standard rate for companies or pre-2026 rules
      if (!(inputs.use2026Rules && inputs.entityType === 'business_name' && inputs.capitalGains <= 10000000) &&
          !(inputs.use2026Rules && inputs.entityType === 'business_name' && inputs.capitalGains > 10000000)) {
        const cgt = inputs.capitalGains * cgtRate;
        breakdown.push({
          label: 'Capital Gains Tax',
          amount: cgt,
          description: cgtDescription,
        });
        incomeTax += cgt;
      }
    }
  }

  // EDTI credit reduction
  if (sectorRules?.edtiRate && incomeTax > 0) {
    const edtiCredit = incomeTax * (sectorRules.edtiRate / 100);
    breakdown.push({
      label: 'EDTI Tax Credit',
      amount: -edtiCredit,
      description: `${sectorRules.edtiRate}% credit on qualifying investments`,
    });
    incomeTax = Math.max(0, incomeTax - edtiCredit);
  }

  const netVatPayable = vatResult.vatStatus === 'zero-rated' ? 0 : vatResult.netVat;
  const totalTaxPayable = Math.max(0, incomeTax + developmentLevy + netVatPayable - whtCredits);
  const effectiveRate = grossIncome > 0 ? (totalTaxPayable / grossIncome) * 100 : 0;

  return {
    grossIncome,
    taxableIncome,
    incomeTax,
    developmentLevy,
    vatPayable: netVatPayable,
    whtCredits,
    totalTaxPayable,
    effectiveRate,
    breakdown,
    alerts,
    entityType: inputs.entityType === 'company' ? 'Limited Liability Company' : 'Business Name',
    isSmallCompany,
    sectorId: inputs.sectorId,
    sectorRules: inputs.sectorRules,
    appliedIncentives: appliedIncentives.length > 0 ? appliedIncentives : undefined,
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
