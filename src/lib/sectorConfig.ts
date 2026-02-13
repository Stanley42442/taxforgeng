// Sector Configuration for TaxForge NG
import { 
  Cpu, Wheat, Factory, ShoppingCart, Globe, Package, CreditCard, 
  Stethoscope, Building, Truck, Leaf, Droplet, Utensils, GraduationCap, 
  HardHat, Store, Bitcoin, User, Briefcase, Building2
} from "lucide-react";

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
  pioneerStatus?: boolean; // Legacy: replaced by EDI under 2026 rules
  ediEligible?: boolean; // Economic Development Incentive (2026): 5% annual credit for 5 years
  greenHireDeduction?: number;
}

export interface SectorMyth {
  myth: string;
  truth: string;
}

export interface SectorPreset {
  id: string;
  name: string;
  icon: typeof Cpu;
  description: string;
  category: 'business' | 'individual' | 'specialized';
  presets: {
    turnover?: number;
    expenses?: number;
    fixedAssets?: number;
    vatableSales?: number;
    vatablePurchases?: number;
  };
  benefits: string[];
  taxRules: SectorTaxRules;
  myths: SectorMyth[];
  formFields?: string[]; // Which fields to show for this sector
}

// Extended sector presets with new categories
export const SECTOR_PRESETS: SectorPreset[] = [
  // === EXISTING SECTORS ===
  {
    id: 'tech',
    name: 'Tech/NSA',
    icon: Cpu,
    category: 'business',
    description: 'NITDA Software Accreditation benefits',
    presets: {
      turnover: 50000000,
      expenses: 20000000,
      fixedAssets: 15000000,
      vatableSales: 50000000,
      vatablePurchases: 5000000,
    },
    benefits: ['5% EDTI tax credit', 'R&D deductions', 'IP income benefits'],
    taxRules: {
      citRate: 0,
      vatStatus: 'standard',
      vatRate: 7.5,
      edtiRate: 5,
      pioneerStatus: true,
      ediEligible: true,
      specialIncentives: ['NSA labeling (<₦1.5B)', 'EDTI 5% credit', 'R&D deduction (5% of turnover)', 'EDI 5% annual credit (5 years)']
    },
    myths: [
      { myth: 'All tech companies are tax-free', truth: 'Only NSA-approved software companies qualify for reduced rates' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: Wheat,
    category: 'business',
    description: '5-year CIT exemption for primary production',
    presets: {
      turnover: 30000000,
      expenses: 18000000,
      fixedAssets: 25000000,
      vatableSales: 0,
      vatablePurchases: 8000000,
    },
    benefits: ['CIT holiday (5 years)', 'VAT zero-rating', 'Input VAT credits'],
    taxRules: {
      citRate: 0,
      vatStatus: 'zero',
      vatRate: 0,
      specialIncentives: ['Duty-free equipment', 'Accelerated depreciation', 'Export incentives']
    },
    myths: [
      { myth: 'Farm income is never taxed', truth: 'CIT holiday is 5 years only for primary production' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    category: 'business',
    description: 'Asset investment & wage deductions',
    presets: {
      turnover: 120000000,
      expenses: 80000000,
      fixedAssets: 200000000,
      vatableSales: 120000000,
      vatablePurchases: 60000000,
    },
    benefits: ['10% fixed asset credit', 'Wage deductions', 'Accelerated depreciation'],
    taxRules: {
      citRate: 30, // 30% for large companies under 2026 rules
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Investment Tax Credit 10%', 'Local raw material bonus 10%', 'Job creation 10% deduction']
    },
    myths: [
      { myth: 'Manufacturing always qualifies for pioneer status', truth: 'Under 2026 rules, Pioneer Status is replaced by EDI (5% annual tax credit for 5 years). Existing approvals continue under original terms' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'retail',
    name: 'Retail/SME',
    icon: ShoppingCart,
    category: 'business',
    description: 'Presumptive tax option for small businesses',
    presets: {
      turnover: 15000000,
      expenses: 9000000,
      fixedAssets: 3000000,
      vatableSales: 15000000,
      vatablePurchases: 10000000,
    },
    benefits: ['Presumptive tax option', 'Simplified filing', 'Small company relief'],
    taxRules: {
      citRate: 0,
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Simplified record-keeping', 'Reduced audit risk']
    },
    myths: [
      { myth: 'Small shops don\'t need to register for tax', truth: 'All businesses must register, but may qualify for simplified filing' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'freezone',
    name: 'Free Zone',
    icon: Globe,
    category: 'specialized',
    description: 'Export-focused tax incentives',
    presets: {
      turnover: 200000000,
      expenses: 100000000,
      fixedAssets: 80000000,
      vatableSales: 0,
      vatablePurchases: 40000000,
    },
    benefits: ['CIT exemption', 'Duty-free imports', 'No WHT on dividends'],
    taxRules: {
      citRate: 0,
      vatStatus: 'zero',
      vatRate: 0,
      specialIncentives: ['NEPZA/OGFZA registration', 'Repatriation guaranteed', 'One-stop approval']
    },
    myths: [
      { myth: 'Free zone companies pay no tax ever', truth: 'Exemptions apply to qualifying exports; local sales may be taxable' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'export',
    name: 'Export Business',
    icon: Package,
    category: 'business',
    description: 'Export expansion grant benefits',
    presets: {
      turnover: 80000000,
      expenses: 50000000,
      fixedAssets: 30000000,
      vatableSales: 0,
      vatablePurchases: 25000000,
    },
    benefits: ['VAT zero-rating', 'EEG eligibility', 'Forex retention'],
    taxRules: {
      citRate: 30, // 30% for large companies under 2026 rules
      vatStatus: 'zero',
      vatRate: 0,
      specialIncentives: ['EEG up to 30%', 'Duty drawback', 'Export Development Fund']
    },
    myths: [
      { myth: 'All export income is tax-free', truth: 'CIT still applies, but VAT is zero-rated for qualifying exports' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'fintech',
    name: 'Fintech',
    icon: CreditCard,
    category: 'business',
    description: 'Digital financial services taxation',
    presets: {
      turnover: 100000000,
      expenses: 60000000,
      fixedAssets: 20000000,
      vatableSales: 100000000,
      vatablePurchases: 30000000,
    },
    benefits: ['NSA labeling eligible', 'R&D deductions', 'EDTI credits'],
    taxRules: {
      citRate: 30, // 30% for large companies under 2026 rules (small companies 0%)
      vatStatus: 'standard',
      vatRate: 7.5,
      edtiRate: 5,
      pioneerStatus: true,
      ediEligible: true,
      specialIncentives: ['CBN sandbox benefits', 'Platform development deductions', 'EDI 5% annual credit (5 years)']
    },
    myths: [
      { myth: 'Fintech companies are always exempt from VAT', truth: 'Financial service fees are VATable; some interest income may be exempt' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Stethoscope,
    category: 'business',
    description: 'Medical services exemptions',
    presets: {
      turnover: 50000000,
      expenses: 35000000,
      fixedAssets: 40000000,
      vatableSales: 0,
      vatablePurchases: 15000000,
    },
    benefits: ['VAT-exempt services', 'Equipment duty waiver', 'EDI tax credit (formerly Pioneer Status)'],
    taxRules: {
      citRate: 30, // 30% for large companies under 2026 rules (small companies 0%)
      vatStatus: 'exempt',
      vatRate: 0,
      pioneerStatus: true,
      ediEligible: true,
      specialIncentives: ['Duty-free medical equipment', 'NAFDAC fast-track', 'EDI 5% annual credit (5 years)']
    },
    myths: [
      { myth: 'All healthcare is tax-free', truth: 'Medical services are VAT-exempt, but CIT still applies' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    icon: Building,
    category: 'business',
    description: 'Property development & rental income',
    presets: {
      turnover: 150000000,
      expenses: 100000000,
      fixedAssets: 500000000,
      vatableSales: 150000000,
      vatablePurchases: 80000000,
    },
    benefits: ['Capital allowances', 'Interest deductions', 'CGT deferral'],
    taxRules: {
      citRate: 30, // 30% for large companies under 2026 rules
      vatStatus: 'standard',
      vatRate: 7.5,
      whtRate: 10,
      specialIncentives: ['10% CGT on disposal', 'Rollover relief available']
    },
    myths: [
      { myth: 'Rental income is only taxed when withdrawn', truth: 'Rental income is taxed when earned; 10% WHT applies' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases', 'rentalIncome']
  },
  {
    id: 'logistics',
    name: 'Logistics',
    icon: Truck,
    category: 'business',
    description: 'Transportation and warehousing',
    presets: {
      turnover: 80000000,
      expenses: 55000000,
      fixedAssets: 60000000,
      vatableSales: 80000000,
      vatablePurchases: 40000000,
    },
    benefits: ['Vehicle depreciation', 'Fuel deductions', 'Export logistics incentives'],
    taxRules: {
      citRate: 30, // 30% for large companies under 2026 rules
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Accelerated vehicle depreciation', 'Export logistics zero-rated']
    },
    myths: [
      { myth: 'Transport is always VAT-exempt', truth: 'Only public passenger transport is exempt; freight is VATable' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },

  // === NEW SECTORS (Phase 1) ===
  {
    id: 'renewables',
    name: 'Renewables/Green Energy',
    icon: Leaf,
    category: 'specialized',
    description: 'Eco-investment incentives and green technology',
    presets: {
      turnover: 100000000,
      expenses: 60000000,
      fixedAssets: 150000000,
      vatableSales: 50000000,
      vatablePurchases: 80000000,
    },
    benefits: ['5% EDTI on eco-investments', 'Zero VAT on EVs/solar', '50% green tech hire deduction'],
    taxRules: {
      citRate: 30, // 30% for large companies under 2026 rules
      vatStatus: 'zero',
      vatRate: 0,
      edtiRate: 5,
      greenHireDeduction: 50,
      specialIncentives: ['EV import duty exemption', 'Solar equipment zero-rating', 'Green bond incentives']
    },
    myths: [
      { myth: 'All green investments are tax-free', truth: 'Only qualifying eco-investments get 5% EDTI credit, not full exemption' },
      { myth: 'Solar panels have no import duty', truth: 'Zero-rated for VAT, but import duty still applies unless exempted' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'oil_gas',
    name: 'Oil & Gas/Hydrocarbons',
    icon: Droplet,
    category: 'specialized',
    description: 'Dual taxation with Hydrocarbon Tax and CIT',
    presets: {
      turnover: 500000000,
      expenses: 300000000,
      fixedAssets: 1000000000,
      vatableSales: 500000000,
      vatablePurchases: 200000000,
    },
    benefits: ['Gas investment credits', 'Accelerated depreciation', 'Cost recovery provisions'],
    taxRules: {
      citRate: 30,
      hydrocarbonTaxMin: 15,
      hydrocarbonTaxMax: 30,
      environmentalSurcharge: 5,
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Gas flare penalty exemptions', 'Deep offshore incentives', 'Marginal field incentives']
    },
    myths: [
      { myth: 'Oil companies pay 85% tax', truth: 'Legacy PPT (50-85%) is being phased out; new Hydrocarbon Tax is 15-30%' },
      { myth: 'All oil income goes to government', truth: 'Cost recovery and profit sharing determine actual government take' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'hospitality',
    name: 'Hospitality/Tourism',
    icon: Utensils,
    category: 'business',
    description: 'Seasonal business incentives and presumptive options',
    presets: {
      turnover: 40000000,
      expenses: 28000000,
      fixedAssets: 50000000,
      vatableSales: 40000000,
      vatablePurchases: 15000000,
    },
    benefits: ['Presumptive tax for small operators', 'VAT-exempt transport services', 'Seasonal wage deductions'],
    taxRules: {
      citRate: 30, // 30% for large companies under 2026 rules (small companies 0%)
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Tourism levy credits', 'Hotel equipment duty waivers', 'Local sourcing incentives']
    },
    myths: [
      { myth: 'Hotels don\'t pay VAT', truth: 'Accommodation is VATable at 7.5%; only passenger transport is exempt' },
      { myth: 'Tips are tax-free', truth: 'Tips are taxable income for employees under PAYE' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'education_health',
    name: 'Education/Health Services',
    icon: GraduationCap,
    category: 'business',
    description: 'Social sector exemptions and reduced rates',
    presets: {
      turnover: 30000000,
      expenses: 22000000,
      fixedAssets: 20000000,
      vatableSales: 0,
      vatablePurchases: 8000000,
    },
    benefits: ['Zero VAT on educational materials', '0% CIT for small institutions', '10% donation deduction cap'],
    taxRules: {
      citRate: 0,
      vatStatus: 'exempt',
      vatRate: 0,
      donationCap: 10,
      specialIncentives: ['Scholarship deductions', 'Research grants exemption', 'Equipment duty waivers']
    },
    myths: [
      { myth: 'All schools are tax-exempt', truth: 'Only qualifying small educational institutions get 0% CIT' },
      { myth: 'Private schools pay no tax', truth: 'For-profit schools pay standard CIT; VAT exemption applies to tuition' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'construction',
    name: 'Construction/Real Estate',
    icon: HardHat,
    category: 'business',
    description: 'Property development and contract taxation',
    presets: {
      turnover: 200000000,
      expenses: 150000000,
      fixedAssets: 100000000,
      vatableSales: 200000000,
      vatablePurchases: 120000000,
    },
    benefits: ['WHT 5-10% on contracts', 'Rent relief up to ₦500k', 'CGT home sale exemptions'],
    taxRules: {
      citRate: 30, // 30% for large companies under 2026 rules
      vatStatus: 'standard',
      vatRate: 7.5,
      whtRate: 5,
      rentReliefMax: 500000,
      rentReliefPercent: 20,
      specialIncentives: ['Infrastructure bond incentives', 'Affordable housing credits', 'Stamp duty reductions']
    },
    myths: [
      { myth: 'Selling your home is always tax-free', truth: 'Principal residence exemption has conditions and limits' },
      { myth: 'Construction contracts avoid withholding tax', truth: '5% WHT applies to all construction contracts' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases', 'rentPaid']
  },
  {
    id: 'informal',
    name: 'Informal/Micro-Enterprise',
    icon: Store,
    category: 'individual',
    description: 'Simplified compliance for unregistered businesses',
    presets: {
      turnover: 5000000,
      expenses: 3000000,
      fixedAssets: 500000,
      vatableSales: 0,
      vatablePurchases: 0,
    },
    benefits: ['Location-based flat taxes (₦5k-50k)', 'Formalization incentives', 'VAT exemption for micro-enterprises'],
    taxRules: {
      citRate: 0,
      vatStatus: 'exempt',
      vatRate: 0,
      presumptiveMin: 5000,
      presumptiveMax: 50000,
      specialIncentives: ['CAC registration assistance', 'Business development support', 'Microfinance access']
    },
    myths: [
      { myth: 'Small traders don\'t need to pay any tax', truth: 'Presumptive taxes (₦5k-50k) still apply based on location and activity' },
      { myth: 'Unregistered businesses are illegal', truth: 'Registration is encouraged but informal trading is common and taxable' }
    ],
    formFields: ['turnover', 'expenses']
  },

  // === INDIVIDUAL MODES ===
  {
    id: 'individual',
    name: 'Individual (No Business)',
    icon: User,
    category: 'individual',
    description: 'Personal income tax for employed individuals',
    presets: {
      turnover: 0,
      expenses: 0,
      fixedAssets: 0,
      vatableSales: 0,
      vatablePurchases: 0,
    },
    benefits: ['₦800k annual exemption', 'Progressive rates 0-25%', 'Pension contributions relief'],
    taxRules: {
      citRate: 0,
      vatStatus: 'exempt',
      vatRate: 0,
      specialIncentives: ['PAYE withholding', 'NHF contributions', 'Life insurance premiums']
    },
    myths: [
      { myth: 'Employees don\'t file tax returns', truth: 'Employees with additional income must file annual returns' },
      { myth: 'Only high earners pay tax', truth: 'Tax starts above ₦800k but filing is required for most' }
    ],
    formFields: []
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency/Digital Assets',
    icon: Bitcoin,
    category: 'individual',
    description: 'Taxation of crypto income and capital gains',
    presets: {
      turnover: 10000000,
      expenses: 0,
      fixedAssets: 0,
      vatableSales: 0,
      vatablePurchases: 0,
    },
    benefits: ['Exemptions for gains ≤₦10-150M', 'Loss carry-forward', 'Progressive CGT up to 25%'],
    taxRules: {
      citRate: 0,
      vatStatus: 'exempt',
      vatRate: 0,
      specialIncentives: ['Cost basis deductions', 'Exchange fee deductions', 'Wallet-to-wallet transfers exempt']
    },
    myths: [
      { myth: 'Crypto is completely untaxed in Nigeria', truth: 'Crypto income is taxable as PIT; capital gains attract CGT' },
      { myth: 'CBN crypto ban means no tax obligation', truth: 'Tax liability exists regardless of banking restrictions' }
    ],
    formFields: ['capitalGains']
  }
];

// Helper to get sector by ID
export const getSectorById = (id: string): SectorPreset | undefined => {
  return SECTOR_PRESETS.find(s => s.id === id);
};

// Get sectors by category
export const getSectorsByCategory = (category: 'business' | 'individual' | 'specialized'): SectorPreset[] => {
  return SECTOR_PRESETS.filter(s => s.category === category);
};

// Presumptive tax rates by location (informal sector)
export const PRESUMPTIVE_TAX_RATES: Record<string, { min: number; max: number; description: string }> = {
  lagos: { min: 20000, max: 50000, description: 'High-traffic commercial areas' },
  abuja: { min: 15000, max: 40000, description: 'Federal Capital Territory' },
  port_harcourt: { min: 12000, max: 35000, description: 'Oil & gas hub' },
  kano: { min: 8000, max: 25000, description: 'Northern commercial center' },
  other_urban: { min: 5000, max: 20000, description: 'Other state capitals' },
  rural: { min: 5000, max: 10000, description: 'Rural and semi-urban areas' }
};

// Digital VAT thresholds for NRP/SEP
export const DIGITAL_VAT_CONFIG = {
  sepThreshold: 25000000, // ₦25M annual revenue threshold
  vatRate: 7.5,
  registrationRequired: true,
  exemptCategories: ['local_sme', 'zero_rated_exports', 'essential_digital_services']
};

// Crypto tax thresholds (2026 rules)
export const CRYPTO_TAX_CONFIG = {
  exemptionThresholdMin: 10000000, // ₦10M
  exemptionThresholdMax: 150000000, // ₦150M
  progressiveRates: [
    { threshold: 10000000, rate: 0 },
    { threshold: 50000000, rate: 10 },
    { threshold: 150000000, rate: 15 },
    { threshold: Infinity, rate: 25 }
  ],
  lossCarryForwardYears: 4
};
