import { Link } from 'react-router-dom';
import { SEOHead, createWebApplicationSchema, createFAQSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { ComparisonTable, CIT_COMPARISON_ROWS } from '@/components/seo/ComparisonTable';
import { Building2, TrendingUp, Calendar, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';

const CITCalculator = () => {
  const faqs = [
    {
      question: 'What is Company Income Tax (CIT) in Nigeria?',
      answer: 'Company Income Tax is a tax on the profits of incorporated companies operating in Nigeria. Under the 2026 rules, rates range from 0% for small companies to 30% for large companies.',
    },
    {
      question: 'How do I know if my company is small, medium, or large?',
      answer: 'Company size is determined by annual turnover. Small: ≤₦50M turnover AND ≤₦250M assets. Medium: ₦50M-₦200M turnover. Large: >₦200M turnover.',
    },
    {
      question: 'What is the Development Levy?',
      answer: 'The Development Levy is 4% of company profits, replacing the old Tertiary Education Tax (TET). It applies to all companies except those qualifying for the small company exemption.',
    },
    {
      question: 'When is CIT due?',
      answer: 'CIT returns must be filed within 6 months after the end of your accounting year. Payment is due on the same date. Late filing attracts penalties.',
    },
  ];

  const citRates = [
    { 
      category: 'Small Company', 
      rate: '0%', 
      criteria: 'Turnover ≤₦50M AND Assets ≤₦250M',
      example: { turnover: 30_000_000, profit: 3_000_000, tax: 0, levy: 0 },
      highlight: true,
    },
    { 
      category: 'Medium Company', 
      rate: '20%', 
      criteria: 'Turnover ₦50M - ₦200M',
      example: { turnover: 100_000_000, profit: 15_000_000, tax: 3_000_000, levy: 600_000 },
      highlight: false,
    },
    { 
      category: 'Large Company', 
      rate: '30%', 
      criteria: 'Turnover >₦200M',
      example: { turnover: 500_000_000, profit: 75_000_000, tax: 22_500_000, levy: 3_000_000 },
      highlight: false,
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createWebApplicationSchema(
        'Company Income Tax (CIT) Calculator Nigeria 2026',
        'Calculate Nigerian CIT with 2026 rates. 0% for small companies, 20% medium, 30% large. Includes Development Levy.'
      ),
      createFAQSchema(faqs),
    ],
  };

  return (
    <>
      <SEOHead
        title="Company Income Tax (CIT) Calculator Nigeria 2026 | TaxForge"
        description="Nigerian CIT rates 2026: 0% small, 20% medium, 30% large companies. Calculate your company tax with Development Levy. Free guide."
        canonicalPath="/cit-calculator"
        keywords="company income tax Nigeria, CIT calculator 2026, corporate tax Nigeria, small company exemption, Development Levy Nigeria"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="fixed top-20 right-10 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-float-slow pointer-events-none" />
        <div className="fixed bottom-20 left-10 w-64 h-64 rounded-full bg-success/8 blur-3xl animate-float pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              {/* Hero */}
              <SEOHero
                title="Nigerian Company Income Tax"
                titleHighlight="2026 CIT Rates Explained"
                subtitle="Under the 2026 tax rules, company income tax rates vary from 0% to 30% based on your turnover. Learn which rate applies to your business."
              />

              {/* Trust Badges */}
              <div className="mb-10 animate-slide-up-delay-2">
                <TrustBadges
                  badges={[
                    { icon: 'check', text: 'Nigeria Tax Act 2025' },
                    { icon: 'shield', text: 'FIRS Rates' },
                    { icon: 'clock', text: 'Development Levy Included' },
                  ]}
                />
              </div>

              {/* CIT Rates Overview */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  2026 Company Income Tax Rates
                </h2>
                <div className="space-y-4">
                  {citRates.map((rate, index) => (
                    <div 
                      key={index} 
                      className={`glass-frosted rounded-2xl p-6 ${rate.highlight ? 'border-2 border-success/30' : ''}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                            rate.highlight ? 'bg-success/20' : 'bg-primary/20'
                          }`}>
                            <Building2 className={`h-7 w-7 ${rate.highlight ? 'text-success' : 'text-primary'}`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{rate.category}</h3>
                            <p className="text-sm text-muted-foreground">{rate.criteria}</p>
                          </div>
                        </div>
                        <div className="text-center md:text-right">
                          <span className={`text-3xl font-bold ${rate.highlight ? 'text-success' : 'text-primary'}`}>
                            {rate.rate}
                          </span>
                          <p className="text-sm text-muted-foreground">CIT Rate</p>
                        </div>
                      </div>
                      
                      {/* Example */}
                      <div className="glass rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-2">Example Calculation:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Turnover:</span>
                            <p className="font-semibold text-foreground">{formatCurrency(rate.example.turnover)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Profit:</span>
                            <p className="font-semibold text-foreground">{formatCurrency(rate.example.profit)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CIT:</span>
                            <p className={`font-semibold ${rate.highlight ? 'text-success' : 'text-primary'}`}>
                              {formatCurrency(rate.example.tax)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Dev. Levy (4%):</span>
                            <p className="font-semibold text-foreground">{formatCurrency(rate.example.levy)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* What Counts as Turnover */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  What Counts as Turnover vs Profit?
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-primary">
                    <h3 className="text-xl font-bold text-foreground mb-4">Turnover (Gross Revenue)</h3>
                    <ul className="space-y-2">
                      {[
                        'Total sales before any deductions',
                        'All income from business operations',
                        'Service fees and commissions',
                        'Interest and investment income',
                        'Used to determine company size category',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-success">
                    <h3 className="text-xl font-bold text-foreground mb-4">Profit (Taxable Income)</h3>
                    <ul className="space-y-2">
                      {[
                        'Turnover minus allowable expenses',
                        'After deducting operating costs',
                        'After capital allowances',
                        'CIT is calculated on this amount',
                        'Development Levy also applies here',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Development Levy Explained */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Development Levy (Replaces TET)
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">4% of Assessable Profits</h3>
                      <p className="text-muted-foreground">
                        The Development Levy replaces the old Tertiary Education Tax (TET) under 2026 rules. 
                        It's calculated at 4% of your company's assessable profits.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-semibold text-foreground mb-2">Who Pays?</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• All companies registered in Nigeria</li>
                        <li>• Except small companies (0% CIT eligible)</li>
                        <li>• Applies regardless of CIT rate tier</li>
                      </ul>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-semibold text-foreground mb-2">When Due?</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Same deadline as CIT returns</li>
                        <li>• 6 months after accounting year end</li>
                        <li>• Filed together with CIT</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Filing Deadlines */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  CIT Filing Deadlines
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="grid gap-4 md:grid-cols-3 text-center">
                    <div className="glass rounded-xl p-5">
                      <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">Annual Returns</h3>
                      <p className="text-sm text-muted-foreground">
                        Within 6 months of accounting year end
                      </p>
                    </div>
                    <div className="glass rounded-xl p-5">
                      <FileText className="h-8 w-8 text-success mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">Self-Assessment</h3>
                      <p className="text-sm text-muted-foreground">
                        File Form C with audited accounts
                      </p>
                    </div>
                    <div className="glass rounded-xl p-5">
                      <TrendingUp className="h-8 w-8 text-accent mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">Estimated Tax</h3>
                      <p className="text-sm text-muted-foreground">
                        Pay installments if liability exceeds ₦1M
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* CIT Comparison Table */}
              <section className="mb-12">
                <ComparisonTable
                  title="CIT: 2026 vs Pre-2026 Rules"
                  rows={CIT_COMPARISON_ROWS}
                />
              </section>

              {/* FAQ Section */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Related Tools */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                  Related Tax Tools
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/small-company-exemption" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Small Company Exemption Checker
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Check if you qualify for 0% CIT instantly
                    </p>
                  </Link>
                  <Link to="/vat-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      VAT Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate your 7.5% VAT obligations
                    </p>
                  </Link>
                  <Link to="/wht-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      WHT Reference Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Withholding tax rates and credits
                    </p>
                  </Link>
                  <Link to="/tax-reforms-2026" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      2026 Tax Reforms Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Complete overview of all changes
                    </p>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Calculate Your Complete Company Tax"
                subtext="Get a detailed breakdown of CIT, VAT, WHT, and Development Levy with a professional PDF report."
                primaryText="Business Tax Calculator"
                primaryLink="/calculator"
                secondaryText="View Documentation"
                secondaryLink="/documentation"
              />

              {/* Disclaimer */}
              <SEODisclaimer />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CITCalculator;
