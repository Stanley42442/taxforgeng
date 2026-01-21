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
};

export const VERIFICATION_SOURCES = [
  'PwC Tax Summaries - Nigeria Corporate Tax',
  'KPMG Nigeria Tax Alert - Tax Act 2025',
  'EY Global Tax Alert - Nigeria Tax Act 2025',
  'Deloitte Nigeria Tax Update',
  'NRS Guidelines',
];
