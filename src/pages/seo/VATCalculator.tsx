import { Link } from 'react-router-dom';
import { SEOHead, createCalculatorSchema, createFAQSchema, createBreadcrumbSchema, createHowToSchema, createTaxRateSchema, createSpeakableSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SimpleVATCalculator } from '@/components/seo/SimpleVATCalculator';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { DataSourceCitation } from '@/components/seo/DataSourceCitation';
import { ShoppingCart, Building2, Calendar, CheckCircle2, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const VATCalculator = () => {
  const howToSteps = [
    { name: 'Enter Sale Price', text: 'Input the price of your goods or services. Choose whether the price is VAT-exclusive (you\'ll add 7.5% on top) or VAT-inclusive (VAT is already included in the price).' },
    { name: 'Check if Item is VAT-Exempt', text: 'Some items are VAT-exempt: basic food, medical supplies, educational materials, baby products, agricultural equipment, and exports.' },
    { name: 'Apply 7.5% Standard Rate', text: 'For taxable goods and services, calculate 7.5% of the VAT-exclusive price. This is your Output VAT to charge customers.' },
    { name: 'Calculate Input vs Output VAT', text: 'Track VAT paid on business purchases (Input VAT). Subtract Input VAT from Output VAT to find your net VAT liability.' },
    { name: 'Determine Net VAT Payable', text: 'Remit the difference (Output VAT minus Input VAT) to NRS by the 21st of each month.' },
  ];

  const faqs = [
    {
      question: 'What is the current VAT rate in Nigeria?',
      answer: 'The current VAT rate in Nigeria is 7.5% (NTA Sec 19). This rate applies to most goods and services, with some exemptions for essential items.',
    },
    {
      question: 'Who must register for VAT?',
      answer: 'Businesses with annual turnover exceeding ₦25 million are required to register for VAT. Businesses below ₦100 million turnover qualify for the small business exemption (NTAA Sec 22). Smaller businesses may voluntarily register.',
    },
    {
      question: 'What is Input VAT vs Output VAT?',
      answer: 'Output VAT is the VAT you charge customers on sales. Input VAT is the VAT you pay on business purchases. You remit the difference (Output - Input) to NRS.',
    },
    {
      question: 'When are VAT returns due?',
      answer: 'VAT returns must be filed monthly, by the 21st day of the following month. Late filing attracts penalties and interest.',
    },
    {
      question: 'Do e-commerce businesses need to charge VAT?',
      answer: 'Yes. Online businesses selling taxable goods or services in Nigeria must charge 7.5% VAT if their turnover exceeds ₦25M. This includes digital platforms, SaaS providers, and online marketplaces.',
    },
    {
      question: 'How does VAT work on cross-border transactions?',
      answer: 'Exports of goods are zero-rated (0% VAT). Imported services are subject to reverse-charge VAT at 7.5%, where the Nigerian buyer self-accounts for the VAT. Non-resident digital companies with significant economic presence must also register.',
    },
    {
      question: 'What are the penalties for late VAT filing?',
      answer: 'Late filing attracts a penalty of ₦100,000 for the first month and ₦50,000 for each subsequent month of default (NTA Sec 23). Additionally, interest accrues on the unpaid VAT at the prevailing commercial rate.',
    },
  ];

  const exemptItems = [
    'Basic food items (unprocessed)',
    'Medical and pharmaceutical products',
    'Educational materials and books',
    'Baby products',
    'Agricultural equipment',
    'Exports of goods',
  ];

  const vatableItems = [
    'Professional services',
    'Telecommunications',
    'Hotel and hospitality',
    'Processed foods',
    'Electronics and appliances',
    'Construction services',
  ];

  const vatTerms = [
    { name: 'VAT Standard Rate', description: '7.5% on all taxable goods and services in Nigeria' },
    { name: 'VAT Registration Threshold', description: 'Businesses with annual turnover above NGN 25 million must register for VAT' },
    { name: 'VAT-Exempt Items', description: 'Basic food, medical supplies, educational materials, baby products, agricultural equipment, and exports' },
    { name: 'VAT Filing Deadline', description: 'Monthly returns due by the 21st day of the following month' },
    { name: 'Input VAT', description: 'VAT paid on business purchases, deductible from Output VAT' },
    { name: 'Output VAT', description: 'VAT charged to customers on sales of taxable goods and services' },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createCalculatorSchema(
        'VAT Calculator Nigeria 2026 - 7.5% Rate',
        'Calculate Nigerian VAT at 7.5%. Know exempt items, registration thresholds, and filing deadlines. Free instant calculator.',
        'VAT Calculator'
      ),
      createFAQSchema(faqs),
      createHowToSchema(
        'How to Calculate Nigerian VAT',
        'Step-by-step guide to calculating Value Added Tax on goods and services in Nigeria at the 7.5% rate.',
        howToSteps
      ),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Tax Tools', url: 'https://taxforgeng.com/free-tax-calculator' },
        { name: 'VAT Calculator', url: 'https://taxforgeng.com/vat-calculator' },
      ]),
      createTaxRateSchema(
        'Nigeria VAT Rates and Rules 2026',
        'Value Added Tax rates and registration rules in Nigeria, effective 2026',
        vatTerms
      ),
      createSpeakableSchema(
        'VAT Calculator Nigeria 2026',
        'https://taxforgeng.com/vat-calculator',
        ['#vat-rates', '#faq', '#how-it-works']
      ),
    ],
  };

  return (
    <>
      <SEOHead
        title="VAT Calculator Nigeria 2026 - 7.5% Rate & Exemptions | TaxForge"
        description="Calculate Nigerian VAT at 7.5%. Know exempt items, ₦25M registration threshold, and monthly filing deadlines. Free instant calculator."
        canonicalPath="/vat-calculator"
        keywords="VAT calculator Nigeria, Nigerian VAT rate, 7.5% VAT Nigeria, VAT exempt items Nigeria, VAT registration threshold"
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
            <article className="max-w-4xl mx-auto">
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Tax Tools', href: '/free-tax-calculator' },
                { label: 'VAT Calculator' },
              ]} />
              <ContentMeta published="2026-01-15" publishedLabel="January 15, 2026" updated="2026-02-13" updatedLabel="February 13, 2026" />

              <header>
                {/* Hero */}
                <SEOHero
                  title="Nigerian VAT Calculator"
                  titleHighlight="7.5% Rate Explained"
                  subtitle="Calculate Value Added Tax instantly. Understand which items are exempt, when to register, and how to file your monthly returns."
                />

                {/* Trust Badges */}
                <div className="mb-10 animate-slide-up-delay-2">
                  <TrustBadges
                    badges={[
                      { icon: 'check', text: '7.5% Standard Rate' },
                      { icon: 'shield', text: 'NRS Compliant' },
                      { icon: 'clock', text: 'Monthly Filing' },
                    ]}
                  />
                </div>
              </header>

              {/* VAT Calculator Widget */}
              <div className="mb-12">
                <SimpleVATCalculator />
              </div>

              {/* How VAT Works */}
              <section id="how-it-works" className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How to Calculate Nigerian VAT
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
                  Common VAT Mistakes to Avoid
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      mistake: 'Charging VAT below ₦25M turnover threshold',
                      fix: 'VAT registration is mandatory only above ₦25M annual turnover. Below that, registration is voluntary. Charging VAT without registration is non-compliant.',
                    },
                    {
                      mistake: 'Applying VAT on exempt items',
                      fix: 'Basic food, medical supplies, educational materials, and baby products are exempt. Charging VAT on these items is incorrect and you may face penalties.',
                    },
                    {
                      mistake: 'Late monthly filing (due by 21st)',
                      fix: 'VAT returns are due by the 21st of the following month. Late filing attracts ₦100,000 penalty for the first month plus ₦50,000 each subsequent month (NTA 2025).',
                    },
                    {
                      mistake: 'Not keeping proper VAT invoices',
                      fix: 'Maintain proper VAT invoices with your TIN, the customer\'s details, the VAT amount separately shown, and the date. Without proper invoices, you cannot claim Input VAT credits.',
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

              {/* Registration Threshold */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  VAT Registration Requirements
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8 border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        ₦25 Million Turnover Threshold
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Businesses with annual turnover exceeding ₦25 million must register for VAT 
                        and charge 7.5% on taxable supplies. You have 6 months from the date you 
                        exceed this threshold to register.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="glass rounded-xl p-4">
                          <h4 className="font-semibold text-foreground mb-2">Required to Register</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Turnover exceeds ₦25M/year</li>
                            <li>• Importing taxable goods</li>
                            <li>• Government contractors</li>
                          </ul>
                        </div>
                        <div className="glass rounded-xl p-4">
                          <h4 className="font-semibold text-foreground mb-2">Voluntary Registration</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Turnover below ₦25M/year</li>
                            <li>• Want to claim input VAT</li>
                            <li>• Credibility with larger clients</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Exempt vs Taxable */}
              <section id="vat-rates" className="mb-12" aria-label="VAT exempt and taxable items">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  VAT-Exempt vs VATable Items
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-success">
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle className="h-6 w-6 text-success" aria-hidden="true" />
                      <h3 className="text-xl font-bold text-foreground">VAT Exempt (0%)</h3>
                    </div>
                    <dl className="space-y-2">
                      {exemptItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                          <dt className="text-sm text-muted-foreground">{item}</dt>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-primary">
                    <div className="flex items-center gap-3 mb-4">
                      <ShoppingCart className="h-6 w-6 text-primary" aria-hidden="true" />
                      <h3 className="text-xl font-bold text-foreground">VATable (7.5%)</h3>
                    </div>
                    <dl className="space-y-2">
                      {vatableItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                          <dt className="text-sm text-muted-foreground">{item}</dt>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <DataSourceCitation />
                </div>
              </section>

              {/* Real Examples */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  VAT Calculation Examples
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { item: 'Consulting Service', price: 500_000, vat: 37_500, total: 537_500 },
                    { item: 'Software License', price: 1_200_000, vat: 90_000, total: 1_290_000 },
                    { item: 'Office Equipment', price: 2_500_000, vat: 187_500, total: 2_687_500 },
                  ].map((example, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-5 text-center">
                      <h4 className="font-semibold text-foreground mb-3">{example.item}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium text-foreground">{formatCurrency(example.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">VAT (7.5%):</span>
                          <span className="font-medium text-primary">{formatCurrency(example.vat)}</span>
                        </div>
                        <div className="border-t border-border/50 pt-2 flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-bold text-success">{formatCurrency(example.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Filing Deadlines */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Monthly VAT Filing Deadlines
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        File by the 21st of Each Month
                      </h3>
                      <p className="text-muted-foreground">
                        VAT returns for each month must be filed and paid by the 21st day of the 
                        following month. For example, January VAT is due by February 21st.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-semibold text-foreground mb-2">Late Filing Penalties</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• ₦100,000 first month (NTA 2025)</li>
                        <li>• ₦50,000 each subsequent month</li>
                        <li>• Plus interest on unpaid tax</li>
                      </ul>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-semibold text-foreground mb-2">How to File</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Online via NRS TaxPro Max portal</li>
                        <li>• Complete VAT Form 002</li>
                        <li>• Attach supporting schedules</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Machine-Readable VAT Definitions */}
              <section className="mb-12" aria-label="VAT rate definitions">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  VAT Rate Definitions
                </h2>
                <div className="glass-frosted rounded-2xl p-6">
                  <dl className="space-y-4">
                    {vatTerms.map((term, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                        <dt className="font-semibold text-foreground min-w-[220px]">{term.name}</dt>
                        <dd className="text-sm text-muted-foreground">{term.description}</dd>
                      </div>
                    ))}
                  </dl>
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
                  <Link to="/cit-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Company Income Tax Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate CIT at 0% or 30% under 2026 rules
                    </p>
                  </Link>
                  <Link to="/wht-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Withholding Tax Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      WHT rates on contracts, rent, dividends
                    </p>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Get Complete Business Tax Breakdown"
                subtext="Calculate VAT, CIT, WHT, and Development Levy together with a professional PDF report."
                primaryText="Business Tax Calculator"
                primaryLink="/calculator"
                secondaryText="View Documentation"
                secondaryLink="/documentation"
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

export default VATCalculator;
