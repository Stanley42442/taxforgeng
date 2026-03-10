import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import { Link } from 'react-router-dom';

const VATGuideNigeria = () => {
  const toc = [
    { id: 'what-is-vat', label: 'What Is VAT?' },
    { id: 'registration', label: 'Who Must Register?' },
    { id: 'rate-and-calculation', label: 'Rate & Calculation' },
    { id: 'exempt-items', label: 'VAT-Exempt Items' },
    { id: 'input-vs-output', label: 'Input vs Output VAT' },
    { id: 'filing', label: 'Filing & Remittance' },
    { id: 'penalties', label: 'Penalties for Non-Compliance' },
    { id: 'digital-services', label: 'Digital Services VAT' },
    { id: 'faq', label: 'FAQ' },
  ];

  const faqs = [
    { question: 'What is the VAT rate in Nigeria in 2026?', answer: 'The VAT rate remains at 7.5% under the 2026 rules (Nigeria Tax Act 2025). There is no planned increase.' },
    { question: 'Who must register for VAT?', answer: 'Any business with annual turnover exceeding ₦25 million must register for VAT with NRS (formerly FIRS). Below this threshold, registration is optional but recommended for input VAT recovery.' },
    { question: 'What items are exempt from VAT?', answer: 'Basic food items (unprocessed agricultural produce, raw meat, fish), medical services, educational materials, baby products, and agricultural equipment are exempt. Exported goods are zero-rated.' },
    { question: 'How often must VAT returns be filed?', answer: 'VAT returns are filed monthly, due by the 21st of the following month. Late filing attracts ₦100,000 for the first month plus ₦50,000 per additional month (NTA 2025).' },
    { question: 'Can I recover input VAT?', answer: 'Yes. Registered businesses can offset input VAT (VAT paid on purchases) against output VAT (VAT collected on sales). If input exceeds output, you can carry the credit forward or apply for a refund.' },
  ];

  return (
    <BlogPostLayout
      title="VAT Guide for"
      titleHighlight="Nigerian Businesses"
      subtitle="Everything you need to know about Value Added Tax in Nigeria under the 2026 rules — registration, filing, exempt items, and penalties with worked examples."
      seoTitle="VAT Guide for Nigerian Businesses 2026 | TaxForge Blog"
      seoDescription="Complete VAT guide for Nigeria 2026. Registration threshold, filing deadlines, exempt items, input vs output VAT, penalties, and digital services VAT explained."
      canonicalPath="/blog/vat-guide-nigeria"
      keywords="VAT Nigeria 2026, VAT registration Nigeria, VAT filing, VAT exempt items Nigeria, input output VAT, digital services VAT"
      badge="VAT"
      datePublished="2026-02-09"
      dateModified="2026-02-09"
      toc={toc}
      faqs={faqs}
      relatedPosts={[
        { title: '2026 Tax Reforms Summary', slug: 'tax-reforms-2026-summary' },
        { title: 'WHT Explained', slug: 'wht-explained' },
        { title: 'Tax Guide for Tech Startups', slug: 'tax-guide-tech-startups' },
      ]}
      relatedTools={[
        { title: 'VAT Calculator', to: '/vat-calculator' },
        { title: 'CIT Calculator', to: '/cit-calculator' },
        { title: 'Free Tax Calculator', to: '/free-tax-calculator' },
      ]}
      ctaHeadline="Calculate Your VAT Now"
      ctaSubtext="Use our free VAT calculator for instant 7.5% computations."
      ctaPrimaryLink="/vat-calculator"
    >
      <section id="what-is-vat">
        <h2 className="text-2xl font-bold text-foreground mb-4">What Is VAT?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Value Added Tax (VAT) is an indirect, consumption-based tax charged at each stage of the supply chain. In Nigeria, VAT is administered by the Nigeria Revenue Service (NRS, formerly FIRS) under the Nigeria Tax Act 2025.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Unlike income tax, which is levied on profits, VAT is charged on the value added at each production and distribution stage. The end consumer ultimately bears the tax, but businesses act as collection agents — charging VAT on sales (output VAT) and recovering VAT on purchases (input VAT).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Understanding VAT is critical for every Nigerian business. Incorrect VAT handling can lead to significant penalties, and proper input VAT recovery can save your business substantial amounts.
        </p>
      </section>

      <section id="registration">
        <h2 className="text-2xl font-bold text-foreground mb-4">Who Must Register?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Under the 2026 rules, VAT registration is mandatory for any business or individual with an annual turnover exceeding <strong className="text-foreground">₦25 million</strong>. This threshold was clarified by the Nigeria Tax Act 2025 to reduce the compliance burden on micro-enterprises.
        </p>
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Registration Requirements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-foreground font-semibold">Turnover</th><th className="text-left py-2 text-foreground font-semibold">Obligation</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">Below ₦25M</td><td>Registration optional — may register voluntarily to recover input VAT</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">₦25M – ₦50M</td><td>Mandatory registration — file monthly returns</td></tr>
                <tr><td className="py-2">Above ₦50M</td><td>Mandatory registration — monthly filing, may need automated systems</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          To register, apply at your local NRS office or through the TaxPro Max online portal. You'll need your Tax Identification Number (TIN), CAC registration documents, and a completed VAT registration form.
        </p>
      </section>

      <section id="rate-and-calculation">
        <h2 className="text-2xl font-bold text-foreground mb-4">Rate & Calculation</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The standard VAT rate in Nigeria is <strong className="text-foreground">7.5%</strong>, unchanged under the 2026 rules. VAT is calculated on the invoice value of taxable goods and services.
        </p>
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Worked Example</h3>
          <p className="text-sm text-muted-foreground mb-2">A consulting firm invoices ₦1,000,000 for services:</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Service fee: ₦1,000,000</p>
            <p>VAT (7.5%): ₦75,000</p>
            <p className="font-semibold text-foreground">Total invoice: ₦1,075,000</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">The firm collects ₦75,000 as output VAT and remits it to NRS (minus any input VAT credits).</p>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Use our <Link to="/vat-calculator" className="text-primary hover:underline">VAT Calculator</Link> for instant computations.
        </p>
      </section>

      <section id="exempt-items">
        <h2 className="text-2xl font-bold text-foreground mb-4">VAT-Exempt Items</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The 2026 rules expanded the list of VAT-exempt items to reduce the tax burden on essential goods and services:
        </p>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
           <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-3">Exempt Goods</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {['Basic food (unprocessed)', 'Baby products', 'Agricultural equipment', 'Medical supplies & pharmaceuticals', 'Educational materials', 'Fertilisers & seeds'].map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-3">Exempt Services</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {['Medical services', 'Educational services', 'Community banking services', 'Plays and cultural performances', 'Agricultural services', 'Exported services (zero-rated)'].map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="input-vs-output">
        <h2 className="text-2xl font-bold text-foreground mb-4">Input vs Output VAT</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Output VAT</strong> is the VAT you charge on your sales. <strong className="text-foreground">Input VAT</strong> is the VAT you pay on your business purchases. The difference is what you remit to NRS.
        </p>
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Monthly VAT Calculation</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Output VAT collected in January: ₦500,000</p>
            <p>Input VAT paid in January: ₦200,000</p>
            <p className="font-semibold text-foreground">Net VAT payable: ₦300,000</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">If input VAT exceeds output VAT, the excess is carried forward as a credit to the next month.</p>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Important:</strong> Input VAT can only be claimed on purchases directly related to your business operations and supported by valid tax invoices. Personal expenses and entertainment costs generally don't qualify.
        </p>
      </section>

      <section id="filing">
        <h2 className="text-2xl font-bold text-foreground mb-4">Filing & Remittance</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          VAT returns must be filed <strong className="text-foreground">monthly</strong>, due by the <strong className="text-foreground">21st of the following month</strong>. Filing is done through the NRS TaxPro Max portal or at your local NRS office.
        </p>
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Filing Checklist</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'Compile all sales invoices showing VAT charged (output VAT)',
              'Compile all purchase invoices showing VAT paid (input VAT)',
              'Calculate net VAT payable (output minus input)',
              'Complete VAT return form on TaxPro Max',
              'Make payment via bank or online transfer',
              'Retain all invoices for minimum 6 years',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2"><span className="font-semibold text-foreground shrink-0">{i + 1}.</span> {step}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="penalties">
        <h2 className="text-2xl font-bold text-foreground mb-4">Penalties for Non-Compliance</h2>
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-foreground font-semibold">Offence</th><th className="text-left py-2 text-foreground font-semibold">Penalty</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">Late filing (first month)</td><td>₦100,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Late filing (each subsequent month)</td><td>₦50,000</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Late payment</td><td>10% per annum interest</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Failure to register</td><td>₦100,000 first month + ₦50,000/month</td></tr>
                <tr><td className="py-2">Failure to issue tax invoice</td><td>50% of invoice value</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="digital-services">
        <h2 className="text-2xl font-bold text-foreground mb-4">Digital Services VAT</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Under the 2026 Significant Economic Presence (SEP) rules, foreign companies providing digital services to Nigerian consumers must register for VAT and charge 7.5% on their Nigerian revenue. This applies to streaming services, SaaS platforms, digital advertising, and e-commerce marketplaces.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Nigerian businesses purchasing digital services from foreign providers should be aware that the provider may pass on the VAT. If the foreign provider is not registered, the Nigerian business may be required to self-account for the VAT using the reverse charge mechanism.
        </p>
      </section>
    </BlogPostLayout>
  );
};

export default VATGuideNigeria;
