import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import { Link } from 'react-router-dom';

const PITPAYEGuide2026 = () => {
  const toc = [
    { id: 'new-bands', label: '2026 PIT Tax Bands' },
    { id: 'old-vs-new', label: 'Old vs New Comparison' },
    { id: 'worked-example', label: 'Step-by-Step Calculation' },
    { id: 'rent-relief', label: 'Rent Relief Integration' },
    { id: 'employer-paye', label: 'How Employers Handle PAYE' },
    { id: 'common-mistakes', label: 'Common Mistakes' },
    { id: 'faq', label: 'FAQ' },
  ];

  const faqs = [
    { question: 'What is the difference between PIT and PAYE?', answer: 'PIT (Personal Income Tax) is the tax on individual income. PAYE (Pay As You Earn) is the system by which employers deduct PIT from employees\' salaries monthly and remit it to the tax authority. Same tax, different collection method.' },
    { question: 'Is the ₦800,000 threshold per month or per year?', answer: 'Per year. The ₦800,000 tax-free threshold applies to annual taxable income. Monthly, this translates to approximately ₦66,667 that is not subject to tax.' },
    { question: 'Do I get Rent Relief if I don\'t pay rent?', answer: 'No. Rent Relief is only available if you actually pay rent for residential accommodation. You need to provide evidence (tenancy agreement, receipts) to claim it.' },
    { question: 'How do pension contributions affect my tax?', answer: 'Employee pension contributions (8% of basic, housing, and transport allowances) are deducted before tax. This reduces your taxable income and therefore your PIT liability.' },
    { question: 'What if I have multiple sources of income?', answer: 'All income sources must be aggregated for PIT purposes. If you have employment income plus freelance income, the total is subject to the graduated tax bands. You may need to file a self-assessment return.' },
  ];

  return (
    <BlogPostLayout
      title="PIT & PAYE Calculator"
      titleHighlight="Guide 2026"
      subtitle="Step-by-step walkthrough of personal income tax under the 2026 bands. Includes worked Naira examples, Rent Relief integration, and employer PAYE guidance."
      seoTitle="PIT & PAYE Calculator Guide 2026 - Nigeria | TaxForge Blog"
      seoDescription="Complete guide to calculating Personal Income Tax and PAYE in Nigeria under the 2026 rules. New tax bands, Rent Relief, worked examples with real Naira figures."
      canonicalPath="/blog/pit-paye-guide-2026"
      keywords="PIT calculator Nigeria 2026, PAYE guide, personal income tax Nigeria, tax bands 2026, Rent Relief calculator"
      badge="Guides"
      datePublished="2026-01-30"
      dateModified="2026-02-09"
      toc={toc}
      faqs={faqs}
      relatedPosts={[
        { title: 'Tax Reforms 2026: Full Summary', slug: 'tax-reforms-2026-summary' },
        { title: '0% CIT for Small Companies', slug: 'small-company-cit-exemption' },
        { title: 'Tax Guide for Tech Startups', slug: 'tax-guide-tech-startups' },
      ]}
      relatedTools={[
        { title: 'PIT/PAYE Calculator', to: '/pit-paye-calculator' },
        { title: 'Rent Relief Calculator', to: '/rent-relief-2026' },
      ]}
      ctaHeadline="Calculate Your PIT Now"
      ctaSubtext="Enter your salary and see your exact 2026 tax breakdown instantly."
      ctaPrimaryLink="/pit-paye-calculator"
    >
      <section id="new-bands">
        <h2 className="text-2xl font-bold text-foreground mb-4">2026 PIT Tax Bands</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Nigeria Tax Act 2025 introduced a completely new set of Personal Income Tax bands effective January 2026. The most significant change is the ₦800,000 tax-free threshold, which replaces the old graduated relief system.
        </p>
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground font-semibold">Annual Taxable Income</th>
                  <th className="text-left py-2 text-foreground font-semibold">Rate</th>
                  <th className="text-left py-2 text-foreground font-semibold">Cumulative Tax</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">First ₦800,000</td><td>0%</td><td>₦0</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Next ₦2,200,000</td><td>15%</td><td>₦330,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Next ₦9,000,000</td><td>18%</td><td>₦1,950,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Next ₦13,000,000</td><td>21%</td><td>₦4,680,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Next ₦25,000,000</td><td>23%</td><td>₦10,430,000</td></tr>
                <tr><td className="py-2">Above ₦50,000,000</td><td>25%</td><td>—</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4">
          This means anyone earning ₦800,000 or less per year (approximately ₦66,667/month) pays <strong className="text-foreground">zero income tax</strong>. For reference, the national minimum wage of ₦70,000/month (₦840,000/year) results in only ₦6,000 annual tax — a dramatic reduction from the old system.
        </p>
        <h3 className="text-lg font-semibold text-foreground mb-2">All Six Statutory Deductions (2026)</h3>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Under the NTA 2025, the old CRA is abolished and replaced with six specific deductions:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground mb-4">
          <li><strong className="text-foreground">Pension Contribution</strong> — 8% of gross income</li>
          <li><strong className="text-foreground">NHF (National Housing Fund)</strong> — 2.5% of basic salary</li>
          <li><strong className="text-foreground">NHIS/Health Insurance</strong> — actual premium paid</li>
          <li><strong className="text-foreground">Life Insurance Premium</strong> — premium on own life</li>
          <li><strong className="text-foreground">Rent Relief</strong> — 20% of annual rent paid (max ₦500,000)</li>
          <li><strong className="text-foreground">Mortgage Interest</strong> — interest on loan for building owner-occupied home</li>
        </ol>
        <h3 className="text-lg font-semibold text-foreground mb-2">Key Exemptions</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>National minimum wage earners (₦70,000/month) pay near-zero tax</li>
          <li>Military and armed forces salaries are exempt from PIT</li>
          <li>Compensation for loss of office up to ₦50,000,000 is exempt</li>
        </ul>
      </section>

      <section id="old-vs-new">
        <h2 className="text-2xl font-bold text-foreground mb-4">Old vs New Comparison</h2>
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground font-semibold">Annual Salary</th>
                  <th className="text-left py-2 text-foreground font-semibold">Old Tax</th>
                  <th className="text-left py-2 text-foreground font-semibold">2026 Tax</th>
                  <th className="text-left py-2 text-foreground font-semibold">Saving</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">₦1,200,000</td><td>~₦68,000</td><td>₦60,000</td><td className="text-success">₦8,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦3,000,000</td><td>~₦308,000</td><td>₦330,000</td><td className="text-destructive">-₦22,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦5,000,000</td><td>~₦620,000</td><td>₦690,000</td><td className="text-destructive">-₦70,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦10,000,000</td><td>~₦1,540,000</td><td>₦1,590,000</td><td className="text-destructive">-₦50,000</td></tr>
                <tr><td className="py-2">₦25,000,000</td><td>~₦4,210,000</td><td>₦4,680,000</td><td className="text-destructive">-₦470,000</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Note: These 2026 figures are calculated on gross salary without Rent Relief or pension deductions. In practice, deductions will reduce taxable income and therefore the tax payable. The Rent Relief can significantly offset any increase for higher earners.
        </p>
      </section>

      <section id="worked-example">
        <h2 className="text-2xl font-bold text-foreground mb-4">Step-by-Step Calculation</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Let's calculate the annual PIT for an employee earning <strong className="text-foreground">₦6,000,000 gross salary</strong> with <strong className="text-foreground">₦1,800,000 annual rent</strong>.
        </p>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Calculate Pension Contribution', desc: 'Employee contribution: 8% of basic (assumed 60% of gross) = 8% × ₦3,600,000 = ₦288,000' },
            { step: '2', title: 'Calculate Taxable Income', desc: 'Gross ₦6,000,000 − Pension ₦288,000 = ₦5,712,000 taxable income' },
            { step: '3', title: 'Apply Rent Relief', desc: '20% of ₦1,800,000 rent = ₦360,000 relief. Taxable income becomes ₦5,712,000 − ₦360,000 = ₦5,352,000' },
            { step: '4', title: 'Apply Tax Bands', desc: 'First ₦800,000: ₦0 | Next ₦2,200,000 @ 15%: ₦330,000 | Remaining ₦2,352,000 @ 18%: ₦423,360' },
            { step: '5', title: 'Total Annual Tax', desc: '₦0 + ₦330,000 + ₦423,360 = ₦753,360. Monthly PAYE: ₦62,780' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">{item.step}</div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground leading-relaxed mt-4">
          Try this with your own numbers: <Link to="/pit-paye-calculator" className="text-primary hover:underline">PIT/PAYE Calculator</Link>.
        </p>
      </section>

      <section id="rent-relief">
        <h2 className="text-2xl font-bold text-foreground mb-4">Rent Relief Integration</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The 2026 Rent Relief replaces the old Consolidated Relief Allowance (CRA). It's simpler but requires actual rent payments. You can deduct 20% of your annual rent from your taxable income, with a maximum deduction of ₦500,000.
        </p>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Rent Relief Examples</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground font-semibold">Annual Rent</th>
                  <th className="text-left py-2 text-foreground font-semibold">20% of Rent</th>
                  <th className="text-left py-2 text-foreground font-semibold">Relief (capped)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">₦500,000</td><td>₦100,000</td><td>₦100,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦1,500,000</td><td>₦300,000</td><td>₦300,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦2,500,000</td><td>₦500,000</td><td>₦500,000</td></tr>
                <tr><td className="py-2">₦4,000,000</td><td>₦800,000</td><td className="text-warning">₦500,000 (capped)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Calculate yours: <Link to="/rent-relief-2026" className="text-primary hover:underline">Rent Relief Calculator</Link>.
        </p>
      </section>

      <section id="employer-paye">
        <h2 className="text-2xl font-bold text-foreground mb-4">How Employers Handle PAYE</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Employers are responsible for deducting PAYE from employees' salaries each month and remitting it to the relevant State Internal Revenue Service (SIRS). Under the 2026 rules, employers must:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
          <li className="flex items-start gap-2"><span className="text-primary">•</span>Apply the new ₦800,000 tax-free threshold when calculating monthly deductions</li>
          <li className="flex items-start gap-2"><span className="text-primary">•</span>Factor in Rent Relief where employees provide valid rent documentation</li>
          <li className="flex items-start gap-2"><span className="text-primary">•</span>Deduct pension contributions (employee 8%, employer 10%) before calculating taxable income</li>
          <li className="flex items-start gap-2"><span className="text-primary">•</span>Remit PAYE by the 10th of the following month</li>
          <li className="flex items-start gap-2"><span className="text-primary">•</span>File annual PAYE returns with the SIRS</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          TaxForge's <Link to="/payroll" className="text-primary hover:underline">Payroll Calculator</Link> handles all these calculations automatically for multiple employees.
        </p>
      </section>

      <section id="common-mistakes">
        <h2 className="text-2xl font-bold text-foreground mb-4">Common Mistakes</h2>
        <div className="space-y-3">
          {[
            { mistake: 'Using the old CRA formula', fix: 'The ₦200,000 + 20% CRA is gone. Use the ₦800,000 threshold + Rent Relief instead.' },
            { mistake: 'Applying Rent Relief without documentation', fix: 'You need a valid tenancy agreement and proof of rent payment to claim Rent Relief.' },
            { mistake: 'Forgetting pension deduction', fix: 'Pension contributions (8% employee) are deducted before applying tax bands. Missing this overstates your tax.' },
            { mistake: 'Mixing up monthly and annual figures', fix: 'Tax bands are annual. Divide annual tax by 12 for the monthly PAYE figure.' },
          ].map((item, i) => (
            <div key={i} className="glass-frosted rounded-xl p-5 border-l-4 border-warning/60">
              <h3 className="font-semibold text-foreground text-sm mb-1">❌ {item.mistake}</h3>
              <p className="text-sm text-muted-foreground">✅ {item.fix}</p>
            </div>
          ))}
        </div>
      </section>
    </BlogPostLayout>
  );
};

export default PITPAYEGuide2026;
