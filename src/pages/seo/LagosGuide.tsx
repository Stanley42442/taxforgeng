import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createFAQSchema, createBreadcrumbSchema, createHowToSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { DataSourceCitation } from '@/components/seo/DataSourceCitation';
import { MapPin, Building2, Laptop, Banknote, Ship, Clock, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const LagosGuide = () => {
  const faqs = [
    { question: 'What taxes does LIRS collect?', answer: 'LIRS collects Personal Income Tax (PAYE) for Lagos residents, withholding tax on state contracts, development levy, business premises levy, and other state-imposed levies. Federal taxes (CIT, VAT, WHT on federal matters) are handled by FIRS.' },
    { question: 'Do I need to register with both FIRS and LIRS?', answer: 'Yes. FIRS handles federal taxes (CIT, VAT, WHT), while LIRS handles state taxes (PAYE for state residents, state development levy). All Lagos businesses must register with both.' },
    { question: 'Is there a Lagos-specific business levy?', answer: 'Yes. Lagos imposes a Business Premises Levy based on business size and location. There are also signage/advertisement fees and environmental levies. These are in addition to federal taxes.' },
    { question: 'How does PAYE work for Lagos employees?', answer: 'Employers in Lagos withhold PAYE using the 2026 PIT bands and remit to LIRS monthly by the 10th of the following month. The new ₦800,000 tax-free threshold means many junior employees pay zero PAYE.' },
    { question: 'Are there incentives for tech startups in Lagos?', answer: 'While there is no Lagos-specific tech tax break, the federal Small Company Exemption (₦50M turnover, 0% CIT) benefits most early-stage startups. Pioneer status may also apply to qualifying tech companies.' },
    { question: 'Where are the LIRS offices in Lagos?', answer: 'LIRS headquarters is at Block 1, The Secretariat, Alausa, Ikeja. There are district offices in Ikeja, Lagos Island, Victoria Island, Lekki, Surulere, and other areas.' },
  ];

  const commonMistakes = [
    { mistake: 'Only registering with FIRS, not LIRS', fix: 'Lagos businesses must register with both. LIRS handles PAYE for state residents and various state levies. Non-registration leads to back-assessments and penalties.' },
    { mistake: 'Missing Lagos State development levy', fix: 'Lagos imposes an annual development levy on businesses. This is separate from the federal Development Levy (4% of profits). Budget for both.' },
    { mistake: 'Late PAYE remittance', fix: 'PAYE must be remitted to LIRS by the 10th of the following month. Late payment attracts 10% penalty plus interest. Set up automated reminders.' },
    { mistake: 'Ignoring Land Use Charge', fix: 'Property owners and tenants in Lagos must pay the Land Use Charge annually. Rates vary by location and property type. Check the Lagos State LUC calculator.' },
  ];

  const keySectors = [
    { icon: Laptop, name: 'Technology & Fintech', description: 'Lagos is Nigeria\'s tech hub. Yaba, Lekki, and VI host hundreds of startups.', tips: ['Small Company Exemption applies (₦50M)', 'Digital services VAT for B2C', 'Pioneer status for qualifying tech'] },
    { icon: Banknote, name: 'Finance & Banking', description: 'Most Nigerian banks and financial institutions are headquartered in Lagos.', tips: ['WHT on interest payments', 'Specific banking sector CIT rules', 'CBN regulatory compliance'] },
    { icon: Ship, name: 'Import & Export', description: 'Apapa and Tin Can ports handle most of Nigeria\'s trade volume.', tips: ['Customs duties separate from CIT/VAT', 'WHT on shipping payments', 'Free Trade Zone benefits'] },
    { icon: Building2, name: 'Real Estate & Construction', description: 'Lagos has Nigeria\'s most active property market.', tips: ['10% WHT on rent', 'Capital gains tax on property sales', 'Land Use Charge obligations'] },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema('Lagos Tax Guide 2026 - LIRS, Tech, Finance', 'Complete tax guide for Lagos businesses. LIRS obligations, tech startup tips, finance sector rules.', '2026-02-09', '2026-02-09'),
      createFAQSchema(faqs),
      createHowToSchema('How to Register Your Lagos Business for Taxes', 'Step-by-step tax registration for Lagos businesses.', [
        { name: 'Register with CAC', text: 'Complete your CAC registration to obtain your RC number.' },
        { name: 'Get TIN from FIRS', text: 'Visit FIRS Lagos or use TaxPro Max portal for your Tax Identification Number.' },
        { name: 'Register with LIRS', text: 'Register at LIRS Alausa or online at lirs.gov.ng for state tax obligations.' },
        { name: 'Pay business premises levy', text: 'Register your business premises and pay the annual levy to LIRS.' },
      ]),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'State Guides', url: 'https://taxforgeng.com/state-guides' },
        { name: 'Lagos', url: 'https://taxforgeng.com/state-guides/lagos' },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title="Lagos Tax Guide 2026 - LIRS, Tech Startups, Finance | TaxForge"
        description="Complete tax guide for Lagos businesses. LIRS obligations, tech startup incentives, finance sector rules, common mistakes, and filing deadlines."
        canonicalPath="/state-guides/lagos"
        keywords="Lagos tax guide, LIRS, Lagos business tax, tech startup tax Lagos, PAYE Lagos, Lagos state levy"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <article className="max-w-4xl mx-auto">
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'State Guides', href: '/state-guides' },
                { label: 'Lagos' },
              ]} />
              <ContentMeta published="2026-02-09" publishedLabel="February 9, 2026" updated="2026-02-13" updatedLabel="February 13, 2026" />

              <header>
                <SEOHero badge="State Guide" title="Lagos Tax Guide" titleHighlight="Nigeria's Commercial Capital" subtitle="LIRS obligations, tech & finance sector tips, and compliance advice for businesses in Lagos State." />

                <div className="mb-10"><TrustBadges badges={[{ icon: 'check', text: 'LIRS Compliant' }, { icon: 'shield', text: 'Lagos Focus' }, { icon: 'clock', text: '2026 Rules' }]} /></div>
              </header>

              {/* About Lagos Taxation */}
              <section className="mb-12">
                <div className="glass-frosted rounded-2xl p-6 md:p-8 border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0"><MapPin className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Tax Compliance in Lagos</h2>
                      <p className="text-muted-foreground leading-relaxed mb-3">Lagos State generates the highest internally generated revenue (IGR) of any Nigerian state, driven by its massive PAYE collections and business levies. The Lagos State Internal Revenue Service (LIRS) is one of the most active and technologically advanced state revenue agencies in Nigeria.</p>
                      <p className="text-muted-foreground leading-relaxed">Whether you're running a fintech in Lekki, importing goods through Apapa port, or managing a construction firm on the mainland, understanding both your federal (FIRS) and state (LIRS) obligations is critical to avoiding penalties.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Key Sectors */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Key Business Sectors in Lagos</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {keySectors.map((sector, i) => (
                    <div key={i} className="glass-frosted rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center"><sector.icon className="h-6 w-6 text-primary" /></div>
                        <h3 className="text-lg font-bold text-foreground">{sector.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{sector.description}</p>
                      <ul className="space-y-2">
                        {sector.tips.map((tip, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /><span>{tip}</span></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* State vs Federal */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">State vs Federal Taxes in Lagos</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-primary">
                    <h3 className="text-xl font-bold text-foreground mb-4">Federal (FIRS)</h3>
                    <ul className="space-y-2">{['Company Income Tax (CIT)', 'Value Added Tax (VAT)', 'Withholding Tax (WHT)', 'Capital Gains Tax (companies)', 'Development Levy (4%)'].map((t, i) => (<li key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{t}</li>))}</ul>
                  </div>
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-success">
                    <h3 className="text-xl font-bold text-foreground mb-4">State (LIRS)</h3>
                    <ul className="space-y-2">{['Personal Income Tax (PAYE)', 'Business Premises Levy', 'Development Levy (state)', 'Land Use Charge', 'Signage & advertisement fees', 'Environmental levy'].map((t, i) => (<li key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success shrink-0" />{t}</li>))}</ul>
                  </div>
                </div>
              </section>

              {/* Common Mistakes */}
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

              {/* FAQ */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="glass-frosted rounded-xl border-none px-2">
                      <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-foreground hover:no-underline px-4 py-4">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground px-4 pb-4">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>

              {/* Related */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">Related Guides</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/state-guides" className="glass-frosted rounded-xl p-5 hover-lift transition-all group"><h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">All State Guides</h3><p className="text-sm text-muted-foreground">Compare tax obligations across states</p></Link>
                  <Link to="/blog/tax-guide-tech-startups" className="glass-frosted rounded-xl p-5 hover-lift transition-all group"><h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">Tax Guide for Tech Startups</h3><p className="text-sm text-muted-foreground">CIT, VAT, WHT and payroll for startups</p></Link>
                </div>
              </section>

              <CTASection variant="gradient" headline="Calculate Your Lagos Taxes" subtext="Free 2026-compliant calculator — works for all states." primaryText="Calculate Now" primaryLink="/individual-calculator" secondaryText="View All Tools" secondaryLink="/free-tax-calculator" />
              <DataSourceCitation />
              <SEODisclaimer />
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default LagosGuide;
