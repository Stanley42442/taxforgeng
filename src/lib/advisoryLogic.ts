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
  titleKey: string;
  summaryKey: string;
  prosKeys: string[];
  consKeys: string[];
  taxAuthorityKey: string;
  estimatedCosts: {
    registrationKey: string;
    annualKey: string;
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
      titleKey: 'advisory.result.company.title',
      summaryKey: 'advisory.result.company.summary',
      prosKeys: [
        'advisory.result.company.pros.liability',
        'advisory.result.company.pros.credibility',
        'advisory.result.company.pros.capital',
        'advisory.result.company.pros.citBenefit',
        'advisory.result.company.pros.perpetual',
      ],
      consKeys: [
        'advisory.result.company.cons.registration',
        'advisory.result.company.cons.compliance',
        'advisory.result.company.cons.annualReturns',
        'advisory.result.company.cons.audit',
      ],
      taxAuthorityKey: 'advisory.result.company.taxAuthority',
      estimatedCosts: {
        registrationKey: 'advisory.result.company.costs.registration',
        annualKey: 'advisory.result.company.costs.annual',
      },
      suitabilityScore,
    };
  } else {
    return {
      entityType: 'business_name',
      titleKey: 'advisory.result.businessName.title',
      summaryKey: 'advisory.result.businessName.summary',
      prosKeys: [
        'advisory.result.businessName.pros.lowCost',
        'advisory.result.businessName.pros.simpler',
        'advisory.result.businessName.pros.control',
        'advisory.result.businessName.pros.setup',
        'advisory.result.businessName.pros.taxRates',
      ],
      consKeys: [
        'advisory.result.businessName.cons.liability',
        'advisory.result.businessName.cons.funding',
        'advisory.result.businessName.cons.credibility',
        'advisory.result.businessName.cons.lifespan',
      ],
      taxAuthorityKey: 'advisory.result.businessName.taxAuthority',
      estimatedCosts: {
        registrationKey: 'advisory.result.businessName.costs.registration',
        annualKey: 'advisory.result.businessName.costs.annual',
      },
      suitabilityScore,
    };
  }
}

export interface AdvisoryQuestion {
  id: string;
  questionKey: string;
  descriptionKey: string;
  options: {
    value: boolean | string;
    labelKey: string;
    icon: string;
  }[];
}

export const advisoryQuestions: AdvisoryQuestion[] = [
  {
    id: 'hasPartners',
    questionKey: 'advisory.questions.hasPartners.question',
    descriptionKey: 'advisory.questions.hasPartners.description',
    options: [
      { value: true, labelKey: 'advisory.questions.hasPartners.yesPartners', icon: 'users' },
      { value: false, labelKey: 'advisory.questions.hasPartners.noSolo', icon: 'user' },
    ],
  },
  {
    id: 'expectedTurnover',
    questionKey: 'advisory.questions.expectedTurnover.question',
    descriptionKey: 'advisory.questions.expectedTurnover.description',
    options: [
      { value: 'under_25m', labelKey: 'advisory.questions.expectedTurnover.under25m', icon: 'trending-down' },
      { value: '25m_to_50m', labelKey: 'advisory.questions.expectedTurnover.25mTo50m', icon: 'minus' },
      { value: 'over_50m', labelKey: 'advisory.questions.expectedTurnover.over50m', icon: 'trending-up' },
    ],
  },
  {
    id: 'needsAssetProtection',
    questionKey: 'advisory.questions.needsAssetProtection.question',
    descriptionKey: 'advisory.questions.needsAssetProtection.description',
    options: [
      { value: true, labelKey: 'advisory.questions.needsAssetProtection.yesImportant', icon: 'shield' },
      { value: false, labelKey: 'advisory.questions.needsAssetProtection.notPriority', icon: 'shield-off' },
    ],
  },
  {
    id: 'ownsHome',
    questionKey: 'advisory.questions.ownsHome.question',
    descriptionKey: 'advisory.questions.ownsHome.description',
    options: [
      { value: true, labelKey: 'advisory.questions.ownsHome.yesAssets', icon: 'home' },
      { value: false, labelKey: 'advisory.questions.ownsHome.noSignificant', icon: 'briefcase' },
    ],
  },
  {
    id: 'isProfessionalService',
    questionKey: 'advisory.questions.isProfessionalService.question',
    descriptionKey: 'advisory.questions.isProfessionalService.description',
    options: [
      { value: true, labelKey: 'advisory.questions.isProfessionalService.yesProfessional', icon: 'briefcase' },
      { value: false, labelKey: 'advisory.questions.isProfessionalService.noProduct', icon: 'package' },
    ],
  },
  {
    id: 'hasSignificantAssets',
    questionKey: 'advisory.questions.hasSignificantAssets.question',
    descriptionKey: 'advisory.questions.hasSignificantAssets.description',
    options: [
      { value: true, labelKey: 'advisory.questions.hasSignificantAssets.yesSignificant', icon: 'building' },
      { value: false, labelKey: 'advisory.questions.hasSignificantAssets.minimal', icon: 'laptop' },
    ],
  },
  {
    id: 'planToSeekInvestment',
    questionKey: 'advisory.questions.planToSeekInvestment.question',
    descriptionKey: 'advisory.questions.planToSeekInvestment.description',
    options: [
      { value: true, labelKey: 'advisory.questions.planToSeekInvestment.yesFunding', icon: 'trending-up' },
      { value: false, labelKey: 'advisory.questions.planToSeekInvestment.selfFunded', icon: 'wallet' },
    ],
  },
];