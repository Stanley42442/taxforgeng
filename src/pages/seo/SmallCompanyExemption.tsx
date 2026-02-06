import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createHowToSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { EligibilityChecker } from '@/components/seo/EligibilityChecker';
import { ComparisonTable, CIT_COMPARISON_ROWS } from '@/components/seo/ComparisonTable';
import { CheckCircle2, AlertTriangle, Building2, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';

const SmallCompanyExemption = () => {
  const howToSteps = [
    { name: 'Check Your Turnover', text: 'Verify your annual gross revenue is ₦50 million or less.' },
    { name: 'Calculate Fixed Assets', text: 'Add up land, buildings, machinery, vehicles, and equipment. Must be ₦250 million or less.' },
    { name: 'Meet Both Criteria', text: 'You must satisfy BOTH conditions to qualify for the 0% CIT exemption.' },
    { name: 'File Your Returns', text: 'Even with 0% CIT, you must file annual returns with FIRS to claim the exemption.' },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema(
        '2026 Small Company Tax Exemption in Nigeria - Complete Guide',
        'Learn how Nigerian small companies with turnover ≤₦50M and assets ≤₦250M can pay 0% Company Income Tax under the Nigeria Tax Act 2025.',
        '2026-01-01',
        '2026-02-06'
      ),
      createHowToSchema(
        'How to Qualify for 0% Company Income Tax in Nigeria',
        'Step-by-step guide to checking if your Nigerian company qualifies for the small company CIT exemption under 2026 rules.',
        howToSteps
      ),
    ],
  };

  return (
    <>
      <SEOHead
        title="2026 Small Company Tax Exemption - ₦0 CIT for Nigerian SMEs | TaxForge"
        description="Nigerian companies with turnover ≤₦50m and assets ≤₦250m pay 0% CIT under Nigeria Tax Act 2025. Check eligibility and calculate savings."
        canonicalPath="/small-company-exemption"
        keywords="small company tax exemption Nigeria, 0% CIT Nigeria 2026, ₦50 million turnover tax, small business tax Nigeria, Nigeria Tax Act 2025"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="fixed top-20 right-10 w-80 h-80 rounded-full bg-success/10 blur-3xl animate-float-slow pointer-events-none" />
        <div className="fixed bottom-20 left-10 w-64 h-64 rounded-full bg-primary/8 blur-3xl animate-float pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              {/* Hero */}
              <SEOHero
                title="Does Your Company Qualify for"
                titleHighlight="0% Company Income Tax?"
                subtitle="Under the 2026 tax rules, small companies in Nigeria can pay zero CIT. Check if your business meets the criteria instantly."
              />

              {/* Trust Badges */}
              <div className="mb-10 animate-slide-up-delay-2">
                <TrustBadges
                  badges={[
                    { icon: 'check', text: 'Nigeria Tax Act 2025' },
                    { icon: 'shield', text: 'Official FIRS Rules' },
                    { icon: 'clock', text: 'Effective 2026' },
                  ]}
                />
              </div>

              {/* Eligibility Checker */}
              <div className="mb-12">
                <EligibilityChecker />
              </div>

              {/* Eligibility Criteria Explained */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  The Two Criteria for 0% CIT
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-success">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Turnover Limit</h3>
                        <p className="text-success font-semibold">≤ ₦50 Million</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Your company's gross annual revenue must not exceed ₦50 million. This is your total sales before deducting any expenses.
                    </p>
                  </div>

                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-primary">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Fixed Assets Limit</h3>
                        <p className="text-primary font-semibold">≤ ₦250 Million</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Your total fixed assets (land, buildings, machinery, vehicles, equipment) must not exceed ₦250 million.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Important:</strong> You must meet BOTH conditions to qualify. 
                    Exceeding either limit means standard CIT rates apply (30% for large, 20% for medium companies).
                  </p>
                </div>
              </section>

              {/* What You Save Section */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  What Small Companies Save
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="grid gap-6 md:grid-cols-3 text-center">
                    {[
                      { turnover: 20_000_000, profit: 2_000_000 },
                      { turnover: 35_000_000, profit: 3_500_000 },
                      { turnover: 48_000_000, profit: 4_800_000 },
                    ].map((example, index) => {
                      const taxSaved = example.profit * 0.30;
                      return (
                        <div key={index} className="glass rounded-xl p-5">
                          <p className="text-sm text-muted-foreground mb-1">Turnover: {formatCurrency(example.turnover)}</p>
                          <p className="text-xs text-muted-foreground mb-3">Est. Profit: {formatCurrency(example.profit)}</p>
                          <p className="text-3xl font-bold text-success">{formatCurrency(taxSaved)}</p>
                          <p className="text-sm text-muted-foreground">CIT saved annually</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-6">
                    *Estimates based on 10% profit margin. Actual savings depend on your specific profit.
                  </p>
                </div>
              </section>

              {/* How To Steps */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How to Claim the Exemption
                </h2>
                <div className="space-y-4">
                  {howToSteps.map((step, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-5 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{step.name}</h3>
                        <p className="text-sm text-muted-foreground">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Common Mistakes */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Common Mistakes to Avoid
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      mistake: 'Forgetting land in fixed assets',
                      solution: 'Include ALL fixed assets: land, buildings, machinery, vehicles, office equipment',
                    },
                    {
                      mistake: 'Only checking turnover',
                      solution: 'Both turnover AND assets must be under the limits - check both!',
                    },
                    {
                      mistake: 'Not filing returns',
                      solution: 'Even with 0% CIT, you must file annual returns with FIRS',
                    },
                    {
                      mistake: 'Ignoring VAT obligations',
                      solution: 'CIT exemption doesn\'t exempt you from VAT (if turnover > ₦25M)',
                    },
                  ].map((item, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <h3 className="font-semibold text-destructive">{item.mistake}</h3>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{item.solution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* CIT Comparison Table */}
              <section className="mb-12">
                <ComparisonTable
                  title="Company Income Tax: 2026 vs Pre-2026"
                  rows={CIT_COMPARISON_ROWS}
                />
              </section>

              {/* Related Tools */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                  Related Tax Tools
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Business Tax Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate full CIT, VAT, and WHT for your company
                    </p>
                  </Link>
                  <Link to="/tax-reforms-2026" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      2026 Tax Reforms Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Complete overview of all tax changes
                    </p>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Ready to Calculate Your Company Tax?"
                subtext="Get a complete tax breakdown with all deductions, exemptions, and a professional PDF report."
                primaryText="Calculate Business Tax"
                primaryLink="/calculator"
                secondaryText="View Documentation"
                secondaryLink="/documentation"
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SmallCompanyExemption;
