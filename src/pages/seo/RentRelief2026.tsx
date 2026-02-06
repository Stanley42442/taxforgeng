import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createFAQSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { RentReliefCalculator } from '@/components/seo/RentReliefCalculator';
import { ComparisonTable } from '@/components/seo/ComparisonTable';
import { CheckCircle2, Home, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';

const RentRelief2026 = () => {
  const faqs = [
    {
      question: 'What is Rent Relief in the 2026 tax rules?',
      answer: 'Rent Relief is a new tax deduction under the Nigeria Tax Act 2025 (effective 2026). You can claim 20% of your annual rent as a deduction from your taxable income, up to a maximum of ₦500,000.',
    },
    {
      question: 'Does Rent Relief replace the old CRA?',
      answer: 'Yes. The Consolidated Relief Allowance (CRA) has been abolished under 2026 rules. Rent Relief is one of the new specific deductions that replaces it.',
    },
    {
      question: 'What documents do I need to claim Rent Relief?',
      answer: 'You need proof of rent payment: rent receipts, tenancy agreement, and bank transfer records. For claims over a certain threshold, you may need your landlord\'s Tax Identification Number (TIN).',
    },
    {
      question: 'Can I claim Rent Relief if I own my home?',
      answer: 'No. Rent Relief is only available for taxpayers who pay rent for their residence. Homeowners don\'t qualify for this specific deduction.',
    },
  ];

  const comparisonRows = [
    { feature: 'Relief Type', pre2026: 'CRA (formula-based)', post2026: 'Rent Relief (20% of rent)', highlight: true },
    { feature: 'Maximum Benefit', pre2026: 'No fixed cap', post2026: '₦500,000', highlight: true },
    { feature: 'Documentation', pre2026: 'Less strict', post2026: 'Proof of rent required' },
    { feature: 'For Homeowners', pre2026: true, post2026: false },
    { feature: 'Transparency', pre2026: 'Complex formula', post2026: 'Simple 20% calculation', highlight: true },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema(
        'Rent Relief 2026 Nigeria - How to Claim 20% Tax Deduction on Rent',
        'Complete guide to the new Rent Relief under Nigeria Tax Act 2025. Calculate your 20% relief (max ₦500,000) and understand documentation requirements.',
        '2026-01-01',
        '2026-02-06'
      ),
      createFAQSchema(faqs),
    ],
  };

  return (
    <>
      <SEOHead
        title="Rent Relief 2026 Nigeria - Claim 20% Tax Relief (Max ₦500,000) | TaxForge"
        description="New 2026 rent relief replaces CRA. Claim 20% of annual rent paid up to ₦500,000. See examples and calculate your savings."
        canonicalPath="/rent-relief-2026"
        keywords="rent relief Nigeria 2026, 20% rent tax deduction, CRA replacement 2026, rent tax relief, Nigeria Tax Act 2025"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="fixed top-20 left-10 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-float-slow pointer-events-none" />
        <div className="fixed bottom-20 right-10 w-64 h-64 rounded-full bg-primary/8 blur-3xl animate-float pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              {/* Hero */}
              <SEOHero
                title="Claim Up to ₦500,000"
                titleHighlight="Tax Relief on Your Rent"
                subtitle="The 2026 tax rules introduce Rent Relief - a new way to reduce your tax by 20% of your annual rent paid. Calculate your savings now."
              />

              {/* Trust Badges */}
              <div className="mb-10 animate-slide-up-delay-2">
                <TrustBadges
                  badges={[
                    { icon: 'check', text: '20% of Annual Rent' },
                    { icon: 'shield', text: 'Max ₦500,000' },
                    { icon: 'clock', text: 'Replaces CRA' },
                  ]}
                />
              </div>

              {/* Rent Relief Calculator */}
              <div className="mb-12">
                <RentReliefCalculator />
              </div>

              {/* How It Works */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How Rent Relief Works
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl font-bold text-primary-foreground">1</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Pay Your Rent</h3>
                      <p className="text-sm text-muted-foreground">
                        Keep records of all rent payments made during the tax year
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl font-bold text-primary-foreground">2</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Calculate 20%</h3>
                      <p className="text-sm text-muted-foreground">
                        Your relief is 20% of annual rent, up to ₦500,000 maximum
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl font-bold text-primary-foreground">3</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Reduce Your Tax</h3>
                      <p className="text-sm text-muted-foreground">
                        The relief is deducted from your taxable income before tax is calculated
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Real Examples */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Real Examples
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { rent: 600_000, relief: 120_000, taxSaving: 24_000 },
                    { rent: 1_200_000, relief: 240_000, taxSaving: 48_000 },
                    { rent: 3_000_000, relief: 500_000, taxSaving: 100_000, capped: true },
                  ].map((example, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-5 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Annual Rent</p>
                      <p className="text-2xl font-bold text-foreground mb-3">{formatCurrency(example.rent)}</p>
                      <div className="glass rounded-lg p-3 mb-3">
                        <p className="text-xs text-muted-foreground">Your Relief</p>
                        <p className="text-xl font-bold text-success">{formatCurrency(example.relief)}</p>
                        {example.capped && (
                          <span className="text-xs text-warning">Cap Applied</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Est. Tax Saved: <span className="text-success font-medium">{formatCurrency(example.taxSaving)}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  *Tax savings estimated at 20% average tax rate
                </p>
              </section>

              {/* CRA vs Rent Relief Comparison */}
              <section className="mb-12">
                <ComparisonTable
                  title="Rent Relief vs Old CRA System"
                  rows={comparisonRows}
                />
              </section>

              {/* Documentation Required */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Documentation You'll Need
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { title: 'Rent Receipts', desc: 'Official receipts from your landlord for each payment', required: true },
                      { title: 'Tenancy Agreement', desc: 'Valid signed agreement showing rent amount and property address', required: true },
                      { title: 'Bank Transfer Records', desc: 'Proof of payment via bank transfer or other traceable method', required: true },
                      { title: 'Landlord TIN', desc: 'May be required for claims above certain thresholds', required: false },
                    ].map((doc, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                        {doc.required ? (
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {doc.title}
                            {doc.required && <span className="text-destructive ml-1">*</span>}
                          </h3>
                          <p className="text-sm text-muted-foreground">{doc.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    <span className="text-destructive">*</span> Required for all Rent Relief claims
                  </p>
                </div>
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
                  <Link to="/individual-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Personal Tax Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate your full PIT with Rent Relief included
                    </p>
                  </Link>
                  <Link to="/pit-paye-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      2026 PIT/PAYE Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      See all the new personal income tax bands
                    </p>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Calculate Your Full Tax with Rent Relief"
                subtext="Include Rent Relief, Pension, NHF and all other deductions in one comprehensive calculation."
                primaryText="Calculate Full Tax"
                primaryLink="/individual-calculator"
                secondaryText="View All Deductions"
                secondaryLink="/documentation"
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default RentRelief2026;
