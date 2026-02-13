import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import { Link } from 'react-router-dom';

const TaxReforms2026Summary = () => {
  const toc = [
    { id: 'overview', label: 'Overview of Changes' },
    { id: 'pit-bands', label: 'New PIT Bands' },
    { id: 'cit-changes', label: 'CIT Changes' },
    { id: 'vat-updates', label: 'VAT Updates' },
    { id: 'wht-final-tax', label: 'WHT as Final Tax' },
    { id: 'dev-levy', label: 'Development Levy' },
    { id: 'rent-relief', label: 'Rent Relief' },
    { id: 'timeline', label: 'Implementation Timeline' },
    { id: 'faq', label: 'FAQ' },
  ];

  const faqs = [
    { question: 'When did the 2026 reforms take effect?', answer: 'The Nigeria Tax Act 2025 was signed into law in late 2025 and took effect from January 1, 2026.' },
    { question: 'Did the VAT rate increase?', answer: 'No. The VAT rate remains at 7.5%. The reforms clarified the registration threshold (₦25M turnover) and expanded exemptions.' },
    { question: 'Are employees affected by the reforms?', answer: 'Yes. The new PIT bands with ₦800,000 tax-free threshold reduce taxes for most employees earning below ₦5 million annually.' },
    { question: 'What happened to the Consolidated Relief Allowance?', answer: 'The CRA (₦200,000 + 20% of income) has been replaced by the simpler Rent Relief system (20% of rent, max ₦500,000).' },
    { question: 'How does the Development Levy affect my company?', answer: 'The Development Levy is 4% of assessable profits, replacing the 3% Tertiary Education Tax. It applies to large companies only — small companies qualifying for 0% CIT are exempt.' },
  ];

  return (
    <BlogPostLayout
      title="Nigeria Tax Reforms 2026"
      titleHighlight="Complete Summary"
      subtitle="Everything that changed under the Nigeria Tax Act 2025 — PIT, CIT, VAT, WHT, Rent Relief, and the Development Levy explained with Naira examples."
      seoTitle="Nigeria Tax Reforms 2026: Full Summary | TaxForge Blog"
      seoDescription="Complete guide to the 2026 Nigerian tax reforms. New PIT bands, CIT thresholds, Rent Relief, Development Levy, and what they mean for individuals and businesses."
      canonicalPath="/blog/tax-reforms-2026-summary"
      keywords="Nigeria tax reform 2026, Nigeria Tax Act 2025, PIT bands 2026, CIT changes, Rent Relief Nigeria, Development Levy"
      badge="Tax Reforms"
      datePublished="2026-02-08"
      dateModified="2026-02-09"
      toc={toc}
      faqs={faqs}
      relatedPosts={[
        { title: '0% CIT for Small Companies', slug: 'small-company-cit-exemption' },
        { title: 'PIT & PAYE Guide 2026', slug: 'pit-paye-guide-2026' },
        { title: 'Tax Guide for Tech Startups', slug: 'tax-guide-tech-startups' },
      ]}
      relatedTools={[
        { title: 'CIT Calculator', to: '/cit-calculator' },
        { title: 'PIT/PAYE Calculator', to: '/pit-paye-calculator' },
        { title: 'Small Company Exemption Checker', to: '/small-company-exemption' },
      ]}
      ctaHeadline="See How the Reforms Affect You"
      ctaSubtext="Enter your income and get your personalised 2026 vs old-rules comparison."
    >
      {/* Overview */}
      <section id="overview">
        <h2 className="text-2xl font-bold text-foreground mb-4">Overview of Changes</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Nigeria Tax Act 2025 represents the most significant overhaul of Nigeria's tax system in decades. Signed into law in late 2025 and effective from January 1, 2026, it consolidates the Personal Income Tax Act (PITA), Companies Income Tax Act (CITA), Value Added Tax Act (VATA), and Capital Gains Tax Act into a single unified framework.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The reform was driven by the need to simplify Nigeria's tax code, broaden the tax base, reduce the burden on low-income earners, and make the system more competitive for businesses. The result is a cleaner, more predictable tax structure that benefits both individuals and small companies.
        </p>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Key Changes at a Glance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground font-semibold">Area</th>
                  <th className="text-left py-2 text-foreground font-semibold">Old Rules</th>
                  <th className="text-left py-2 text-foreground font-semibold">2026 Rules</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">PIT tax-free</td><td>₦300,000 + 20% GI</td><td>₦800,000 flat</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Top PIT rate</td><td>24% (above ₦3.2M)</td><td>25% (above ₦50M)</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Small co. CIT</td><td>0% (≤ ₦25M)</td><td>0% (≤ ₦50M)</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Rent relief</td><td>CRA: ₦200k + 20%</td><td>20% of rent, max ₦500k</td></tr>
                <tr><td className="py-2">Education levy</td><td>TET 3%</td><td>Dev. Levy 4%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PIT Bands */}
      <section id="pit-bands">
        <h2 className="text-2xl font-bold text-foreground mb-4">New Personal Income Tax Bands</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The 2026 PIT structure introduces a generous ₦800,000 tax-free threshold, which means most minimum-wage earners and many lower-income workers pay zero income tax. Above this threshold, five progressive bands apply:
        </p>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground font-semibold">Taxable Income Band</th>
                  <th className="text-left py-2 text-foreground font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">First ₦800,000</td><td>0%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦800,001 – ₦3,000,000</td><td>15%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦3,000,001 – ₦12,000,000</td><td>18%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦12,000,001 – ₦25,000,000</td><td>21%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦25,000,001 – ₦50,000,000</td><td>23%</td></tr>
                <tr><td className="py-2">Above ₦50,000,000</td><td>25%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Worked Example:</strong> An employee earning ₦5,000,000 annually pays: ₦0 on the first ₦800,000 + ₦330,000 (15% × ₦2,200,000) + ₦360,000 (18% × ₦2,000,000) = <strong className="text-foreground">₦690,000 total tax</strong>. Under the old rules, this same employee would have paid approximately ₦860,000 — a saving of over ₦170,000.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Try our <Link to="/pit-paye-calculator" className="text-primary hover:underline">PIT/PAYE Calculator</Link> to see your exact breakdown.
        </p>
      </section>

      {/* CIT Changes */}
      <section id="cit-changes">
        <h2 className="text-2xl font-bold text-foreground mb-4">Company Income Tax Changes</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The standard CIT rate for large companies is 30%. The major change is the doubling of the Small Company Exemption threshold. Previously, companies with turnover up to ₦25 million paid 0% CIT. Under the 2026 rules, this threshold has been raised to ₦50 million, with an additional asset threshold of ₦250 million.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          This means thousands of additional Nigerian businesses — particularly tech startups, small retailers, and service providers — now pay zero company income tax. According to estimates, this could save qualifying businesses up to ₦12.5 million annually in CIT alone.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Read our detailed guide: <Link to="/blog/small-company-cit-exemption" className="text-primary hover:underline">0% CIT for Small Companies</Link>.
        </p>
      </section>

      {/* VAT */}
      <section id="vat-updates">
        <h2 className="text-2xl font-bold text-foreground mb-4">VAT Updates</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The VAT rate stays at 7.5%, but the 2026 rules provide important clarifications. The registration threshold is confirmed at ₦25 million annual turnover — businesses below this level are not required to register for or charge VAT. The exempt goods list has been expanded to include more basic food items and essential services.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          For foreign digital service providers, the Significant Economic Presence (SEP) rules now clearly require VAT registration and collection for services delivered to Nigerian consumers, regardless of physical presence. Use our <Link to="/vat-calculator" className="text-primary hover:underline">VAT Calculator</Link> for quick computations.
        </p>
      </section>

      {/* WHT */}
      <section id="wht-final-tax">
        <h2 className="text-2xl font-bold text-foreground mb-4">WHT as Final Tax</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          One of the more notable changes is the expansion of Withholding Tax as a final tax. For individuals receiving dividends, interest, or rent, the WHT deducted at source is now treated as the final tax liability in many cases — meaning no additional assessment is needed for those income streams.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          For companies, WHT on trading transactions remains a credit against CIT. Non-resident payments continue to be subject to WHT as final tax at rates between 5% and 10% depending on the payment type. See our <Link to="/wht-calculator" className="text-primary hover:underline">WHT Calculator</Link>.
        </p>
      </section>

      {/* Development Levy */}
      <section id="dev-levy">
        <h2 className="text-2xl font-bold text-foreground mb-4">Development Levy (Replacing TET)</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Tertiary Education Tax (TET) of 3% has been replaced by the Development Levy at 4% of assessable profits. This applies to large companies only — small companies qualifying for 0% CIT are also exempt from the Development Levy. The increase from 3% to 4% represents a marginal cost increase for large companies, but the broader reform benefits (particularly the Small Company Exemption) more than offset this for qualifying businesses.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          For a company with ₦100 million in assessable profits, the Development Levy would be ₦4 million — up from ₦3 million under the old TET.
        </p>
      </section>

      {/* Rent Relief */}
      <section id="rent-relief">
        <h2 className="text-2xl font-bold text-foreground mb-4">Rent Relief (Replacing CRA)</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The old Consolidated Relief Allowance (CRA) of ₦200,000 plus 20% of gross income has been replaced by the simpler Rent Relief. Under the new system, individuals can deduct 20% of their annual rent from taxable income, up to a maximum of ₦500,000.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Example:</strong> If you pay ₦1,500,000 in annual rent, your Rent Relief is 20% × ₦1,500,000 = ₦300,000. If you pay ₦3,000,000, your relief would be 20% × ₦3,000,000 = ₦600,000, but it's capped at ₦500,000.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Calculate yours: <Link to="/rent-relief-2026" className="text-primary hover:underline">Rent Relief Calculator</Link>.
        </p>
      </section>

      {/* Timeline */}
      <section id="timeline">
        <h2 className="text-2xl font-bold text-foreground mb-4">Implementation Timeline</h2>
        <div className="space-y-3">
          {[
            { date: 'Late 2025', event: 'Nigeria Tax Act 2025 signed into law by the President' },
            { date: 'January 1, 2026', event: 'All provisions take effect — new PIT bands, CIT thresholds, Rent Relief' },
            { date: 'Q1 2026', event: 'Employers begin withholding PAYE under new bands' },
            { date: 'June 2026', event: 'First CIT returns under new rules due (for Dec 2025 year-end companies)' },
            { date: 'Throughout 2026', event: 'NRS rolling out updated e-filing systems and guidance circulars' },
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
      </section>
    </BlogPostLayout>
  );
};

export default TaxReforms2026Summary;
