// Comprehensive Nigerian Tax Myths & Facts Database

export interface TaxMyth {
  id: string;
  myth: string;
  truth: string;
  explanation: string;
  category: 'gifts' | 'audits' | 'penalties' | 'foreign' | 'vat' | 'exemptions' | 'reforms' | 'general' | 'digital' | 'compliance';
  severity: 'high' | 'medium' | 'low'; // How dangerous the myth is
  tier: 'free' | 'basic' | 'business';
  relatedTopics: string[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface SectorGuide {
  id: string;
  sector: 'tech' | 'agriculture' | 'manufacturing' | 'retail' | 'freezone' | 'export' | 'fintech' | 'healthcare';
  title: string;
  description: string;
  benefits: string[];
  requirements: string[];
  taxIncentives: {
    name: string;
    value: string;
    duration?: string;
  }[];
  content: string;
  tier: 'free' | 'basic' | 'business';
  icon: string;
}

export interface VideoGuide {
  id: string;
  title: string;
  description: string;
  duration: string;
  youtubeId?: string;
  thumbnail?: string;
  category: 'basics' | 'reforms' | 'sectors' | 'tips';
  tier: 'free' | 'basic' | 'business';
}

export const taxMyths: TaxMyth[] = [
  // GIFTS & INCOME MYTHS
  {
    id: 'gift-narration',
    myth: 'Labeling money transfers as "gifts" or "birthday money" means they\'re tax-free',
    truth: 'FIRS assesses income based on SUBSTANCE, not labels. Regular "gifts" from clients are income.',
    explanation: 'The tax authorities look at the economic substance of transactions, not what you call them. If you regularly receive money from the same sources as payment for services, calling it a "gift" won\'t change its tax treatment. FIRS can reclassify transactions based on patterns, frequency, and business relationships.',
    category: 'gifts',
    severity: 'high',
    tier: 'free',
    relatedTopics: ['income classification', 'tax evasion', 'FIRS audits'],
    quiz: {
      question: 'A freelancer receives ₦500,000 monthly labeled as "support" from a client. How is this treated?',
      options: [
        'Tax-free gift since it\'s not called salary',
        'Taxable income based on substance',
        'Only 50% taxable',
        'Tax-free if under ₦1 million'
      ],
      correctIndex: 1,
      explanation: 'Regular payments from business relationships are taxable income regardless of the label. FIRS looks at substance over form.'
    }
  },
  {
    id: 'startup-grace-period',
    myth: 'New startups get an automatic 2-year grace period before paying taxes',
    truth: 'There\'s NO automatic grace period. Taxes are due from day one of operations.',
    explanation: 'This is one of the most dangerous tax myths. While certain incentives exist (like the Economic Development Incentive (EDI, formerly Pioneer Status)), there\'s no blanket exemption for new businesses. CIT, VAT, and PAYE obligations begin immediately upon commencement of business activities.',
    category: 'exemptions',
    severity: 'high',
    tier: 'free',
    relatedTopics: ['startup compliance', 'first-year taxes', 'Pioneer Status', 'EDI'],
    quiz: {
      question: 'When must a new Nigerian company start paying taxes?',
      options: [
        'After 2 years of operation',
        'Once profitable',
        'From day one of business activities',
        'After ₦10 million turnover'
      ],
      correctIndex: 2,
      explanation: 'Tax obligations begin immediately. There\'s no automatic grace period for new businesses in Nigeria.'
    }
  },
  {
    id: 'foreign-income-auto-taxed',
    myth: 'All foreign income is automatically taxed when received in Nigeria',
    truth: 'Foreign income taxation depends on residency status and income type. Gift remittances from family are generally exempt.',
    explanation: 'Nigerian tax residency is determined by presence (183+ days) or a permanent home. Residents are taxed on worldwide income, but genuine gifts from family abroad aren\'t typically taxable. Employment income earned abroad may have treaty protections.',
    category: 'foreign',
    severity: 'medium',
    tier: 'free',
    relatedTopics: ['tax residency', 'double taxation treaties', 'diaspora remittances'],
    quiz: {
      question: 'Are family remittances from abroad taxable in Nigeria?',
      options: [
        'Always taxable at 10%',
        'Generally exempt if genuine gifts',
        'Taxable only if over ₦5 million',
        'Depends on the sender\'s country'
      ],
      correctIndex: 1,
      explanation: 'Genuine gift remittances from family members abroad are generally not taxable in Nigeria.'
    }
  },
  {
    id: 'vat-all-digital',
    myth: 'VAT applies to ALL digital purchases and subscriptions',
    truth: 'VAT exemptions exist for educational materials, some software, and specific digital services.',
    explanation: 'While Nigeria implemented VAT on digital services (7.5%), not everything is covered. Educational materials remain exempt. B2B software may qualify for input VAT recovery. The rules distinguish between consumer-facing and business services.',
    category: 'vat',
    severity: 'medium',
    tier: 'free',
    relatedTopics: ['digital services tax', 'VAT exemptions', 'e-commerce taxation'],
    quiz: {
      question: 'Which digital purchase is VAT-exempt in Nigeria?',
      options: [
        'Netflix subscription',
        'Educational e-books',
        'Gaming apps',
        'Music streaming'
      ],
      correctIndex: 1,
      explanation: 'Educational materials, including digital educational content, remain VAT-exempt in Nigeria.'
    }
  },
  {
    id: 'penalties-jail',
    myth: 'Tax filing errors automatically lead to criminal prosecution and jail time',
    truth: 'Penalties are graduated and often waivable. Criminal prosecution is reserved for deliberate fraud.',
    explanation: 'Nigeria\'s tax system uses progressive penalties: late filing (5-10%), late payment (interest at CBN rate), and underreporting (additional assessments). Criminal prosecution requires proof of willful fraud. FIRS often offers voluntary disclosure programs with reduced penalties.',
    category: 'penalties',
    severity: 'high',
    tier: 'free',
    relatedTopics: ['voluntary disclosure', 'penalty waivers', 'tax disputes'],
    quiz: {
      question: 'What happens if you file your CIT return 2 months late?',
      options: [
        'Automatic arrest warrant',
        '10% penalty on tax due + interest',
        'Business license revoked',
        'No consequences for first offense'
      ],
      correctIndex: 1,
      explanation: 'Late CIT filing attracts a 10% penalty on tax due plus interest at CBN lending rate. Criminal charges require proof of fraud.'
    }
  },
  {
    id: 'audits-random',
    myth: 'Tax audits are completely random - anyone can be targeted anytime',
    truth: 'Audits are RISK-BASED, triggered by red flags like inconsistent filings or large refund claims.',
    explanation: 'FIRS uses data analytics to identify audit targets. Common triggers include: large VAT refund claims, inconsistent filings across periods, lifestyle inconsistent with declared income, industry-specific reviews, and anonymous tips. Good record-keeping reduces audit risk.',
    category: 'audits',
    severity: 'medium',
    tier: 'basic',
    relatedTopics: ['audit triggers', 'risk assessment', 'FIRS investigations'],
    quiz: {
      question: 'What typically triggers a FIRS tax audit?',
      options: [
        'Random computer selection only',
        'Being in a specific industry',
        'Risk-based factors like large refund claims',
        'Earning above ₦50 million'
      ],
      correctIndex: 2,
      explanation: 'FIRS uses risk-based targeting. Red flags like large refunds, inconsistent filings, or lifestyle-income mismatches trigger audits.'
    }
  },
  {
    id: 'free-zone-scrapped',
    myth: 'All free zone tax holidays were scrapped in the 2025 reforms',
    truth: 'Export-oriented free zone benefits are RETAINED. Only domestic sales lost some advantages.',
    explanation: 'The Nigeria Tax Act 2025 preserved tax incentives for free zones focused on exports. Companies in NEPZA/OGFZA zones still enjoy: CIT holiday for exports, duty-free imports, no WHT on dividends to non-residents. Domestic sales from free zones now attract standard taxes.',
    category: 'reforms',
    severity: 'medium',
    tier: 'business',
    relatedTopics: ['NEPZA', 'OGFZA', 'export incentives', 'free trade zones'],
    quiz: {
      question: 'Under 2026 rules, what happens to free zone export benefits?',
      options: [
        'Completely eliminated',
        'Reduced by 50%',
        'Retained for export-oriented businesses',
        'Converted to tax credits only'
      ],
      correctIndex: 2,
      explanation: 'Free zone benefits for export-oriented businesses are retained. Only domestic sales from free zones lost advantages.'
    }
  },
  {
    id: 'food-prices-vat',
    myth: 'The 2026 tax reforms will dramatically increase food prices through VAT',
    truth: 'Basic food items remain VAT-EXEMPT. Zero-rating on agricultural inputs actually REDUCES farm costs.',
    explanation: 'The reforms maintain VAT exemptions on unprocessed food, agricultural produce, and basic staples. Additionally, zero-rating on agricultural inputs (seeds, fertilizer, equipment) means farmers can claim back VAT, potentially lowering production costs and food prices.',
    category: 'reforms',
    severity: 'high',
    tier: 'free',
    relatedTopics: ['VAT exemptions', 'food security', 'agricultural incentives'],
    quiz: {
      question: 'How do 2026 rules affect VAT on basic food items?',
      options: [
        'New 7.5% VAT applies',
        'Remains VAT-exempt',
        '15% luxury food tax',
        'Only exempt for low-income buyers'
      ],
      correctIndex: 1,
      explanation: 'Basic food items remain VAT-exempt under the 2026 rules. Agricultural inputs are zero-rated, reducing farm costs.'
    }
  },
  {
    id: 'crypto-unreported',
    myth: 'Cryptocurrency gains don\'t need to be reported since crypto isn\'t recognized',
    truth: 'Crypto gains are TAXABLE as capital gains (10% CGT) regardless of regulatory status.',
    explanation: 'While CBN restricts banking services for crypto, FIRS treats crypto as property. Gains from crypto disposals attract 10% Capital Gains Tax. Losses can offset gains. Proper record-keeping of acquisition costs is essential.',
    category: 'digital',
    severity: 'high',
    tier: 'basic',
    relatedTopics: ['cryptocurrency', 'capital gains', 'digital assets'],
    quiz: {
      question: 'You sold Bitcoin for ₦5 million profit. What\'s the tax treatment?',
      options: [
        'Tax-free - crypto isn\'t legal',
        '10% CGT = ₦500,000',
        'Only taxable if converted to fiat',
        '30% income tax applies'
      ],
      correctIndex: 1,
      explanation: 'Crypto gains attract 10% Capital Gains Tax in Nigeria, regardless of regulatory restrictions on crypto banking.'
    }
  },
  {
    id: 'wht-final',
    myth: 'Withholding Tax deducted at source is the FINAL tax - no need to file returns',
    truth: 'WHT is an ADVANCE payment. You must file returns and claim WHT as credit against final tax.',
    explanation: 'Withholding Tax (5-10% depending on payment type) is deducted at source but isn\'t your final tax liability. You must file annual returns showing total income and claim WHT certificates as credit. If WHT exceeds actual tax, you can claim a refund.',
    category: 'general',
    severity: 'medium',
    tier: 'free',
    relatedTopics: ['WHT credits', 'tax returns', 'advance payments'],
    quiz: {
      question: 'What should you do with WHT deduction certificates?',
      options: [
        'Keep as proof tax is paid - no filing needed',
        'File returns and claim as credit against total tax',
        'Only useful if requesting refund',
        'Submit to your bank for records'
      ],
      correctIndex: 1,
      explanation: 'WHT certificates must be claimed as credits when filing your annual tax returns. They\'re advance payments, not final tax.'
    }
  },
  {
    id: 'small-company-automatic',
    myth: 'Companies with low turnover automatically qualify for 0% CIT under 2026 rules',
    truth: 'You must meet BOTH thresholds: turnover ≤₦50m AND fixed assets ≤₦250m.',
    explanation: 'The small company exemption requires meeting two conditions simultaneously. A company with ₦40m turnover but ₦300m in assets doesn\'t qualify. Similarly, a company with ₦60m turnover but ₦100m assets doesn\'t qualify. Both thresholds must be satisfied.',
    category: 'reforms',
    severity: 'medium',
    tier: 'free',
    relatedTopics: ['small company status', 'CIT exemption', '2026 rules'],
    quiz: {
      question: 'A company has ₦45m turnover and ₦300m fixed assets. Under 2026 rules, what CIT rate applies?',
      options: [
        '0% - qualifies as small company',
        '30% - exceeds asset threshold',
        '15% - reduced rate applies',
        '30% - old rate still applies'
      ],
      correctIndex: 1,
      explanation: 'Despite low turnover, exceeding the ₦250m asset threshold disqualifies the company from 0% small company rate.'
    }
  },
  {
    id: 'dividends-always-exempt',
    myth: 'All dividend income is tax-exempt in Nigeria',
    truth: 'Only FRANKED dividends from Nigerian companies are exempt. Foreign dividends are taxable.',
    explanation: 'Dividends from Nigerian companies (franked dividends) are exempt because the company already paid CIT on the profits. However, dividends from foreign companies are taxable as foreign income. Additionally, dividends to non-residents may attract 10% WHT.',
    category: 'general',
    severity: 'medium',
    tier: 'basic',
    relatedTopics: ['dividend taxation', 'franked dividends', 'foreign income'],
    quiz: {
      question: 'You receive ₦1m dividends from a US company. Tax treatment?',
      options: [
        'Tax-exempt like Nigerian dividends',
        'Taxable as foreign income',
        '10% flat rate applies',
        'Only taxable if over ₦5m'
      ],
      correctIndex: 1,
      explanation: 'Foreign dividends are taxable as foreign income. Only franked dividends from Nigerian companies are exempt.'
    }
  },
  {
    id: 'tin-later',
    myth: 'You only need a TIN when you\'re ready to pay taxes',
    truth: 'TIN registration is MANDATORY for many activities: bank accounts, contracts, land purchases.',
    explanation: 'Tax Identification Number (TIN) is required for: opening bank accounts, government contracts, land registry transactions, vehicle registration, and business registrations. Failure to obtain TIN can block legitimate business activities even before tax liability arises.',
    category: 'compliance',
    severity: 'medium',
    tier: 'free',
    relatedTopics: ['TIN registration', 'tax compliance', 'business setup'],
    quiz: {
      question: 'When should a new business owner obtain a TIN?',
      options: [
        'When first tax payment is due',
        'After first profitable year',
        'Immediately - required for bank accounts and contracts',
        'Only if turnover exceeds ₦10m'
      ],
      correctIndex: 2,
      explanation: 'TIN should be obtained immediately. It\'s required for bank accounts, contracts, and many other business activities.'
    }
  },
  {
    id: 'spouse-splitting',
    myth: 'You can split income with your spouse to reduce taxes',
    truth: 'Income splitting is NOT allowed. Each person is taxed on their OWN income.',
    explanation: 'Unlike some countries, Nigeria doesn\'t allow income splitting between spouses. Each individual is taxed on their actual earned income. However, legitimate business structures (e.g., employing spouse) with real work performed are acceptable.',
    category: 'general',
    severity: 'low',
    tier: 'basic',
    relatedTopics: ['family taxation', 'income splitting', 'tax planning'],
    quiz: {
      question: 'Can a high-earning spouse transfer income to a lower-earning spouse for tax purposes?',
      options: [
        'Yes, up to 50% can be transferred',
        'No, each person is taxed on their own income',
        'Only for joint bank accounts',
        'Yes, if they file jointly'
      ],
      correctIndex: 1,
      explanation: 'Income splitting isn\'t allowed in Nigeria. Each person is taxed individually on their own earned income.'
    }
  },
  {
    id: 'state-federal-choice',
    myth: 'You can choose whether to pay taxes to state or federal government',
    truth: 'Tax jurisdiction is determined by LAW based on income type and business structure.',
    explanation: 'PIT goes to your state of residence (via PAYE or self-assessment). CIT goes to federal (FIRS). VAT is federal. You can\'t choose. Operating in multiple states may require filing in each. State IGR matters for certain taxes.',
    category: 'general',
    severity: 'low',
    tier: 'free',
    relatedTopics: ['tax jurisdiction', 'state vs federal', 'multi-state operations'],
    quiz: {
      question: 'Where does a Lagos-based company pay its Company Income Tax?',
      options: [
        'Lagos State Internal Revenue',
        'Federal Inland Revenue Service',
        'Choice between state or federal',
        'Depends on company size'
      ],
      correctIndex: 1,
      explanation: 'CIT is always paid to FIRS (federal). PIT goes to state. VAT is federal. Jurisdiction is determined by law, not choice.'
    }
  },
  {
    id: 'pioneer-easy',
    myth: 'Getting Pioneer Status is easy and automatic for qualifying industries',
    truth: 'Pioneer Status required formal application to NIPC. Under 2026 rules, it is replaced by EDI (5% annual tax credit for 5 years on qualifying capex).',
    explanation: 'Pioneer Status (up to 5 years CIT holiday) required: application to NIPC, investment/employment commitments, and ongoing compliance. Under the Nigeria Tax Act 2025, it is replaced by the Economic Development Incentive (EDI), which provides a 5% annual tax credit for 5 years on qualifying capital expenditure. Existing Pioneer Status approvals continue under their original terms, but new applicants should apply for EDI.',
    category: 'exemptions',
    severity: 'medium',
    tier: 'business',
    relatedTopics: ['Pioneer Status', 'EDI', 'NIPC', 'tax credits', 'investment incentives'],
    quiz: {
      question: 'Under 2026 rules, what replaced the Pioneer Status tax holiday?',
      options: [
        'Automatic exemption for listed industries',
        'Economic Development Incentive (EDI) — 5% annual tax credit',
        'Extended CIT holiday of 10 years',
        'Simply claim it when filing taxes'
      ],
      correctIndex: 1,
      explanation: 'Pioneer Status is replaced by EDI under the Nigeria Tax Act 2025, providing a 5% annual tax credit for 5 years on qualifying capex.'
    }
  },
  {
    id: 'cash-untraceable',
    myth: 'Cash transactions are untraceable and don\'t need to be reported',
    truth: 'Banks report large cash transactions. Lifestyle audits can reveal unreported income.',
    explanation: 'Nigerian banks report cash transactions above certain thresholds. FIRS conducts lifestyle audits comparing assets/spending to declared income. Third-party data (property records, vehicle registrations) is cross-referenced. Cash businesses are often flagged for audits.',
    category: 'audits',
    severity: 'high',
    tier: 'basic',
    relatedTopics: ['cash transactions', 'lifestyle audits', 'bank reporting'],
    quiz: {
      question: 'Are large cash sales safe from tax detection?',
      options: [
        'Yes, if no receipt is issued',
        'No, lifestyle audits and bank reports can reveal income',
        'Only if under ₦10m annually',
        'Yes, if deposited in multiple accounts'
      ],
      correctIndex: 1,
      explanation: 'FIRS uses lifestyle audits, bank transaction reports, and third-party data to detect unreported cash income.'
    }
  },
  {
    id: 'vat-threshold-exempt',
    myth: 'Businesses below ₦25m turnover are completely VAT-exempt',
    truth: 'Below ₦25m, VAT REGISTRATION is optional. You still pay VAT on purchases but can\'t recover it.',
    explanation: 'The ₦25m threshold determines mandatory registration, not VAT liability. Unregistered businesses still pay VAT on their purchases but can\'t claim it back. Voluntary registration may be beneficial if you have significant vatable purchases or B2B clients who need VAT invoices.',
    category: 'vat',
    severity: 'medium',
    tier: 'free',
    relatedTopics: ['VAT registration', 'input VAT', 'voluntary registration'],
    quiz: {
      question: 'A business with ₦20m turnover pays VAT on a ₦1m equipment purchase. What happens?',
      options: [
        'They can claim the VAT back',
        'They absorb it as a cost (no recovery)',
        'FIRS automatically refunds it',
        'Only pays half the VAT rate'
      ],
      correctIndex: 1,
      explanation: 'Unregistered businesses pay VAT on purchases but can\'t recover it. The VAT becomes part of their cost.'
    }
  },
  {
    id: 'personal-business-mix',
    myth: 'Using personal accounts for business is fine if you track everything',
    truth: 'Mixing accounts creates AUDIT RISK and makes deductions harder to prove.',
    explanation: 'While not strictly illegal, mixing personal and business finances creates problems: harder to prove legitimate business expenses, higher audit risk, potential piercing of corporate veil for LTDs, difficulty obtaining business loans. Separate accounts are strongly recommended.',
    category: 'audits',
    severity: 'medium',
    tier: 'basic',
    relatedTopics: ['record keeping', 'business accounts', 'audit preparation'],
    quiz: {
      question: 'What\'s the risk of using personal accounts for business?',
      options: [
        'None if you track transactions',
        'Increased audit risk and difficulty proving deductions',
        'Only a problem for companies over ₦100m',
        'FIRS will reject all expenses'
      ],
      correctIndex: 1,
      explanation: 'Mixing accounts increases audit risk and makes it harder to prove business expenses are legitimate deductions.'
    }
  },
  {
    id: 'staff-loans-free',
    myth: 'Staff loans are tax-free benefits for employees',
    truth: 'Below-market loans create TAXABLE benefit equal to the interest foregone.',
    explanation: 'If an employer provides a loan at below-market interest rates, the difference between market rate and actual rate charged is a taxable benefit. The employee must pay tax on this "benefit in kind." This applies to housing loans, car loans, and other employer-provided financing.',
    category: 'general',
    severity: 'low',
    tier: 'business',
    relatedTopics: ['benefits in kind', 'employee taxation', 'PAYE'],
    quiz: {
      question: 'An employer gives a staff loan at 5% when market rate is 20%. Tax implication?',
      options: [
        'Tax-free if documented properly',
        'The 15% difference is taxable as benefit in kind',
        'Only taxable if loan exceeds ₦10m',
        'Employer pays the tax, not employee'
      ],
      correctIndex: 1,
      explanation: 'Below-market interest loans create taxable benefits. The interest rate difference is treated as employee income.'
    }
  },
  // NEW MYTHS ADDED
  {
    id: 'reforms-retroactive',
    myth: 'The 2026 tax reforms will apply retroactively to previous years',
    truth: 'Tax reforms are PROSPECTIVE. They only apply from the effective date forward.',
    explanation: 'The Nigeria Tax Act 2025 comes into effect from January 1, 2026. It doesn\'t apply to tax years before that date. Your 2024 and 2025 returns still follow the old rules. Only income earned from 2026 onwards follows the new rules.',
    category: 'reforms',
    severity: 'high',
    tier: 'free',
    relatedTopics: ['tax reforms', 'effective dates', 'transitional provisions'],
    quiz: {
      question: 'When do the 2026 tax reforms apply?',
      options: [
        'From January 1, 2024 retroactively',
        'From January 1, 2026 onwards only',
        'Immediately upon signing',
        'When FIRS issues guidelines'
      ],
      correctIndex: 1,
      explanation: 'Tax reforms are prospective and apply from January 1, 2026. Previous years follow old rules.'
    }
  },
  {
    id: 'reforms-increase-taxes',
    myth: 'The 2026 reforms will increase taxes for everyone',
    truth: 'The reforms REDUCE taxes for 98% of workers by raising the exempt threshold to ₦800,000.',
    explanation: 'Under the new rules, the first ₦800,000 of annual income is tax-free (up from ₦300,000). This means most Nigerian workers will pay LESS tax. Only very high earners may see marginal increases, and even then, the effective rates are often lower.',
    category: 'reforms',
    severity: 'high',
    tier: 'free',
    relatedTopics: ['personal income tax', 'tax relief', '2026 reforms'],
    quiz: {
      question: 'How do 2026 reforms affect most Nigerian workers?',
      options: [
        'Taxes increase by 50%',
        'Taxes decrease for 98% of workers',
        'No change for anyone',
        'Only affects high earners'
      ],
      correctIndex: 1,
      explanation: 'The raised exempt threshold (₦800,000) means most workers pay less tax under the new rules.'
    }
  },
  {
    id: 'digital-vat-kills-startups',
    myth: 'VAT on digital services will kill Nigerian tech startups',
    truth: 'The VAT primarily targets FOREIGN providers. Nigerian startups below ₦25m are exempt from registration.',
    explanation: 'The digital services VAT targets foreign companies like Netflix, Spotify selling to Nigerian consumers. Small Nigerian tech startups (turnover <₦25m) aren\'t required to register for VAT. B2B services can often recover input VAT. The impact on local startups is minimal.',
    category: 'digital',
    severity: 'medium',
    tier: 'basic',
    relatedTopics: ['digital economy', 'tech startups', 'VAT registration'],
    quiz: {
      question: 'Who is primarily targeted by Nigeria\'s digital services VAT?',
      options: [
        'All Nigerian tech companies',
        'Foreign digital service providers',
        'Only streaming services',
        'E-commerce platforms only'
      ],
      correctIndex: 1,
      explanation: 'The digital VAT primarily targets foreign providers. Small Nigerian startups are often exempt.'
    }
  },
  {
    id: 'audit-means-jail',
    myth: 'Being selected for a tax audit means you\'re going to jail',
    truth: 'Most audits are ROUTINE compliance checks. Only fraud leads to criminal prosecution.',
    explanation: 'Tax audits are normal business procedures. FIRS conducts thousands annually, most resulting in no penalties or minor adjustments. Even when issues are found, the first response is usually additional assessment and penalties, not prosecution. Criminal charges require proof of intentional fraud.',
    category: 'audits',
    severity: 'high',
    tier: 'free',
    relatedTopics: ['tax audits', 'compliance', 'FIRS procedures'],
    quiz: {
      question: 'What happens in most tax audits?',
      options: [
        'Immediate arrest',
        'Routine check with minor or no adjustments',
        'Business shutdown',
        'Automatic penalties'
      ],
      correctIndex: 1,
      explanation: 'Most audits are routine compliance checks. Only intentional fraud leads to criminal prosecution.'
    }
  },
  {
    id: 'freelancer-no-tax',
    myth: 'Freelancers and gig workers don\'t need to pay taxes',
    truth: 'Freelance income is TAXABLE. You must file annual PIT returns and pay quarterly estimates.',
    explanation: 'Freelancers are self-employed and must register for tax, file annual Personal Income Tax returns with their state IRS, and pay estimated taxes quarterly. Common deductible expenses include equipment, internet, co-working space, and professional development.',
    category: 'compliance',
    severity: 'high',
    tier: 'free',
    relatedTopics: ['freelancing', 'self-employment', 'PIT', 'estimated taxes'],
    quiz: {
      question: 'What are a freelancer\'s tax obligations?',
      options: [
        'No tax if income is irregular',
        'Register, file annual returns, pay estimated taxes',
        'Only if earning above ₦10m',
        'Employer handles everything'
      ],
      correctIndex: 1,
      explanation: 'Freelancers must register for tax, file annual returns, and pay estimated taxes quarterly.'
    }
  },
  {
    id: 'deductions-fake-receipts',
    myth: 'You can claim deductions with any receipt, even fabricated ones',
    truth: 'FIRS verifies receipts. Fabricated documents are FRAUD with criminal penalties.',
    explanation: 'FIRS cross-references receipts with supplier records and conducts random verification. Submitting fabricated receipts constitutes tax fraud with penalties including fines, back taxes with interest, and potential criminal prosecution. Always keep genuine documentation.',
    category: 'penalties',
    severity: 'high',
    tier: 'basic',
    relatedTopics: ['tax fraud', 'documentation', 'deductions'],
    quiz: {
      question: 'What happens if you submit fake receipts for deductions?',
      options: [
        'Nothing if not audited',
        'Criminal fraud charges and penalties',
        'Just lose the deduction',
        'Warning letter only'
      ],
      correctIndex: 1,
      explanation: 'Submitting fabricated receipts is tax fraud with criminal penalties, fines, and back taxes.'
    }
  },
  {
    id: 'late-penalty-fixed',
    myth: 'Late filing penalties are a fixed amount anyone can afford to pay',
    truth: 'Penalties are PERCENTAGE-BASED and compound with interest. Large liabilities mean large penalties.',
    explanation: 'Late CIT filing is 10% of tax due + interest at CBN rate. Late VAT is 5% + ₦5,000/month. For a ₦10m tax liability, that\'s ₦1m+ in penalties. Interest compounds monthly. What seems affordable for small amounts becomes devastating for larger liabilities.',
    category: 'penalties',
    severity: 'high',
    tier: 'free',
    relatedTopics: ['late filing', 'penalties', 'interest charges'],
    quiz: {
      question: 'What is the penalty for filing CIT 1 year late on ₦10m tax due?',
      options: [
        '₦10,000 fixed penalty',
        '₦1m + interest (potentially ₦2m+ total)',
        '5% = ₦500,000',
        'No penalty for first offense'
      ],
      correctIndex: 1,
      explanation: 'Late penalties are 10% of tax due plus compound interest. For ₦10m, that\'s ₦1m+ in penalties.'
    }
  },
  {
    id: 'voluntary-disclosure-trap',
    myth: 'Coming forward voluntarily about past errors will make things worse',
    truth: 'Voluntary disclosure programs offer REDUCED penalties and protection from prosecution.',
    explanation: 'FIRS and state tax authorities offer voluntary disclosure programs. Coming forward before an audit typically results in: waived or reduced penalties, no criminal prosecution, payment plans for back taxes, and a clean slate going forward. Waiting for an audit is much worse.',
    category: 'penalties',
    severity: 'medium',
    tier: 'basic',
    relatedTopics: ['voluntary disclosure', 'tax amnesty', 'penalty waivers'],
    quiz: {
      question: 'What happens if you voluntarily disclose past tax errors?',
      options: [
        'Automatic prosecution',
        'Reduced penalties and protection from prosecution',
        'Double penalties for admitting guilt',
        'No benefit vs being caught'
      ],
      correctIndex: 1,
      explanation: 'Voluntary disclosure programs offer reduced penalties and protection from criminal prosecution.'
    }
  },
  {
    id: 'entertainment-full-deduction',
    myth: 'All entertainment and client meals are fully deductible',
    truth: 'Entertainment deductions are LIMITED and require proper documentation of business purpose.',
    explanation: 'Entertainment expenses have caps and strict documentation requirements: who attended, business discussed, relationship to business. Lavish entertainment may be disallowed entirely. Keep detailed records including receipts, attendee lists, and meeting notes.',
    category: 'general',
    severity: 'low',
    tier: 'basic',
    relatedTopics: ['entertainment expenses', 'deductions', 'documentation'],
    quiz: {
      question: 'Can you fully deduct a ₦500,000 client dinner?',
      options: [
        'Yes, if you have the receipt',
        'Limited deduction with strict documentation requirements',
        'Only if the client signed',
        'Never deductible'
      ],
      correctIndex: 1,
      explanation: 'Entertainment deductions are limited and require detailed documentation of business purpose.'
    }
  },
  {
    id: 'loss-carried-forever',
    myth: 'Business losses can be carried forward indefinitely',
    truth: 'Loss carry-forward has TIME LIMITS and restrictions under the new rules.',
    explanation: 'Under the 2026 rules, losses can be carried forward for 4 years (reduced from unlimited). Additionally, losses can only offset up to 50% of future profits in any given year. This means planning for loss recovery is now more critical.',
    category: 'reforms',
    severity: 'medium',
    tier: 'business',
    relatedTopics: ['loss carry-forward', 'tax planning', '2026 rules'],
    quiz: {
      question: 'How long can business losses be carried forward under 2026 rules?',
      options: [
        'Indefinitely',
        '4 years maximum',
        '2 years only',
        '10 years'
      ],
      correctIndex: 1,
      explanation: 'Under 2026 rules, losses can be carried forward for 4 years and offset up to 50% of future profits.'
    }
  }
];

export const sectorGuides: SectorGuide[] = [
  {
    id: 'tech-nsa',
    sector: 'tech',
    title: 'Tech Companies & NSA Incentives',
    description: 'Tax benefits for technology companies under the Nigerian Startup Act and NITDA guidelines',
    benefits: [
      'EDTI (Expenditure on Domestic Technology Investment) 5% tax credits',
      'Pioneer Status eligibility for software development',
      'R&D expense deductions at 120%',
      'Export service income exemptions',
      'Foreign talent visa facilitation'
    ],
    requirements: [
      'Registration with NITDA',
      'NSA labeling for startups under 10 years, <₦1.5B turnover',
      'Minimum local employment ratios',
      'IP registration in Nigeria',
      'Annual innovation reporting'
    ],
    taxIncentives: [
      { name: 'EDTI Credit', value: '5% of qualifying technology spend', duration: 'Annual' },
      { name: 'Pioneer Status', value: '0% CIT', duration: 'Up to 5 years' },
      { name: 'R&D Super Deduction', value: '120% of qualifying R&D costs', duration: 'Ongoing' },
      { name: 'Export Services', value: 'Reduced WHT on export earnings', duration: 'Ongoing' }
    ],
    content: `The Nigerian Startup Act (NSA) provides significant benefits for qualifying tech companies:

**NSA Labeling Requirements:**
- Company age under 10 years
- Turnover below ₦1.5 billion
- Focus on technology, innovation, or intellectual property
- Nigerian ownership of at least 51% (or foreign with local directors)

**EDTI Credit Details:**
The 5% Expenditure on Domestic Technology Investment credit applies to:
- Purchase of locally developed software
- Investment in Nigerian tech startups
- Technology training for Nigerian staff
- Equipment for R&D activities

**How to Apply:**
1. Register with NITDA as a tech company
2. Apply for NSA labeling via the Startup Portal
3. Submit annual innovation reports
4. Claim incentives in your tax returns

**Common Mistakes to Avoid:**
- Failing to maintain proper documentation of technology investments
- Missing NSA labeling renewal deadlines
- Claiming credits without NITDA registration
- Underreporting R&D activities`,
    tier: 'business',
    icon: '💻'
  },
  {
    id: 'agriculture',
    sector: 'agriculture',
    title: 'Agriculture Tax Exemptions',
    description: 'Complete guide to agricultural sector tax incentives and exemptions in Nigeria',
    benefits: [
      '5-year CIT holiday for new agricultural operations',
      'Zero-rated VAT on agricultural inputs',
      'Import duty exemptions on farming equipment',
      'Accelerated depreciation on farm assets',
      'Tax-free agricultural produce sales'
    ],
    requirements: [
      'Registration as agricultural business',
      'Minimum land under cultivation',
      'Evidence of actual farming operations',
      'Local employment compliance',
      'Environmental impact assessment for large operations'
    ],
    taxIncentives: [
      { name: 'CIT Holiday', value: '0% CIT for new farms', duration: '5 years' },
      { name: 'Input VAT', value: 'Zero-rated (full recovery)', duration: 'Ongoing' },
      { name: 'Equipment Import', value: 'Duty-free for qualifying items', duration: 'Ongoing' },
      { name: 'Produce Sales', value: 'VAT-exempt', duration: 'Ongoing' }
    ],
    content: `Nigeria heavily incentivizes agriculture to boost food security:

**5-Year CIT Holiday:**
New agricultural companies enjoy complete CIT exemption for their first 5 years. This applies to:
- Crop farming and horticulture
- Livestock farming
- Aquaculture and fisheries
- Primary agricultural processing

**Zero-Rated Agricultural Inputs:**
Unlike exempt items, zero-rating means you can RECOVER VAT paid on:
- Seeds and seedlings
- Fertilizers and pesticides
- Farm machinery and equipment
- Irrigation systems
- Animal feed and veterinary supplies

**How Zero-Rating Benefits You:**
If you spend ₦10m on fertilizer with ₦750k VAT, you can claim back that ₦750k when filing VAT returns. This effectively reduces your costs.

**Qualifying for Benefits:**
1. Register with relevant agricultural agencies
2. Obtain tax clearance showing agricultural status
3. Maintain proper records of farming operations
4. File annual returns showing agricultural income separately

**Watch Out For:**
- Processing beyond primary level may lose some exemptions
- Trading (buying/selling) without farming may not qualify
- Multi-purpose businesses need careful allocation`,
    tier: 'free',
    icon: '🌾'
  },
  {
    id: 'manufacturing',
    sector: 'manufacturing',
    title: 'Manufacturing & Industrial Incentives',
    description: 'Tax benefits for manufacturers including asset credits and wage deductions',
    benefits: [
      'Accelerated capital allowances on plant and machinery',
      'Investment Tax Credit on qualifying assets',
      'Local raw material utilization incentives',
      'Export expansion grants',
      'Additional wage deduction for job creation'
    ],
    requirements: [
      'Manufacturing license from regulatory bodies',
      'Factory registration and inspection',
      'Compliance with environmental standards',
      'Minimum local content requirements',
      'Quality certification (SON, NAFDAC as applicable)'
    ],
    taxIncentives: [
      { name: 'Capital Allowance', value: 'Up to 95% first year for plant', duration: 'Year of acquisition' },
      { name: 'Investment Credit', value: '10% of qualifying plant cost', duration: 'One-time' },
      { name: 'Local Raw Material', value: '10% bonus on local inputs', duration: 'Ongoing' },
      { name: 'Job Creation', value: 'Additional 10% wage deduction', duration: 'For new manufacturing jobs' }
    ],
    content: `Manufacturing enjoys significant tax incentives to boost industrialization:

**Accelerated Capital Allowances:**
- Plant and Machinery: 50% initial + 25% annual
- Buildings: 15% initial + 10% annual
- Motor Vehicles: 50% initial + 25% annual
- Furniture: 25% initial + 20% annual

**Investment Tax Credit:**
10% of cost of qualifying plant and equipment can be credited directly against your CIT liability. This is different from a deduction - it reduces tax naira-for-naira.

**Local Raw Material Incentive:**
Additional 10% deduction on cost of local raw materials used in manufacturing. Encourages local sourcing over imports.

**Job Creation Bonus:**
Extra 10% deduction on wages paid to new manufacturing employees. Helps reduce the effective cost of expanding your workforce.

**Qualifying for Maximum Benefits:**
1. Maintain detailed asset registers
2. Document local content in production
3. Keep employee records showing job creation
4. Obtain manufacturing certifications
5. File capital allowance claims accurately`,
    tier: 'basic',
    icon: '🏭'
  },
  {
    id: 'retail',
    sector: 'retail',
    title: 'Retail & Trade Taxation',
    description: 'Tax options for retailers including presumptive taxation for small traders',
    benefits: [
      'Presumptive tax option for small retailers',
      'Simplified record-keeping for micro businesses',
      'Lower compliance burden for turnover-based tax',
      'No need for complex accounting'
    ],
    requirements: [
      'Turnover below ₦25m for presumptive option',
      'Registration with tax authority',
      'Sales records (can be simplified)',
      'Annual returns filing'
    ],
    taxIncentives: [
      { name: 'Presumptive Tax', value: '1% of turnover (simplified)', duration: 'For qualifying small retailers' },
      { name: 'Micro Business', value: 'Simplified compliance', duration: 'Below ₦25m turnover' }
    ],
    content: `Retail businesses have specific tax considerations:

**Presumptive Taxation:**
Small retailers (turnover ≤₦25m) can opt for presumptive tax:
- Pay 1% of turnover as final tax
- No need to track profits or expenses
- Simplified record-keeping requirements
- Reduced audit risk

**Standard Taxation:**
Larger retailers use standard tax:
- Track all income and expenses
- Claim legitimate deductions
- File normal CIT/PIT returns
- Generally better if profit margins are low

**VAT Considerations:**
- Below ₦25m: Registration optional
- Above ₦25m: Must register, charge 7.5%, file monthly
- Input VAT on purchases can offset output VAT

**Inventory Valuation:**
Choose consistent method:
- FIFO (First In, First Out)
- Weighted Average
- Specific identification

**Common Retail Deductions:**
- Stock purchases (cost of goods sold)
- Rent and utilities
- Staff salaries
- Marketing and advertising
- Transportation and delivery
- Packaging materials`,
    tier: 'free',
    icon: '🛒'
  },
  {
    id: 'freezone',
    sector: 'freezone',
    title: 'Free Zone Operations',
    description: 'Tax benefits for businesses operating in Nigerian free trade zones (NEPZA/OGFZA)',
    benefits: [
      'Complete CIT exemption on export earnings',
      'Duty-free imports of raw materials and equipment',
      'No withholding tax on dividends to non-residents',
      'Repatriation of capital and profits guaranteed',
      'One-stop approval for investments'
    ],
    requirements: [
      'NEPZA or OGFZA registration',
      'Located within approved free zone',
      'Minimum investment thresholds',
      'Export orientation (varies by zone)',
      'Annual operating license renewal'
    ],
    taxIncentives: [
      { name: 'Export CIT', value: '0% on export earnings', duration: 'Ongoing for approved enterprises' },
      { name: 'Import Duties', value: 'Exempt on raw materials', duration: 'For zone operations' },
      { name: 'Dividend WHT', value: '0% to non-residents', duration: 'Ongoing' }
    ],
    content: `Nigeria's free zones offer significant tax advantages:

**Types of Free Zones:**
- NEPZA zones (general export processing)
- OGFZA zones (oil & gas sector)
- Special Economic Zones

**Export vs Domestic Sales (2026 Rules):**
The 2025 reforms changed treatment of domestic sales:
- Exports: Still enjoy full tax holiday
- Domestic sales: Now attract standard taxes
- Careful planning needed for mixed operations

**Free Zone Simulator:**
To estimate your tax position:
1. Calculate export revenue percentage
2. Export portion: 0% CIT
3. Domestic portion: 30% CIT
4. Factor in duty savings on imports
5. Consider WHT savings on repatriation

**Compliance Requirements:**
- Maintain separate books for zone operations
- Quarterly reports to zone authority
- Annual license renewal
- Import/export documentation
- Employment and training reports

**Common Mistakes:**
- Selling to domestic market without proper approvals
- Failing to maintain required export ratios
- Importing for resale outside zone
- Missing license renewal deadlines`,
    tier: 'business',
    icon: '🏝️'
  },
  {
    id: 'export',
    sector: 'export',
    title: 'Export Business Incentives',
    description: 'Tax benefits for Nigerian exporters including duty drawbacks and expansion grants',
    benefits: [
      'Export Expansion Grant (EEG)',
      'Duty drawback on imported inputs',
      'Export Development Fund access',
      'Reduced corporate tax on export profits',
      'Currency retention allowance'
    ],
    requirements: [
      'NEPC registration',
      'Export documentation (Form NXP)',
      'Proof of export proceeds repatriation',
      'Quality certification for products',
      'Compliance with destination country standards'
    ],
    taxIncentives: [
      { name: 'EEG', value: 'Up to 30% of export value', duration: 'Per qualifying export' },
      { name: 'Duty Drawback', value: 'Refund of import duties', duration: 'On inputs used for exports' },
      { name: 'Profit Tax', value: 'Reduced rate on export profits', duration: 'Ongoing' }
    ],
    content: `Exporters enjoy multiple tax and grant benefits:

**Export Expansion Grant (EEG):**
Cash grant of up to 30% of export value:
- Manufacturing exports: Higher rates
- Agro-processing: Additional bonuses
- New exporters: Special incentives
- Small exporters: Simplified access

**Duty Drawback Scheme:**
Recover import duties on inputs used for exports:
1. Pay duties when importing
2. Use inputs for manufacturing
3. Export finished goods
4. Claim refund with documentation

**Export Development Fund:**
Access to financing for:
- Market development activities
- Trade fair participation
- Product certification
- Quality improvement

**Documentation Requirements:**
- Form NXP (export declaration)
- Bill of lading/airway bill
- Commercial invoice
- Certificate of origin
- Quality certification
- Bank confirmation of proceeds

**Tax Planning for Exporters:**
- Separate export income in books
- Document input-output linkage
- Time duty drawback claims properly
- Maximize EEG through eligible activities`,
    tier: 'basic',
    icon: '📦'
  },
  {
    id: 'fintech',
    sector: 'fintech',
    title: 'Fintech & Digital Finance',
    description: 'Tax considerations for fintech companies, payment processors, and digital lenders',
    benefits: [
      'NSA labeling benefits for qualifying fintechs',
      'CBN sandbox participation',
      'R&D deductions on platform development',
      'EDTI credits for technology investment',
      'Potential Pioneer Status for innovative services'
    ],
    requirements: [
      'CBN licensing or registration',
      'Compliance with financial regulations',
      'Data protection compliance (NDPA)',
      'Anti-money laundering procedures',
      'Capital adequacy requirements'
    ],
    taxIncentives: [
      { name: 'NSA Benefits', value: 'Various tax credits', duration: 'For qualifying startups' },
      { name: 'R&D Deduction', value: '120% of platform development costs', duration: 'Ongoing' },
      { name: 'EDTI Credit', value: '5% on domestic tech spend', duration: 'Annual' }
    ],
    content: `Fintech companies have unique tax considerations:

**Regulatory Landscape:**
- CBN licensing for payment services
- SEC registration for investment platforms
- NAICOM for insurtechs
- Multiple compliance requirements affect costs

**Tax Treatment of Revenue:**
- Transaction fees: Standard income
- Interest income: Withholding may apply
- FX gains: Taxable as income
- Subscription fees: Standard VAT rules

**Deductible Expenses:**
- Platform development and maintenance
- Server and infrastructure costs
- Compliance and licensing fees
- Customer acquisition costs
- Fraud prevention systems

**NSA Labeling:**
Qualifying fintechs can benefit from:
- Tax holidays via Pioneer Status
- R&D super deductions
- EDTI credits
- Simplified forex access

**VAT on Digital Services:**
- B2C services: Charge 7.5% VAT
- B2B services: May be zero-rated
- Cross-border payments: Complex rules apply`,
    tier: 'business',
    icon: '💳'
  },
  {
    id: 'healthcare',
    sector: 'healthcare',
    title: 'Healthcare & Pharmaceutical',
    description: 'Tax incentives for healthcare providers, hospitals, and pharmaceutical companies',
    benefits: [
      'VAT exemption on medical services',
      'Import duty waivers on medical equipment',
      'Pioneer Status for local drug manufacturing',
      'Accelerated depreciation on medical equipment',
      'Reduced WHT on pharmaceutical exports'
    ],
    requirements: [
      'Registration with health authorities',
      'NAFDAC approval for pharmaceuticals',
      'Professional licensing requirements',
      'Quality certifications',
      'Compliance with healthcare standards'
    ],
    taxIncentives: [
      { name: 'Medical Services', value: 'VAT-exempt', duration: 'Ongoing' },
      { name: 'Equipment Import', value: 'Reduced/waived duties', duration: 'For medical equipment' },
      { name: 'Drug Manufacturing', value: 'Pioneer Status available', duration: 'Up to 5 years' }
    ],
    content: `Healthcare sector enjoys various tax benefits:

**VAT Exemptions:**
The following are VAT-exempt:
- Medical and veterinary services
- Pharmaceutical products
- Basic medical supplies
- Hospital services

**Equipment Import:**
Medical equipment qualifies for:
- Reduced or zero import duties
- VAT exemption on qualifying items
- Faster customs clearance via NAFDAC

**Local Manufacturing:**
Pharmaceutical companies manufacturing locally can apply for:
- Pioneer Status (0% CIT for 3-5 years)
- Additional capital allowances
- Local content bonuses

**Healthcare Professional Income:**
Doctors, nurses, and other professionals:
- PIT applies to employment income
- Private practice income separately taxed
- Allowable deductions for professional costs

**Hospital Operations:**
- Separate treatment for profit vs non-profit
- Non-profit hospitals may have additional exemptions
- For-profit hospitals use standard CIT rules`,
    tier: 'basic',
    icon: '🏥'
  }
];

export const videoGuides: VideoGuide[] = [
  {
    id: 'reforms-2026-overview',
    title: '2026 Tax Reforms Explained',
    description: 'Complete overview of the Nigeria Tax Act 2025 and what changes for you',
    duration: '5 min',
    category: 'reforms',
    tier: 'free'
  },
  {
    id: 'pit-calculation',
    title: 'How to Calculate PIT (2026 Rules)',
    description: 'Step-by-step guide to calculating Personal Income Tax under new rules',
    duration: '4 min',
    category: 'basics',
    tier: 'free'
  },
  {
    id: 'vat-registration',
    title: 'VAT Registration Guide',
    description: 'When and how to register for VAT, and what to do after',
    duration: '6 min',
    category: 'basics',
    tier: 'free'
  },
  {
    id: 'small-company-benefits',
    title: 'Small Company 0% CIT',
    description: 'Understanding the new small company exemption and how to qualify',
    duration: '3 min',
    category: 'reforms',
    tier: 'free'
  },
  {
    id: 'myth-busting-gifts',
    title: 'Myth: Labeling as Gifts',
    description: 'Why calling income "gifts" doesn\'t make it tax-free',
    duration: '2 min',
    category: 'tips',
    tier: 'free'
  },
  {
    id: 'tech-nsa-incentives',
    title: 'Tech Startup Tax Benefits',
    description: 'NSA labeling, EDTI credits, and R&D deductions for tech companies',
    duration: '7 min',
    category: 'sectors',
    tier: 'basic'
  },
  {
    id: 'agriculture-exemptions',
    title: 'Agriculture Tax Exemptions',
    description: '5-year CIT holiday and zero-rated inputs for farmers',
    duration: '5 min',
    category: 'sectors',
    tier: 'free'
  },
  {
    id: 'avoiding-audits',
    title: 'Avoiding Tax Audits',
    description: 'Common audit triggers and how to stay compliant',
    duration: '6 min',
    category: 'tips',
    tier: 'basic'
  },
  {
    id: 'freelancer-taxes',
    title: 'Freelancer Tax Guide',
    description: 'Complete tax guide for gig workers and freelancers',
    duration: '8 min',
    category: 'basics',
    tier: 'free'
  },
  {
    id: 'penalty-prevention',
    title: 'Penalty Prevention Tips',
    description: 'Understand penalties and how to avoid them',
    duration: '4 min',
    category: 'tips',
    tier: 'free'
  }
];

// Helper functions
export const getMythsByCategory = (category: TaxMyth['category']): TaxMyth[] => {
  return taxMyths.filter(myth => myth.category === category);
};

export const getMythsByTier = (tier: 'free' | 'basic' | 'business'): TaxMyth[] => {
  const tierOrder = { free: 0, basic: 1, business: 2 };
  return taxMyths.filter(myth => tierOrder[myth.tier] <= tierOrder[tier]);
};

export const getHighSeverityMyths = (): TaxMyth[] => {
  return taxMyths.filter(myth => myth.severity === 'high');
};

export const getSectorGuidesByTier = (tier: 'free' | 'basic' | 'business'): SectorGuide[] => {
  const tierOrder = { free: 0, basic: 1, business: 2 };
  return sectorGuides.filter(guide => tierOrder[guide.tier] <= tierOrder[tier]);
};

export const getVideoGuidesByTier = (tier: 'free' | 'basic' | 'business'): VideoGuide[] => {
  const tierOrder = { free: 0, basic: 1, business: 2 };
  return videoGuides.filter(video => tierOrder[video.tier] <= tierOrder[tier]);
};

export const searchMythsAndGuides = (query: string): { myths: TaxMyth[]; guides: SectorGuide[]; videos: VideoGuide[] } => {
  const lowerQuery = query.toLowerCase();
  
  const myths = taxMyths.filter(myth => 
    myth.myth.toLowerCase().includes(lowerQuery) ||
    myth.truth.toLowerCase().includes(lowerQuery) ||
    myth.explanation.toLowerCase().includes(lowerQuery) ||
    myth.relatedTopics.some(topic => topic.toLowerCase().includes(lowerQuery))
  );
  
  const guides = sectorGuides.filter(guide =>
    guide.title.toLowerCase().includes(lowerQuery) ||
    guide.description.toLowerCase().includes(lowerQuery) ||
    guide.content.toLowerCase().includes(lowerQuery) ||
    guide.benefits.some(b => b.toLowerCase().includes(lowerQuery))
  );

  const videos = videoGuides.filter(video =>
    video.title.toLowerCase().includes(lowerQuery) ||
    video.description.toLowerCase().includes(lowerQuery)
  );
  
  return { myths, guides, videos };
};

// Penalty calculator helper
export interface PenaltyEstimate {
  lateFiling: number;
  interest: number;
  totalPenalty: number;
  description: string;
}

export const calculatePenalty = (
  taxType: 'cit' | 'vat' | 'pit' | 'paye',
  taxDue: number,
  monthsLate: number,
  cbnRate: number = 24
): PenaltyEstimate => {
  let lateFiling = 0;
  let monthlyPenalty = 0;
  let description = '';

  switch (taxType) {
    case 'cit':
      lateFiling = taxDue * 0.1; // 10% of tax due
      description = '10% penalty on tax due + interest at CBN rate';
      break;
    case 'vat':
      lateFiling = taxDue * 0.05; // 5% of tax due
      monthlyPenalty = 5000 * monthsLate; // ₦5,000 per month
      lateFiling += monthlyPenalty;
      description = '5% penalty + ₦5,000 per month + interest';
      break;
    case 'pit':
    case 'paye':
      lateFiling = taxDue * 0.1; // 10% of tax due
      description = '10% penalty on tax due + interest at CBN rate';
      break;
  }

  // Interest calculation (compound monthly)
  const monthlyRate = cbnRate / 100 / 12;
  const interest = taxDue * (Math.pow(1 + monthlyRate, monthsLate) - 1);

  return {
    lateFiling,
    interest,
    totalPenalty: lateFiling + interest,
    description
  };
};
