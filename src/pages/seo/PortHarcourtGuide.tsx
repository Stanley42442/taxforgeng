import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createFAQSchema, createBreadcrumbSchema, createHowToSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { DataSourceCitation } from '@/components/seo/DataSourceCitation';
import { MapPin, Building2, Ship, Fuel, Factory, Clock, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PortHarcourtGuide = () => {
  const faqs = [
    { question: 'Do Rivers State businesses pay different taxes than other states?', answer: 'No, federal taxes (CIT, VAT, WHT) are the same nationwide. However, Rivers State has specific state levies and the Rivers State Internal Revenue Service (RIRS) handles state taxes like PAYE for state employees.' },
    { question: 'Where is the NRS office in Port Harcourt?', answer: 'The main NRS office (formerly FIRS) in Port Harcourt is located at Nigeria Revenue Service, Plot 6, Olu Obasanjo Road, Port Harcourt. There are also satellite offices in Trans-Amadi and GRA.' },
    { question: 'Are there special tax incentives for oil and gas companies?', answer: 'Under 2026 rules, Pioneer Status is replaced by the Economic Development Incentive (EDI), providing a 5% annual tax credit for 5 years on qualifying capex. Free Trade Zone benefits (e.g., Onne Oil & Gas FTZ) continue to apply. Consult a tax professional for current eligibility.' },
    { question: 'How do I register my Port Harcourt business for taxes?', answer: 'Visit the NRS office with your CAC registration documents, utility bill, and ID. You can also start registration online via the NRS TaxPro Max portal. TIN processing typically takes 2-5 working days.' },
    { question: 'What Free Trade Zone benefits apply in Rivers State?', answer: 'Businesses in the Onne Oil & Gas Free Zone and other designated zones enjoy tax holidays on profits, exemption from customs duties on imported equipment, and freedom from foreign exchange regulations. However, sales to the domestic market attract standard duties and taxes.' },
    { question: 'Can I e-file my taxes from Port Harcourt?', answer: 'Yes. NRS operates the TaxPro Max e-filing portal which is accessible nationwide. You can file CIT, VAT, and WHT returns online without visiting the physical office.' },
    { question: 'What is the penalty for late filing in Rivers State?', answer: 'Federal tax penalties are the same nationwide: ₦50,000 for the first month of late filing, plus ₦25,000 for each subsequent month. Late payment of tax attracts 10% per annum interest on the unpaid amount.' },
  ];

  const commonMistakes = [
    { mistake: 'Not registering with both NRS and RIRS', fix: 'Rivers State businesses must register separately with NRS (federal taxes) and the Rivers State Internal Revenue Service (state taxes like PAYE). Missing either creates compliance gaps.' },
    { mistake: 'Ignoring state levies and fees', fix: 'Beyond federal taxes, Rivers State imposes business premises registration fees, signage levies, and development charges. Budget for these to avoid surprise penalties from RIRS.' },
    { mistake: 'Applying wrong WHT rates for oil services', fix: 'Oil and gas services have specific WHT rates. Professional and technical services to oil companies attract 10% WHT for individuals and 5% for companies. Double-check rates before deducting.' },
    { mistake: 'Missing business premises registration', fix: 'All businesses operating in Port Harcourt must register their premises with the Rivers State government. This is separate from CAC registration and must be renewed annually.' },
  ];

  const keySectors = [
    { icon: Fuel, name: 'Oil & Gas', description: 'Nigeria\'s oil hub. Special petroleum profit tax rules apply alongside CIT.', tips: ['Petroleum Profits Tax (PPT) applies', 'EDI tax credit for deep offshore (replaces Pioneer Status)', 'Gas utilization incentives'] },
    { icon: Ship, name: 'Maritime & Shipping', description: 'Major port city with significant shipping activity.', tips: ['Cabotage rules apply to local shipping', 'Port handling services subject to VAT', 'WHT on charter payments'] },
    { icon: Factory, name: 'Manufacturing', description: 'Growing industrial zone with manufacturing incentives.', tips: ['EDI tax credit for qualifying industries (replaces Pioneer Status)', 'Accelerated capital allowances', 'Free Trade Zone benefits'] },
    { icon: Building2, name: 'Construction & Real Estate', description: 'Active construction sector serving oil industry.', tips: ['5% WHT on contracts', '10% WHT on rent', 'Capital gains tax on property sales'] },
  ];

  const localResources = [
    { name: 'NRS Port Harcourt', address: 'Plot 6, Olu Obasanjo Road, Port Harcourt', hours: 'Mon-Fri: 8AM - 4PM' },
    { name: 'Rivers State IRS (RIRS)', address: 'Revenue House, Moscow Road, Port Harcourt', hours: 'Mon-Fri: 8AM - 4PM' },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema(
        'Port Harcourt Tax Guide 2026 - Rivers State SME Tips',
        'Complete tax guide for Port Harcourt businesses. Local SME compliance tips, oil & gas sector advice, NRS office locations.',
        '2026-01-01',
        '2026-02-09'
      ),
      createFAQSchema(faqs),
      createHowToSchema(
        'How to Register Your Port Harcourt Business for Taxes',
        'Step-by-step guide to tax registration for Rivers State businesses.',
        [
          { name: 'Register with CAC', text: 'Complete your CAC registration to obtain your RC number.' },
          { name: 'Get your TIN from NRS', text: 'Visit NRS Port Harcourt or use TaxPro Max to obtain your Tax Identification Number.' },
          { name: 'Register with RIRS', text: 'Register with Rivers State Internal Revenue Service for state tax obligations.' },
          { name: 'Register business premises', text: 'Register your business premises with the Rivers State government.' },
        ]
      ),
      {
        '@type': 'LocalBusiness',
        name: 'TaxForge NG',
        description: 'Nigerian tax calculation platform built in Port Harcourt',
        address: { '@type': 'PostalAddress', addressLocality: 'Port Harcourt', addressRegion: 'Rivers State', addressCountry: 'NG' },
        areaServed: { '@type': 'State', name: 'Rivers' },
      },
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Tax Guides', url: 'https://taxforgeng.com/free-tax-calculator' },
        { name: 'Port Harcourt Guide', url: 'https://taxforgeng.com/port-harcourt-tax-guide' },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title="Port Harcourt Tax Guide 2026 - Rivers State SME Tips | TaxForge"
        description="Tax guide for Port Harcourt businesses. Rivers State SME compliance tips, oil & gas sector advice. Built by a local Port Harcourt developer."
        canonicalPath="/port-harcourt-tax-guide"
        keywords="Port Harcourt tax guide, Rivers State tax, oil and gas tax Nigeria, NRS Port Harcourt, FIRS Port Harcourt, tax compliance Rivers State"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="fixed top-20 right-10 w-80 h-80 rounded-full bg-success/10 blur-3xl animate-float-slow pointer-events-none" />
        <div className="fixed bottom-20 left-10 w-64 h-64 rounded-full bg-primary/8 blur-3xl animate-float pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <article className="max-w-4xl mx-auto">
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'State Guides', href: '/state-guides' },
                { label: 'Port Harcourt' },
              ]} />
              <ContentMeta published="2026-01-01" publishedLabel="January 1, 2026" updated="2026-02-09" updatedLabel="February 9, 2026" />

              <header>
                <SEOHero
                  badge="Built in Port Harcourt"
                  title="Port Harcourt Tax Guide"
                  titleHighlight="Rivers State SME Tips"
                  subtitle="Local tax compliance guide for businesses in Nigeria's oil capital. Sector-specific advice for Port Harcourt entrepreneurs."
                />

                <div className="mb-10 animate-slide-up-delay-2">
                  <TrustBadges badges={[
                    { icon: 'check', text: 'Local Developer' },
                    { icon: 'shield', text: 'Rivers State Focus' },
                    { icon: 'clock', text: '2026 Rules' },
                  ]} />
                </div>
              </header>

              {/* About Section */}
              <section className="mb-12">
                <div className="glass-frosted rounded-2xl p-6 md:p-8 border-l-4 border-success">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Built by a Port Harcourt Developer</h2>
                      <p className="text-muted-foreground">
                        TaxForge NG was created by Gillespie, a developer based in Port Harcourt, Rivers State. 
                        This platform is built with local Nigerian businesses in mind, with a special understanding 
                        of the unique challenges faced by SMEs in the Niger Delta region.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Key Sectors */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Key Business Sectors in Port Harcourt</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {keySectors.map((sector, index) => (
                    <div key={index} className="glass-frosted rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <sector.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{sector.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{sector.description}</p>
                      <ul className="space-y-2">
                        {sector.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* State vs Federal Taxes */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">State vs Federal Taxes in Rivers State</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-primary">
                    <h3 className="text-xl font-bold text-foreground mb-4">Federal Taxes (NRS)</h3>
                    <ul className="space-y-2">
                      {['Company Income Tax (CIT)', 'Value Added Tax (VAT)', 'Withholding Tax (WHT)', 'Petroleum Profits Tax (PPT)', 'Capital Gains Tax (companies)', 'Education Tax / Development Levy'].map((tax, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span>{tax}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-success">
                    <h3 className="text-xl font-bold text-foreground mb-4">State Taxes (RIRS)</h3>
                    <ul className="space-y-2">
                      {['Personal Income Tax (PAYE for state)', 'Business premises registration', 'Development levy (state)', 'Signage & advertisement fees', 'Land use charges', 'Market stall fees & levies'].map((tax, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                          <span>{tax}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Common Mistakes */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Common Mistakes to Avoid</h2>
                <div className="space-y-4">
                  {commonMistakes.map((item, i) => (
                    <div key={i} className="glass-frosted rounded-xl p-5 border-l-4 border-warning/60">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-foreground text-sm mb-1">{item.mistake}</h3>
                          <p className="text-sm text-muted-foreground">{item.fix}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Local Tax Offices */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Tax Offices in Port Harcourt</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {localResources.map((office, index) => (
                    <div key={index} className="glass-frosted rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-foreground mb-4">{office.name}</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{office.address}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm text-muted-foreground">{office.hours}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">*Contact information may change. Please verify before visiting.</p>
              </section>

              {/* FAQ Accordion */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="glass-frosted rounded-xl border-none px-2">
                      <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-foreground hover:no-underline px-4 py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground px-4 pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>

              {/* Related Articles */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">Related Articles</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/blog/tax-guide-tech-startups" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">Tax Guide for Tech Startups</h3>
                    <p className="text-sm text-muted-foreground">CIT, VAT, WHT and payroll for Nigerian startups</p>
                  </Link>
                  <Link to="/blog/tax-reforms-2026-summary" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">2026 Tax Reforms Summary</h3>
                    <p className="text-sm text-muted-foreground">Everything that changed under the Nigeria Tax Act 2025</p>
                  </Link>
                </div>
              </section>

              {/* Tax Tools */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">Calculate Your Taxes</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { to: '/free-tax-calculator', title: 'Free Tax Calculator', desc: 'Instant PIT/PAYE calculation' },
                    { to: '/small-company-exemption', title: 'Small Company Checker', desc: '0% CIT eligibility test' },
                    { to: '/cit-calculator', title: 'CIT Calculator', desc: 'Company Income Tax guide' },
                    { to: '/vat-calculator', title: 'VAT Calculator', desc: '7.5% VAT calculations' },
                    { to: '/wht-calculator', title: 'WHT Reference', desc: 'Withholding tax rates' },
                    { to: '/tax-reforms-2026', title: '2026 Tax Reforms', desc: 'What changed this year' },
                  ].map((link) => (
                    <Link key={link.to} to={link.to} className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.desc}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <CTASection
                variant="gradient"
                headline="Ready to Calculate Your Taxes?"
                subtext="Get accurate tax calculations with 2026 rules. Built right here in Port Harcourt for Nigerian businesses."
                primaryText="Start Calculating"
                primaryLink="/free-tax-calculator"
                secondaryText="View Business Tools"
                secondaryLink="/calculator"
              />

              <DataSourceCitation />
              <SEODisclaimer />
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default PortHarcourtGuide;
