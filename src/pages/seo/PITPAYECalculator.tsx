import { Link } from 'react-router-dom';
import { SEOHead, createWebApplicationSchema, createFAQSchema, createBreadcrumbSchema, createHowToSchema, createTaxRateSchema, createSpeakableSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { QuickTaxCalculator } from '@/components/seo/QuickTaxCalculator';
import { ComparisonTable, PIT_COMPARISON_ROWS } from '@/components/seo/ComparisonTable';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { DataSourceCitation } from '@/components/seo/DataSourceCitation';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { TrendingDown, CheckCircle2, Wallet, ArrowRight, Building2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const PITPAYECalculator = () => {
  const taxBands2026 = [
    { min: 0, max: 800_000, rate: '0%', description: 'Tax-free threshold' },
    { min: 800_001, max: 3_000_000, rate: '15%', description: 'First taxable band' },
    { min: 3_000_001, max: 12_000_000, rate: '18%', description: 'Second band' },
    { min: 12_000_001, max: 25_000_000, rate: '21%', description: 'Third band' },
    { min: 25_000_001, max: 50_000_000, rate: '23%', description: 'Fourth band' },
    { min: 50_000_001, max: Infinity, rate: '25%', description: 'Maximum rate' },
  ];

  const howToSteps = [
    { name: 'Enter Your Gross Annual Salary', text: 'Input your total annual salary before deductions. Include all allowances, bonuses, and benefits in kind.' },
    { name: 'Deduct Pension (8%) and NHF (2.5%)', text: 'Your employee pension contribution of 8% and NHF of 2.5% are automatically deducted from your gross income.' },
    { name: 'Apply Rent Relief & Mortgage Interest', text: 'If you pay rent, enter your annual rent for 20% relief (max ₦500k). If you have a mortgage for building your own home, the interest portion is also deductible.' },
    { name: 'Apply Progressive Tax Bands', text: 'Tax is calculated progressively: first ₦800k is tax-free, then 15% on ₦800k-₦3M, 18% on ₦3M-₦12M, and so on.' },
    { name: 'View Monthly PAYE Amount', text: 'Your annual tax is divided by 12 to show your monthly PAYE deduction — the amount your employer withholds each month.' },
  ];

  const faqs = [
    {
      question: 'What is the 2026 tax-free threshold?',
      answer: 'Under the Nigeria Tax Act 2025 (effective 2026), the first ₦800,000 of your annual income is completely tax-free. This is a significant increase from the previous threshold.',
    },
    {
      question: 'What is the maximum PIT rate in 2026?',
      answer: 'The maximum Personal Income Tax rate is 25%, applicable to income above ₦50 million. This is slightly higher than the previous 24% but only affects the highest earners.',
    },
    {
      question: 'How is PAYE different from PIT?',
      answer: 'PAYE (Pay As You Earn) is the system used to collect PIT (Personal Income Tax) from employees. Your employer deducts PIT from your salary each month and remits it to NRS on your behalf.',
    },
    {
      question: 'What happens if I have two jobs?',
      answer: 'If you earn income from multiple employers, each employer should deduct PAYE based on the salary they pay you. You may need to file a personal tax return to reconcile the total tax owed across all income sources.',
    },
    {
      question: 'How are bonuses taxed under 2026 rules?',
      answer: 'Bonuses are added to your annual income and taxed at your marginal rate. If your salary is ₦5M and you receive a ₦2M bonus, the bonus is taxed at the rate applicable to the ₦5M-₦7M income range (18%).',
    },
    {
      question: 'What about salary arrears from previous years?',
      answer: 'Salary arrears are taxed in the year they are received. However, if the arrears relate to a prior tax year, you may be able to apply for tax relief to avoid being pushed into a higher bracket unfairly.',
    },
    {
      question: 'Can I deduct mortgage interest from my tax?',
      answer: 'Yes, but only interest on loans used to BUILD (not buy) an owner-occupied residential home. The property must be self-occupied (not rental/investment). Only the interest portion is deductible, not the principal repayment.',
    },
    {
      question: 'Are minimum wage earners exempt from PIT?',
      answer: 'Effectively yes. Under 2026 rules, the ₦800,000 tax-free threshold means workers earning the national minimum wage of ₦70,000/month (₦840,000/year) pay minimal tax — only ₦6,000 annually.',
    },
  ];

  const pitTerms = [
    { name: 'Tax-Free Threshold', description: 'First NGN 800,000 of annual income: 0% tax rate' },
    { name: 'First Taxable Band', description: 'NGN 800,001 to NGN 3,000,000: 15% tax rate' },
    { name: 'Second Band', description: 'NGN 3,000,001 to NGN 12,000,000: 18% tax rate' },
    { name: 'Third Band', description: 'NGN 12,000,001 to NGN 25,000,000: 21% tax rate' },
    { name: 'Fourth Band', description: 'NGN 25,000,001 to NGN 50,000,000: 23% tax rate' },
    { name: 'Maximum Rate', description: 'Above NGN 50,000,000: 25% tax rate' },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createWebApplicationSchema(
        'PIT/PAYE Calculator Nigeria 2026',
        'Calculate Nigerian Personal Income Tax with 2026 rules. First ₦800,000 tax-free. Progressive rates from 15% to 25%.'
      ),
      createFAQSchema(faqs),
      createHowToSchema(
        'How to Calculate Your 2026 PIT/PAYE',
        'Step-by-step guide to calculating your Nigerian Personal Income Tax under the 2026 rules.',
        howToSteps
      ),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Tax Tools', url: 'https://taxforgeng.com/free-tax-calculator' },
        { name: 'PIT/PAYE Calculator', url: 'https://taxforgeng.com/pit-paye-calculator' },
      ]),
      createTaxRateSchema(
        'Nigeria PIT Tax Bands 2026',
        'Personal Income Tax progressive bands under the Nigeria Tax Act 2025, effective January 2026',
        pitTerms
      ),
      createSpeakableSchema(
        'PIT/PAYE Calculator Nigeria 2026',
        'https://taxforgeng.com/pit-paye-calculator',
        ['#tax-bands', '#faq', '#how-it-works']
      ),
    ],
  };

  return (
    <>
      <SEOHead
        title="PIT & PAYE Calculator Nigeria 2026 - New Tax Bands | TaxForge"
        description="Calculate Nigerian Personal Income Tax with 2026 rules. First ₦800,000 tax-free. New bands: 15%, 18%, 21%, 23%, 25%. Free instant results."
        canonicalPath="/pit-paye-calculator"
        keywords="PAYE calculator Nigeria 2026, personal income tax calculator Nigeria, PIT calculator, Nigeria tax bands 2026, Nigeria Tax Act 2025"
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
            <article className="max-w-4xl mx-auto">
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Tax Tools', href: '/free-tax-calculator' },
                { label: 'PIT/PAYE Calculator' },
              ]} />
              <ContentMeta published="2026-01-15" publishedLabel="January 15, 2026" updated="2026-02-13" updatedLabel="February 13, 2026" />

              {/* Table of Contents */}
              <TableOfContents items={[
                { id: 'how-it-works', label: 'How to Calculate Your PIT/PAYE' },
                { id: 'tax-bands', label: '2026 Tax Bands' },
                { id: 'common-mistakes', label: 'Common Mistakes' },
                { id: 'visualization', label: 'Tax Band Visualization' },
                { id: 'salary-examples', label: 'Monthly Salary Examples' },
                { id: 'faq', label: 'Frequently Asked Questions' },
              ]} />

              <header>
                {/* Hero */}
                <SEOHero
                  title="Nigerian PIT & PAYE Calculator"
                  titleHighlight="2026 Tax Bands"
                  subtitle="Calculate your Personal Income Tax with the new 2026 rules. First ₦800,000 is tax-free. See how the new progressive rates affect you."
                />

                {/* Trust Badges */}
                <div className="mb-10 animate-slide-up-delay-2">
                  <TrustBadges
                    badges={[
                      { icon: 'check', text: 'First ₦800K Tax-Free' },
                      { icon: 'shield', text: 'Nigeria Tax Act 2025' },
                      { icon: 'clock', text: 'Updated Feb 2026' },
                    ]}
                  />
                </div>
              </header>

              {/* Quick Calculator */}
              <div className="mb-12">
                <QuickTaxCalculator showComparison={true} />
              </div>

              {/* How It Works */}
              <section id="how-it-works" className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How to Calculate Your 2026 PIT/PAYE
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

              {/* 2026 Tax Bands */}
              <section id="tax-bands" className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  2026 Personal Income Tax Bands
                </h2>
                <div className="glass-frosted rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/30">
                          <th className="p-4 text-left text-sm font-semibold text-foreground">Income Range</th>
                          <th className="p-4 text-center text-sm font-semibold text-foreground">Tax Rate</th>
                          <th className="p-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxBands2026.map((band, index) => (
                          <tr key={index} className={`border-b border-border/30 last:border-0 ${index === 0 ? 'bg-success/5' : ''}`}>
                            <td className="p-4 text-sm text-foreground">
                              {formatCurrency(band.min)} - {band.max === Infinity ? '∞' : formatCurrency(band.max)}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                                band.rate === '0%' 
                                  ? 'bg-success/20 text-success' 
                                  : 'bg-primary/20 text-primary'
                              }`}>
                                {band.rate}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                              {band.description}
                              {index === 0 && <span className="ml-2 text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">NEW</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <DataSourceCitation />
                </div>
              </section>

              {/* Common Mistakes */}
              <section id="common-mistakes" className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Common PIT/PAYE Mistakes to Avoid
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      mistake: 'Using the old CRA formula',
                      fix: 'The Consolidated Relief Allowance (20% of gross + higher of ₦200k or 1% of gross) is abolished in 2026. Use the new ₦800k threshold and specific reliefs instead.',
                    },
                    {
                      mistake: 'Not applying the ₦800k tax-free threshold first',
                      fix: 'Under 2026 rules, the first ₦800,000 of taxable income is completely exempt. Always deduct this before applying the 15% rate on the next band.',
                    },
                    {
                      mistake: 'Confusing annual vs monthly calculations',
                      fix: 'Tax bands are annual. If you earn ₦300,000/month, your annual income is ₦3.6M — apply bands to the annual figure, then divide by 12 for monthly PAYE.',
                    },
                    {
                      mistake: 'Employers not updating payroll systems',
                      fix: 'Payroll software must be updated with 2026 bands by January 2026. Using old bands results in over-deduction, which employees must reclaim.',
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

              {/* Visual Tax Band Chart */}
              <section id="visualization" className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Progressive Tax Visualization
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="space-y-3">
                    {taxBands2026.map((band, index) => {
                      const widthPercentage = band.max === Infinity ? 100 : Math.min((band.max / 50_000_000) * 100, 100);
                      const rateNum = parseInt(band.rate, 10);
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{band.rate}</span>
                            <span className="text-muted-foreground">
                              {band.max === Infinity ? '₦50M+' : formatCurrency(band.max)}
                            </span>
                          </div>
                          <div className="h-8 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full flex items-center justify-end px-3 transition-all duration-1000 ${
                                rateNum === 0 ? 'bg-success/60' : 'bg-gradient-to-r from-primary/40 to-primary/80'
                              }`}
                              style={{ width: `${widthPercentage}%` }}
                            >
                              <span className="text-xs font-medium text-foreground">{band.rate}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-6">
                    Tax is calculated progressively - only income within each band is taxed at that rate
                  </p>
                </div>
              </section>

              {/* Monthly Salary Examples */}
              <section id="salary-examples" className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Monthly Salary Tax Examples
                </h2>
                <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
                  See how the 2026 tax rules affect different income levels. These examples show approximate 
                  monthly PAYE deductions under the new bands.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full glass-frosted rounded-2xl overflow-hidden">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="p-4 text-left text-sm font-semibold text-foreground">Monthly Salary</th>
                        <th className="p-4 text-center text-sm font-semibold text-foreground">Annual Income</th>
                        <th className="p-4 text-center text-sm font-semibold text-foreground">Monthly Tax</th>
                        <th className="p-4 text-right text-sm font-semibold text-foreground">Take-Home</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { monthly: 100_000, annual: 1_200_000, tax: 5_000, takeHome: 95_000, note: 'Most in tax-free band' },
                        { monthly: 300_000, annual: 3_600_000, tax: 35_000, takeHome: 265_000, note: '15% band' },
                        { monthly: 500_000, annual: 6_000_000, tax: 70_000, takeHome: 430_000, note: '18% band' },
                        { monthly: 1_000_000, annual: 12_000_000, tax: 162_500, takeHome: 837_500, note: '21% band' },
                        { monthly: 2_500_000, annual: 30_000_000, tax: 520_000, takeHome: 1_980_000, note: '23% band' },
                      ].map((example, index) => (
                        <tr key={index} className="border-b border-border/30 last:border-0">
                          <td className="p-4">
                            <span className="font-semibold text-foreground">{formatCurrency(example.monthly)}</span>
                            <span className="text-xs text-muted-foreground block">{example.note}</span>
                          </td>
                          <td className="p-4 text-center text-sm text-muted-foreground">{formatCurrency(example.annual)}</td>
                          <td className="p-4 text-center">
                            <span className="text-primary font-medium">{formatCurrency(example.tax)}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-success font-semibold">{formatCurrency(example.takeHome)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  *Estimates assume 8% pension and 2.5% NHF deductions. Actual amounts vary based on individual reliefs.
                </p>
              </section>

              {/* What Employers Need to Know */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  What Employers Need to Know
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8 border-l-4 border-primary">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">PAYE Remittance Obligations</h3>
                      <p className="text-muted-foreground">
                        As an employer, you're required to deduct PAYE from employee salaries and remit to 
                        the relevant tax authority. Failure to remit attracts penalties.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="glass rounded-xl p-4">
                      <h4 className="font-semibold text-foreground mb-2">Your Responsibilities</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-success" /> Calculate PAYE using 2026 bands</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-success" /> Deduct at source monthly</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-success" /> Remit by 10th of next month</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-success" /> Issue annual P9 forms to employees</li>
                      </ul>
                    </div>
                    <div className="glass rounded-xl p-4 border border-warning/30">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Penalties for Non-Compliance
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 10% penalty on unremitted PAYE</li>
                        <li>• Interest at CBN rate + 2%</li>
                        <li>• Criminal prosecution possible</li>
                        <li>• Employee may claim from employer</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* What Changed Comparison */}
              <section className="mb-12">
                <ComparisonTable
                  title="PIT/PAYE: 2026 vs Pre-2026"
                  rows={PIT_COMPARISON_ROWS}
                />
              </section>

              {/* Available Reliefs */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Available Tax Reliefs (2026)
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { title: 'Pension Contribution', desc: 'Up to 8% of your gross income', highlight: false },
                    { title: 'NHF Contribution', desc: '2.5% of basic salary', highlight: false },
                    { title: 'Rent Relief', desc: '20% of annual rent paid (max ₦500,000)', highlight: true, link: '/rent-relief-2026' },
                    { title: 'NHIS/Health Insurance', desc: 'Health insurance premiums are now deductible', highlight: true },
                    { title: 'Life Insurance', desc: 'Premiums on own life insurance', highlight: false },
                    { title: 'Tax-Free Threshold', desc: 'First ₦800,000 is completely exempt', highlight: true },
                  ].map((relief, index) => (
                    <div 
                      key={index} 
                      className={`glass-frosted rounded-xl p-5 ${relief.link ? 'hover-lift transition-all cursor-pointer' : ''}`}
                    >
                      {relief.link ? (
                        <Link to={relief.link} className="block">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {relief.title}
                                {relief.highlight && (
                                  <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">NEW</span>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">{relief.desc}</p>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {relief.title}
                              {relief.highlight && (
                                <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">NEW</span>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">{relief.desc}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Machine-Readable Tax Band Definitions */}
              <section className="mb-12" aria-label="PIT tax band definitions">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  2026 PIT Tax Band Definitions
                </h2>
                <div className="glass-frosted rounded-2xl p-6">
                  <dl className="space-y-4">
                    {pitTerms.map((term, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                        <dt className="font-semibold text-foreground min-w-[180px]">{term.name}</dt>
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
                  More Tax Tools
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/rent-relief-2026" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Rent Relief Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate your 20% rent relief (max ₦500k)
                    </p>
                  </Link>
                  <Link to="/tax-reforms-2026" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      2026 Tax Reforms Overview
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Complete guide to all tax changes
                    </p>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Get Your Complete Tax Breakdown"
                subtext="Include all reliefs, see your take-home pay, and download a professional PDF report."
                primaryText="Get Your Net Salary Breakdown"
                primaryLink="/individual-calculator"
                secondaryText="Business Calculator"
                secondaryLink="/calculator"
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

export default PITPAYECalculator;
