import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import { Link } from 'react-router-dom';

const PayrollTaxGuide = () => {
  const toc = [
    { id: 'overview', label: 'Employer Tax Obligations' },
    { id: 'paye', label: 'PAYE Calculation (2026 Bands)' },
    { id: 'pension', label: 'Pension Contributions' },
    { id: 'nhf', label: 'National Housing Fund' },
    { id: 'itf', label: 'Industrial Training Fund' },
    { id: 'nsitf', label: 'NSITF (Employee Compensation)' },
    { id: 'step-by-step', label: 'Step-by-Step Payroll Process' },
    { id: 'deadlines', label: 'Filing Deadlines' },
    { id: 'faq', label: 'FAQ' },
  ];

  const faqs = [
    { question: 'What is the employer pension contribution rate?', answer: 'Employers contribute a minimum of 10% of each employee\'s monthly emoluments to their pension fund. Employees contribute 8%. Total minimum: 18%. Emoluments include basic salary, housing allowance, and transport allowance.' },
    { question: 'When must PAYE be remitted?', answer: 'PAYE must be remitted to the relevant state IRS by the 10th of the following month. For example, January salaries must have PAYE remitted by February 10th.' },
    { question: 'Do I need to deduct NHF for all employees?', answer: 'NHF is mandatory for employees earning ₦3,000 or more per annum. The contribution is 2.5% of the employee\'s basic salary. Employers must also register with the Federal Mortgage Bank.' },
    { question: 'What is the ITF levy?', answer: 'The Industrial Training Fund (ITF) levy is 1% of annual payroll, paid by employers with 5 or more employees OR annual turnover of ₦50 million or more. It funds vocational training programmes.' },
    { question: 'How does Rent Relief affect payroll?', answer: 'Under the 2026 rules, Rent Relief (20% of annual rent, max ₦500,000) replaces the old CRA. Employees provide proof of rent to their employer, who adjusts the PAYE calculation accordingly.' },
  ];

  return (
    <BlogPostLayout
      title="Payroll Tax Guide"
      titleHighlight="for Employers"
      subtitle="Complete guide to Nigerian payroll obligations — PAYE under 2026 bands, pension, NHF, ITF, NSITF, Rent Relief, and monthly filing deadlines."
      seoTitle="Payroll Tax Guide for Nigerian Employers 2026 | TaxForge Blog"
      seoDescription="Complete payroll tax guide for Nigeria 2026. PAYE calculation, pension contributions, NHF, ITF, NSITF, Rent Relief, filing deadlines, and worked examples."
      canonicalPath="/blog/payroll-tax-guide"
      keywords="Nigerian payroll tax, PAYE calculation 2026, employer pension contribution, NHF Nigeria, ITF levy, payroll compliance Nigeria"
      badge="Payroll"
      datePublished="2026-02-09"
      dateModified="2026-02-09"
      toc={toc}
      faqs={faqs}
      relatedPosts={[
        { title: 'PIT & PAYE Guide 2026', slug: 'pit-paye-guide-2026' },
        { title: '2026 Tax Reforms Summary', slug: 'tax-reforms-2026-summary' },
        { title: 'Tax Calendar 2026', slug: 'tax-calendar-2026' },
      ]}
      relatedTools={[
        { title: 'PIT/PAYE Calculator', to: '/pit-paye-calculator' },
        { title: 'Payroll Manager', to: '/payroll' },
        { title: 'Tax Calendar', to: '/tax-calendar' },
      ]}
      ctaHeadline="Calculate Payroll Instantly"
      ctaSubtext="Use our payroll tool for bulk PAYE, pension, and NHF calculations."
      ctaPrimaryLink="/payroll"
    >
      <section id="overview">
        <h2 className="text-2xl font-bold text-foreground mb-4">Employer Tax Obligations</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          As a Nigerian employer, you are responsible for deducting and remitting several taxes and contributions from your employees' salaries. These obligations apply regardless of your company size, though some levies have minimum employee thresholds.
        </p>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Summary of Employer Obligations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-foreground font-semibold">Obligation</th><th className="text-left py-2 text-foreground font-semibold">Rate</th><th className="text-left py-2 text-foreground font-semibold">Paid To</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">PAYE</td><td>0% – 25% (2026 bands)</td><td>State IRS</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Pension (employer)</td><td>Min. 10%</td><td>PFA</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Pension (employee)</td><td>Min. 8%</td><td>PFA</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">NHF</td><td>2.5% of basic</td><td>FMBN</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">ITF</td><td>1% of payroll</td><td>ITF</td></tr>
                <tr><td className="py-2">NSITF</td><td>1% of payroll</td><td>NSITF</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="paye">
        <h2 className="text-2xl font-bold text-foreground mb-4">PAYE Calculation (2026 Bands)</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Pay-As-You-Earn (PAYE) is the mechanism by which employers deduct income tax from employees' salaries. Under the 2026 rules, the tax-free threshold is ₦800,000 annually, which means most minimum-wage earners pay zero PAYE.
        </p>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">2026 PIT Bands (Annual)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-foreground font-semibold">Band</th><th className="text-left py-2 text-foreground font-semibold">Rate</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">First ₦800,000</td><td>0%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦800,001 – ₦2,800,000</td><td>15%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦2,800,001 – ₦10,800,000</td><td>19%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦10,800,001 – ₦50,000,000</td><td>21%</td></tr>
                <tr><td className="py-2">Above ₦50,000,000</td><td>25%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Worked Example</h3>
          <p className="text-sm text-muted-foreground mb-2">Employee with ₦400,000 monthly gross (₦4,800,000 annual):</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Less: Pension (8%): ₦384,000</p>
            <p>Less: Rent Relief (assume ₦300,000)</p>
            <p>Taxable income: ₦4,116,000</p>
            <p>Tax: ₦0 (first ₦800k) + ₦300,000 (15% × ₦2M) + ₦250,040 (19% × ₦1,316,000) = <strong className="text-foreground">₦550,040 annual / ₦45,837 monthly PAYE</strong></p>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Use our <Link to="/pit-paye-calculator" className="text-primary hover:underline">PIT/PAYE Calculator</Link> for precise calculations.
        </p>
      </section>

      <section id="pension">
        <h2 className="text-2xl font-bold text-foreground mb-4">Pension Contributions</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Under the Pension Reform Act, employers with 3 or more employees must operate a contributory pension scheme. The minimum rates are <strong className="text-foreground">10% employer + 8% employee = 18% total</strong> of monthly emoluments (basic salary + housing + transport allowances).
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Employers may contribute more than 10%, and the additional amount is tax-deductible. Employee contributions are deducted before PAYE is calculated, reducing the tax liability.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Deadline:</strong> Contributions must be remitted to the employee's Pension Fund Administrator (PFA) within 7 working days after salary payment.
        </p>
      </section>

      <section id="nhf">
        <h2 className="text-2xl font-bold text-foreground mb-4">National Housing Fund (NHF)</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          NHF is a mandatory contribution of <strong className="text-foreground">2.5% of basic salary</strong> for employees earning ₦3,000 or more per annum. The contribution is deducted from the employee and remitted to the Federal Mortgage Bank of Nigeria (FMBN).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          NHF contributions are also deducted before PAYE calculation, further reducing the employee's tax liability. Employees can access the NHF for housing loans at favourable rates.
        </p>
      </section>

      <section id="itf">
        <h2 className="text-2xl font-bold text-foreground mb-4">Industrial Training Fund (ITF)</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Employers with <strong className="text-foreground">5 or more employees</strong> or annual turnover of ₦50 million or more must contribute 1% of annual payroll to the ITF. This is an employer-only cost, not deducted from employees.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          ITF contributions are due annually. Employers who train their staff can claim back up to 50% of their ITF contribution as reimbursement for qualifying training expenses.
        </p>
      </section>

      <section id="nsitf">
        <h2 className="text-2xl font-bold text-foreground mb-4">NSITF (Employee Compensation)</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Nigeria Social Insurance Trust Fund (NSITF) administers the Employee Compensation Scheme. Employers contribute <strong className="text-foreground">1% of total monthly payroll</strong>. This covers workplace injury, disability, and death benefits.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          NSITF is an employer-only cost. Registration is mandatory for all employers, and contributions are due monthly.
        </p>
      </section>

      <section id="step-by-step">
        <h2 className="text-2xl font-bold text-foreground mb-4">Step-by-Step Monthly Payroll Process</h2>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              'Calculate gross salary for each employee (basic + allowances + overtime + bonuses)',
              'Deduct employee pension contribution (8% of emoluments)',
              'Deduct NHF (2.5% of basic salary)',
              'Apply Rent Relief (20% of annual rent, max ₦500,000) if applicable',
              'Calculate annual taxable income (gross - pension - NHF - Rent Relief)',
              'Apply 2026 PIT bands to determine annual tax, then divide by 12 for monthly PAYE',
              'Calculate employer pension contribution (10% of emoluments)',
              'Calculate NSITF (1% of total payroll)',
              'Prepare payslips showing gross, deductions, and net pay',
              'Remit PAYE to state IRS by the 10th of the following month',
              'Remit pension to PFA within 7 working days of salary payment',
              'Remit NHF to FMBN monthly',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3"><span className="font-bold text-primary shrink-0 w-6">{i + 1}.</span> {step}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="deadlines">
        <h2 className="text-2xl font-bold text-foreground mb-4">Filing Deadlines</h2>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-foreground font-semibold">Obligation</th><th className="text-left py-2 text-foreground font-semibold">Deadline</th><th className="text-left py-2 text-foreground font-semibold">Penalty</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">PAYE remittance</td><td>10th of following month</td><td>10% p.a. interest</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Pension</td><td>7 working days after salary</td><td>2% per month penalty</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">NHF</td><td>Monthly</td><td>Penalties per FMBN guidelines</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Annual PAYE returns</td><td>January 31st</td><td>₦500,000 + ₦50,000/day</td></tr>
                <tr><td className="py-2">ITF contribution</td><td>Annually</td><td>Penalties per ITF Act</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          See our <Link to="/tax-calendar" className="text-primary hover:underline">Tax Calendar</Link> for all 2026 deadlines.
        </p>
      </section>
    </BlogPostLayout>
  );
};

export default PayrollTaxGuide;
