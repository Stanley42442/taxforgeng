import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import { Link } from 'react-router-dom';

const TaxCalendar2026 = () => {
  const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'monthly', label: 'Monthly Obligations' },
    { id: 'quarterly', label: 'Quarterly Deadlines' },
    { id: 'annual', label: 'Annual Deadlines' },
    { id: 'calendar', label: 'Month-by-Month Calendar' },
    { id: 'penalties', label: 'Late Filing Penalties' },
    { id: 'tips', label: 'Compliance Tips' },
    { id: 'faq', label: 'FAQ' },
  ];

  const faqs = [
    { question: 'When is the CIT filing deadline for 2026?', answer: 'Companies with a December year-end must file their 2025 CIT returns by June 30, 2026. For other year-ends, the deadline is 6 months after the financial year-end.' },
    { question: 'How often must VAT returns be filed?', answer: 'VAT returns are filed monthly, due by the 21st of the following month. For example, January VAT returns are due by February 21st.' },
    { question: 'When is the PAYE annual return deadline?', answer: 'Annual PAYE returns (Form H1) must be filed by January 31st of the following year. So the 2026 PAYE annual return is due by January 31, 2027.' },
    { question: 'What happens if I miss a filing deadline?', answer: 'Penalties vary by tax type but generally include ₦100,000 for the first month of late filing, plus ₦50,000 for each subsequent month (NTA 2025). Late payment attracts 10% per annum interest.' },
    { question: 'Can I file taxes online in Nigeria?', answer: 'Yes. NRS (formerly FIRS) operates the TaxPro Max e-filing portal for CIT, VAT, WHT, and other federal taxes. State taxes are filed with the respective state IRS portals.' },
  ];

  return (
    <BlogPostLayout
      title="Tax Calendar 2026"
      titleHighlight="Key Deadlines"
      subtitle="Month-by-month guide to every CIT, VAT, WHT, PAYE, and pension filing deadline for the 2026 tax year in Nigeria."
      seoTitle="Nigerian Tax Calendar 2026 - Filing Deadlines & Penalties | TaxForge"
      seoDescription="Complete Nigerian tax calendar for 2026. Monthly, quarterly, and annual filing deadlines for CIT, VAT, WHT, PAYE, pension. Penalties for late filing."
      canonicalPath="/blog/tax-calendar-2026"
      keywords="Nigerian tax calendar 2026, tax filing deadlines Nigeria, CIT deadline, VAT filing deadline, PAYE annual return, tax penalties Nigeria"
      badge="Deadlines"
      datePublished="2026-02-09"
      dateModified="2026-02-09"
      toc={toc}
      faqs={faqs}
      relatedPosts={[
        { title: '2026 Tax Reforms Summary', slug: 'tax-reforms-2026-summary' },
        { title: 'Payroll Tax Guide', slug: 'payroll-tax-guide' },
        { title: 'VAT Guide for Businesses', slug: 'vat-guide-nigeria' },
      ]}
      relatedTools={[
        { title: 'Tax Calendar', to: '/tax-calendar' },
        { title: 'Free Tax Calculator', to: '/free-tax-calculator' },
        { title: 'Compliance Tracker', to: '/compliance' },
      ]}
      ctaHeadline="Never Miss a Deadline"
      ctaSubtext="Set up automatic reminders with our Tax Calendar tool."
      ctaPrimaryLink="/tax-calendar"
    >
      <section id="overview">
        <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Nigerian tax compliance requires attention to multiple deadlines throughout the year. Missing a deadline can result in significant penalties — starting at ₦50,000 and escalating monthly. This guide consolidates every key deadline for the 2026 tax year so you can plan ahead.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The deadlines below apply to the standard January–December financial year. Companies with non-standard year-ends should adjust accordingly. Use our interactive <Link to="/tax-calendar" className="text-primary hover:underline">Tax Calendar</Link> for personalised reminders.
        </p>
      </section>

      <section id="monthly">
        <h2 className="text-2xl font-bold text-foreground mb-4">Monthly Obligations</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">These obligations recur every month and are the most frequent compliance requirements:</p>
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-foreground font-semibold">Obligation</th><th className="text-left py-2 text-foreground font-semibold">Due Date</th><th className="text-left py-2 text-foreground font-semibold">Authority</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">PAYE remittance</td><td>10th of following month</td><td>State IRS</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">VAT returns & payment</td><td>21st of following month</td><td>NRS</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">WHT remittance</td><td>21 days from deduction</td><td>NRS</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Pension contributions</td><td>7 working days after salary</td><td>PFA</td></tr>
                <tr><td className="py-2">NHF remittance</td><td>Monthly</td><td>FMBN</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="quarterly">
        <h2 className="text-2xl font-bold text-foreground mb-4">Quarterly Deadlines</h2>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-foreground font-semibold">Obligation</th><th className="text-left py-2 text-foreground font-semibold">Q1</th><th className="text-left py-2 text-foreground font-semibold">Q2</th><th className="text-left py-2 text-foreground font-semibold">Q3</th><th className="text-left py-2 text-foreground font-semibold">Q4</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">CIT instalment (if applicable)</td><td>Mar 31</td><td>Jun 30</td><td>Sep 30</td><td>Dec 31</td></tr>
                <tr><td className="py-2">WHT summary returns</td><td>Apr 21</td><td>Jul 21</td><td>Oct 21</td><td>Jan 21</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="annual">
        <h2 className="text-2xl font-bold text-foreground mb-4">Annual Deadlines</h2>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-foreground font-semibold">Deadline</th><th className="text-left py-2 text-foreground font-semibold">Date (Dec Year-End)</th><th className="text-left py-2 text-foreground font-semibold">Notes</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">PAYE annual return (Form H1)</td><td>January 31</td><td>Summary of all employee PAYE for the year</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Individual tax return</td><td>March 31</td><td>For self-employed individuals and sole traders</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">CIT return filing</td><td>June 30</td><td>6 months after financial year-end</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Audited financial statements</td><td>June 30</td><td>Must accompany CIT return</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Development Levy (4%)</td><td>June 30</td><td>Payable with CIT return</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">ITF contribution (1%)</td><td>April 1</td><td>Annual payroll contribution</td></tr>
                <tr><td className="py-2">Tax clearance certificate renewal</td><td>Throughout year</td><td>Apply after filing returns</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="calendar">
        <h2 className="text-2xl font-bold text-foreground mb-4">Month-by-Month Calendar</h2>
        <div className="space-y-3 mb-4">
          {[
            { month: 'January', items: ['PAYE annual return (Form H1) — Jan 31', 'Dec PAYE remittance — Jan 10', 'Dec VAT return — Jan 21'] },
            { month: 'February', items: ['Jan PAYE remittance — Feb 10', 'Jan VAT return — Feb 21'] },
            { month: 'March', items: ['Feb PAYE remittance — Mar 10', 'Individual tax return — Mar 31', 'CIT Q1 instalment — Mar 31', 'Feb VAT return — Mar 21'] },
            { month: 'April', items: ['Mar PAYE remittance — Apr 10', 'ITF annual contribution — Apr 1', 'Mar VAT return — Apr 21', 'Q1 WHT summary — Apr 21'] },
            { month: 'May', items: ['Apr PAYE remittance — May 10', 'Apr VAT return — May 21'] },
            { month: 'June', items: ['May PAYE remittance — Jun 10', 'CIT annual return (Dec YE) — Jun 30', 'Development Levy — Jun 30', 'CIT Q2 instalment — Jun 30', 'May VAT return — Jun 21'] },
            { month: 'July', items: ['Jun PAYE remittance — Jul 10', 'Jun VAT return — Jul 21', 'Q2 WHT summary — Jul 21'] },
            { month: 'August', items: ['Jul PAYE remittance — Aug 10', 'Jul VAT return — Aug 21'] },
            { month: 'September', items: ['Aug PAYE remittance — Sep 10', 'CIT Q3 instalment — Sep 30', 'Aug VAT return — Sep 21'] },
            { month: 'October', items: ['Sep PAYE remittance — Oct 10', 'Sep VAT return — Oct 21', 'Q3 WHT summary — Oct 21'] },
            { month: 'November', items: ['Oct PAYE remittance — Nov 10', 'Oct VAT return — Nov 21'] },
            { month: 'December', items: ['Nov PAYE remittance — Dec 10', 'CIT Q4 instalment — Dec 31', 'Nov VAT return — Dec 21'] },
          ].map((m) => (
            <div key={m.month} className="glass-frosted rounded-xl p-4">
              <h3 className="font-bold text-foreground mb-2">{m.month}</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {m.items.map((item, i) => (<li key={i}>• {item}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="penalties">
        <h2 className="text-2xl font-bold text-foreground mb-4">Late Filing Penalties</h2>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-foreground font-semibold">Tax Type</th><th className="text-left py-2 text-foreground font-semibold">Late Filing Penalty</th><th className="text-left py-2 text-foreground font-semibold">Late Payment Interest</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">CIT</td><td>₦100,000 first month + ₦50,000/month</td><td>10% p.a.</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">VAT</td><td>₦100,000 first month + ₦50,000/month</td><td>10% p.a.</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">PAYE (monthly)</td><td>10% p.a. interest</td><td>10% p.a.</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">PAYE (annual return)</td><td>₦500,000 + ₦50,000/day</td><td>—</td></tr>
                <tr><td className="py-2">Pension</td><td>2% per month</td><td>Additional penalties per PenCom</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="tips">
        <h2 className="text-2xl font-bold text-foreground mb-4">Compliance Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'Set up automated reminders', tip: 'Use our Tax Calendar tool to receive email and push notifications before each deadline.' },
            { title: 'File early, not on the deadline', tip: 'The TaxPro Max portal can be slow near deadlines. File at least 3 days early to avoid technical issues.' },
            { title: 'Keep records for 6 years', tip: 'NRS can audit tax returns going back 6 years. Maintain organised digital records of all invoices, receipts, and returns.' },
            { title: 'Reconcile monthly', tip: 'Don\'t wait until year-end. Reconcile your VAT, WHT, and PAYE records monthly to catch errors early.' },
          ].map((item, i) => (
            <div key={i} className="glass-frosted rounded-xl p-5">
              <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.tip}</p>
            </div>
          ))}
        </div>
      </section>
    </BlogPostLayout>
  );
};

export default TaxCalendar2026;
