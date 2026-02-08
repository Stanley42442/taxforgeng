import { Link } from 'react-router-dom';
import { SEOHead, createWebApplicationSchema, createFAQSchema, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SimpleVATCalculator } from '@/components/seo/SimpleVATCalculator';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { ShoppingCart, Building2, Calendar, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';

const VATCalculator = () => {
  const faqs = [
    {
      question: 'What is the current VAT rate in Nigeria?',
      answer: 'The current VAT rate in Nigeria is 7.5%. This rate applies to most goods and services, with some exemptions for essential items.',
    },
    {
      question: 'Who must register for VAT?',
      answer: 'Businesses with annual turnover exceeding ₦25 million are required to register for VAT. Smaller businesses may voluntarily register.',
    },
    {
      question: 'What is Input VAT vs Output VAT?',
      answer: 'Output VAT is the VAT you charge customers on sales. Input VAT is the VAT you pay on business purchases. You remit the difference (Output - Input) to FIRS.',
    },
    {
      question: 'When are VAT returns due?',
      answer: 'VAT returns must be filed monthly, by the 21st day of the following month. Late filing attracts penalties and interest.',
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

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createWebApplicationSchema(
        'VAT Calculator Nigeria 2026 - 7.5% Rate',
        'Calculate Nigerian VAT at 7.5%. Know exempt items, registration thresholds, and filing deadlines. Free instant calculator.'
      ),
      createFAQSchema(faqs),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Tax Tools', url: 'https://taxforgeng.com/free-tax-calculator' },
        { name: 'VAT Calculator', url: 'https://taxforgeng.com/vat-calculator' },
      ]),
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
            <div className="max-w-4xl mx-auto">
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
                    { icon: 'shield', text: 'FIRS Compliant' },
                    { icon: 'clock', text: 'Monthly Filing' },
                  ]}
                />
              </div>

              {/* VAT Calculator Widget */}
              <div className="mb-12">
                <SimpleVATCalculator />
              </div>

              {/* How VAT Works */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How Nigerian VAT Works
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl font-bold text-primary-foreground">1</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Collect Output VAT</h3>
                      <p className="text-sm text-muted-foreground">
                        Charge 7.5% VAT on your sales to customers. This is your Output VAT.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl font-bold text-primary-foreground">2</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Track Input VAT</h3>
                      <p className="text-sm text-muted-foreground">
                        Record VAT paid on business purchases. This is your Input VAT credit.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl font-bold text-primary-foreground">3</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Remit the Difference</h3>
                      <p className="text-sm text-muted-foreground">
                        Pay (Output VAT - Input VAT) to FIRS by the 21st of each month.
                      </p>
                    </div>
                  </div>
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
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  VAT-Exempt vs VATable Items
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-success">
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle className="h-6 w-6 text-success" />
                      <h3 className="text-xl font-bold text-foreground">VAT Exempt (0%)</h3>
                    </div>
                    <ul className="space-y-2">
                      {exemptItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-primary">
                    <div className="flex items-center gap-3 mb-4">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold text-foreground">VATable (7.5%)</h3>
                    </div>
                    <ul className="space-y-2">
                      {vatableItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                        <li>• ₦50,000 first month</li>
                        <li>• ₦25,000 each subsequent month</li>
                        <li>• Plus interest on unpaid tax</li>
                      </ul>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-semibold text-foreground mb-2">How to File</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Online via FIRS TaxPro Max portal</li>
                        <li>• Complete VAT Form 002</li>
                        <li>• Attach supporting schedules</li>
                      </ul>
                    </div>
                  </div>
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
                  <Link to="/cit-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Company Income Tax Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate CIT at 0%, 20%, or 30%
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
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default VATCalculator;
