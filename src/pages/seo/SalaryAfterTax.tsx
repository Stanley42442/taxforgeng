import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead, createCalculatorSchema, createFAQSchema, createBreadcrumbSchema, createHowToSchema, createTaxRateSchema, createSpeakableSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { QuickTaxCalculator } from '@/components/seo/QuickTaxCalculator';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { DataSourceCitation } from '@/components/seo/DataSourceCitation';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { TrendingDown, CheckCircle2, ArrowRight, Wallet, Calculator, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';
import { calculatePersonalIncomeTax, IndividualTaxInputs } from '@/lib/individualTaxCalculations';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const SalaryAfterTax = () => {
  // Compute salary band comparisons dynamically
  const salaryBands = useMemo(() => {
    const monthlySalaries = [70_000, 100_000, 200_000, 300_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000];
    return monthlySalaries.map((monthly) => {
      const annual = monthly * 12;
      const pension = annual * 0.08;
      const inputs: IndividualTaxInputs = {
        calculationType: 'pit',
        use2026Rules: true,
        employmentIncome: annual,
        pensionContribution: pension,
      };
      const result = calculatePersonalIncomeTax(inputs);
      return {
        monthly,
        annual,
        monthlyTax: Math.round(result.taxPayable / 12),
        monthlyNet: Math.round((annual - pension - result.taxPayable) / 12),
        effectiveRate: result.effectiveRate,
        isMinWage: monthly === 70_000,
      };
    });
  }, []);

  const howToSteps = [
    { name: 'Enter Your Monthly Salary', text: 'Type in your gross monthly salary — the amount before any deductions. Include all regular allowances.' },
    { name: 'Pension Is Deducted Automatically', text: 'Your 8% employee pension contribution is subtracted from your gross pay before tax is calculated.' },
    { name: 'Add Your Rent (Optional)', text: 'If you pay rent, enter the annual amount. You get 20% back as a tax relief, up to ₦500,000 — a new benefit under the 2026 rules.' },
    { name: 'Tax Is Calculated on What Remains', text: 'Your first ₦800,000 of annual income is completely tax-free. After that, progressive rates of 15% to 25% apply to each income band.' },
    { name: 'See Your Take-Home Pay', text: 'Your monthly take-home pay is shown instantly — that\'s your salary minus pension, minus tax. This is what hits your bank account.' },
  ];

  const faqs = [
    {
      question: 'What is my take-home pay on a ₦500,000 monthly salary?',
      answer: 'On a gross salary of ₦500,000/month (₦6M/year), after 8% pension (₦40,000) and applying the 2026 tax bands, your approximate monthly take-home pay is around ₦395,000–₦430,000 depending on other reliefs like rent. Use the calculator above for your exact figure.',
    },
    {
      question: 'Is the minimum wage taxed in Nigeria?',
      answer: 'Barely. The national minimum wage is ₦70,000/month (₦840,000/year). Under 2026 rules, only ₦40,000 of your annual income falls above the ₦800,000 tax-free threshold, resulting in just ₦6,000 annual tax (₦500/month). You keep over 99% of your salary.',
    },
    {
      question: 'How much tax do I pay on ₦1 million per month?',
      answer: 'On ₦1,000,000/month (₦12M/year), your approximate annual tax is around ₦1.6M–₦1.95M depending on pension and other reliefs. That gives you a monthly take-home of roughly ₦830,000–₦860,000. The exact amount depends on your pension rate and whether you claim rent relief.',
    },
    {
      question: 'What changed about salary tax in 2026?',
      answer: 'The old Consolidated Relief Allowance (CRA) system was replaced by a simpler ₦800,000 tax-free threshold. Tax bands were restructured to 6 levels (0%, 15%, 18%, 21%, 23%, 25%). A new rent relief of 20% (max ₦500k) was introduced. Most workers earning under ₦250,000/month pay less tax than before.',
    },
    {
      question: 'Does my employer handle my tax deduction?',
      answer: 'Yes. Under the PAYE (Pay As You Earn) system, your employer calculates your tax using the 2026 bands, deducts it from your salary each month, and remits it to NRS (Nigeria Revenue Service) on your behalf. You receive your salary after tax.',
    },
    {
      question: 'Can I reduce my tax by paying rent?',
      answer: 'Yes — this is new for 2026. If you pay rent, you can claim 20% of your annual rent as a tax relief, up to a maximum of ₦500,000. For example, if you pay ₦2,000,000 in annual rent, you get ₦400,000 deducted from your taxable income.',
    },
    {
      question: 'What is the difference between gross salary and net salary?',
      answer: 'Gross salary is your total pay before any deductions. Net salary (take-home pay) is what you actually receive after pension contributions (8%), tax (PAYE), and any other deductions like NHF (2.5%). The calculator above shows both figures.',
    },
    {
      question: 'How do I calculate my salary after tax manually?',
      answer: 'Step 1: Multiply monthly salary by 12 for annual gross. Step 2: Subtract 8% pension. Step 3: Subtract the ₦800,000 tax-free threshold. Step 4: Apply rates progressively: 15% on first ₦2.2M, 18% on next ₦9M, etc. Step 5: Divide annual tax by 12 for monthly PAYE. Or just use our free calculator.',
    },
    {
      question: 'Are bonuses included in salary after tax calculations?',
      answer: 'Yes. Bonuses, 13th month salary, and other allowances are added to your total annual income and taxed at your marginal rate. A bonus can push you into a higher tax band for that year.',
    },
    {
      question: 'What is the effective tax rate vs marginal tax rate?',
      answer: 'Your marginal rate is the rate on your last naira of income (e.g., 18% if you earn ₦5M). Your effective rate is the total tax divided by total income — always lower because the first ₦800K is tax-free and lower bands apply first. The calculator shows your effective rate.',
    },
  ];

  const netPayTerms = [
    { name: 'Gross Salary', description: 'Your total salary before any deductions — the amount in your employment contract' },
    { name: 'Pension (8%)', description: 'Employee contribution to Pension Fund Administrator (PFA). Deducted before tax calculation.' },
    { name: 'Tax-Free Threshold', description: 'First NGN 800,000 of annual income is exempt from Personal Income Tax under 2026 rules' },
    { name: 'PAYE (Pay As You Earn)', description: 'Monthly income tax deducted by your employer and remitted to NRS on your behalf' },
    { name: 'Net Salary / Take-Home Pay', description: 'The amount deposited to your bank account after all deductions: Gross minus Pension minus PAYE' },
    { name: 'Rent Relief', description: '20% of annual rent paid, capped at NGN 500,000. Reduces your taxable income (new for 2026)' },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createCalculatorSchema(
        'Salary After Tax Calculator Nigeria 2026',
        'Calculate your take-home pay in Nigeria with 2026 tax rules. Free instant net salary calculator — no signup required.',
        'Net Salary Calculator'
      ),
      createFAQSchema(faqs),
      createHowToSchema(
        'How to Calculate Your Salary After Tax in Nigeria',
        'Step-by-step guide to calculating your take-home pay under the 2026 Nigerian tax rules.',
        howToSteps
      ),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Tax Tools', url: 'https://taxforgeng.com/free-tax-calculator' },
        { name: 'Salary After Tax', url: 'https://taxforgeng.com/salary-after-tax-nigeria' },
      ]),
      createTaxRateSchema(
        'Nigeria Net Salary Deductions 2026',
        'Key deductions applied to your gross salary to calculate take-home pay under Nigeria Tax Act 2025',
        netPayTerms
      ),
      createSpeakableSchema(
        'Salary After Tax Calculator Nigeria 2026',
        'https://taxforgeng.com/salary-after-tax-nigeria',
        ['#salary-bands', '#faq', '#how-it-works']
      ),
    ],
  };

  return (
    <>
      <SEOHead
        title="Salary After Tax Calculator Nigeria 2026 - Take-Home Pay | TaxForge"
        description="Calculate your salary after tax in Nigeria with 2026 rules. Free take-home pay calculator. First ₦800K tax-free. See your net salary instantly."
        canonicalPath="/salary-after-tax-nigeria"
        keywords="salary after tax Nigeria, take home pay calculator Nigeria 2026, net salary calculator Nigeria, how much tax do I pay on my salary Nigeria, PAYE calculator Nigeria 2026, salary calculator Nigeria"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col bg-background bg-ambient">
        <LavaLampBackground />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <article className="max-w-4xl mx-auto">
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Tax Tools', href: '/free-tax-calculator' },
                { label: 'Salary After Tax' },
              ]} />
              <ContentMeta published="2026-02-15" publishedLabel="February 15, 2026" updated="2026-02-15" updatedLabel="February 15, 2026" />

              {/* Table of Contents */}
              <TableOfContents items={[
                { id: 'how-it-works', label: 'How It Works' },
                { id: 'breakdown', label: 'Monthly Breakdown' },
                { id: 'salary-bands', label: 'Salary Comparison Table' },
                { id: 'key-terms', label: 'Key Terms Explained' },
                { id: 'faq', label: 'Frequently Asked Questions' },
              ]} />

              <header>
                <SEOHero
                  title="Salary After Tax Calculator Nigeria"
                  titleHighlight="2026 Take-Home Pay"
                  subtitle="Find out exactly how much of your salary you keep after tax, pension, and other deductions. Updated for the 2026 Nigeria Tax Act rules."
                />

                <div className="mb-10 animate-slide-up-delay-2">
                  <TrustBadges
                    badges={[
                      { icon: 'check', text: 'First ₦800K Tax-Free' },
                      { icon: 'shield', text: '2026 Rules Applied' },
                      { icon: 'clock', text: 'Instant Results' },
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
                  How Your Take-Home Pay Is Calculated
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

              {/* Monthly Breakdown Visual */}
              <section id="breakdown" className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Where Does Your Salary Go?
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <p className="text-center text-muted-foreground mb-6">
                    Example breakdown for a ₦500,000/month salary under 2026 rules
                  </p>
                  <div className="space-y-4 max-w-lg mx-auto">
                    {[
                      { label: 'Gross Monthly Salary', amount: 500_000, color: 'bg-foreground/80', icon: Banknote },
                      { label: 'Pension (8%)', amount: -40_000, color: 'bg-primary/60', icon: Wallet },
                      { label: 'PAYE Tax', amount: -65_300, color: 'bg-destructive/60', icon: Calculator },
                      { label: 'Your Take-Home Pay', amount: 394_700, color: 'bg-success/80', icon: CheckCircle2 },
                    ].map((item, index) => (
                      <div key={index} className={`flex items-center justify-between p-4 rounded-xl ${index === 3 ? 'glass border-2 border-success/30' : 'glass-subtle'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center`}>
                            <item.icon className="h-4 w-4 text-background" />
                          </div>
                          <span className={`text-sm font-medium ${index === 3 ? 'text-success font-bold' : 'text-foreground'}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className={`font-semibold ${index === 3 ? 'text-success text-lg' : item.amount < 0 ? 'text-destructive' : 'text-foreground'}`}>
                          {item.amount < 0 ? '−' : ''}{formatCurrency(Math.abs(item.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    *Approximate. Actual amount varies based on NHF, rent relief, and other deductions.
                  </p>
                </div>
              </section>

              {/* Salary Comparison Table */}
              <section id="salary-bands" className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Net Salary at Every Income Level
                </h2>
                <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
                  See your estimated take-home pay at common Nigerian salary levels. All figures use 2026 tax rules with 8% pension.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full glass-frosted rounded-2xl overflow-hidden">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="p-4 text-left text-sm font-semibold text-foreground">Monthly Salary</th>
                        <th className="p-4 text-center text-sm font-semibold text-foreground">Monthly Tax</th>
                        <th className="p-4 text-center text-sm font-semibold text-foreground">Effective Rate</th>
                        <th className="p-4 text-right text-sm font-semibold text-foreground">Take-Home Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryBands.map((band, index) => (
                        <tr key={index} className={`border-b border-border/30 last:border-0 ${band.isMinWage ? 'bg-success/5' : ''}`}>
                          <td className="p-4">
                            <span className="font-semibold text-foreground">{formatCurrency(band.monthly)}</span>
                            {band.isMinWage && (
                              <span className="text-xs text-success block">Minimum Wage</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-primary font-medium">{formatCurrency(band.monthlyTax)}</span>
                          </td>
                          <td className="p-4 text-center text-sm text-muted-foreground">
                            {band.effectiveRate.toFixed(1)}%
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-success font-semibold">{formatCurrency(band.monthlyNet)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DataSourceCitation />
                <p className="text-center text-xs text-muted-foreground mt-2">
                  *Estimates assume 8% pension deduction. Rent relief, NHF, and other deductions not included. Use the calculator above for personalised results.
                </p>
              </section>

              {/* Key Terms */}
              <section id="key-terms" className="mb-12" aria-label="Salary deduction terms explained">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Key Terms Explained
                </h2>
                <div className="glass-frosted rounded-2xl p-6">
                  <dl className="space-y-4">
                    {netPayTerms.map((term, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                        <dt className="font-semibold text-foreground min-w-[180px]">{term.name}</dt>
                        <dd className="text-sm text-muted-foreground">{term.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>

              {/* Reverse Salary CTA */}
              <section className="mb-12">
                <div className="glass-frosted rounded-2xl p-6 md:p-8 border-l-4 border-accent">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <TrendingDown className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Know Your Target Take-Home?</h3>
                      <p className="text-muted-foreground mb-4">
                        If you know what net salary you want, our <strong>Reverse Salary Calculator</strong> works 
                        backwards to tell you the gross salary you need to negotiate. Perfect for job offers and salary reviews.
                      </p>
                      <Link to="/individual-calculator">
                        <Button variant="outline" className="group">
                          <span>Try Reverse Salary Calculator</span>
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
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
                  Related Tools
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/pit-paye-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      PIT/PAYE Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Detailed Personal Income Tax breakdown with all 6 bands
                    </p>
                  </Link>
                  <Link to="/rent-relief-2026" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Rent Relief Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate your 20% rent tax relief (max ₦500k)
                    </p>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Get Your Full Salary Breakdown"
                subtext="Include all reliefs, pension, NHF, rent relief, and download a professional PDF payslip."
                primaryText="Full Take-Home Pay Calculator"
                primaryLink="/individual-calculator"
                secondaryText="Reverse Salary Calculator"
                secondaryLink="/individual-calculator"
              />

              <SEODisclaimer />
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default SalaryAfterTax;
