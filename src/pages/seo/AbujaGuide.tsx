import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createFAQSchema, createBreadcrumbSchema, createHowToSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { MapPin, Landmark, Building2, Briefcase, Globe, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const AbujaGuide = () => {
  const faqs = [
    { question: 'What is FCT-IRS and how does it differ from FIRS?', answer: 'FCT-IRS (Federal Capital Territory Internal Revenue Service) is the state-equivalent tax authority for Abuja. Since Abuja is not a state, it has its own IRS that collects PAYE for FCT residents, development levies, and business premises fees. FIRS handles federal taxes nationwide.' },
    { question: 'Do government contractors in Abuja have special tax obligations?', answer: 'Yes. Government contractors must ensure WHT is properly deducted at source — typically 5% for contracts and 10% for professional services. The procuring government agency deducts and remits. Contractors should obtain WHT credit notes for CIT offset.' },
    { question: 'Are embassies and international organisations exempt from tax?', answer: 'Diplomatic missions enjoy tax exemptions under the Vienna Convention. However, local Nigerian staff employed by embassies are subject to PAYE. International organisations may have specific agreements with the Nigerian government.' },
    { question: 'Where is the FCT-IRS office?', answer: 'FCT-IRS headquarters is at Plot 737, Cadastral Zone B6, Mabushi, Abuja. District offices are located in Garki, Wuse, and Gwagwalada.' },
    { question: 'Is the Land Use Charge different in Abuja?', answer: 'Yes. Abuja operates under the FCT Land Use Act with its own charging framework. The Federal Capital Development Authority (FCDA) manages land allocation and charges, which differ from state-based systems.' },
    { question: 'How do I file PAYE for Abuja employees?', answer: 'Employers in Abuja remit PAYE to FCT-IRS (not FIRS). Filing is monthly by the 10th of the following month. The 2026 PIT bands apply with the ₦800,000 tax-free threshold.' },
  ];

  const commonMistakes = [
    { mistake: 'Confusing FCT-IRS with FIRS', fix: 'They are separate. FCT-IRS handles state-level taxes for Abuja (PAYE, levies). FIRS handles federal taxes (CIT, VAT, WHT). Register with both.' },
    { mistake: 'Not claiming WHT credit notes on government contracts', fix: 'When a government ministry deducts WHT from your payment, request the credit note immediately. These credits offset your CIT liability — losing them means paying tax twice.' },
    { mistake: 'Ignoring FCT tenement rates', fix: 'Property occupiers in Abuja must pay tenement rates to AMAC or the relevant area council. These are separate from Land Use Charge and must be paid annually.' },
    { mistake: 'Assuming diplomatic employer exemption covers local staff', fix: 'Only diplomatic personnel enjoy tax exemption. Nigerian nationals working for embassies are subject to PAYE under normal rules. Employers must deduct and remit.' },
  ];

  const keySectors = [
    { icon: Landmark, name: 'Government & Public Sector', description: 'Abuja hosts all federal ministries, agencies, and departments.', tips: ['WHT on government contracts (5%)', 'Prompt payment compliance', 'Tax clearance certificate requirement'] },
    { icon: Briefcase, name: 'Consulting & Professional Services', description: 'Large consulting firms serve government and private sector clients.', tips: ['10% WHT on professional fees', 'VAT on services above ₦25M', 'CIT on net profits'] },
    { icon: Globe, name: 'International Organisations', description: 'Embassies, NGOs, and multilateral agencies are concentrated in Abuja.', tips: ['Diplomatic exemptions', 'Local staff PAYE obligations', 'Specific bilateral agreements'] },
    { icon: Building2, name: 'Real Estate & Construction', description: 'Active construction and property market driven by government spending.', tips: ['10% WHT on rent', '5% WHT on construction contracts', 'FCT Land Use Charge'] },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema('Abuja Tax Guide 2026 - FCT-IRS, Government Contracts', 'Complete tax guide for Abuja businesses. FCT-IRS obligations, government contractor tips, diplomatic sector rules.', '2026-02-09', '2026-02-09'),
      createFAQSchema(faqs),
      createHowToSchema('How to Register Your Abuja Business for Taxes', 'Step-by-step tax registration for FCT businesses.', [
        { name: 'Register with CAC', text: 'Complete CAC registration to obtain your RC number.' },
        { name: 'Get TIN from FIRS', text: 'Visit FIRS Abuja or use TaxPro Max portal.' },
        { name: 'Register with FCT-IRS', text: 'Register at FCT-IRS Mabushi for state-level tax obligations.' },
        { name: 'Obtain Tax Clearance Certificate', text: 'Essential for government contracts — apply after filing returns.' },
      ]),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'State Guides', url: 'https://taxforgeng.com/state-guides' },
        { name: 'Abuja', url: 'https://taxforgeng.com/state-guides/abuja' },
      ]),
    ],
  };

  return (
    <>
      <SEOHead title="Abuja Tax Guide 2026 - FCT-IRS, Government Contracts | TaxForge" description="Tax guide for Abuja businesses. FCT-IRS obligations, government contractor WHT, diplomatic exemptions, and compliance tips." canonicalPath="/state-guides/abuja" keywords="Abuja tax guide, FCT-IRS, government contractor tax, Abuja PAYE, FCT tax compliance" schema={schema} />

      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              <SEOHero badge="State Guide" title="Abuja Tax Guide" titleHighlight="Federal Capital Territory" subtitle="FCT-IRS obligations, government contractor compliance, and sector-specific advice for businesses in Nigeria's capital." />

              <div className="mb-10"><TrustBadges badges={[{ icon: 'check', text: 'FCT-IRS Compliant' }, { icon: 'shield', text: 'Abuja Focus' }, { icon: 'clock', text: '2026 Rules' }]} /></div>

              <section className="mb-12">
                <div className="glass-frosted rounded-2xl p-6 md:p-8 border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0"><MapPin className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Tax Compliance in Abuja</h2>
                      <p className="text-muted-foreground leading-relaxed mb-3">As the Federal Capital Territory, Abuja has a unique tax structure. Unlike the 36 states, Abuja is administered directly by the federal government through the FCT Administration. Tax collection at the state level is handled by FCT-IRS, while federal taxes are managed by FIRS as in all other locations.</p>
                      <p className="text-muted-foreground leading-relaxed">Abuja's economy is dominated by government spending, professional services, real estate, and international organisations. Understanding the WHT obligations on government contracts and the FCT-IRS registration requirements is essential for businesses operating in the capital.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Key Business Sectors in Abuja</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {keySectors.map((sector, i) => (
                    <div key={i} className="glass-frosted rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4"><div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center"><sector.icon className="h-6 w-6 text-primary" /></div><h3 className="text-lg font-bold text-foreground">{sector.name}</h3></div>
                      <p className="text-sm text-muted-foreground mb-4">{sector.description}</p>
                      <ul className="space-y-2">{sector.tips.map((tip, j) => (<li key={j} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /><span>{tip}</span></li>))}</ul>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Common Mistakes to Avoid</h2>
                <div className="space-y-4">
                  {commonMistakes.map((item, i) => (
                    <div key={i} className="glass-frosted rounded-xl p-5 border-l-4 border-warning/60">
                      <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><div><h3 className="font-semibold text-foreground text-sm mb-1">{item.mistake}</h3><p className="text-sm text-muted-foreground">{item.fix}</p></div></div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {faqs.map((faq, i) => (<AccordionItem key={i} value={`faq-${i}`} className="glass-frosted rounded-xl border-none px-2"><AccordionTrigger className="text-left text-sm md:text-base font-semibold text-foreground hover:no-underline px-4 py-4">{faq.question}</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground px-4 pb-4">{faq.answer}</AccordionContent></AccordionItem>))}
                </Accordion>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">Related Guides</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/state-guides" className="glass-frosted rounded-xl p-5 hover-lift transition-all group"><h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">All State Guides</h3><p className="text-sm text-muted-foreground">Compare tax obligations across states</p></Link>
                  <Link to="/blog/tax-reforms-2026-summary" className="glass-frosted rounded-xl p-5 hover-lift transition-all group"><h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">2026 Tax Reforms Summary</h3><p className="text-sm text-muted-foreground">Everything that changed this year</p></Link>
                </div>
              </section>

              <CTASection variant="gradient" headline="Calculate Your Abuja Taxes" subtext="Free 2026-compliant calculator for all states." primaryText="Calculate Now" primaryLink="/individual-calculator" secondaryText="View All Tools" secondaryLink="/free-tax-calculator" />
              <SEODisclaimer />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AbujaGuide;
