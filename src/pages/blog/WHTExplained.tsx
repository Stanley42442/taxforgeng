import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import { Link } from 'react-router-dom';

const WHTExplained = () => {
  const toc = [
    { id: 'what-is-wht', label: 'What Is WHT?' },
    { id: 'rates', label: 'WHT Rates by Payment Type' },
    { id: 'how-it-works', label: 'How WHT Works' },
    { id: 'credit-vs-final', label: 'Credit vs Final Tax' },
    { id: 'credit-notes', label: 'WHT Credit Notes' },
    { id: 'remittance', label: 'Remittance & Filing' },
    { id: 'non-resident', label: 'Non-Resident WHT' },
    { id: 'common-mistakes', label: 'Common Mistakes' },
    { id: 'faq', label: 'FAQ' },
  ];

  const faqs = [
    { question: 'What is the WHT rate for professional services?', answer: 'For companies paying other companies: 5%. For companies paying individuals: 5%. For individuals paying individuals: 5%. However, consultancy and management fees attract 10% for company-to-company payments.' },
    { question: 'Is WHT a final tax or a credit?', answer: 'It depends. For individuals receiving dividends, interest, or rent, WHT is now treated as final tax under the 2026 rules. For companies, WHT on trading transactions is a credit against CIT. Non-resident WHT is always final.' },
    { question: 'How do I get a WHT credit note?', answer: 'The payer should provide a WHT credit note within 30 days of deduction. If not received, follow up in writing. The credit note is essential for offsetting WHT against your CIT liability.' },
    { question: 'What happens if I don\'t deduct WHT?', answer: 'Failure to deduct WHT makes the payer liable for the tax plus 10% per annum interest. NRS can also impose penalties. It\'s always safer to deduct and remit.' },
    { question: 'Does WHT apply to all payments?', answer: 'No. WHT applies to specific payment types including rent, dividends, interest, royalties, contracts, consultancy fees, professional services, and commissions. Salary payments are subject to PAYE, not WHT.' },
  ];

  return (
    <BlogPostLayout
      title="Withholding Tax"
      titleHighlight="Explained"
      subtitle="A complete guide to Nigerian Withholding Tax under the 2026 rules — rates by payment type, credit notes, final tax treatment, and remittance deadlines."
      seoTitle="Withholding Tax (WHT) Explained - Nigeria 2026 Guide | TaxForge"
      seoDescription="Complete WHT guide for Nigeria 2026. Rates by payment type, credit vs final tax, credit notes, non-resident WHT, and common mistakes explained."
      canonicalPath="/blog/wht-explained"
      keywords="withholding tax Nigeria, WHT rates 2026, WHT credit note, WHT final tax, Nigeria withholding tax guide"
      badge="WHT"
      datePublished="2026-02-09"
      dateModified="2026-02-09"
      toc={toc}
      faqs={faqs}
      relatedPosts={[
        { title: '2026 Tax Reforms Summary', slug: 'tax-reforms-2026-summary' },
        { title: 'VAT Guide for Businesses', slug: 'vat-guide-nigeria' },
        { title: 'Payroll Tax Guide', slug: 'payroll-tax-guide' },
      ]}
      relatedTools={[
        { title: 'WHT Calculator', to: '/wht-calculator' },
        { title: 'CIT Calculator', to: '/cit-calculator' },
        { title: 'Free Tax Calculator', to: '/free-tax-calculator' },
      ]}
      ctaHeadline="Check WHT Rates Instantly"
      ctaSubtext="Use our WHT reference tool for quick rate lookups."
      ctaPrimaryLink="/wht-calculator"
    >
      <section id="what-is-wht">
        <h2 className="text-2xl font-bold text-foreground mb-4">What Is Withholding Tax?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Withholding Tax (WHT) is a method of collecting income tax at source. When you make certain payments — such as rent, dividends, professional fees, or contract payments — you are required to deduct a percentage and remit it directly to NRS on behalf of the recipient.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          WHT serves two purposes: it ensures the government receives tax revenue promptly, and it reduces the risk of non-compliance by the income recipient. For the recipient, WHT either represents a credit against their final tax liability or constitutes the final tax on that income.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The Nigeria Tax Act 2025 (effective 2026) made significant changes to WHT, particularly in expanding the categories where WHT is treated as a final tax for individuals.
        </p>
      </section>

      <section id="rates">
        <h2 className="text-2xl font-bold text-foreground mb-4">WHT Rates by Payment Type</h2>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground font-semibold">Payment Type</th>
                  <th className="text-center py-2 text-foreground font-semibold">Company</th>
                  <th className="text-center py-2 text-foreground font-semibold">Individual</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-2">Dividends</td><td className="text-center">10%</td><td className="text-center">10%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Interest</td><td className="text-center">10%</td><td className="text-center">10%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Rent</td><td className="text-center">10%</td><td className="text-center">10%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Royalties</td><td className="text-center">10%</td><td className="text-center">5%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Commission</td><td className="text-center">10%</td><td className="text-center">5%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Consultancy / Management fees</td><td className="text-center">10%</td><td className="text-center">5%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Technical / Professional fees</td><td className="text-center">5%</td><td className="text-center">5%</td></tr>
                <tr className="border-b border-border/50"><td className="py-2">Construction / Building</td><td className="text-center">5%</td><td className="text-center">5%</td></tr>
                <tr><td className="py-2">Contracts (all types)</td><td className="text-center">5%</td><td className="text-center">5%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Use our <Link to="/wht-calculator" className="text-primary hover:underline">WHT Calculator</Link> for instant rate lookups.
        </p>
      </section>

      <section id="how-it-works">
        <h2 className="text-2xl font-bold text-foreground mb-4">How WHT Works</h2>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Worked Example</h3>
          <p className="text-sm text-muted-foreground mb-2">Company A hires Company B for consulting at ₦2,000,000:</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Gross fee: ₦2,000,000</p>
            <p>WHT deducted (10%): ₦200,000</p>
            <p>Amount paid to Company B: ₦1,800,000</p>
            <p>VAT (7.5%): ₦150,000</p>
            <p className="font-semibold text-foreground">Total invoice: ₦2,150,000 (Company A pays ₦1,950,000 to B + ₦200,000 WHT to NRS + ₦150,000 VAT to NRS)</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Note: WHT is calculated on the gross amount before VAT.</p>
        </div>
      </section>

      <section id="credit-vs-final">
        <h2 className="text-2xl font-bold text-foreground mb-4">Credit vs Final Tax</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Under the 2026 rules, WHT treatment depends on the recipient type and income category:
        </p>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div className="glass-frosted rounded-xl p-5 border-l-4 border-primary">
            <h3 className="font-semibold text-foreground mb-2">WHT as Credit (Companies)</h3>
            <p className="text-sm text-muted-foreground">WHT on trading transactions (contracts, supplies) is a credit against CIT. The company includes the gross income in its tax return and offsets the WHT credit.</p>
          </div>
          <div className="glass-frosted rounded-xl p-5 border-l-4 border-success">
            <h3 className="font-semibold text-foreground mb-2">WHT as Final Tax (Individuals)</h3>
            <p className="text-sm text-muted-foreground">For individuals receiving dividends, interest, or rent, the WHT deducted is now the final tax — no additional assessment or filing is needed for those income streams.</p>
          </div>
        </div>
      </section>

      <section id="credit-notes">
        <h2 className="text-2xl font-bold text-foreground mb-4">WHT Credit Notes</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          A WHT credit note is proof that tax was deducted at source. The payer must provide this to the recipient within 30 days of deduction. Without the credit note, the recipient cannot offset the WHT against their CIT or prove final tax was paid.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Tip:</strong> Always follow up on missing credit notes promptly. Include credit note requirements in your contracts and invoices. Maintain a register of all WHT deductions and credit notes received.
        </p>
      </section>

      <section id="remittance">
        <h2 className="text-2xl font-bold text-foreground mb-4">Remittance & Filing</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          WHT must be remitted to NRS within <strong className="text-foreground">21 days</strong> from the date of deduction. Late remittance attracts 10% per annum interest on the unremitted amount.
        </p>
        <div className="glass-frosted rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Remittance Steps</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'Deduct WHT at the correct rate when making payment',
              'Complete NRS WHT remittance schedule',
              'Pay via bank transfer using NRS-designated bank accounts',
              'File WHT return on TaxPro Max portal',
              'Issue credit note to the recipient within 30 days',
              'Retain records for minimum 6 years',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2"><span className="font-semibold text-foreground shrink-0">{i + 1}.</span> {step}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="non-resident">
        <h2 className="text-2xl font-bold text-foreground mb-4">Non-Resident WHT</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Payments to non-resident companies or individuals are subject to WHT as a <strong className="text-foreground">final tax</strong>. This means the non-resident has no further Nigerian tax obligation on that income. Rates typically range from 5% to 10% depending on the payment type, and may be reduced by applicable Double Taxation Agreements (DTAs).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Nigeria has DTAs with over 15 countries. If a DTA applies, the treaty rate (often lower) takes precedence. Always check for applicable DTAs before deducting WHT on cross-border payments.
        </p>
      </section>

      <section id="common-mistakes">
        <h2 className="text-2xl font-bold text-foreground mb-4">Common Mistakes to Avoid</h2>
        <div className="space-y-3">
          {[
            { mistake: 'Applying wrong rates', fix: 'Always check whether the recipient is a company or individual, and the specific payment type. Rates differ significantly.' },
            { mistake: 'Deducting WHT on VAT-inclusive amount', fix: 'WHT is calculated on the gross amount BEFORE VAT, not the VAT-inclusive total.' },
            { mistake: 'Not issuing credit notes', fix: 'Failure to issue credit notes within 30 days leaves the recipient unable to claim their credit. This damages business relationships and creates compliance issues.' },
            { mistake: 'Forgetting to apply DTA rates', fix: 'For payments to treaty countries, the DTA rate (often lower) should be applied instead of the domestic rate.' },
          ].map((item, i) => (
            <div key={i} className="glass-frosted rounded-xl p-5 border-l-4 border-warning/60">
              <h3 className="font-semibold text-foreground text-sm mb-1">{item.mistake}</h3>
              <p className="text-sm text-muted-foreground">{item.fix}</p>
            </div>
          ))}
        </div>
      </section>
    </BlogPostLayout>
  );
};

export default WHTExplained;
