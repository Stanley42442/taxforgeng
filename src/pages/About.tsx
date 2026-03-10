import { Link } from 'react-router-dom';
import { SEOHead, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { MapPin, Target, Zap, Shield, Users, Calculator, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';

const About = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'TaxForge NG',
        alternateName: 'OptiSolve Labs',
        url: 'https://taxforgeng.com',
        description: 'Free Nigerian tax calculator and compliance platform built in Port Harcourt, Rivers State.',
        founder: { '@type': 'Person', name: 'Gillespie Benjamin Mclee' },
        address: { '@type': 'PostalAddress', addressLocality: 'Port Harcourt', addressRegion: 'Rivers State', addressCountry: 'NG' },
        areaServed: { '@type': 'Country', name: 'Nigeria' },
      },
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'About', url: 'https://taxforgeng.com/about' },
      ]),
    ],
  };

  const stats = [
    { value: '2,300+', label: 'Businesses Served' },
    { value: '₦4.2B+', label: 'Tax Calculated' },
    { value: '30+', label: 'Free Tools' },
    { value: '2026', label: 'Rules Compliant' },
  ];

  const values = [
    { icon: Target, title: 'Accuracy First', description: 'Every calculation is built on NRS-compliant formulas verified against the Nigeria Tax Act 2025. We cross-reference with Big 4 publications to ensure correctness.' },
    { icon: Zap, title: 'Simplicity', description: 'Tax doesn\'t have to be complicated. We translate complex tax legislation into plain language and intuitive tools that anyone can use — no accounting degree required.' },
    { icon: Shield, title: 'Transparency', description: 'We show you exactly how every number is calculated. Our Tax Logic Reference page documents every formula, rate, and threshold used across the platform.' },
    { icon: Users, title: 'Accessibility', description: 'Core tax calculations are free forever. We believe every Nigerian — from a market trader in Kano to a tech startup in Lagos — deserves accurate tax information.' },
  ];

  return (
    <>
      <SEOHead
        title="About TaxForge NG - Nigerian Tax Calculator | Port Harcourt"
        description="TaxForge NG is a free Nigerian tax calculator built in Port Harcourt by OptiSolve Labs. Learn about our mission to simplify tax compliance for every Nigerian."
        canonicalPath="/about"
        keywords="about TaxForge NG, Nigerian tax calculator, OptiSolve Labs, Port Harcourt tax, Gillespie Benjamin Mclee"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <article className="max-w-4xl mx-auto">
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'About' },
              ]} />
              <ContentMeta published="2025-06-01" publishedLabel="June 1, 2025" updated="2026-02-13" updatedLabel="February 13, 2026" />

              <header>
                <SEOHero
                  badge="About Us"
                  title="Making Nigerian Taxes"
                  titleHighlight="Simple & Accurate"
                  subtitle="TaxForge NG is a free, NRS-compliant tax calculator built by Gillespie Benjamin Mclee (OptiSolve Labs) in Port Harcourt, Rivers State — for every Nigerian business and individual."
                />
              </header>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {stats.map((stat, i) => (
                  <div key={i} className="glass-frosted rounded-2xl p-5 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Origin Story */}
              <section className="mb-12">
                <div className="glass-frosted rounded-2xl p-6 md:p-8 border-l-4 border-success">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">Our Story</h2>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        TaxForge NG was born out of frustration. In 2025, while helping a small business in Port Harcourt file their taxes, Gillespie realised there was no simple, free tool that could accurately calculate Nigerian taxes under the constantly changing rules. Every existing solution was either expensive, outdated, or too complex for the average SME owner.
                      </p>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        So he built one. Starting with a basic CIT calculator, TaxForge NG grew into a comprehensive platform covering Personal Income Tax (PIT), Company Income Tax (CIT), Value Added Tax (VAT), Withholding Tax (WHT), payroll processing, and more — all updated for the landmark Nigeria Tax Act 2025 (effective 2026).
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Today, TaxForge NG serves thousands of businesses across Nigeria, from sole traders in Kano to tech startups in Lagos. And it's still built and maintained from Port Harcourt, Rivers State — proof that world-class tech can come from anywhere in Nigeria.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Mission */}
              <section className="mb-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  To make Nigerian tax compliance <strong className="text-foreground">simple, accurate, and affordable</strong> for every individual and business — from first-time filers to seasoned accountants.
                </p>
              </section>

              {/* Values */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">What We Stand For</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {values.map((v, i) => (
                    <div key={i} className="glass-frosted rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <v.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{v.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* What We Offer */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">What We Offer</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { icon: Calculator, title: 'Tax Calculators', desc: 'PIT, CIT, VAT, WHT — all NRS-compliant for 2026', link: '/free-tax-calculator' },
                    { icon: Users, title: 'Payroll Management', desc: 'Bulk PAYE, pension, NHF, payslip generation', link: '/payroll' },
                    { icon: BarChart3, title: 'Reports & Filing', desc: 'PDF exports, P&L statements, e-filing prep', link: '/business-report' },
                  ].map((item, i) => (
                    <Link key={i} to={item.link} className="glass-frosted rounded-2xl p-5 hover-lift transition-all group">
                      <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Technology */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Built With Modern Technology</h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      'React & TypeScript for a fast, reliable interface',
                      'Real-time calculations with no server round-trips',
                      'Progressive Web App — works offline on mobile',
                      'Bank-grade encryption for all stored data',
                      'Automated test suites for calculation accuracy',
                      'Accessible design (WCAG 2.1 guidelines)',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Links */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">Explore More</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { to: '/team', title: 'Meet the Team', desc: 'The people behind TaxForge NG' },
                    { to: '/blog', title: 'Read the Blog', desc: 'Expert Nigerian tax guides' },
                    { to: '/pricing', title: 'View Pricing', desc: 'Free core + premium tiers' },
                  ].map((link) => (
                    <Link key={link.to} to={link.to} className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                        {link.title} <ArrowRight className="h-3 w-3" />
                      </h3>
                      <p className="text-sm text-muted-foreground">{link.desc}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <CTASection
                variant="gradient"
                headline="Start Calculating Today"
                subtext="Free, accurate, and built for Nigeria."
                primaryText="Try the Calculator"
                primaryLink="/individual-calculator"
                secondaryText="View All Tools"
                secondaryLink="/free-tax-calculator"
              />

              <SEODisclaimer />
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default About;
