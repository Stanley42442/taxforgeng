// Sector presets for the tax calculator
// Based on Nigeria 2026 Tax Reforms

export interface SectorPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaults: {
    entityType: 'business_name' | 'company';
    turnover: number;
    expenses: number;
    fixedAssets: number;
    use2026Rules: boolean;
  };
  taxBenefits: string[];
  eligibility: string[];
  citRate?: number; // Special CIT rate if applicable
  vatExempt?: boolean;
  edtiCredit?: number; // EDTI credit percentage
  taxHoliday?: number; // Years of tax holiday
}

export const SECTOR_PRESETS: SectorPreset[] = [
  {
    id: 'tech-startup',
    name: 'Tech Startup (NSA)',
    icon: '💻',
    description: 'NITDA-labeled tech startups eligible for 5% EDTI credit',
    defaults: {
      entityType: 'company',
      turnover: 35000000,
      expenses: 15000000,
      fixedAssets: 10000000,
      use2026Rules: true,
    },
    taxBenefits: [
      '5% EDTI credit on R&D expenses',
      'Potential pioneer status (3-5 year tax holiday)',
      'Software development costs deductible',
      '0% CIT if turnover < ₦50M (small company)',
    ],
    eligibility: [
      'NITDA Software Labeling certification',
      'At least 70% revenue from tech services',
      'R&D expenditure documentation',
    ],
    edtiCredit: 5,
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: '🌾',
    description: 'Agricultural enterprises with 5-year CIT exemption',
    defaults: {
      entityType: 'company',
      turnover: 50000000,
      expenses: 35000000,
      fixedAssets: 25000000,
      use2026Rules: true,
    },
    taxBenefits: [
      '5-year initial CIT tax holiday',
      'Additional 3-year extension possible',
      'VAT zero-rating on agricultural inputs',
      'Import duty exemption on farm equipment',
    ],
    eligibility: [
      'Primary agricultural production',
      'Agro-processing activities',
      'Farming equipment ownership',
    ],
    vatExempt: true,
    taxHoliday: 5,
    citRate: 0,
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: '🏭',
    description: 'Manufacturing companies with capital allowances',
    defaults: {
      entityType: 'company',
      turnover: 150000000,
      expenses: 80000000,
      fixedAssets: 100000000,
      use2026Rules: true,
    },
    taxBenefits: [
      'Accelerated capital allowances on machinery',
      '15% investment tax credit on local materials',
      'Wage deduction for new hires (10% of wages)',
      'Pioneer status possible (3-5 years)',
    ],
    eligibility: [
      'Manufacturing operations in Nigeria',
      'Local content requirements',
      'Employment of Nigerian workers',
    ],
  },
  {
    id: 'retail',
    name: 'Retail / Trading',
    icon: '🛒',
    description: 'Retail businesses with presumptive tax option',
    defaults: {
      entityType: 'business_name',
      turnover: 20000000,
      expenses: 12000000,
      fixedAssets: 5000000,
      use2026Rules: true,
    },
    taxBenefits: [
      'Presumptive tax option (simplified)',
      '0% tax if turnover < ₦25M',
      'Lower compliance burden',
      'Quarterly filing option',
    ],
    eligibility: [
      'Turnover below ₦25M for presumptive tax',
      'Business name registration',
      'Basic bookkeeping',
    ],
  },
  {
    id: 'export',
    name: 'Export-Oriented',
    icon: '🚢',
    description: 'Export businesses with tax incentives',
    defaults: {
      entityType: 'company',
      turnover: 200000000,
      expenses: 120000000,
      fixedAssets: 50000000,
      use2026Rules: true,
    },
    taxBenefits: [
      'Export Expansion Grant (EEG)',
      'VAT zero-rating on exports',
      '10% tax credit on export profits',
      'Duty drawback on imported inputs',
    ],
    eligibility: [
      'At least 50% revenue from exports',
      'Non-oil export products',
      'Export documentation compliance',
    ],
  },
  {
    id: 'free-zone',
    name: 'Free Zone Company',
    icon: '🏗️',
    description: 'Companies in NEPZA/OGFZA free trade zones',
    defaults: {
      entityType: 'company',
      turnover: 500000000,
      expenses: 300000000,
      fixedAssets: 200000000,
      use2026Rules: true,
    },
    taxBenefits: [
      '100% CIT exemption on export income',
      'Duty-free import of equipment',
      'No withholding tax on dividends',
      '100% repatriation of capital',
    ],
    eligibility: [
      'Located in approved free zone',
      'At least 75% of output exported',
      'NEPZA/OGFZA license',
    ],
    citRate: 0,
    vatExempt: true,
  },
  {
    id: 'freelancer',
    name: 'Freelancer / Consultant',
    icon: '👨‍💻',
    description: 'Individual consultants and freelancers',
    defaults: {
      entityType: 'business_name',
      turnover: 8000000,
      expenses: 2000000,
      fixedAssets: 500000,
      use2026Rules: true,
    },
    taxBenefits: [
      'Personal income tax (progressive rates)',
      'Home office deduction (if applicable)',
      'Professional development expenses deductible',
      '0% if income < ₦800k (2026 threshold)',
    ],
    eligibility: [
      'Registered business name',
      'Service-based income',
      'Proper invoicing',
    ],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: '🏢',
    description: 'Property development and rental income',
    defaults: {
      entityType: 'company',
      turnover: 80000000,
      expenses: 40000000,
      fixedAssets: 150000000,
      use2026Rules: true,
    },
    taxBenefits: [
      'Capital allowances on buildings',
      'Interest expense deductible',
      'Stamp duty exemption on REIT transfers',
      'CGT deferral on reinvestment',
    ],
    eligibility: [
      'Property ownership documentation',
      'Land use compliance',
      'Rental agreements',
    ],
  },
];

export const getSectorPreset = (id: string): SectorPreset | undefined => {
  return SECTOR_PRESETS.find(p => p.id === id);
};

export const getSectorBenefitsSummary = (preset: SectorPreset): string => {
  const benefits: string[] = [];
  
  if (preset.taxHoliday) {
    benefits.push(`${preset.taxHoliday}-year tax holiday`);
  }
  if (preset.citRate === 0) {
    benefits.push('0% CIT');
  }
  if (preset.edtiCredit) {
    benefits.push(`${preset.edtiCredit}% EDTI credit`);
  }
  if (preset.vatExempt) {
    benefits.push('VAT exempt');
  }
  
  return benefits.length > 0 ? benefits.join(' • ') : 'Standard tax treatment';
};
