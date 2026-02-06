import { Link } from 'react-router-dom';
import { SEOHead, createWebApplicationSchema, createFAQSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { QuickTaxCalculator } from '@/components/seo/QuickTaxCalculator';
import { StatsCounter } from '@/components/seo/StatsCounter';
import { ComparisonTable, PIT_COMPARISON_ROWS } from '@/components/seo/ComparisonTable';
import { CheckCircle2, Zap, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FreeCalculator = () => {
  const faqs = [
    {
      question: 'Is this calculator really free?',
      answer: 'Yes! Our personal tax calculator is completely free to use with no signup required. You can calculate your Nigerian PIT, PAYE, and see your tax savings instantly.',
    },
    {
      question: 'How accurate are the results?',
      answer: 'Our calculator uses the official Nigeria Tax Act 2025 (effective 2026) tax bands and rules. Results are verified against FIRS guidelines and Big 4 accounting firm publications.',
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No account is needed for basic calculations. Sign up only if you want to save your calculations, generate PDF reports, or access business tax features.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createWebApplicationSchema(
        'Free Nigerian Tax Calculator 2026',
        'Calculate your Nigerian personal income tax instantly with 2026 rules. Free PIT, PAYE calculator - no signup required.'
      ),
      createFAQSchema(faqs),
    ],
  };

  return (
    <>
      <SEOHead
        title="Free Nigerian Tax Calculator 2026 - No Login Required | TaxForge"
        description="Calculate your Nigerian taxes instantly. Free CIT, PIT, PAYE calculator with 2026 rules. No signup, no card. Accurate FIRS-compliant results."
        canonicalPath="/free-tax-calculator"
        keywords="Nigerian tax calculator, free tax calculator Nigeria, PAYE calculator, PIT calculator Nigeria 2026, Nigeria Tax Act 2025"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="fixed top-20 left-10 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-float-slow pointer-events-none" />
        <div className="fixed bottom-20 right-10 w-64 h-64 rounded-full bg-accent/12 blur-3xl animate-float pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              {/* Hero */}
              <SEOHero
                title="Calculate Your Nigerian Tax"
                titleHighlight="In 30 Seconds - Free"
                subtitle="Get instant, accurate tax calculations with 2026 rules. No signup required. See how much you save under the new tax regime."
              />

              {/* Trust Badges */}
              <div className="mb-10 animate-slide-up-delay-2">
                <TrustBadges />
              </div>

              {/* Quick Calculator */}
              <div className="mb-12">
                <QuickTaxCalculator showComparison={true} />
              </div>

              {/* Why Free Section */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Why Use TaxForge Calculator?
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    {
                      icon: Zap,
                      title: 'Instant Results',
                      description: 'No waiting. Get your tax calculation the moment you enter your income.',
                    },
                    {
                      icon: Lock,
                      title: 'No Signup Required',
                      description: 'Use immediately without creating an account or providing personal details.',
                    },
                    {
                      icon: CheckCircle2,
                      title: 'FIRS Compliant',
                      description: 'Calculations verified against Nigeria Tax Act 2025 and FIRS guidelines.',
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="glass-frosted rounded-2xl p-6 text-center hover-lift transition-all"
                    >
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground mb-4 shadow-lg">
                        <feature.icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Stats Counter */}
              <section className="mb-12">
                <StatsCounter />
              </section>

              {/* 2026 Changes Comparison */}
              <section className="mb-12">
                <ComparisonTable
                  title="2026 Tax Rules: What Changed?"
                  rows={PIT_COMPARISON_ROWS}
                />
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

              {/* More Tools */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                  Explore More Tax Tools
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/calculator" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Business Tax Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate CIT, VAT, WHT for Nigerian businesses
                    </p>
                  </Link>
                  <Link to="/small-company-exemption" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Small Company Exemption Checker
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      See if you qualify for 0% Company Income Tax
                    </p>
                  </Link>
                  <Link to="/rent-relief-2026" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Rent Relief Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate your 20% rent relief (max ₦500k)
                    </p>
                  </Link>
                  <Link to="/tax-reforms-2026" className="glass-frosted rounded-xl p-5 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      2026 Tax Reforms Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Everything you need to know about the new rules
                    </p>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Ready for a Detailed Breakdown?"
                subtext="Get your complete tax analysis with all reliefs, deductions, and a downloadable PDF report."
                primaryText="Get Full Tax Report"
                primaryLink="/individual-calculator"
                secondaryText="View Business Tools"
                secondaryLink="/calculator"
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FreeCalculator;
