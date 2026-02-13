import { Link } from 'react-router-dom';
import { SEOHead, createArticleSchema, createBreadcrumbSchema, createHowToSchema, createFAQSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { TrustBadges } from '@/components/seo/TrustBadges';
import { StatsCounter } from '@/components/seo/StatsCounter';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { 
  Building2, 
  Home, 
  Wallet, 
  TrendingUp, 
  FileText,
  ArrowRight,
  CheckCircle2,
  Users,
  Calculator,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const TaxReforms2026 = () => {
  const howToSteps = [
    { name: 'Check Your Income Against New PIT Bands', text: 'Compare your annual income to the new 2026 bands. The first ₦800,000 is now tax-free, with progressive rates of 15%, 18%, 21%, 23%, and 25%.' },
    { name: 'Review Your Company\'s CIT Eligibility', text: 'If your company has turnover ≤₦50M AND assets ≤₦250M, you qualify for 0% CIT. All other companies pay 30%. Professional service firms cannot qualify as small companies.' },
    { name: 'Calculate Your Rent Relief Entitlement', text: 'If you pay rent, you can now claim 20% of annual rent (max ₦500,000) as a deduction. This replaces the old Consolidated Relief Allowance.' },
    { name: 'Understand the Development Levy Impact', text: 'Companies (except small) now pay a 4% Development Levy on profits, replacing the old 3% Tertiary Education Tax. Budget accordingly.' },
    { name: 'Update Your Compliance Calendar', text: 'Review filing deadlines: PAYE remitted by the 10th monthly, CIT within 6 months of year-end, VAT by the 21st monthly.' },
  ];

  const faqs = [
    {
      question: 'When did the 2026 tax reforms take effect?',
      answer: 'The Nigeria Tax Act 2025 was signed into law in 2025 and takes effect from January 1, 2026. All 2026 tax assessments use the new rules.',
    },
    {
      question: 'Do the old CRA rules still apply in 2026?',
      answer: 'No. The Consolidated Relief Allowance (CRA) has been abolished. Under 2026 rules, taxpayers benefit from the ₦800,000 tax-free threshold and specific reliefs like Rent Relief instead.',
    },
    {
      question: 'Do all small businesses automatically get 0% CIT?',
      answer: 'No. You must meet BOTH criteria: annual turnover ≤₦50 million AND total fixed assets ≤₦250 million. The asset test is often overlooked — a company with ₦40M turnover but ₦300M in assets does NOT qualify.',
    },
    {
      question: 'What is the Development Levy and how is it different from TET?',
      answer: 'The Development Levy is 4% of assessable profits, replacing the old Tertiary Education Tax (TET) which was 3%. It applies to all companies except those qualifying for the small company exemption.',
    },
    {
      question: 'Are the new rules applied retroactively to 2025?',
      answer: 'No. The 2026 rules apply only to income earned from January 1, 2026 onwards. Income earned in 2025 is taxed under the previous regime, even if the return is filed in 2026.',
    },
    {
      question: 'How do state taxes interact with the new federal rules?',
      answer: 'Personal Income Tax for employees is collected at the state level (where the employee resides). The 2026 PIT bands apply federally but are administered by State Internal Revenue Services (SIRS). Company Income Tax remains fully federal under FIRS.',
    },
    {
      question: 'What happens to tax assessments that straddle the transition?',
      answer: 'For companies with accounting years spanning the transition (e.g., July 2025 to June 2026), the old rules generally apply to profits earned before January 2026, and new rules apply from January 2026 onwards.',
    },
    {
      question: 'Will filing deadlines change under the new rules?',
      answer: 'Core deadlines remain similar: CIT returns within 6 months of year-end, VAT monthly by the 21st, PAYE by the 10th. However, the introduction of the Development Levy means an additional computation is required alongside CIT.',
    },
  ];

  const keyReforms = [
    {
      icon: Building2,
      title: 'Small Company Exemption',
      description: 'Companies with turnover ≤₦50M and assets ≤₦250M pay 0% CIT',
      link: '/small-company-exemption',
      color: 'success',
      benefit: 'Up to ₦15M saved annually',
    },
    {
      icon: Home,
      title: 'Rent Relief',
      description: '20% of annual rent is deductible, capped at ₦500,000',
      link: '/rent-relief-2026',
      color: 'primary',
      benefit: 'Replaces old CRA',
    },
    {
      icon: Wallet,
      title: 'New PIT Bands',
      description: 'First ₦800k tax-free, progressive rates 15%-25%',
      link: '/pit-paye-calculator',
      color: 'accent',
      benefit: 'Most earners pay less',
    },
    {
      icon: TrendingUp,
      title: 'Development Levy',
      description: '4% levy replaces Tertiary Education Tax for companies',
      link: '/calculator',
      color: 'warning',
      benefit: 'Applies to companies only',
    },
    {
      icon: FileText,
      title: 'WHT as Final Tax',
      description: 'Withholding tax can now serve as final tax in some cases',
      link: '/documentation',
      color: 'muted',
      benefit: 'Simplified compliance',
    },
  ];

  const beneficiaries = [
    { group: 'Small Business Owners', benefit: 'Companies with turnover under ₦50M can pay ZERO company income tax', icon: Building2 },
    { group: 'Employees Under ₦3M', benefit: 'New tax-free threshold of ₦800k means significant tax savings', icon: Users },
    { group: 'Renters in High-Cost Areas', benefit: 'Claim up to ₦500k tax relief on your annual rent', icon: Home },
    { group: 'Middle-Income Earners', benefit: 'Progressive rates mean fairer taxation at every level', icon: Wallet },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema(
        'Nigeria Tax Reforms 2026 - Complete Guide to Changes',
        'Everything changing in Nigerian tax from 2026: small company exemption, rent relief, new PIT bands, development levy, and more from Nigeria Tax Act 2025.',
        '2026-01-01',
        '2026-02-09'
      ),
      createHowToSchema(
        'How These 2026 Tax Reforms Affect You',
        'Step-by-step guide to understanding how the Nigeria Tax Act 2025 reforms impact your personal and business taxes.',
        howToSteps
      ),
      createFAQSchema(faqs),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Tax Tools', url: 'https://taxforgeng.com/free-tax-calculator' },
        { name: '2026 Tax Reforms', url: 'https://taxforgeng.com/tax-reforms-2026' },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title="Nigeria Tax Reforms 2026 - Complete Guide to Changes | TaxForge"
        description="Everything changing in Nigerian tax from 2026. Small company exemption, rent relief, new PIT bands, and more from Nigeria Tax Act 2025."
        canonicalPath="/tax-reforms-2026"
        keywords="Nigeria tax reforms 2026, Nigeria Tax Act 2025, Nigerian tax changes, 2026 tax rules Nigeria, NRS 2026, FIRS 2026"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="fixed top-20 left-10 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-float-slow pointer-events-none" />
        <div className="fixed top-60 right-10 w-64 h-64 rounded-full bg-accent/12 blur-3xl animate-float pointer-events-none" />
        <div className="fixed bottom-20 left-1/4 w-72 h-72 rounded-full bg-success/6 blur-3xl animate-float-slow pointer-events-none" />

        <main className="relative z-10 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <article className="max-w-5xl mx-auto">
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Tax Tools', href: '/free-tax-calculator' },
                { label: '2026 Tax Reforms' },
              ]} />
              <ContentMeta published="2026-01-01" publishedLabel="January 1, 2026" updated="2026-02-13" updatedLabel="February 13, 2026" />

              <TableOfContents items={[
                { id: 'key-reforms', label: '5 Key Reforms You Need to Know' },
                { id: 'how-it-works', label: 'How These Reforms Affect You' },
                { id: 'common-mistakes', label: 'Common Transition Mistakes' },
                { id: 'who-benefits', label: 'Who Benefits Most?' },
                { id: 'timeline', label: 'Implementation Timeline' },
                { id: 'faq', label: 'Frequently Asked Questions' },
              ]} />

              <header>
                {/* Hero */}
                <SEOHero
                  badge="Nigeria Tax Act 2025"
                  title="Everything Changing in"
                  titleHighlight="Nigerian Tax from 2026"
                  subtitle="The most significant tax reform in years. Understand how the new rules affect your personal income and business taxes."
                />

                {/* Trust Badges */}
                <div className="mb-12 animate-slide-up-delay-2">
                  <TrustBadges
                    badges={[
                      { icon: 'check', text: 'Official NRS Rules' },
                      { icon: 'shield', text: 'Nigeria Tax Act 2025' },
                      { icon: 'clock', text: 'Effective January 2026' },
                    ]}
                  />
                </div>
              </header>

              {/* Key Reforms Grid */}
              <section id="key-reforms" className="mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  5 Key Reforms You Need to Know
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {keyReforms.map((reform, index) => (
                    <Link
                      key={index}
                      to={reform.link}
                      className="glass-frosted rounded-2xl p-6 hover-lift transition-all group relative overflow-hidden"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-${reform.color}/10 blur-2xl -translate-y-1/2 translate-x-1/2`} />
                      <div className="relative">
                        <div className={`h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                          <reform.icon className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {reform.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{reform.description}</p>
                        <span className="inline-flex items-center text-sm font-medium text-success">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {reform.benefit}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* How These Reforms Affect You */}
              <section id="how-it-works" className="mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  How These Reforms Affect You
                </h2>
                <div className="space-y-4">
                  {howToSteps.map((step, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-5 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{step.name}</h3>
                        <p className="text-sm text-muted-foreground">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Common Mistakes */}
              <section id="common-mistakes" className="mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Common Mistakes During the Transition
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      mistake: 'Assuming old CRA still applies',
                      fix: 'The Consolidated Relief Allowance is abolished in 2026. Use the new ₦800k tax-free threshold and specific reliefs (Rent Relief, pension, NHF) instead.',
                    },
                    {
                      mistake: 'Thinking all small businesses get 0% CIT automatically',
                      fix: 'The asset test matters! Your company must have turnover ≤₦50M AND fixed assets ≤₦250M. A business with ₦30M turnover but ₦400M in property does NOT qualify.',
                    },
                    {
                      mistake: 'Ignoring the Development Levy as a "new" cost',
                      fix: 'The 4% Development Levy replaces the 3% TET, so it\'s a 1% increase for companies. Budget for this additional cost in your tax planning.',
                    },
                    {
                      mistake: 'Not updating filing procedures',
                      fix: 'While core deadlines haven\'t changed, the computation process has. Ensure your accountant or payroll system is updated for the new PIT bands and CIT categories.',
                    },
                  ].map((item, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <h3 className="font-semibold text-destructive">{item.mistake}</h3>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{item.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Stats Section */}
              <section className="mb-14">
                <StatsCounter />
              </section>

              {/* Who Benefits Most */}
              <section id="who-benefits" className="mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Who Benefits Most?
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {beneficiaries.map((item, index) => (
                    <div key={index} className="glass-frosted rounded-xl p-6 flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
                        <item.icon className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{item.group}</h3>
                        <p className="text-sm text-muted-foreground">{item.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Timeline */}
              <section id="timeline" className="mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Implementation Timeline
                </h2>
                <div className="glass-frosted rounded-2xl p-6 md:p-8">
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-success to-accent hidden md:block" />
                    <div className="space-y-8">
                      {[
                        { date: '2025', title: 'Nigeria Tax Act 2025 Signed', description: 'New tax law passed by the National Assembly and signed into law' },
                        { date: 'Jan 2026', title: 'New Rules Take Effect', description: 'All 2026 tax rules become effective for new tax year' },
                        { date: 'Mar 2026', title: 'First Filing Deadline', description: 'Employers remit January/February PAYE under new rules' },
                        { date: 'Jul 2026', title: 'Company Tax Returns', description: 'First annual returns filed under new CIT rules' },
                      ].map((event, index) => (
                        <div key={index} className="relative md:pl-16">
                          <div className="hidden md:flex absolute left-0 h-12 w-12 rounded-full bg-gradient-primary items-center justify-center text-primary-foreground font-bold text-xs shadow-lg">
                            {event.date}
                          </div>
                          <div className="glass rounded-xl p-5">
                            <span className="md:hidden text-sm font-semibold text-primary mb-1 block">{event.date}</span>
                            <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ Section - Accordion */}
              <section id="faq" className="mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="glass-frosted rounded-2xl p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left text-foreground hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>

              {/* Quick Links to All Tools */}
              <section className="mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Tax Calculators & Tools
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { title: 'Personal Tax Calculator', desc: 'PIT with all 2026 reliefs', link: '/individual-calculator', icon: Wallet },
                    { title: 'Business Tax Calculator', desc: 'CIT, VAT, WHT', link: '/calculator', icon: Building2 },
                    { title: 'Rent Relief Calculator', desc: '20% relief, max ₦500k', link: '/rent-relief-2026', icon: Home },
                    { title: 'Small Company Checker', desc: '0% CIT eligibility', link: '/small-company-exemption', icon: CheckCircle2 },
                    { title: 'PIT/PAYE Guide', desc: 'New tax bands explained', link: '/pit-paye-calculator', icon: FileText },
                    { title: 'Free Quick Calculator', desc: 'Instant tax estimate', link: '/free-tax-calculator', icon: Calculator },
                  ].map((tool, index) => (
                    <Link
                      key={index}
                      to={tool.link}
                      className="glass-frosted rounded-xl p-5 hover-lift transition-all group flex items-start gap-3"
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{tool.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Learn More Section */}
              <section className="mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  Learn More
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/documentation" className="glass-frosted rounded-xl p-6 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors text-lg">
                      Full Documentation
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Comprehensive guide to all tax calculations, rules, and NRS requirements
                    </p>
                    <span className="text-primary text-sm font-medium inline-flex items-center">
                      Read Documentation <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </Link>
                  <Link to="/tax-logic" className="glass-frosted rounded-xl p-6 hover-lift transition-all group">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors text-lg">
                      Tax Logic Reference
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Technical details of how we calculate taxes with 2026 vs pre-2026 rules
                    </p>
                    <span className="text-primary text-sm font-medium inline-flex items-center">
                      View Tax Logic <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </Link>
                </div>
              </section>

              {/* Final CTA */}
              <CTASection
                variant="gradient"
                headline="Ready to Calculate Your Tax?"
                subtext="Start with a free assessment using our 2026-compliant calculators. No signup required."
                primaryText="Start Free Assessment"
                primaryLink="/free-tax-calculator"
                secondaryText="View Pricing"
                secondaryLink="/pricing"
              />

              {/* Disclaimer */}
              <SEODisclaimer />
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default TaxReforms2026;
