import { Link } from 'react-router-dom';
import { SEOHead, createWebApplicationSchema, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { FileText, QrCode, Download, Mail, Shield, Printer, CheckCircle2, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TaxReports = () => {
  const reportTypes = [
    {
      title: 'Personal Tax Summary',
      description: 'Complete breakdown of your PIT with all reliefs, deductions, and comparison with pre-2026 rules.',
      features: ['Net salary calculation', 'Rent Relief included', 'Tax band breakdown', 'Year comparison'],
      icon: FileText,
    },
    {
      title: 'Business Tax Report',
      description: 'Comprehensive CIT, VAT, WHT, and Development Levy calculations for your company.',
      features: ['CIT by company size', 'VAT summary', 'WHT credits', 'Development Levy'],
      icon: FileText,
    },
    {
      title: 'Payroll Summary',
      description: 'Bulk PAYE calculations for all employees with individual breakdowns.',
      features: ['Employee list', 'PAYE per employee', 'Total remittance', 'P9 form ready'],
      icon: FileText,
    },
    {
      title: 'Invoice Generation',
      description: 'Professional invoices with automatic VAT and WHT calculations.',
      features: ['Branded design', 'Auto VAT/WHT', 'Client management', 'Payment tracking'],
      icon: FileText,
    },
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: '₦0',
      period: 'forever',
      features: ['Basic PIT calculation', 'On-screen results', 'No PDF export', 'No saved history'],
      cta: 'Start Free',
      link: '/free-tax-calculator',
      highlight: false,
    },
    {
      name: 'Starter',
      price: '₦500',
      period: '/month',
      features: ['PDF tax reports', 'QR verification', 'Business calculator', 'Expense tracking', '5 saved businesses'],
      cta: 'Get Started',
      link: '/pricing',
      highlight: true,
    },
    {
      name: 'Business',
      price: '₦2,000',
      period: '/month',
      features: ['Everything in Starter', 'Invoice generation', 'OCR receipt scanning', 'Email delivery', '20 saved businesses'],
      cta: 'Upgrade',
      link: '/pricing',
      highlight: false,
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createWebApplicationSchema(
        'Nigerian Tax Reports & Invoices Generator',
        'Generate professional tax reports and invoices with QR verification. FIRS-compliant format. Download PDF instantly.'
      ),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Features', url: 'https://taxforgeng.com/pricing' },
        { name: 'Tax Reports', url: 'https://taxforgeng.com/tax-reports' },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title="Nigerian Tax Reports & Invoices - Professional PDFs | TaxForge"
        description="Generate FIRS-compliant tax reports with QR verification. Professional invoices, payroll summaries, P9 forms. Download PDF instantly."
        canonicalPath="/tax-reports"
        keywords="Nigerian tax report, tax invoice Nigeria, FIRS compliant report, QR verified tax document, PDF tax report Nigeria"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="fixed top-20 left-10 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-float-slow pointer-events-none" />
        <div className="fixed bottom-20 right-10 w-64 h-64 rounded-full bg-accent/8 blur-3xl animate-float pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              {/* Hero */}
              <SEOHero
                title="Professional Nigerian"
                titleHighlight="Tax Reports & Invoices"
                subtitle="Generate FIRS-compliant tax documents with QR code verification. Download professional PDF reports instantly."
              />

              {/* Trust Badges */}
              <div className="mb-10 animate-slide-up-delay-2">
                <TrustBadges
                  badges={[
                    { icon: 'shield', text: 'QR Verified' },
                    { icon: 'check', text: 'FIRS Compliant' },
                    { icon: 'clock', text: 'Instant Download' },
                  ]}
                />
              </div>

              {/* Key Features */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Why Choose TaxForge Reports?
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    {
                      icon: QrCode,
                      title: 'QR Verification',
                      description: 'Every report includes a unique QR code that links to verification page for authenticity.',
                    },
                    {
                      icon: Shield,
                      title: 'FIRS Compliant',
                      description: 'Reports follow official formats and include all required information for tax filing.',
                    },
                    {
                      icon: Download,
                      title: 'Instant PDF',
                      description: 'Generate and download professional reports immediately. No waiting, no email delays.',
                    },
                  ].map((feature, index) => (
                    <div key={index} className="glass-frosted rounded-2xl p-6 text-center hover-lift transition-all">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground mb-4 shadow-lg">
                        <feature.icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Report Types */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Available Report Types
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {reportTypes.map((report, index) => (
                    <div key={index} className="glass-frosted rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          <report.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-2">{report.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                          <ul className="space-y-1">
                            {report.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-success" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* What's Included */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  What's Included in Every Report
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      { icon: FileText, text: 'Professional branded design' },
                      { icon: QrCode, text: 'Unique QR verification code' },
                      { icon: Shield, text: 'Official disclaimers' },
                      { icon: Download, text: 'High-quality PDF format' },
                      { icon: Mail, text: 'Email delivery option' },
                      { icon: Printer, text: 'Print-optimized layout' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 glass rounded-xl">
                        <item.icon className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-sm text-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Pricing Comparison */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Choose Your Plan
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {pricingTiers.map((tier, index) => (
                    <div 
                      key={index} 
                      className={`glass-frosted rounded-2xl p-6 ${
                        tier.highlight ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                      }`}
                    >
                      {tier.highlight && (
                        <div className="flex items-center justify-center gap-1 text-xs font-semibold text-primary mb-4">
                          <Star className="h-3 w-3 fill-primary" />
                          MOST POPULAR
                        </div>
                      )}
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                          <span className="text-sm text-muted-foreground">{tier.period}</span>
                        </div>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link to={tier.link}>
                        <Button 
                          variant={tier.highlight ? 'glow' : 'outline'} 
                          className="w-full"
                        >
                          {tier.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>

              {/* How It Works */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How to Generate a Report
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="grid gap-6 md:grid-cols-4">
                    {[
                      { step: '1', title: 'Enter Details', desc: 'Input your income, expenses, or business data' },
                      { step: '2', title: 'Calculate', desc: 'Get instant results with full breakdown' },
                      { step: '3', title: 'Review', desc: 'Check all figures before generating' },
                      { step: '4', title: 'Download', desc: 'Get your QR-verified PDF report' },
                    ].map((step, index) => (
                      <div key={index} className="text-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <span className="text-lg font-bold text-primary-foreground">{step.step}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Related Tools */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                  Start Calculating
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/individual-calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Personal Tax Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate PIT/PAYE and generate personal tax report
                    </p>
                  </Link>
                  <Link to="/calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Business Tax Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate CIT, VAT, WHT with full business report
                    </p>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Get Your Professional Tax Report"
                subtext="Calculate your taxes and download a QR-verified PDF report in minutes."
                primaryText="Start Calculating"
                primaryLink="/individual-calculator"
                secondaryText="View Pricing"
                secondaryLink="/pricing"
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

export default TaxReports;
