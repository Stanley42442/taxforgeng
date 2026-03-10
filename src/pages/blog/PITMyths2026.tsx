import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import { Link } from 'react-router-dom';

const PITMyths2026 = () => {
  const toc = [
    { id: 'why-myths-matter', label: 'Why PIT Myths Are Dangerous' },
    { id: 'myth-1', label: 'Myth 1: ₦800k Means No Tax' },
    { id: 'myth-2', label: 'Myth 2: CRA Still Applies' },
    { id: 'myth-3', label: 'Myth 3: Rent Relief Is Automatic' },
    { id: 'myth-4', label: 'Myth 4: Freelancers Don\'t Pay PIT' },
    { id: 'myth-5', label: 'Myth 5: My Employer Handles Everything' },
    { id: 'myth-6', label: 'Myth 6: Minimum Wage = Fully Exempt' },
    { id: 'myth-7', label: 'Myth 7: Old Tax Bands Still Work' },
    { id: 'rent-relief-facts', label: 'Rent Relief: The Real Facts' },
    { id: 'faq', label: 'FAQ' },
  ];

  const faqs = [
    {
      question: 'Does the ₦800,000 threshold mean I pay zero tax if I earn below ₦800k?',
      answer: 'If your taxable income (after deductions like pension) is ₦800,000 or below, you pay 0% on that amount. However, pension and NHF contributions still apply. The threshold is a tax-free band, not a blanket exemption from all obligations.',
    },
    {
      question: 'Is the CRA (Consolidated Relief Allowance) still available in 2026?',
      answer: 'No. The Nigeria Tax Act 2025 abolished the CRA entirely. It has been replaced by six specific deductions: Pension, NHF, NHIS, Rent Relief (capped at ₦500,000), Life Insurance premiums, and Mortgage Interest on owner-occupied homes.',
    },
    {
      question: 'How do I claim Rent Relief under the 2026 rules?',
      answer: 'You must actually pay rent on your primary residence and provide documentation (tenancy agreement, receipts, or bank transfer evidence). The maximum deduction is ₦500,000 per year. Homeowners who don\'t pay rent cannot claim this relief.',
    },
    {
      question: 'Do freelancers and self-employed individuals pay PIT in Nigeria?',
      answer: 'Yes. All income — whether from employment, freelancing, consulting, or side businesses — must be aggregated and reported. Freelancers must file self-assessment returns and may need to make quarterly instalment payments.',
    },
    {
      question: 'What are the 2026 PIT tax bands?',
      answer: 'The 2026 bands are: 0% on the first ₦800,000; 15% on ₦800,001–₦2,800,000; 18% on ₦2,800,001–₦4,200,000; 21% on ₦4,200,001–₦9,800,000; 23% on ₦9,800,001–₦17,800,000; and 25% on income above ₦17,800,000.',
    },
    {
      question: 'Are minimum wage earners completely exempt from PIT?',
      answer: 'Minimum wage earners (₦70,000/month or ₦840,000/year) are exempt from income tax under the NTA 2025. However, mandatory contributions like pension (8%) and NHF (2.5%) still apply, reducing take-home pay slightly.',
    },
  ];

  const relatedPosts = [
    { title: 'Nigeria Tax Reforms 2026: Complete Summary', slug: 'tax-reforms-2026-summary' },
    { title: 'PIT & PAYE Calculator Guide 2026', slug: 'pit-paye-guide-2026' },
    { title: '0% CIT for Small Companies: Complete Guide', slug: 'small-company-cit-exemption' },
  ];

  const relatedTools = [
    { title: 'PIT/PAYE Calculator', to: '/pit-paye-calculator' },
    { title: 'Rent Relief Calculator', to: '/rent-relief-2026' },
    { title: 'Salary After Tax Calculator', to: '/salary-after-tax-nigeria' },
  ];

  return (
    <BlogPostLayout
      title="7 PIT Myths Nigerians Still Believe"
      titleHighlight="in 2026"
      subtitle="The Nigeria Tax Act 2025 rewrote the PIT rules — but dangerous misconceptions persist. Here are seven myths that could cost you money or trigger penalties."
      seoTitle="7 PIT Myths Nigerians Still Believe in 2026 | TaxForge NG"
      seoDescription="Debunking 7 common misconceptions about Personal Income Tax under the 2026 Nigeria Tax Act — from the ₦800k threshold to Rent Relief and the new tax bands."
      canonicalPath="/blog/pit-myths-2026"
      keywords="PIT myths Nigeria, personal income tax 2026, Nigeria tax misconceptions, CRA abolished, Rent Relief Nigeria, ₦800k threshold, PIT bands 2026"
      badge="Guides"
      datePublished="2026-03-05"
      dateModified="2026-03-05"
      toc={toc}
      faqs={faqs}
      relatedPosts={relatedPosts}
      relatedTools={relatedTools}
      ctaHeadline="Check Your Real PIT — Free"
      ctaSubtext="Run the numbers with the 2026-compliant calculator and see exactly what you owe."
      ctaPrimaryLink="/pit-paye-calculator"
    >
      {/* Why Myths Matter */}
      <section id="why-myths-matter">
        <h2 className="text-2xl font-bold text-foreground mb-4">Why PIT Myths Are Dangerous</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Nigeria Tax Act (NTA) 2025, effective January 2026, introduced the most significant overhaul
          of personal income tax in over a decade. New bands, abolished allowances, and restructured
          deductions mean that much of what Nigerians "know" about PIT is now wrong.
        </p>
        <p className="text-muted-foreground leading-relaxed mt-3">
          Acting on outdated assumptions can lead to <strong className="text-foreground">over-payment</strong> (leaving
          money on the table), <strong className="text-foreground">under-payment</strong> (triggering penalties and
          interest from the Nigeria Revenue Service), or missed deductions like the new Rent Relief.
          Let's set the record straight.
        </p>
      </section>

      {/* Myth 1 */}
      <section id="myth-1">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Myth 1: "The ₦800k Threshold Means I Pay No Tax"
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 mb-4">
          <p className="text-sm font-semibold text-destructive mb-1">❌ The Myth</p>
          <p className="text-muted-foreground text-sm">"If I earn under ₦800,000 I'm completely tax-free."</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-primary mb-1">✅ The Fact</p>
          <p className="text-muted-foreground text-sm">
            The ₦800,000 figure is a <strong className="text-foreground">0% tax band</strong>, not an exemption
            from all obligations. It means the first ₦800,000 of your <em>taxable income</em> (after
            pension and other deductions) is taxed at 0%. Income above that threshold is taxed at 15%
            and higher.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Even if your gross salary is below ₦800k, mandatory deductions like <strong className="text-foreground">pension
            (8%)</strong> and <strong className="text-foreground">NHF (2.5%)</strong> still apply. You're not
            "tax-free" — you're in the 0% PIT band with other obligations intact.
          </p>
        </div>
      </section>

      {/* Myth 2 */}
      <section id="myth-2">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Myth 2: "The CRA Still Applies in 2026"
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 mb-4">
          <p className="text-sm font-semibold text-destructive mb-1">❌ The Myth</p>
          <p className="text-muted-foreground text-sm">"I can still claim my 20% + ₦200,000 Consolidated Relief Allowance."</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-primary mb-1">✅ The Fact</p>
          <p className="text-muted-foreground text-sm">
            The CRA has been <strong className="text-foreground">completely abolished</strong> under the NTA 2025.
            In its place, six specific deductions are available:
          </p>
          <ol className="list-decimal list-inside text-muted-foreground text-sm mt-2 space-y-1">
            <li>Pension contributions (mandatory 8% employee share)</li>
            <li>National Housing Fund (NHF) — 2.5% of basic salary</li>
            <li>National Health Insurance Scheme (NHIS)</li>
            <li><strong className="text-foreground">Rent Relief</strong> — up to ₦500,000/year (new!)</li>
            <li>Life Insurance premiums</li>
            <li>Mortgage Interest on owner-occupied residential property</li>
          </ol>
          <p className="text-muted-foreground text-sm mt-2">
            If your payroll software or accountant is still applying CRA, your tax is being calculated
            incorrectly. Use the <Link to="/pit-paye-calculator" className="text-primary hover:underline">PIT/PAYE Calculator</Link> to
            verify your deductions.
          </p>
        </div>
      </section>

      {/* Myth 3 */}
      <section id="myth-3">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Myth 3: "Everyone Gets Rent Relief Automatically"
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 mb-4">
          <p className="text-sm font-semibold text-destructive mb-1">❌ The Myth</p>
          <p className="text-muted-foreground text-sm">"Rent Relief replaces CRA, so everyone gets it by default."</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-primary mb-1">✅ The Fact</p>
          <p className="text-muted-foreground text-sm">
            Rent Relief is <strong className="text-foreground">not automatic</strong>. To claim it, you must:
          </p>
          <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
            <li>Actually pay rent on your <strong className="text-foreground">primary residence</strong></li>
            <li>Provide documentation — tenancy agreement, rent receipts, or bank transfer proof</li>
            <li>Declare it during filing or through your employer's payroll</li>
          </ul>
          <p className="text-muted-foreground text-sm mt-2">
            The cap is <strong className="text-foreground">₦500,000 per year</strong>. Homeowners who own outright
            (no rent payments) cannot claim this relief. See exactly how much you could save with
            the <Link to="/rent-relief-2026" className="text-primary hover:underline">Rent Relief Calculator</Link>.
          </p>
        </div>
      </section>

      {/* Myth 4 */}
      <section id="myth-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Myth 4: "Freelancers Don't Pay PIT"
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 mb-4">
          <p className="text-sm font-semibold text-destructive mb-1">❌ The Myth</p>
          <p className="text-muted-foreground text-sm">"PIT is only for salaried employees — freelancers and contractors are excluded."</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-primary mb-1">✅ The Fact</p>
          <p className="text-muted-foreground text-sm">
            Under the NTA 2025, <strong className="text-foreground">all income sources</strong> must be aggregated
            for PIT purposes — employment income, freelance earnings, consulting fees, rental income,
            and investment returns. The tax bands apply to your <em>total</em> taxable income.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Freelancers must file <strong className="text-foreground">self-assessment returns</strong> and may
            need to make quarterly instalment payments to the Nigeria Revenue Service. Failure to file
            attracts penalties of ₦50,000 for individuals, plus interest on unpaid tax.
          </p>
        </div>
      </section>

      {/* Myth 5 */}
      <section id="myth-5">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Myth 5: "My Employer Handles Everything — I Don't Need to File"
        </h2>
        <div className="glass-frosted rounded-xl p-6 mb-4">
          <p className="text-sm font-semibold text-destructive mb-1">❌ The Myth</p>
          <p className="text-muted-foreground text-sm">"PAYE is deducted at source, so I have no filing obligation."</p>
        </div>
        <div className="glass-frosted rounded-xl p-6">
          <p className="text-sm font-semibold text-primary mb-1">✅ The Fact</p>
          <p className="text-muted-foreground text-sm">
            While employers remit PAYE monthly, you may still need to file a personal return if you:
          </p>
          <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
            <li>Earn income from <strong className="text-foreground">multiple sources</strong> (side business, freelancing, investments)</li>
            <li>Want to claim deductions your employer didn't apply (e.g., Rent Relief, Life Insurance)</li>
            <li>Changed jobs during the year and need to reconcile PAYE across employers</li>
            <li>Earned above the self-assessment threshold</li>
          </ul>
          <p className="text-muted-foreground text-sm mt-2">
            Filing a return also protects you — it creates a formal record and ensures you receive
            credit for all deductions you're entitled to.
          </p>
        </div>
      </section>

      {/* Myth 6 */}
      <section id="myth-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Myth 6: "Minimum Wage Earners Are Fully Exempt"
        </h2>
        <div className="glass-frosted rounded-xl p-6 mb-4">
          <p className="text-sm font-semibold text-destructive mb-1">❌ The Myth</p>
          <p className="text-muted-foreground text-sm">"Earning ₦70,000/month means I pay absolutely nothing."</p>
        </div>
        <div className="glass-frosted rounded-xl p-6">
          <p className="text-sm font-semibold text-primary mb-1">✅ The Fact</p>
          <p className="text-muted-foreground text-sm">
            The NTA 2025 exempts minimum wage earners (₦70,000/month, ₦840,000/year) from
            <strong className="text-foreground"> income tax</strong> specifically. However, mandatory
            contributions still apply:
          </p>
          <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
            <li><strong className="text-foreground">Pension:</strong> 8% employee contribution = ₦67,200/year</li>
            <li><strong className="text-foreground">NHF:</strong> 2.5% of basic salary</li>
          </ul>
          <p className="text-muted-foreground text-sm mt-2">
            So while PIT itself is ₦0, your take-home pay is still reduced by these statutory
            deductions. The distinction matters for payroll processing and employee communication.
          </p>
        </div>
      </section>

      {/* Myth 7 */}
      <section id="myth-7">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Myth 7: "The Old 6-Band Rates (7%–24%) Still Work"
        </h2>
        <div className="glass-frosted rounded-xl p-6 mb-4">
          <p className="text-sm font-semibold text-destructive mb-1">❌ The Myth</p>
          <p className="text-muted-foreground text-sm">"The tax bands haven't really changed — it's still 7%, 11%, 15%, 19%, 21%, 24%."</p>
        </div>
        <div className="glass-frosted rounded-xl p-6">
          <p className="text-sm font-semibold text-primary mb-1">✅ The Fact</p>
          <p className="text-muted-foreground text-sm">
            The 2026 PIT bands are completely restructured:
          </p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground font-semibold">Taxable Income Band</th>
                  <th className="text-right py-2 text-foreground font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">First ₦800,000</td><td className="text-right">0%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦800,001 – ₦2,800,000</td><td className="text-right">15%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦2,800,001 – ₦4,200,000</td><td className="text-right">18%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦4,200,001 – ₦9,800,000</td><td className="text-right">21%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦9,800,001 – ₦17,800,000</td><td className="text-right">23%</td></tr>
                <tr><td className="py-2">Above ₦17,800,000</td><td className="text-right">25%</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground text-sm mt-3">
            Using the old bands will produce incorrect tax figures. Always verify
            with the <Link to="/pit-paye-calculator" className="text-primary hover:underline">2026 PIT Calculator</Link>.
          </p>
        </div>
      </section>

      {/* Rent Relief Facts */}
      <section id="rent-relief-facts">
        <h2 className="text-2xl font-bold text-foreground mb-4">Rent Relief: The Real Facts</h2>
        <p className="text-muted-foreground leading-relaxed">
          Rent Relief is one of the most valuable new deductions under the NTA 2025, but it's also the
          most misunderstood. Here's what you need to know:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div className="glass-frosted rounded-xl p-5">
            <h3 className="font-semibold text-foreground text-sm mb-2">What It Is</h3>
            <p className="text-muted-foreground text-sm">
              A tax deduction of up to <strong className="text-foreground">₦500,000/year</strong> on rent
              paid for your primary residence. It reduces your taxable income, not your tax directly.
            </p>
          </div>
          <div className="glass-frosted rounded-xl p-5">
            <h3 className="font-semibold text-foreground text-sm mb-2">Who Qualifies</h3>
            <p className="text-muted-foreground text-sm">
              Any individual who pays rent on their primary home. You must provide evidence of actual
              rent payments — a tenancy agreement alone is not sufficient without proof of payment.
            </p>
          </div>
          <div className="glass-frosted rounded-xl p-5">
            <h3 className="font-semibold text-foreground text-sm mb-2">How to Claim</h3>
            <p className="text-muted-foreground text-sm">
              Declare during self-assessment filing, or submit documentation to your employer for PAYE
              adjustment. Keep rent receipts, bank transfer records, and your tenancy agreement.
            </p>
          </div>
          <div className="glass-frosted rounded-xl p-5">
            <h3 className="font-semibold text-foreground text-sm mb-2">Tax Savings Example</h3>
            <p className="text-muted-foreground text-sm">
              If you pay ₦1.2M/year in rent, you can deduct ₦500,000. At a marginal rate of 21%, that's
              up to <strong className="text-foreground">₦105,000 saved</strong> annually. Check your exact
              savings with our <Link to="/rent-relief-2026" className="text-primary hover:underline">Rent Relief Calculator</Link>.
            </p>
          </div>
        </div>
      </section>
    </BlogPostLayout>
  );
};

export default PITMyths2026;
