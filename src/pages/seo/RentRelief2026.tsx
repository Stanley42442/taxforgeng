import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createFAQSchema, createBreadcrumbSchema, createHowToSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { RentReliefCalculator } from '@/components/seo/RentReliefCalculator';
import { ComparisonTable } from '@/components/seo/ComparisonTable';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { CheckCircle2, Home, FileText, AlertCircle, ArrowRight, XCircle, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const RentRelief2026 = () => {
  const howToSteps = [
    { name: 'Gather Proof of Rent Paid', text: 'Collect rent receipts, tenancy agreement, and bank transfer records. These are mandatory for claiming Rent Relief.' },
    { name: 'Calculate 20% of Annual Rent', text: 'Multiply your total annual rent by 20%. For example, if you pay ₦2,000,000/year, your relief is ₦400,000.' },
    { name: 'Cap at ₦500,000 Maximum', text: 'If 20% of your rent exceeds ₦500,000, your relief is capped at ₦500,000. This cap applies regardless of how much rent you pay.' },
    { name: 'Deduct from Taxable Income', text: 'The Rent Relief amount is deducted from your taxable income BEFORE applying the progressive PIT bands.' },
    { name: 'File with Supporting Documentation', text: 'Include your Rent Relief claim in your annual tax return with all supporting documents attached.' },
  ];

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
    {
      question: 'What if I share accommodation with a roommate?',
      answer: 'You can only claim Rent Relief on the portion of rent YOU actually pay. If you split ₦2,400,000 rent equally with a roommate, your claimable rent is ₦1,200,000, giving you ₦240,000 relief.',
    },
    {
      question: 'Can I claim relief on office rent for my business?',
      answer: 'No. Rent Relief under the 2026 PIT rules applies only to residential rent — the property where you live. Business rent is deductible as a business expense under CIT, not as personal Rent Relief.',
    },
    {
      question: 'What happens if I move mid-year?',
      answer: 'You claim relief on the total rent paid during the tax year across all properties. If you paid ₦600,000 at one address and ₦900,000 at another, your total claimable rent is ₦1,500,000 (relief = ₦300,000).',
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
        '2026-02-09'
      ),
      createFAQSchema(faqs),
      createHowToSchema(
        'How to Claim Rent Relief Under 2026 Tax Rules',
        'Step-by-step guide to claiming the 20% Rent Relief deduction (max ₦500,000) under the Nigeria Tax Act 2025.',
        howToSteps
      ),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Tax Tools', url: 'https://taxforgeng.com/free-tax-calculator' },
        { name: 'Rent Relief 2026', url: 'https://taxforgeng.com/rent-relief-2026' },
      ]),
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

              {/* How It Works - Step by Step */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How to Claim Rent Relief
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
                  Common Rent Relief Mistakes to Avoid
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      mistake: 'Claiming without proof of payment',
                      fix: 'You must have rent receipts, a tenancy agreement, and bank transfer records. Cash payments without documentation are not claimable.',
                    },
                    {
                      mistake: 'Exceeding the ₦500k cap',
                      fix: 'Even if 20% of your rent is higher, the maximum relief is ₦500,000. For rent above ₦2.5M/year, the cap applies automatically.',
                    },
                    {
                      mistake: 'Homeowners trying to claim',
                      fix: 'Rent Relief is exclusively for renters. If you live in your own property, you do not qualify — even if you have a mortgage.',
                    },
                    {
                      mistake: 'Not obtaining landlord\'s TIN for large claims',
                      fix: 'For larger rent claims, FIRS may require your landlord\'s Tax Identification Number. Obtain this upfront to avoid delays in processing your claim.',
                    },
                  ].map((item, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <h3 className="font-semibold text-destructive">{item.mistake}</h3>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{item.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Who Qualifies */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Who Qualifies for Rent Relief?
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-success">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                      <h3 className="text-xl font-bold text-foreground">Eligible</h3>
                    </div>
                    <ul className="space-y-3">
                      {[
                        'Employed individuals paying rent for residence',
                        'Self-employed persons paying rent',
                        'Contractors with rental accommodation',
                        'Business owners who rent their personal home',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-destructive">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="h-6 w-6 text-destructive" />
                      <h3 className="text-xl font-bold text-foreground">Not Eligible</h3>
                    </div>
                    <ul className="space-y-3">
                      {[
                        'Homeowners (living in own property)',
                        'Those with employer-provided housing',
                        'Rent paid by company on your behalf',
                        'Cash payments without receipts',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Real Examples by City */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Real Examples Across Nigerian Cities
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { city: 'Lagos (Lekki)', rent: 1_800_000, relief: 360_000, taxSaving: 72_000, capped: false, note: 'Middle-income area' },
                    { city: 'Abuja (Maitama)', rent: 3_500_000, relief: 500_000, taxSaving: 100_000, capped: true, note: 'High-rent area - cap applies' },
                    { city: 'Port Harcourt (GRA)', rent: 600_000, relief: 120_000, taxSaving: 24_000, capped: false, note: 'Reasonable rates' },
                    { city: 'Self-Owned Home', rent: 0, relief: 0, taxSaving: 0, capped: false, note: 'Not eligible - no rent paid', ineligible: true },
                  ].map((example, index) => (
                    <div key={index} className={`glass-frosted rounded-xl p-5 ${example.ineligible ? 'opacity-60' : ''}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className={`h-5 w-5 ${example.ineligible ? 'text-muted-foreground' : 'text-primary'}`} />
                        <h3 className="font-semibold text-foreground">{example.city}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Rent/Year</p>
                          <p className="font-semibold text-foreground">{formatCurrency(example.rent)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Relief</p>
                          <p className={`font-semibold ${example.ineligible ? 'text-muted-foreground' : 'text-success'}`}>
                            {formatCurrency(example.relief)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tax Saved</p>
                          <p className={`font-semibold ${example.ineligible ? 'text-muted-foreground' : 'text-primary'}`}>
                            {formatCurrency(example.taxSaving)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {example.note}
                        {example.capped && <span className="text-warning ml-1">(₦500k cap applied)</span>}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  *Tax savings estimated at 20% average tax rate. Actual savings depend on your income bracket.
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

              {/* FAQ Section - Accordion */}
              <section className="mb-12">
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
                primaryText="Calculate My Full Tax"
                primaryLink="/individual-calculator"
                secondaryText="View PIT Calculator"
                secondaryLink="/pit-paye-calculator"
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

export default RentRelief2026;
