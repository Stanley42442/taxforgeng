import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createHowToSchema, createBreadcrumbSchema, createFAQSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { EligibilityChecker } from '@/components/seo/EligibilityChecker';
import { ComparisonTable, CIT_COMPARISON_ROWS } from '@/components/seo/ComparisonTable';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { DataSourceCitation } from '@/components/seo/DataSourceCitation';
import { CheckCircle2, AlertTriangle, Building2, FileText, ArrowRight, Landmark, Car, Monitor, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const SmallCompanyExemption = () => {
  const howToSteps = [
    { name: 'Check Your Turnover', text: 'Verify your annual gross revenue is ₦50 million or less.' },
    { name: 'Calculate Fixed Assets', text: 'Add up land, buildings, machinery, vehicles, and equipment. Must be ₦250 million or less.' },
    { name: 'Meet Both Criteria', text: 'You must satisfy BOTH conditions to qualify for the 0% CIT exemption.' },
    { name: 'File Your Returns', text: 'Even with 0% CIT, you must file annual returns with FIRS to claim the exemption.' },
  ];

  const faqs = [
    {
      question: 'What are the criteria for the small company exemption?',
      answer: 'Your company must have annual turnover of ₦50 million or less AND total fixed assets of ₦250 million or less. Both criteria must be met simultaneously.',
    },
    {
      question: 'Do I still need to file returns at 0% CIT?',
      answer: 'Yes! Even though you pay zero CIT, you are legally required to file annual returns with FIRS. Failure to file attracts penalties regardless of your tax rate.',
    },
    {
      question: 'What happens if I exceed the thresholds mid-year?',
      answer: 'If your turnover or assets exceed the limits during the year, you lose the small company status for that assessment year. You would be reclassified as a large company and taxed at 30%.',
    },
    {
      question: 'Can group companies each claim the exemption separately?',
      answer: 'Each legal entity is assessed independently. However, FIRS may apply anti-avoidance rules if they determine that a group has artificially split operations to create multiple small companies qualifying for the exemption.',
    },
    {
      question: 'Does a dormant company qualify for the exemption?',
      answer: 'A dormant company with zero turnover and minimal assets would technically meet the criteria. However, you must still file nil returns with FIRS to maintain your status and avoid penalties.',
    },
    {
      question: 'How is the transition year handled for companies previously taxed?',
      answer: 'Companies that were previously paying CIT under the old small company rate (0% on ≤₦25M) automatically benefit from the expanded threshold (≤₦50M) from January 2026. No special application is needed — just meet the new criteria.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema(
        '2026 Small Company Tax Exemption in Nigeria - Complete Guide',
        'Learn how Nigerian small companies with turnover ≤₦50M and assets ≤₦250M can pay 0% Company Income Tax under the Nigeria Tax Act 2025.',
        '2026-01-01',
        '2026-02-09'
      ),
      createHowToSchema(
        'How to Qualify for 0% Company Income Tax in Nigeria',
        'Step-by-step guide to checking if your Nigerian company qualifies for the small company CIT exemption under 2026 rules.',
        howToSteps
      ),
      createFAQSchema(faqs),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Tax Tools', url: 'https://taxforgeng.com/free-tax-calculator' },
        { name: 'Small Company Exemption', url: 'https://taxforgeng.com/small-company-exemption' },
      ]),
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
            <article className="max-w-4xl mx-auto">
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Tax Tools', href: '/free-tax-calculator' },
                { label: 'Small Company Exemption' },
              ]} />
              <ContentMeta published="2026-01-01" publishedLabel="January 1, 2026" updated="2026-02-13" updatedLabel="February 13, 2026" />

              <header>
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
              </header>

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
                    Exceeding either limit means the standard 30% CIT rate applies as a large company. <strong className="text-foreground">Note:</strong> Professional service providers (law, accounting, medical, engineering firms) are excluded from the small company definition regardless of their turnover or asset size.
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
              <section id="how-it-works" className="mb-12">
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
                      mistake: 'Only checking turnover, not fixed assets',
                      solution: 'Both turnover AND assets must be under the limits. A company with ₦30M turnover but ₦300M in property does NOT qualify.',
                    },
                    {
                      mistake: 'Not filing returns (still required at 0%)',
                      solution: 'Even with 0% CIT, you must file annual returns with FIRS. Non-filing attracts penalties and may trigger an audit.',
                    },
                    {
                      mistake: 'Assuming exemption is automatic without documentation',
                      solution: 'You must actively claim the exemption by filing your returns with audited accounts showing you meet both criteria.',
                    },
                    {
                      mistake: 'Exceeding thresholds mid-year',
                      solution: 'If your turnover or assets exceed limits during the year, you lose small company status for that entire assessment year.',
                    },
                    {
                      mistake: 'Forgetting land in fixed assets',
                      solution: 'Include ALL fixed assets: land, buildings, machinery, vehicles, office equipment. Use net book value from your balance sheet.',
                    },
                    {
                      mistake: 'Ignoring VAT obligations',
                      solution: 'CIT exemption doesn\'t exempt you from VAT (if turnover > ₦25M). These are separate tax obligations.',
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
                <DataSourceCitation />
              </section>

              {/* What Counts as Fixed Assets */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  What Counts as Fixed Assets?
                </h2>
                <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Understanding what counts toward the ₦250 million fixed asset limit is critical. 
                  Here's a comprehensive checklist of assets to include:
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { icon: Landmark, title: 'Land & Buildings', items: ['Factory premises', 'Warehouse space', 'Office buildings', 'Retail shops'] },
                    { icon: Factory, title: 'Plant & Machinery', items: ['Manufacturing equipment', 'Industrial machines', 'Production lines', 'Heavy equipment'] },
                    { icon: Car, title: 'Motor Vehicles', items: ['Delivery trucks', 'Company cars', 'Motorcycles', 'Forklifts'] },
                    { icon: Monitor, title: 'Office Equipment', items: ['Computers & laptops', 'Furniture & fixtures', 'Air conditioners', 'Generators'] },
                  ].map((category, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <category.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{category.title}</h3>
                      </div>
                      <ul className="space-y-1">
                        {category.items.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong>Pro Tip:</strong> Fixed assets are valued at cost or revalued amounts on your balance sheet. 
                    Depreciation is already factored in, so use the net book value for your calculations.
                  </p>
                </div>
              </section>

              {/* Filing Requirements */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How to Claim the 0% CIT Exemption
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <p className="text-muted-foreground mb-6 text-center">
                    Even though you pay 0% CIT, you must still file returns with FIRS to claim the exemption. 
                    Here's what you need to do:
                  </p>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Prepare Audited Accounts', desc: 'Have your annual accounts audited by a registered accountant showing turnover ≤₦50M and fixed assets ≤₦250M.' },
                      { step: 2, title: 'Complete Self-Assessment Form', desc: 'Fill out FIRS Form C for Company Income Tax, declaring your small company status.' },
                      { step: 3, title: 'Submit to FIRS', desc: 'File electronically via TaxPro Max portal or submit physically at your local FIRS office within 6 months of year-end.' },
                      { step: 4, title: 'Keep Records', desc: 'Maintain supporting documents for 6 years - FIRS may audit your small company claim at any time.' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-4 p-4 glass rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ Section - Accordion */}
              <section id="faq" className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="glass-frosted rounded-2xl p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left text-foreground hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
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
                primaryText="Check Your Eligibility Free"
                primaryLink="/calculator"
                secondaryText="View CIT Calculator"
                secondaryLink="/cit-calculator"
              />

              {/* Disclaimer */}
              <SEODisclaimer />
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default SmallCompanyExemption;
