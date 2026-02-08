import { Link } from 'react-router-dom';
import { SEOHead, createWebApplicationSchema, createFAQSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { Receipt, Building2, CreditCard, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';

const WHTCalculator = () => {
  const faqs = [
    {
      question: 'What is Withholding Tax (WHT)?',
      answer: 'Withholding Tax is an advance payment of income tax. When you make certain payments (contracts, rent, dividends), you deduct a percentage and remit it to FIRS on behalf of the recipient.',
    },
    {
      question: 'Can I use WHT as a tax credit?',
      answer: 'Yes! WHT deducted from payments you receive can be used as a credit against your final income tax liability. Keep your WHT credit notes as evidence.',
    },
    {
      question: 'What is the difference between WHT rates for companies and individuals?',
      answer: 'WHT rates are generally the same for both, but the tax treatment differs. For companies, WHT is usually a credit against CIT. For individuals, some WHT (like dividends at 10%) may be final tax.',
    },
    {
      question: 'When must I remit WHT?',
      answer: 'WHT must be remitted to FIRS within 21 days after the month in which the deduction was made. Late remittance attracts penalties.',
    },
  ];

  const whtRates = [
    { type: 'Contracts and Agency', rate: '5%', example: { payment: 1_000_000, wht: 50_000 }, description: 'Applies to contract fees, commissions, agency fees' },
    { type: 'Rent (to Companies)', rate: '10%', example: { payment: 2_400_000, wht: 240_000 }, description: 'Rent payments to corporate landlords' },
    { type: 'Dividends', rate: '10%', example: { payment: 500_000, wht: 50_000 }, description: 'Dividend distributions to shareholders' },
    { type: 'Interest', rate: '10%', example: { payment: 300_000, wht: 30_000 }, description: 'Interest payments on loans and deposits' },
    { type: 'Royalties', rate: '10%', example: { payment: 800_000, wht: 80_000 }, description: 'Payments for intellectual property use' },
    { type: 'Professional Fees', rate: '10%', example: { payment: 1_500_000, wht: 150_000 }, description: 'Fees to lawyers, accountants, consultants' },
    { type: 'Technical Fees', rate: '10%', example: { payment: 2_000_000, wht: 200_000 }, description: 'Technical services and management fees' },
    { type: 'Directors Fees', rate: '10%', example: { payment: 400_000, wht: 40_000 }, description: 'Payments to company directors' },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createWebApplicationSchema(
        'Withholding Tax (WHT) Calculator Nigeria 2026',
        'Nigerian WHT rates: 5% contracts, 10% rent/dividends/professional fees. Learn about WHT credits and how to offset against income tax.'
      ),
      createFAQSchema(faqs),
    ],
  };

  return (
    <>
      <SEOHead
        title="Withholding Tax (WHT) Calculator Nigeria 2026 | TaxForge"
        description="Nigerian WHT rates: 5% contracts, 10% rent/dividends/professional fees. Learn about WHT credits and 2026 rules. Free reference guide."
        canonicalPath="/wht-calculator"
        keywords="withholding tax Nigeria, WHT rates Nigeria, WHT on contracts, WHT on rent, WHT credit, Nigeria Tax Act 2025"
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
                title="Nigerian Withholding Tax"
                titleHighlight="2026 WHT Rates Guide"
                subtitle="Understand Withholding Tax rates for contracts, rent, dividends, and professional fees. Learn how to use WHT as a credit against your income tax."
              />

              {/* Trust Badges */}
              <div className="mb-10 animate-slide-up-delay-2">
                <TrustBadges
                  badges={[
                    { icon: 'check', text: '5% Contracts' },
                    { icon: 'shield', text: '10% Professional Fees' },
                    { icon: 'clock', text: 'WHT Credits Explained' },
                  ]}
                />
              </div>

              {/* WHT Rates Table */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  2026 Withholding Tax Rates
                </h2>
                <div className="glass-frosted rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/30">
                          <th className="p-4 text-left text-sm font-semibold text-foreground">Payment Type</th>
                          <th className="p-4 text-center text-sm font-semibold text-foreground">WHT Rate</th>
                          <th className="p-4 text-right text-sm font-semibold text-foreground hidden md:table-cell">Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        {whtRates.map((rate, index) => (
                          <tr key={index} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                              <div className="font-medium text-foreground">{rate.type}</div>
                              <div className="text-xs text-muted-foreground hidden md:block">{rate.description}</div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                                rate.rate === '5%' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                              }`}>
                                {rate.rate}
                              </span>
                            </td>
                            <td className="p-4 text-right hidden md:table-cell">
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(rate.example.payment)} → <span className="text-primary font-medium">{formatCurrency(rate.example.wht)}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* How WHT Works */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How Withholding Tax Works
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Receipt className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Deduct at Source</h3>
                      <p className="text-sm text-muted-foreground">
                        When making qualifying payments, deduct the WHT percentage before paying the net amount.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Building2 className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Remit to FIRS</h3>
                      <p className="text-sm text-muted-foreground">
                        Pay the deducted WHT to FIRS within 21 days and obtain credit notes for the recipient.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <CreditCard className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Claim as Credit</h3>
                      <p className="text-sm text-muted-foreground">
                        Recipients use WHT credit notes to offset their final income tax liability.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* WHT as Tax Credit */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Using WHT as a Tax Credit
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-success">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      For Companies (CIT Offset)
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Collect WHT credit notes from payers</li>
                      <li>• Sum all WHT deducted during the year</li>
                      <li>• Offset against your CIT liability</li>
                      <li>• If WHT exceeds CIT, carry forward or claim refund</li>
                    </ul>
                    <div className="glass rounded-xl p-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Example:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>CIT Liability:</span>
                          <span className="font-medium">{formatCurrency(3_000_000)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Less: WHT Credits:</span>
                          <span className="font-medium text-success">({formatCurrency(800_000)})</span>
                        </div>
                        <div className="flex justify-between border-t border-border/50 pt-1">
                          <span>CIT Payable:</span>
                          <span className="font-bold text-primary">{formatCurrency(2_200_000)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-primary">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      For Individuals (PIT Offset)
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Keep records of all WHT deducted</li>
                      <li>• Include in annual tax return</li>
                      <li>• Offset against PIT liability</li>
                      <li>• Some WHT (e.g., dividends) may be final tax</li>
                    </ul>
                    <div className="glass rounded-xl p-4 mt-4 border border-warning/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          <strong>Note:</strong> WHT on dividends (10%) is often treated as final tax for 
                          individual shareholders, meaning no further PIT is due on that income.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Real Examples */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Real-World WHT Examples
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      scenario: 'Contractor Payment',
                      payment: 5_000_000,
                      rate: '5%',
                      wht: 250_000,
                      net: 4_750_000,
                    },
                    {
                      scenario: 'Office Rent (to Company)',
                      payment: 12_000_000,
                      rate: '10%',
                      wht: 1_200_000,
                      net: 10_800_000,
                    },
                    {
                      scenario: 'Legal Fees',
                      payment: 3_000_000,
                      rate: '10%',
                      wht: 300_000,
                      net: 2_700_000,
                    },
                    {
                      scenario: 'Dividend Distribution',
                      payment: 10_000_000,
                      rate: '10%',
                      wht: 1_000_000,
                      net: 9_000_000,
                    },
                  ].map((example, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-5">
                      <h4 className="font-semibold text-foreground mb-3">{example.scenario}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gross Payment:</span>
                          <span className="font-medium text-foreground">{formatCurrency(example.payment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">WHT ({example.rate}):</span>
                          <span className="font-medium text-destructive">- {formatCurrency(example.wht)}</span>
                        </div>
                        <div className="border-t border-border/50 pt-2 flex justify-between">
                          <span className="text-muted-foreground">Net to Recipient:</span>
                          <span className="font-bold text-success">{formatCurrency(example.net)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* When WHT is Final Tax */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  When WHT is Final Tax (2026 Rules)
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8 border-l-4 border-accent">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        No Further Tax Due
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Under the 2026 rules, certain WHT deductions are treated as final tax, meaning 
                        the recipient has no further tax obligation on that income.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="glass rounded-xl p-4">
                          <h4 className="font-semibold text-foreground mb-2">Final Tax Cases</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Dividends to individuals (10%)</li>
                            <li>• Interest to individuals (10%)</li>
                            <li>• Royalties to non-residents</li>
                          </ul>
                        </div>
                        <div className="glass rounded-xl p-4">
                          <h4 className="font-semibold text-foreground mb-2">Credit Cases</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Contracts (5%) - offset against CIT/PIT</li>
                            <li>• Professional fees to companies</li>
                            <li>• Rent received by companies</li>
                          </ul>
                        </div>
                      </div>
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
                      Company Income Tax Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate CIT and see how WHT credits apply
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
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Calculate Your Complete Tax Breakdown"
                subtext="Get CIT, VAT, WHT, and Development Levy calculated together with a professional PDF report."
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

export default WHTCalculator;
