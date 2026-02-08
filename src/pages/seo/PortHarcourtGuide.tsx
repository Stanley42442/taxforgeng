import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createFAQSchema, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { MapPin, Building2, Ship, Fuel, Factory, Phone, Mail, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PortHarcourtGuide = () => {
  const faqs = [
    {
      question: 'Do Rivers State businesses pay different taxes than other states?',
      answer: 'No, federal taxes (CIT, VAT, WHT) are the same nationwide. However, Rivers State has specific state levies and the Rivers State Internal Revenue Service (RIRS) handles state taxes like PAYE for state employees.',
    },
    {
      question: 'Where is the FIRS office in Port Harcourt?',
      answer: 'The main FIRS office in Port Harcourt is located at Federal Inland Revenue Service, Plot 6, Olu Obasanjo Road, Port Harcourt. There are also satellite offices in Trans-Amadi and GRA.',
    },
    {
      question: 'Are there special tax incentives for oil and gas companies?',
      answer: 'Yes, Pioneer Status incentives may apply. Also, companies in designated Free Trade Zones enjoy tax holidays. However, the 2026 rules have modified some incentives - consult a tax professional for current eligibility.',
    },
    {
      question: 'How do I register my Port Harcourt business for taxes?',
      answer: 'Visit the FIRS office with your CAC registration documents, utility bill, and ID. You can also start registration online via the FIRS TaxPro Max portal. TIN processing typically takes 2-5 working days.',
    },
  ];

  const keySectors = [
    {
      icon: Fuel,
      name: 'Oil & Gas',
      description: 'Nigeria\'s oil hub. Special petroleum profit tax rules apply alongside CIT.',
      tips: ['Petroleum Profits Tax (PPT) applies', 'Pioneer status available for deep offshore', 'Gas utilization incentives'],
    },
    {
      icon: Ship,
      name: 'Maritime & Shipping',
      description: 'Major port city with significant shipping activity.',
      tips: ['Cabotage rules apply to local shipping', 'Port handling services subject to VAT', 'WHT on charter payments'],
    },
    {
      icon: Factory,
      name: 'Manufacturing',
      description: 'Growing industrial zone with manufacturing incentives.',
      tips: ['Pioneer status for qualifying industries', 'Accelerated capital allowances', 'Free Trade Zone benefits'],
    },
    {
      icon: Building2,
      name: 'Construction & Real Estate',
      description: 'Active construction sector serving oil industry.',
      tips: ['5% WHT on contracts', '10% WHT on rent', 'Capital gains tax on property sales'],
    },
  ];

  const localResources = [
    {
      name: 'FIRS Port Harcourt',
      address: 'Plot 6, Olu Obasanjo Road, Port Harcourt',
      phone: '+234 84 230 XXX',
      hours: 'Mon-Fri: 8AM - 4PM',
    },
    {
      name: 'Rivers State IRS (RIRS)',
      address: 'Revenue House, Moscow Road, Port Harcourt',
      phone: '+234 84 230 XXX',
      hours: 'Mon-Fri: 8AM - 4PM',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema(
        'Port Harcourt Tax Guide 2026 - Rivers State SME Tips',
        'Complete tax guide for Port Harcourt businesses. Local SME compliance tips, oil & gas sector advice, FIRS office locations.',
        '2026-01-01',
        '2026-02-06'
      ),
      createFAQSchema(faqs),
      {
        '@type': 'LocalBusiness',
        name: 'TaxForge NG',
        description: 'Nigerian tax calculation platform built in Port Harcourt',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Port Harcourt',
          addressRegion: 'Rivers State',
          addressCountry: 'NG',
        },
        areaServed: {
          '@type': 'State',
          name: 'Rivers',
        },
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
        keywords="Port Harcourt tax guide, Rivers State tax, oil and gas tax Nigeria, FIRS Port Harcourt, tax compliance Rivers State"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="fixed top-20 right-10 w-80 h-80 rounded-full bg-success/10 blur-3xl animate-float-slow pointer-events-none" />
        <div className="fixed bottom-20 left-10 w-64 h-64 rounded-full bg-primary/8 blur-3xl animate-float pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              {/* Hero */}
              <SEOHero
                badge="Built in Port Harcourt"
                title="Port Harcourt Tax Guide"
                titleHighlight="Rivers State SME Tips"
                subtitle="Local tax compliance guide for businesses in Nigeria's oil capital. Sector-specific advice for Port Harcourt entrepreneurs."
              />

              {/* Trust Badges */}
              <div className="mb-10 animate-slide-up-delay-2">
                <TrustBadges
                  badges={[
                    { icon: 'check', text: 'Local Developer' },
                    { icon: 'shield', text: 'Rivers State Focus' },
                    { icon: 'clock', text: '2026 Rules' },
                  ]}
                />
              </div>

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
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Key Business Sectors in Port Harcourt
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {keySectors.map((sector, index) => (
                    <div key={index} className="glass-frosted rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <sector.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{sector.name}</h3>
                        </div>
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
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  State vs Federal Taxes in Rivers State
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-frosted rounded-2xl p-6 border-l-4 border-primary">
                    <h3 className="text-xl font-bold text-foreground mb-4">Federal Taxes (FIRS)</h3>
                    <ul className="space-y-2">
                      {[
                        'Company Income Tax (CIT)',
                        'Value Added Tax (VAT)',
                        'Withholding Tax (WHT)',
                        'Petroleum Profits Tax (PPT)',
                        'Capital Gains Tax (companies)',
                        'Education Tax / Development Levy',
                      ].map((tax, index) => (
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
                      {[
                        'Personal Income Tax (PAYE for state)',
                        'Business premises registration',
                        'Development levy (state)',
                        'Signage & advertisement fees',
                        'Land use charges',
                        'Market stall fees & levies',
                      ].map((tax, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                          <span>{tax}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Local Tax Offices */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Tax Offices in Port Harcourt
                </h2>
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
                          <Phone className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm text-muted-foreground">{office.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm text-muted-foreground">{office.hours}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  *Contact information may change. Please verify before visiting.
                </p>
              </section>

              {/* FAQ Section */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tax Tools */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                  Calculate Your Taxes
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Link to="/free-tax-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Free Tax Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Instant PIT/PAYE calculation
                    </p>
                  </Link>
                  <Link to="/small-company-exemption" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Small Company Checker
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      0% CIT eligibility test
                    </p>
                  </Link>
                  <Link to="/cit-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      CIT Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Company Income Tax guide
                    </p>
                  </Link>
                  <Link to="/vat-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      VAT Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      7.5% VAT calculations
                    </p>
                  </Link>
                  <Link to="/wht-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      WHT Reference
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Withholding tax rates
                    </p>
                  </Link>
                  <Link to="/tax-reforms-2026" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      2026 Tax Reforms
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      What changed this year
                    </p>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Ready to Calculate Your Taxes?"
                subtext="Get accurate tax calculations with 2026 rules. Built right here in Port Harcourt for Nigerian businesses."
                primaryText="Start Calculating"
                primaryLink="/free-tax-calculator"
                secondaryText="View Business Tools"
                secondaryLink="/calculator"
              />

              {/* Disclaimer */}
              <SEODisclaimer />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PortHarcourtGuide;
