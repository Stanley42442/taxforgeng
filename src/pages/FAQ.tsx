import { SEOHead, createFAQSchema, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { Link } from 'react-router-dom';

const faqCategories = [
  {
    name: 'Personal Tax (PIT/PAYE)',
    faqs: [
      { question: 'What is the tax-free threshold under the 2026 rules?', answer: 'Under the Nigeria Tax Act 2025 (effective 2026), the first ₦800,000 of annual income is exempt from personal income tax. This is a significant increase from the previous graduated relief system.' },
      { question: 'How is PAYE calculated for employees in Nigeria?', answer: 'PAYE (Pay As You Earn) is deducted monthly by your employer based on the 2026 PIT bands: 0% on the first ₦800,000, then 15%, 19%, 21%, and 25% on higher income brackets. Use our PIT/PAYE Calculator to see your exact breakdown.' },
      { question: 'What reliefs can I claim under the 2026 rules?', answer: 'The main relief is Rent Relief — 20% of your annual rent, capped at ₦500,000. The old Consolidated Relief Allowance (CRA) of ₦200,000 + 20% has been replaced by this simpler system.' },
      { question: 'Do I need to file a tax return if my employer handles PAYE?', answer: 'If your only income is employment income and PAYE is correctly deducted, you generally do not need to file separately. However, if you have additional income sources (rental, freelance, business), you must file with FIRS.' },
      { question: 'What is the maximum PIT rate in Nigeria?', answer: 'The maximum marginal rate is 25% under the 2026 rules, which applies to income above ₦50,000,000. This is lower than the previous maximum of 24% but applies at a much higher threshold.' },
      { question: 'How does Rent Relief work under the 2026 rules?', answer: 'If you pay rent, you can deduct 20% of your annual rent from your taxable income, up to a maximum of ₦500,000. For example, if you pay ₦2,000,000 in rent, your relief is ₦400,000. Use our Rent Relief Calculator to check your savings.' },
    ],
  },
  {
    name: 'Company Tax (CIT)',
    faqs: [
      { question: 'What is the CIT rate for Nigerian companies in 2026?', answer: 'The standard Company Income Tax rate is 25% of assessable profits. However, small companies (turnover ≤ ₦50 million) pay 0% CIT under the Small Company Exemption. Medium companies may qualify for reduced rates.' },
      { question: 'How do I qualify for the Small Company Exemption (0% CIT)?', answer: 'Your company must have annual turnover of ₦50 million or less AND total assets of ₦250 million or less. Both criteria must be met. This is an increase from the previous threshold of ₦25 million. Use our Small Company Exemption Checker to verify.' },
      { question: 'What is the Development Levy?', answer: 'The Development Levy replaces the old Tertiary Education Tax (TET). It is 4% of assessable profits for companies, compared to the previous 3% TET rate. This applies to all companies regardless of size.' },
      { question: 'When is CIT due for Nigerian companies?', answer: 'CIT returns must be filed within 6 months after the end of the accounting year for companies that have been in operation for more than 18 months. New companies get 18 months from the date of incorporation.' },
      { question: 'Can I carry forward business losses?', answer: 'Yes, business losses can be carried forward indefinitely under the 2026 rules to offset against future profits. However, the amount that can be offset in any given year is limited to 50% of assessable profits.' },
    ],
  },
  {
    name: 'VAT',
    faqs: [
      { question: 'What is the VAT rate in Nigeria in 2026?', answer: 'The standard VAT rate remains 7.5% in 2026. This rate applies to all vatable goods and services. Companies with turnover of ₦25 million or less are exempt from VAT registration.' },
      { question: 'Which goods and services are VAT-exempt?', answer: 'Exempt items include basic food items, medical supplies, educational materials, books, baby products, agricultural equipment, and locally manufactured sanitary products. The full list is maintained by FIRS.' },
      { question: 'When must I register for VAT?', answer: 'You must register for VAT if your annual turnover exceeds ₦25 million. Registration should be done within 6 months of reaching this threshold. Below this amount, VAT registration is optional.' },
      { question: 'How often must I file VAT returns?', answer: 'VAT returns must be filed monthly, by the 21st of the following month. For example, January VAT is due by February 21st. Late filing attracts penalties of ₦50,000 for the first month and ₦25,000 for each subsequent month.' },
      { question: 'Can I claim input VAT on business purchases?', answer: 'Yes, registered companies can claim input VAT paid on business purchases against output VAT collected. This must be supported by valid tax invoices from VAT-registered suppliers.' },
    ],
  },
  {
    name: 'Withholding Tax (WHT)',
    faqs: [
      { question: 'What is Withholding Tax and when does it apply?', answer: 'WHT is a tax deducted at source on certain payments including dividends (10%), interest (10%), rent (10%), royalties (10%), and professional fees (5% for companies, 10% for individuals). It acts as an advance payment of the recipient\'s income tax.' },
      { question: 'Is WHT a final tax under the 2026 rules?', answer: 'For certain non-resident payments and investment income of individuals, WHT can be a final tax. For companies, WHT on trading transactions can be offset against CIT liability. Check our WHT Calculator for specifics.' },
      { question: 'How do I remit WHT deducted?', answer: 'WHT must be remitted to the relevant tax authority (FIRS for companies, State IRS for individuals) within 21 days of the deduction. A WHT credit note should be issued to the payee.' },
      { question: 'What happens if I don\'t deduct WHT?', answer: 'Failure to deduct or remit WHT carries penalties including the amount of tax not deducted plus 10% per annum interest. FIRS can also disallow the expense for CIT purposes if WHT was not properly deducted.' },
    ],
  },
  {
    name: '2026 Tax Reforms',
    faqs: [
      { question: 'When did the 2026 tax reforms take effect?', answer: 'The Nigeria Tax Act 2025 was signed into law in late 2025 and took effect from January 1, 2026. It replaces the previous Personal Income Tax Act, Companies Income Tax Act, and Value Added Tax Act.' },
      { question: 'What are the biggest changes in the 2026 reforms?', answer: 'Key changes include: new PIT bands starting with ₦800,000 tax-free threshold, increased Small Company Exemption to ₦50M turnover, Rent Relief replacing CRA, Development Levy (4%) replacing TET (3%), and WHT serving as final tax in more cases.' },
      { question: 'Did VAT rates change in 2026?', answer: 'No, the VAT rate remains at 7.5%. However, the VAT registration threshold was clarified at ₦25 million annual turnover, and more items were added to the exempt list.' },
      { question: 'How does the 2026 reform affect small businesses?', answer: 'Small businesses benefit significantly — the Small Company Exemption threshold doubled from ₦25 million to ₦50 million turnover, meaning many more businesses pay 0% CIT. Read our detailed guide on Small Company CIT Exemption.' },
      { question: 'Where can I read the full Nigeria Tax Act 2025?', answer: 'The official text is available from the Federal Government Gazette and FIRS website. TaxForge provides a plain-English summary on our Tax Reforms 2026 page and in our blog articles.' },
    ],
  },
  {
    name: 'Using TaxForge',
    faqs: [
      { question: 'Is TaxForge free to use?', answer: 'Yes! Basic tax calculations (PIT, PAYE, quick estimates) are completely free with no signup required. Premium features like PDF reports, business calculators, payroll, and expense tracking require a paid plan starting at ₦500/month.' },
      { question: 'How accurate is TaxForge?', answer: 'Our calculations are based on the official Nigeria Tax Act 2025 (effective 2026) and verified against FIRS guidelines and Big 4 accounting firm publications. However, TaxForge is an educational tool — always consult a tax professional for official filings.' },
      { question: 'Can TaxForge handle payroll for my company?', answer: 'Yes, TaxForge includes a full payroll calculator that handles PAYE, pension contributions, NHF, and net pay calculations for multiple employees. This is available on the Business plan.' },
      { question: 'Does TaxForge file my taxes with FIRS?', answer: 'TaxForge does not file taxes directly with FIRS. It generates accurate calculations and PDF reports that you or your accountant can use when filing through the FIRS e-filing portal.' },
      { question: 'Is my data secure on TaxForge?', answer: 'Yes, all data is encrypted and stored securely. We use industry-standard security practices including encrypted connections, session management, and 2FA support. Your financial data is never shared with third parties.' },
    ],
  },
];

const allFaqs = faqCategories.flatMap((c) => c.faqs);

const FAQ = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createFAQSchema(allFaqs),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'FAQ', url: 'https://taxforgeng.com/faq' },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title="Nigerian Tax FAQ 2026 - Questions Answered | TaxForge"
        description="Get answers to 30+ frequently asked questions about Nigerian taxes in 2026. PIT, CIT, VAT, WHT, Rent Relief, and the Nigeria Tax Act 2025 explained."
        canonicalPath="/faq"
        keywords="Nigeria tax FAQ, PIT FAQ Nigeria, CIT questions, VAT Nigeria FAQ, 2026 tax reform questions"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              <SEOHero
                badge="FAQ"
                title="Nigerian Tax Questions"
                titleHighlight="Answered"
                subtitle="Everything you need to know about Nigerian taxes under the 2026 rules. 30+ questions across PIT, CIT, VAT, WHT, and the new reforms."
              />

              {faqCategories.map((category) => (
                <section key={category.name} className="mb-10">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">{category.name}</h2>
                  <div className="space-y-3">
                    {category.faqs.map((faq, i) => (
                      <details key={i} className="glass-frosted rounded-xl group">
                        <summary className="cursor-pointer px-6 py-4 text-foreground font-semibold text-sm md:text-base list-none flex items-center justify-between">
                          {faq.question}
                          <span className="text-muted-foreground text-lg transition-transform group-open:rotate-45">+</span>
                        </summary>
                        <div className="px-6 pb-4 text-sm text-muted-foreground">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ))}

              {/* Cross-links */}
              <section className="mb-12">
                <h2 className="text-xl font-bold text-foreground mb-4">Explore Our Tools</h2>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    { label: 'Free Tax Calculator', to: '/free-tax-calculator' },
                    { label: 'PIT/PAYE Calculator', to: '/pit-paye-calculator' },
                    { label: 'CIT Calculator', to: '/cit-calculator' },
                    { label: 'VAT Calculator', to: '/vat-calculator' },
                    { label: 'WHT Calculator', to: '/wht-calculator' },
                    { label: 'Rent Relief Calculator', to: '/rent-relief-2026' },
                  ].map((link) => (
                    <Link key={link.to} to={link.to} className="glass-frosted rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:text-primary hover-lift transition-all">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>

              <CTASection variant="gradient" headline="Still Have Questions?" subtext="Try our AI Tax Assistant for instant answers about Nigerian tax rules." primaryText="Ask the Tax Bot" primaryLink="/advisory" secondaryText="Calculate Now" secondaryLink="/individual-calculator" />

              <SEODisclaimer />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FAQ;
