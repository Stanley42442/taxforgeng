// Advisory Logic for Business Structure Recommendation

export interface AdvisoryAnswers {
  hasPartners: boolean | null;
  expectedTurnover: 'under_25m' | '25m_to_50m' | 'over_50m' | null;
  needsAssetProtection: boolean | null;
  ownsHome: boolean | null;
  isProfessionalService: boolean | null;
  hasSignificantAssets: boolean | null;
  planToSeekInvestment: boolean | null;
}

export interface Recommendation {
  entityType: 'business_name' | 'company';
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
  taxAuthority: string;
  estimatedCosts: {
    registration: string;
    annual: string;
  };
  suitabilityScore: number;
}

export function getRecommendation(answers: AdvisoryAnswers): Recommendation {
  let companyScore = 0;
  let businessNameScore = 0;

  // Partners evaluation
  if (answers.hasPartners) {
    companyScore += 2; // LTD better for multiple owners
  } else {
    businessNameScore += 1;
  }

  // Turnover evaluation
  if (answers.expectedTurnover === 'over_50m') {
    companyScore += 3; // Higher turnover benefits from LTD structure
  } else if (answers.expectedTurnover === 'under_25m') {
    businessNameScore += 2; // Simpler for small operations
  } else {
    companyScore += 1;
  }

  // Asset protection
  if (answers.needsAssetProtection) {
    companyScore += 4; // LTD provides liability protection
  }

  // Home ownership risk
  if (answers.ownsHome && !answers.needsAssetProtection) {
    companyScore += 2; // Personal assets at risk with Business Name
  }

  // Professional services
  if (answers.isProfessionalService) {
    businessNameScore += 1; // Often simpler, but depends on risk
  }

  // Significant fixed assets
  if (answers.hasSignificantAssets) {
    companyScore += 2; // Better asset management
  }

  // Investment plans
  if (answers.planToSeekInvestment) {
    companyScore += 5; // Investors prefer LTD companies
  }

  const recommendCompany = companyScore > businessNameScore;
  const totalScore = companyScore + businessNameScore;
  const suitabilityScore = recommendCompany 
    ? Math.min(100, Math.round((companyScore / totalScore) * 100))
    : Math.min(100, Math.round((businessNameScore / totalScore) * 100));

  if (recommendCompany) {
    return {
      entityType: 'company',
      title: 'Limited Liability Company (LTD)',
      summary: 'Based on your responses, a Limited Liability Company offers better protection and growth potential for your business.',
      pros: [
        'Limited personal liability - your personal assets are protected',
        'Better credibility with banks and potential investors',
        'Easier to raise capital and bring in partners',
        'Can benefit from 0% CIT if qualifying as small company (2026 rules)',
        'Perpetual succession - company continues beyond founders',
      ],
      cons: [
        'Higher registration costs (₦100,000 - ₦500,000+)',
        'More compliance requirements and paperwork',
        'Annual returns filing with CAC mandatory',
        'Audit requirements for certain companies',
      ],
      taxAuthority: 'Federal Inland Revenue Service (FIRS)',
      estimatedCosts: {
        registration: '₦100,000 - ₦500,000',
        annual: '₦50,000 - ₦200,000 (compliance)',
      },
      suitabilityScore,
    };
  } else {
    return {
      entityType: 'business_name',
      title: 'Business Name (Sole Proprietorship/Partnership)',
      summary: 'A Business Name registration is simpler and more cost-effective for your current business needs.',
      pros: [
        'Lower registration costs (₦10,000 - ₦25,000)',
        'Simpler compliance requirements',
        'Direct control over business decisions',
        'Easier to set up and maintain',
        'Income taxed at personal rates with relief options',
      ],
      cons: [
        'Unlimited personal liability - personal assets at risk',
        'Harder to raise external funding',
        'May not be taken as seriously by larger clients',
        'Business tied to owner\'s lifespan',
      ],
      taxAuthority: 'State Internal Revenue Service (SIRS)',
      estimatedCosts: {
        registration: '₦10,000 - ₦25,000',
        annual: '₦5,000 - ₦20,000 (renewal)',
      },
      suitabilityScore,
    };
  }
}

export const advisoryQuestions = [
  {
    id: 'hasPartners',
    question: 'Will you have business partners or co-founders?',
    description: 'This affects the legal structure and ownership documentation required.',
    options: [
      { value: true, label: 'Yes, I\'ll have partners', icon: 'users' },
      { value: false, label: 'No, I\'m going solo', icon: 'user' },
    ],
  },
  {
    id: 'expectedTurnover',
    question: 'What\'s your expected annual turnover?',
    description: 'This determines tax obligations and whether VAT registration is required.',
    options: [
      { value: 'under_25m', label: 'Under ₦25 million', icon: 'trending-down' },
      { value: '25m_to_50m', label: '₦25m - ₦50 million', icon: 'minus' },
      { value: 'over_50m', label: 'Over ₦50 million', icon: 'trending-up' },
    ],
  },
  {
    id: 'needsAssetProtection',
    question: 'Do you need protection for personal assets?',
    description: 'Limited liability separates personal assets from business debts and lawsuits.',
    options: [
      { value: true, label: 'Yes, this is important', icon: 'shield' },
      { value: false, label: 'Not a priority', icon: 'shield-off' },
    ],
  },
  {
    id: 'ownsHome',
    question: 'Do you own a home or significant personal assets?',
    description: 'Personal assets could be at risk without proper business structure.',
    options: [
      { value: true, label: 'Yes, I have assets to protect', icon: 'home' },
      { value: false, label: 'No significant assets', icon: 'briefcase' },
    ],
  },
  {
    id: 'isProfessionalService',
    question: 'Is this a professional service business?',
    description: 'Examples: Law firm, consulting, accounting, medical practice.',
    options: [
      { value: true, label: 'Yes, professional services', icon: 'briefcase' },
      { value: false, label: 'No, product/other service', icon: 'package' },
    ],
  },
  {
    id: 'hasSignificantAssets',
    question: 'Will you have significant business equipment or assets?',
    description: 'Fixed assets over ₦250m affect small company tax status.',
    options: [
      { value: true, label: 'Yes, significant assets', icon: 'building' },
      { value: false, label: 'Minimal fixed assets', icon: 'laptop' },
    ],
  },
  {
    id: 'planToSeekInvestment',
    question: 'Do you plan to seek investors or loans?',
    description: 'LTD companies are preferred by investors and easier to raise capital.',
    options: [
      { value: true, label: 'Yes, will seek funding', icon: 'trending-up' },
      { value: false, label: 'Self-funded for now', icon: 'wallet' },
    ],
  },
];
