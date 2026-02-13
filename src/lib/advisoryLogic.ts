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
      title: 'Limited Liability Company (LLC)',
      summary: 'A separate legal entity that offers liability protection and is suitable for growth-oriented businesses.',
      pros: [
        'Limited personal liability - your personal assets are protected',
        'Enhanced business credibility with clients and partners',
        'Easier to raise capital and attract investors',
        'Lower corporate income tax rate (30% vs up to 25% PIT)',
        'Perpetual existence - business continues regardless of ownership changes',
      ],
      cons: [
        'Higher registration costs (₦50,000 - ₦150,000)',
        'More complex compliance requirements',
        'Annual returns filing with CAC required',
        'May require audited financial statements',
      ],
      taxAuthority: 'FIRS (Federal)',
      estimatedCosts: {
        registration: '₦50,000 - ₦150,000',
        annual: '₦100,000+',
      },
      suitabilityScore,
    };
  } else {
    return {
      entityType: 'business_name',
      title: 'Business Name / Sole Proprietorship',
      summary: 'A simple business structure ideal for solo entrepreneurs with lower compliance requirements.',
      pros: [
        'Low registration costs (₦10,000 - ₦25,000)',
        'Simpler tax filing and compliance',
        'Full control over business decisions',
        'Quick and easy setup process',
        'Lower tax rates for income under ₦50M (2026 small company threshold)',
      ],
      cons: [
        'Unlimited personal liability - your personal assets are at risk',
        'Harder to raise external funding',
        'May have less business credibility',
        'Business tied to owner\'s lifespan',
      ],
      taxAuthority: 'State IRS',
      estimatedCosts: {
        registration: '₦10,000 - ₦25,000',
        annual: '₦20,000 - ₦50,000',
      },
      suitabilityScore,
    };
  }
}

export interface AdvisoryQuestion {
  id: string;
  question: string;
  description: string;
  options: {
    value: boolean | string;
    label: string;
    icon: string;
  }[];
}

export const advisoryQuestions: AdvisoryQuestion[] = [
  {
    id: 'hasPartners',
    question: 'Do you have business partners?',
    description: 'This helps determine the best ownership structure for your situation.',
    options: [
      { value: true, label: 'Yes, I have partners', icon: 'users' },
      { value: false, label: 'No, I\'m a solo founder', icon: 'user' },
    ],
  },
  {
    id: 'expectedTurnover',
    question: 'What is your expected annual turnover?',
    description: 'Your revenue level affects tax obligations and recommended structure.',
    options: [
      { value: 'under_25m', label: 'Under ₦25 million', icon: 'trending-down' },
      { value: '25m_to_50m', label: '₦25 million to ₦50 million', icon: 'minus' },
      { value: 'over_50m', label: 'Over ₦50 million', icon: 'trending-up' },
    ],
  },
  {
    id: 'needsAssetProtection',
    question: 'Is protecting your personal assets important?',
    description: 'Some business structures separate personal and business liabilities.',
    options: [
      { value: true, label: 'Yes, this is very important', icon: 'shield' },
      { value: false, label: 'Not a priority right now', icon: 'shield-off' },
    ],
  },
  {
    id: 'ownsHome',
    question: 'Do you own a home or have significant personal assets?',
    description: 'This affects your risk exposure with different business structures.',
    options: [
      { value: true, label: 'Yes, I have significant personal assets', icon: 'home' },
      { value: false, label: 'No significant personal assets', icon: 'briefcase' },
    ],
  },
  {
    id: 'isProfessionalService',
    question: 'Is your business a professional service?',
    description: 'Examples: consulting, legal, medical, accounting services.',
    options: [
      { value: true, label: 'Yes, it\'s a professional service', icon: 'briefcase' },
      { value: false, label: 'No, it\'s product or other business', icon: 'package' },
    ],
  },
  {
    id: 'hasSignificantAssets',
    question: 'Will your business have significant fixed assets?',
    description: 'Equipment, property, vehicles, or other valuable business assets.',
    options: [
      { value: true, label: 'Yes, significant business assets', icon: 'building' },
      { value: false, label: 'Minimal assets needed', icon: 'laptop' },
    ],
  },
  {
    id: 'planToSeekInvestment',
    question: 'Do you plan to seek external investment?',
    description: 'Investors and VCs typically require specific business structures.',
    options: [
      { value: true, label: 'Yes, I plan to raise funding', icon: 'trending-up' },
      { value: false, label: 'No, I\'ll be self-funded', icon: 'wallet' },
    ],
  },
];
