import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import { Link } from 'react-router-dom';

const TaxGuideTechStartups = () => {
  const toc = [
    { id: 'taxes-apply', label: 'Which Taxes Apply to Startups?' },
    { id: 'small-company', label: 'Small Company Exemption' },
    { id: 'vat-registration', label: 'VAT Registration Threshold' },
    { id: 'pioneer-status', label: 'Pioneer Status & Tax Holidays' },
    { id: 'payroll-remote', label: 'Payroll for Remote Teams' },
    { id: 'firs-efiling', label: 'FIRS E-Filing Requirements' },
    { id: 'common-mistakes', label: 'Common Mistakes' },
    { id: 'faq', label: 'FAQ' },
  ];

  const faqs = [
    { question: 'Do I need to register for tax as a startup?', answer: 'Yes. All Nigerian companies must register with FIRS within 6 months of incorporation, regardless of revenue. You\'ll receive a Tax Identification Number (TIN) which is required for banking and contracts.' },
    { question: 'My startup has no revenue yet. Do I still pay tax?', answer: 'If you have no turnover, you qualify for the Small Company Exemption (0% CIT). However, you must still file annual returns with FIRS. The Development Levy applies once you have assessable profits.' },
    { question: 'Does my SaaS revenue count for VAT purposes?', answer: 'Yes. SaaS subscriptions are vatable services. If your total turnover (including SaaS revenue) exceeds ₦25 million, you must register for VAT and charge 7.5% on vatable services.' },
    { question: 'Can I deduct staff salaries before calculating CIT?', answer: 'Yes. Salaries, wages, and employee benefits are deductible business expenses. They reduce your assessable profits and therefore your CIT and Development Levy.' },
    { question: 'What about foreign investors in my startup?', answer: 'Dividends paid to foreign investors are subject to 10% Withholding Tax (WHT) as final tax. Double Tax Treaties (DTAs) may reduce this rate for investors from treaty countries.' },
  ];

  return (
    <BlogPostLayout
      title="Tax Guide for Tech Startups"
      titleHighlight="in Nigeria"
      subtitle="CIT, VAT, WHT, PAYE — which taxes apply to your startup? A practical guide covering the Small Company Exemption, pioneer status, payroll obligations, and FIRS e-filing."
      seoTitle="Tax Guide for Tech Startups in Nigeria 2026 | TaxForge Blog"
      seoDescription="Complete tax guide for Nigerian tech startups. Learn about CIT exemptions, VAT thresholds, pioneer status, payroll tax, and FIRS e-filing requirements under the 2026 rules."
      canonicalPath="/blog/tax-guide-tech-startups"
      keywords="tech startup tax Nigeria, startup tax guide, CIT exemption startups, VAT registration Nigeria, pioneer status Nigeria, payroll tax Nigeria"
      badge="Guides"
      datePublished="2026-01-25"
      dateModified="2026-02-09"
      toc={toc}
      faqs={faqs}
      relatedPosts={[
        { title: '0% CIT for Small Companies', slug: 'small-company-cit-exemption' },
        { title: 'Tax Reforms 2026: Full Summary', slug: 'tax-reforms-2026-summary' },
      ]}
      ctaHeadline="Calculate Your Startup's Tax"
      ctaSubtext="See exactly what your startup owes with our free CIT calculator."
      ctaPrimaryLink="/cit-calculator"
    >
      <section id="taxes-apply">
        <h2 className="text-2xl font-bold text-foreground mb-4">Which Taxes Apply to Startups?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Nigerian tech startups face several tax obligations depending on their size, revenue, and activities. Understanding which taxes apply — and which exemptions you qualify for — can save your startup significant money in the early years.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          {[
            { tax: 'CIT', rate: '0% or 25%', desc: 'Company Income Tax on profits. Small companies (≤₦50M turnover) pay 0%.' },
            { tax: 'VAT', rate: '7.5%', desc: 'On vatable goods and services. Only if turnover exceeds ₦25M.' },
            { tax: 'WHT', rate: '5-10%', desc: 'Deducted on payments for services, dividends, interest, and rent.' },
            { tax: 'PAYE', rate: '0-25%', desc: 'Personal income tax on employee salaries, deducted monthly.' },
          ].map((item) => (
            <div key={item.tax} className="glass-frosted rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-foreground">{item.tax}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.rate}</span>
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Additionally, all companies must pay the <strong className="text-foreground">Development Levy</strong> (4% of assessable profits). There is also the <strong className="text-foreground">NASENI Levy</strong> (0.25% of profit before tax) for companies with turnover above ₦100 million, but most startups fall below this.
        </p>
      </section>

      <section id="small-company">
        <h2 className="text-2xl font-bold text-foreground mb-4">Small Company Exemption</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          This is the single most important tax benefit for Nigerian startups. If your annual turnover is ₦50 million or less and total assets are ₦250 million or less, you pay <strong className="text-foreground">0% Company Income Tax</strong>.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Most early-stage tech startups — from fintech MVPs to SaaS platforms to e-commerce ventures — comfortably qualify. The threshold was doubled from ₦25 million in the 2026 reforms, making this benefit accessible to many more companies.
        </p>
        <div className="glass-frosted rounded-xl p-5 border-l-4 border-success mb-4">
          <h3 className="font-semibold text-foreground mb-2">Example: Pre-Revenue Startup</h3>
          <p className="text-sm text-muted-foreground">
            A recently incorporated fintech with ₦0 revenue, ₦5M in seed funding spent on development, and ₦8M in assets. <strong className="text-foreground">Result:</strong> Qualifies for 0% CIT. Since there are no assessable profits, the Development Levy is also ₦0. Total tax: ₦0.
          </p>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Read the full guide: <Link to="/blog/small-company-cit-exemption" className="text-primary hover:underline">0% CIT for Small Companies</Link>.
        </p>
      </section>

      <section id="vat-registration">
        <h2 className="text-2xl font-bold text-foreground mb-4">VAT Registration Threshold</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Under the 2026 rules, businesses with annual turnover of ₦25 million or less are <strong className="text-foreground">exempt from VAT registration</strong>. This means you don't need to charge VAT on your products or services, file monthly VAT returns, or maintain VAT records.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Once your turnover crosses ₦25 million, you must register for VAT within 6 months. At that point, you charge 7.5% VAT on vatable services (which includes most tech services and SaaS subscriptions), file monthly returns, and can claim input VAT on business purchases.
        </p>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-2">VAT-Exempt Items Relevant to Tech</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Educational technology services (may qualify for exemption)</li>
            <li>• Exported digital services (zero-rated, not exempt)</li>
            <li>• Medical technology platforms (may qualify for exemption)</li>
          </ul>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Use our <Link to="/vat-calculator" className="text-primary hover:underline">VAT Calculator</Link> to compute output and input VAT.
        </p>
      </section>

      <section id="pioneer-status">
        <h2 className="text-2xl font-bold text-foreground mb-4">Pioneer Status & Tax Holidays</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Pioneer Status provides a tax holiday of up to 5 years (initial 3 years + 2-year extension) for companies in designated industries. Tech startups may qualify if they operate in areas like:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
          <li className="flex items-start gap-2"><span className="text-primary">•</span>Software development and IT services</li>
          <li className="flex items-start gap-2"><span className="text-primary">•</span>Data processing and hosting</li>
          <li className="flex items-start gap-2"><span className="text-primary">•</span>Telecommunications infrastructure</li>
          <li className="flex items-start gap-2"><span className="text-primary">•</span>Renewable energy technology</li>
          <li className="flex items-start gap-2"><span className="text-primary">•</span>Manufacturing (including hardware)</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Pioneer Status is administered by the Nigerian Investment Promotion Commission (NIPC). The application process can take 3-6 months. Note that this is <strong className="text-foreground">separate from</strong> the Small Company Exemption — you can potentially benefit from both at different stages of your company's growth.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Important:</strong> During the pioneer period, profits are exempt from CIT but the Development Levy may still apply. Consult a tax professional for the specifics of your situation.
        </p>
      </section>

      <section id="payroll-remote">
        <h2 className="text-2xl font-bold text-foreground mb-4">Payroll for Remote Teams</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If your tech startup has employees (even remote ones), you have payroll tax obligations. As an employer, you must:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
          <li className="flex items-start gap-2"><span className="text-primary">1.</span>Register as an employer with the relevant State IRS</li>
          <li className="flex items-start gap-2"><span className="text-primary">2.</span>Deduct PAYE monthly from employee salaries using the 2026 tax bands</li>
          <li className="flex items-start gap-2"><span className="text-primary">3.</span>Contribute to the pension scheme (employer 10%, employee 8%)</li>
          <li className="flex items-start gap-2"><span className="text-primary">4.</span>Consider NHF contribution (2.5% of basic salary, if applicable)</li>
          <li className="flex items-start gap-2"><span className="text-primary">5.</span>Remit PAYE by the 10th of the following month</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          For remote employees in different states, PAYE is generally remitted to the state where the employee is resident. This can mean dealing with multiple State IRS offices.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          TaxForge's <Link to="/payroll" className="text-primary hover:underline">Payroll Calculator</Link> handles multi-employee PAYE calculations, pension deductions, and net pay computations automatically.
        </p>
      </section>

      <section id="firs-efiling">
        <h2 className="text-2xl font-bold text-foreground mb-4">FIRS E-Filing Requirements</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          All Nigerian companies must file annual tax returns with FIRS, regardless of whether they owe any tax. The e-filing portal is accessible at <strong className="text-foreground">tax.firs.gov.ng</strong>. Key deadlines include:
        </p>
        <div className="space-y-3 mb-4">
          {[
            { date: 'Within 6 months of year-end', event: 'CIT returns (companies operating > 18 months)' },
            { date: '18 months from incorporation', event: 'First CIT return (new companies)' },
            { date: '21st of each month', event: 'Monthly VAT returns (if VAT-registered)' },
            { date: 'January 31', event: 'Annual PAYE returns for previous year' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="h-3 w-3 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">{item.date}</p>
                <p className="text-sm text-muted-foreground">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Late filing penalties start at ₦50,000 for the first month. TaxForge's <Link to="/tax-calendar" className="text-primary hover:underline">Tax Calendar</Link> helps you track all deadlines with automated reminders.
        </p>
      </section>

      <section id="common-mistakes">
        <h2 className="text-2xl font-bold text-foreground mb-4">Common Mistakes</h2>
        <div className="space-y-3">
          {[
            { mistake: 'Assuming "no revenue = no obligations"', fix: 'You must still register with FIRS and file annual returns, even with zero revenue.' },
            { mistake: 'Not separating business and personal finances', fix: 'Use a dedicated business bank account. Co-mingling funds creates audit risks.' },
            { mistake: 'Ignoring contractor WHT obligations', fix: 'If you pay contractors > ₦50,000, you should deduct 5% WHT (companies) or 10% (individuals).' },
            { mistake: 'Missing the VAT registration trigger', fix: 'Monitor your rolling 12-month turnover. Register for VAT within 6 months of crossing ₦25M.' },
            { mistake: 'Not documenting expenses properly', fix: 'Keep receipts and invoices for all business expenses. Unsubstantiated deductions can be disallowed by FIRS.' },
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

export default TaxGuideTechStartups;
