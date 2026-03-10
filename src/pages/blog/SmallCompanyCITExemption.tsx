import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import { Link } from 'react-router-dom';

const SmallCompanyCITExemption = () => {
  const toc = [
    { id: 'what-is-it', label: 'What Is the Small Company Exemption?' },
    { id: 'qualification', label: 'Qualification Criteria' },
    { id: 'old-vs-new', label: 'Old vs New Thresholds' },
    { id: 'how-to-claim', label: 'How to Claim the Exemption' },
    { id: 'worked-examples', label: 'Worked Examples' },
    { id: 'common-mistakes', label: 'Common Mistakes' },
    { id: 'dev-levy', label: 'Development Levy: Who Pays?' },
    { id: 'faq', label: 'FAQ' },
  ];

  const faqs = [
    { question: 'What is the turnover threshold for 0% CIT in 2026?', answer: 'The threshold is ₦50 million annual turnover, doubled from the previous ₦25 million. Additionally, your total assets must be ₦250 million or less.' },
    { question: 'Do I still pay the Development Levy if I qualify for 0% CIT?', answer: 'No. Small companies qualifying for 0% CIT are also exempt from the Development Levy (4% of assessable profits). The exemption covers CIT, CGT, and the Development Levy.' },
    { question: 'Can a tech startup qualify for the Small Company Exemption?', answer: 'Yes, provided it is not a professional services firm (law, accounting, medical, engineering). Many early-stage tech startups in Nigeria have turnover below ₦50 million and qualify. The exemption is sector-agnostic for non-professional-service businesses.' },
    { question: 'What happens when my turnover exceeds ₦50 million?', answer: 'You lose the Small Company Exemption for that year and become liable for CIT at the standard 30% rate for large companies. Plan ahead as you approach the threshold.' },
    { question: 'Is this the same as Pioneer Status tax holiday?', answer: 'No. Pioneer Status (replaced by EDI under 2026 rules) was a separate incentive. The Economic Development Incentive (EDI) now provides a 5% annual tax credit for 5 years on qualifying capex. The Small Company Exemption is automatic based on turnover and available to all sectors.' },
  ];

  return (
    <BlogPostLayout
      title="0% CIT for Small Companies"
      titleHighlight="Complete Guide"
      subtitle="How to qualify for the Small Company Exemption under the 2026 rules. The turnover threshold doubled to ₦50 million — here's everything you need to know."
      seoTitle="0% CIT for Small Companies in Nigeria 2026 | TaxForge Blog"
      seoDescription="Complete guide to the 0% Company Income Tax exemption for small companies in Nigeria. Qualification criteria, worked examples, and how to claim under the 2026 rules."
      canonicalPath="/blog/small-company-cit-exemption"
      keywords="small company exemption Nigeria, 0% CIT Nigeria, company income tax 2026, small business tax Nigeria, ₦50 million threshold"
      badge="Guides"
      datePublished="2026-02-05"
      dateModified="2026-02-09"
      toc={toc}
      faqs={faqs}
      relatedPosts={[
        { title: 'Tax Reforms 2026: Full Summary', slug: 'tax-reforms-2026-summary' },
        { title: 'Tax Guide for Tech Startups', slug: 'tax-guide-tech-startups' },
        { title: 'PIT & PAYE Guide 2026', slug: 'pit-paye-guide-2026' },
      ]}
      relatedTools={[
        { title: 'CIT Calculator', to: '/cit-calculator' },
        { title: 'Small Company Exemption Checker', to: '/small-company-exemption' },
      ]}
      ctaHeadline="Check Your Eligibility"
      ctaSubtext="Use our Small Company Exemption checker to instantly see if you qualify for 0% CIT."
      ctaPrimaryLink="/small-company-exemption"
    >
      <section id="what-is-it">
        <h2 className="text-2xl font-bold text-foreground mb-4">What Is the Small Company Exemption?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Small Company Exemption is a provision in Nigerian tax law that allows qualifying small businesses to pay 0% Company Income Tax (CIT). This means your company keeps 100% of its assessable profits — no CIT is payable. Under the 2026 rules, the qualification criteria have been significantly expanded, meaning many more businesses now qualify.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          This exemption is one of the most powerful tax benefits available to Nigerian businesses and is particularly valuable for startups, sole-proprietor companies, and growing SMEs.
        </p>
      </section>

      <section id="qualification">
        <h2 className="text-2xl font-bold text-foreground mb-4">Qualification Criteria</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          To qualify for the Small Company Exemption under the 2026 rules, your company must meet <strong className="text-foreground">both</strong> of the following criteria:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-success">
            <h3 className="font-semibold text-foreground mb-2">Turnover Test</h3>
            <p className="text-sm text-muted-foreground">Annual gross turnover must be <strong className="text-foreground">₦50 million or less</strong></p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-success">
            <h3 className="font-semibold text-foreground mb-2">Asset Test</h3>
            <p className="text-sm text-muted-foreground">Total assets must be <strong className="text-foreground">₦250 million or less</strong></p>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Both criteria must be met simultaneously. A company with ₦40 million turnover but ₦300 million in assets would <strong className="text-foreground">not</strong> qualify.
        </p>
      </section>

      <section id="old-vs-new">
        <h2 className="text-2xl font-bold text-foreground mb-4">Old vs New Thresholds</h2>
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground font-semibold">Criteria</th>
                  <th className="text-left py-2 text-foreground font-semibold">Pre-2026</th>
                  <th className="text-left py-2 text-foreground font-semibold">2026 Rules</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">Turnover threshold</td><td>≤ ₦25 million</td><td className="text-success font-semibold">≤ ₦50 million</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Asset threshold</td><td>Not specified</td><td>≤ ₦250 million</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">CIT rate</td><td>0%</td><td>0%</td></tr>
                <tr><td className="py-2">Education levy</td><td>TET 3%</td><td>Dev. Levy 4%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          The doubling of the turnover threshold from ₦25 million to ₦50 million is a game-changer for Nigeria's SME sector, bringing thousands of additional businesses into the 0% CIT bracket.
        </p>
      </section>

      <section id="how-to-claim">
        <h2 className="text-2xl font-bold text-foreground mb-4">How to Claim the Exemption</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Verify Eligibility', desc: 'Confirm your annual turnover is ≤ ₦50M and total assets are ≤ ₦250M. Use our Small Company Exemption Checker for instant verification.' },
            { step: '2', title: 'File Your CIT Return', desc: 'You must still file an annual CIT return with NRS even though your liability is ₦0. Non-filing attracts penalties.' },
            { step: '3', title: 'Declare Small Company Status', desc: 'Indicate your small company status on the CIT return form. Provide audited financial statements as evidence.' },
            { step: '4', title: 'Confirm Exemptions Apply', desc: 'As a qualifying small company, you are exempt from CIT, CGT, and the 4% Development Levy. Ensure your records clearly demonstrate eligibility.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">{item.step}</div>
              <div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="worked-examples">
        <h2 className="text-2xl font-bold text-foreground mb-4">Worked Examples</h2>

        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-2">Example 1: Small Retail Business</h3>
          <p className="text-sm text-muted-foreground mb-2">A Lagos-based retail business with:</p>
          <ul className="text-sm text-muted-foreground space-y-1 mb-2">
            <li>• Annual turnover: ₦35,000,000</li>
            <li>• Assessable profits: ₦8,000,000</li>
            <li>• Total assets: ₦45,000,000</li>
          </ul>
          <p className="text-sm text-muted-foreground"><strong className="text-foreground">Result:</strong> Qualifies for 0% CIT. CIT payable = ₦0. Development Levy = ₦0 (small companies are exempt).</p>
          <p className="text-sm text-muted-foreground mt-1">Under old rules: would have paid 20% CIT (₦1,600,000) + 3% TET (₦240,000) = ₦1,840,000. <strong className="text-success">Saving: ₦1,840,000</strong>.</p>
        </div>

        <div className="glass-frosted rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-2">Example 2: Tech Startup</h3>
          <p className="text-sm text-muted-foreground mb-2">A fintech startup with:</p>
          <ul className="text-sm text-muted-foreground space-y-1 mb-2">
            <li>• Annual turnover: ₦48,000,000</li>
            <li>• Assessable profits: ₦12,000,000</li>
            <li>• Total assets: ₦180,000,000 (including software IP)</li>
          </ul>
          <p className="text-sm text-muted-foreground"><strong className="text-foreground">Result:</strong> Qualifies (turnover ≤ ₦50M, assets ≤ ₦250M). CIT = ₦0. Dev. Levy = ₦0 (exempt).</p>
          <p className="text-sm text-muted-foreground mt-1">Under old rules (turnover {'>'} ₦25M): would have paid 20% CIT (₦2,400,000) + TET (₦360,000) = ₦2,760,000. <strong className="text-success">Saving: ₦2,760,000</strong>.</p>
        </div>
      </section>

      <section id="common-mistakes">
        <h2 className="text-2xl font-bold text-foreground mb-4">Common Mistakes</h2>
        <div className="space-y-3">
          {[
            { mistake: 'Confusing turnover with profit', fix: 'The ₦50M threshold applies to gross turnover (revenue), not profit. A company with ₦48M turnover and ₦2M profit still qualifies.' },
            { mistake: 'Forgetting to file CIT returns', fix: 'Even with 0% CIT, you must file annual returns. NRS penalties apply for non-filing regardless of your tax liability.' },
            { mistake: 'Assuming the Development Levy applies to small companies', fix: 'Small companies qualifying for 0% CIT are also exempt from the 4% Development Levy. The levy only applies to large companies.' },
            { mistake: 'Not tracking the asset threshold', fix: 'The ₦250M asset limit is new. If your business holds significant property, equipment, or IP, verify you\'re below this threshold.' },
          ].map((item, i) => (
            <div key={i} className="glass-frosted rounded-xl p-5 border-l-4 border-warning/60">
              <h3 className="font-semibold text-foreground text-sm mb-1">❌ {item.mistake}</h3>
              <p className="text-sm text-muted-foreground">✅ {item.fix}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="dev-levy">
        <h2 className="text-2xl font-bold text-foreground mb-4">Development Levy: Who Pays?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Development Levy (4% of assessable profits) replaced the Tertiary Education Tax (TET) under the 2026 rules. However, small companies qualifying for the 0% CIT exemption are <strong className="text-foreground">also exempt</strong> from the Development Levy. This means qualifying small companies pay 0% CIT, 0% CGT, and 0% Development Levy.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Development Levy applies only to <strong className="text-foreground">large companies</strong> (turnover above ₦50M or assets above ₦250M). For a large company with ₦100 million in assessable profits, the Development Levy would be ₦4 million — in addition to the 30% CIT.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Important:</strong> Professional service providers (law firms, accounting firms, medical practices, engineering consultancies) are excluded from the small company definition regardless of their turnover or asset size, and are therefore subject to the Development Levy.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Use our <Link to="/cit-calculator" className="text-primary hover:underline">CIT Calculator</Link> to compute both CIT and the Development Levy simultaneously.
        </p>
      </section>
    </BlogPostLayout>
  );
};

export default SmallCompanyCITExemption;
