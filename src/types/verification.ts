// Tax Verification Types - Nigeria Tax Act 2025

export interface ValidationResult {
  passed: boolean;
  ruleName: string;
  expected: string | number;
  actual: string | number;
  explanation: string;
}

export interface VerificationReport {
  timestamp: string;
  allPassed: boolean;
  results: ValidationResult[];
  rulesAge: number; // Days since last verification
  warnings: string[];
  sources: string[];
}

export interface VerificationData {
  verified: boolean;
  timestamp: string;
  checksRun: number;
  checksPassed: number;
  rulesAge: number;
  details: ValidationResult[];
  warnings: string[];
}

export interface TaxRuleSet {
  pitBands: { threshold: number; rate: number }[];
  citRate: number;
  smallCompanyTurnoverLimit: number;
  smallCompanyAssetLimit: number;
  developmentLevyRate: number;
  vatRate: number;
  rentReliefPercent: number;
  rentReliefMax: number;
  pensionRate: number;
  nhfRate: number;
  lossOfOfficeExemption: number;
}

// 2026 Rule Constants
export const TAX_RULES_2026: TaxRuleSet = {
  pitBands: [
    { threshold: 800000, rate: 0 },
    { threshold: 3000000, rate: 0.15 },
    { threshold: 12000000, rate: 0.18 },
    { threshold: 25000000, rate: 0.21 },
    { threshold: 50000000, rate: 0.23 },
    { threshold: Infinity, rate: 0.25 },
  ],
  citRate: 30,
  smallCompanyTurnoverLimit: 50000000,
  smallCompanyAssetLimit: 250000000,
  developmentLevyRate: 4,
  vatRate: 7.5,
  rentReliefPercent: 20,
  rentReliefMax: 500000,
  pensionRate: 8,
  nhfRate: 2.5,
  lossOfOfficeExemption: 50000000, // ₦50M under 2026 rules
};

// Pre-2026 Rule Constants
export const TAX_RULES_PRE2026: Partial<TaxRuleSet> = {
  pitBands: [
    { threshold: 300000, rate: 0.07 },
    { threshold: 600000, rate: 0.11 },
    { threshold: 1100000, rate: 0.15 },
    { threshold: 1600000, rate: 0.19 },
    { threshold: 3200000, rate: 0.21 },
    { threshold: Infinity, rate: 0.24 },
  ],
  citRate: 30,
  developmentLevyRate: 3, // 3% Tertiary Education Tax per Finance Act 2021
  vatRate: 7.5,
  lossOfOfficeExemption: 10000000, // ₦10M under pre-2026 rules
};

// Detailed verification source information
export interface VerificationSource {
  name: string;
  shortName: string;
  type: 'big4' | 'government' | 'legal' | 'industry';
  description: string;
  rulesVerified: string[];
  lastAccessed: string;
}

export const VERIFICATION_SOURCES_DETAILED: VerificationSource[] = [
  {
    name: 'PwC Tax Summaries - Nigeria',
    shortName: 'PwC',
    type: 'big4',
    description: 'PIT bands, CIT rates, VAT, deductions',
    rulesVerified: ['PIT Bands', 'CIT Rate', 'VAT Rate', 'Pension', 'TET Rate'],
    lastAccessed: '2026-01-21',
  },
  {
    name: 'KPMG Nigeria Tax Alert',
    shortName: 'KPMG',
    type: 'big4',
    description: 'Small company exemption, Development Levy',
    rulesVerified: ['Small Company Exemption', 'Development Levy', 'CIT Thresholds'],
    lastAccessed: '2026-01-21',
  },
  {
    name: 'EY Global Tax Alert',
    shortName: 'EY',
    type: 'big4',
    description: 'CRA abolition, Rent Relief, Loss of Office exemption',
    rulesVerified: ['CRA Abolished', 'Rent Relief', 'Loss of Office Exemption'],
    lastAccessed: '2026-01-21',
  },
  {
    name: 'Deloitte Nigeria Tax Update',
    shortName: 'Deloitte',
    type: 'big4',
    description: 'Pension, NHF, NHIS rates',
    rulesVerified: ['Pension Rate', 'NHF Rate', 'NHIS'],
    lastAccessed: '2026-01-21',
  },
  {
    name: 'Nigeria Revenue Service',
    shortName: 'NRS',
    type: 'government',
    description: 'Official tax filing requirements',
    rulesVerified: ['Filing Requirements', 'Tax Administration'],
    lastAccessed: '2026-01-21',
  },
  {
    name: 'Baker Tilly Nigeria',
    shortName: 'Baker Tilly',
    type: 'legal',
    description: 'Loss of Office CGT exemption thresholds',
    rulesVerified: ['Loss of Office Exemption', 'Severance Tax'],
    lastAccessed: '2026-01-21',
  },
  {
    name: 'Aluko & Oyebode',
    shortName: 'Aluko & Oyebode',
    type: 'legal',
    description: 'Employment tax relief provisions',
    rulesVerified: ['Loss of Office Exemption', 'Employment Benefits'],
    lastAccessed: '2026-01-21',
  },
];

export const VERIFICATION_SOURCES = [
  'PwC Tax Summaries - Nigeria Corporate Tax',
  'KPMG Nigeria Tax Alert - Tax Act 2025',
  'EY Global Tax Alert - Nigeria Tax Act 2025',
  'Deloitte Nigeria Tax Update',
  'NRS Guidelines',
  'Baker Tilly Nigeria',
  'Aluko & Oyebode',
];

export const VERIFICATION_METHODOLOGY = `All tax calculations are automatically validated against the Nigeria Tax Act 2025 (effective January 1, 2026) using rules cross-referenced from Big 4 Tax Advisories (PwC, KPMG, EY, Deloitte), Government Sources (Nigeria Revenue Service), and Legal References (Baker Tilly, Aluko & Oyebode). Rules were last verified on January 21, 2026.`;
