import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createFAQSchema, createBreadcrumbSchema, createHowToSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { DataSourceCitation } from '@/components/seo/DataSourceCitation';
import { MapPin, Wheat, ShoppingBag, Factory, Truck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const KanoGuide = () => {
  const faqs = [
    { question: 'What is KIRS and what taxes does it collect?', answer: 'KIRS (Kano State Internal Revenue Service) collects Personal Income Tax (PAYE) for Kano residents, business premises levies, market stall fees, and other state-imposed levies. Federal taxes (CIT, VAT, WHT) are handled by NRS.' },
    { question: 'Are agricultural businesses exempt from CIT in Kano?', answer: 'Yes, under federal law. Agricultural businesses engaged in primary production (farming, livestock, fishing) are exempt from CIT. However, agro-processing and value-added activities may attract CIT. The Small Company Exemption (₦50M) also applies.' },
    { question: 'How does cross-border trade taxation work in Kano?', answer: 'Kano\'s proximity to Niger Republic means significant cross-border trade. Import duties are collected by Nigeria Customs Service, not NRS. However, imported goods for resale attract VAT, and WHT applies to payments for cross-border services.' },
    { question: 'Do I need to register with both NRS and KIRS?', answer: 'Yes. NRS handles federal taxes (CIT, VAT, WHT), while KIRS handles state taxes (PAYE, state levies). All Kano businesses should register with both to remain compliant.' },
    { question: 'What are the textile industry tax incentives?', answer: 'Under 2026 rules, the textile industry may qualify for the Economic Development Incentive (EDI), which replaces Pioneer Status and provides a 5% annual tax credit for 5 years on qualifying capital expenditure. Companies with existing Pioneer Status approvals continue under their original terms. Additionally, the Small Company Exemption applies if turnover is below ₦50M. Import duty waivers on raw materials may also apply through specific government programmes.' },
    { question: 'Where are the tax offices in Kano?', answer: 'NRS Kano office is at Nigeria Revenue Service, Zoo Road, Kano. KIRS headquarters is at Revenue House, Audu Bako Way, Kano. Both have satellite offices across the metropolitan area.' },
  ];

  const commonMistakes = [
    { mistake: 'Assuming agricultural income is fully exempt', fix: 'Only primary agricultural production is CIT-exempt. Processing, packaging, and distribution may attract CIT. Agribusinesses should clearly separate qualifying and non-qualifying income.' },
    { mistake: 'Not registering with KIRS for state obligations', fix: 'Many Kano businesses only register with NRS and miss KIRS. State PAYE, business premises levies, and market fees must be paid to KIRS.' },
    { mistake: 'Ignoring informal sector formalisation benefits', fix: 'Kano has a large informal sector. Formalising your business (CAC registration + TIN) unlocks the Small Company Exemption and makes you eligible for government contracts and bank facilities.' },
    { mistake: 'Missing customs duties on cross-border goods', fix: 'Cross-border traders must clear goods through Nigeria Customs. Under-declaring or smuggling goods leads to seizure, fines, and criminal prosecution. Proper documentation saves money long-term.' },
  ];

  const keySectors = [
    { icon: Wheat, name: 'Agriculture & Agribusiness', description: 'Kano is a major agricultural hub for groundnuts, grains, and livestock.', tips: ['Primary production CIT-exempt', 'Agro-processing may attract CIT', 'EDI tax credit for value-addition (replaces Pioneer Status)'] },
    { icon: ShoppingBag, name: 'Trade & Commerce', description: 'Kano\'s markets (Kurmi, Sabon Gari) are among Nigeria\'s largest.', tips: ['VAT on goods above ₦25M turnover', 'WHT on large purchases', 'Market stall fees to KIRS'] },
    { icon: Factory, name: 'Textiles & Manufacturing', description: 'Historic textile industry with government revival programmes.', tips: ['EDI incentives (replaces Pioneer Status)', 'Import duty waivers on materials', 'Small Company Exemption'] },
    { icon: Truck, name: 'Transport & Logistics', description: 'Key transit hub connecting northern Nigeria to ports and borders.', tips: ['Road transport VAT exemption', 'WHT on haulage contracts', 'Vehicle licensing fees'] },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema('Kano Tax Guide 2026 - KIRS, Agriculture, Trade', 'Complete tax guide for Kano businesses. KIRS obligations, agricultural exemptions, cross-border trade tips.', '2026-02-09', '2026-02-09'),
      createFAQSchema(faqs),
      createHowToSchema('How to Register Your Kano Business for Taxes', 'Step-by-step tax registration for Kano businesses.', [
        { name: 'Register with CAC', text: 'Complete CAC registration at the Kano CAC office or online.' },
        { name: 'Get TIN from NRS', text: 'Visit NRS Kano (Zoo Road) or use TaxPro Max portal.' },
        { name: 'Register with KIRS', text: 'Register at KIRS Revenue House for state tax obligations.' },
        { name: 'Obtain market registration', text: 'If trading in Kano markets, register with the relevant market association and pay applicable fees.' },
      ]),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'State Guides', url: 'https://taxforgeng.com/state-guides' },
        { name: 'Kano', url: 'https://taxforgeng.com/state-guides/kano' },
      ]),
    ],
  };

  return (
    <>
      <SEOHead title="Kano Tax Guide 2026 - KIRS, Agriculture, Trade | TaxForge" description="Tax guide for Kano businesses. KIRS registration, agricultural exemptions, cross-border trade taxes, textile incentives." canonicalPath="/state-guides/kano" keywords="Kano tax guide, KIRS, Kano agriculture tax, cross-border trade tax, Kano business registration" schema={schema} />

      <div className="min-h-screen flex flex-col bg-background bg-ambient">
        <LavaLampBackground />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <article className="max-w-4xl mx-auto">
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'State Guides', href: '/state-guides' },
                { label: 'Kano' },
              ]} />
              <ContentMeta published="2026-02-09" publishedLabel="February 9, 2026" updated="2026-02-13" updatedLabel="February 13, 2026" />

              <header>
                <SEOHero badge="State Guide" title="Kano Tax Guide" titleHighlight="Northern Nigeria's Trade Hub" subtitle="KIRS obligations, agricultural exemptions, and cross-border trade advice for businesses in Kano State." />

                <div className="mb-10"><TrustBadges badges={[{ icon: 'check', text: 'KIRS Compliant' }, { icon: 'shield', text: 'Kano Focus' }, { icon: 'clock', text: '2026 Rules' }]} /></div>
              </header>

              <section className="mb-12">
                <div className="glass-frosted rounded-2xl p-6 md:p-8 border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0"><MapPin className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Tax Compliance in Kano</h2>
                      <p className="text-muted-foreground leading-relaxed mb-3">Kano State is the commercial heart of northern Nigeria, with a diverse economy spanning agriculture, textiles, trade, and transport. The Kano State Internal Revenue Service (KIRS) manages state-level tax collection, while NRS handles federal taxes.</p>
                      <p className="text-muted-foreground leading-relaxed">With one of Nigeria's largest informal economies, Kano presents unique tax compliance challenges. Understanding the distinction between state and federal obligations — and the agricultural exemptions available — is key to efficient tax planning.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Key Business Sectors in Kano</h2>
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
                  <Link to="/blog/small-company-cit-exemption" className="glass-frosted rounded-xl p-5 hover-lift transition-all group"><h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">0% CIT for Small Companies</h3><p className="text-sm text-muted-foreground">₦50M threshold guide</p></Link>
                </div>
              </section>

              <CTASection variant="gradient" headline="Calculate Your Kano Taxes" subtext="Free 2026-compliant calculator for all states." primaryText="Calculate Now" primaryLink="/individual-calculator" secondaryText="View All Tools" secondaryLink="/free-tax-calculator" />
              <DataSourceCitation />
              <SEODisclaimer />
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default KanoGuide;
