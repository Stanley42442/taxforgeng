import { Link } from 'react-router-dom';
import { SEOHead, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { Download, FileText, Calculator, Calendar, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PageLayout } from '@/components/PageLayout';

const Resources = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Free Tax Resources & Downloads',
        description: 'Free Nigerian tax templates, checklists, and guides. 2026 reform summary, PAYE worksheets, VAT registration guide, and more.',
        url: 'https://taxforgeng.com/resources',
      },
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Resources', url: 'https://taxforgeng.com/resources' },
      ]),
    ],
  };

  const handleDownload = (name: string) => {
    toast.info(`${name} — PDF download coming soon!`, { description: 'We\'re preparing this resource. Check back shortly.' });
  };

  const downloads = [
    { title: '2026 Tax Reform Summary', description: 'One-page overview of every change under the Nigeria Tax Act 2025. PIT bands, CIT thresholds, Rent Relief, Development Levy.', icon: FileText },
    { title: 'Small Company Exemption Checklist', description: 'Step-by-step checklist to confirm your business qualifies for the 0% CIT rate under the ₦50M turnover threshold.', icon: CheckCircle2 },
    { title: 'PAYE Calculation Worksheet', description: 'Monthly PAYE worksheet with 2026 bands. Fill in gross salary, pension, Rent Relief to get net pay.', icon: Calculator },
    { title: 'VAT Registration Guide', description: 'Complete guide to VAT registration: who must register, how to apply, filing deadlines, and exempt categories.', icon: BookOpen },
    { title: 'WHT Rate Card 2026', description: 'Quick-reference card showing all Withholding Tax rates by payment type, for both individuals and companies.', icon: FileText },
    { title: 'Tax Filing Deadlines 2026', description: 'Month-by-month calendar of every CIT, VAT, WHT, and PAYE filing deadline for the 2026 tax year.', icon: Calendar },
  ];

  const tools = [
    { to: '/free-tax-calculator', title: 'Free Tax Calculator', desc: 'PIT/PAYE instant calculation' },
    { to: '/cit-calculator', title: 'CIT Calculator', desc: 'Company Income Tax guide' },
    { to: '/vat-calculator', title: 'VAT Calculator', desc: '7.5% VAT computations' },
    { to: '/wht-calculator', title: 'WHT Reference', desc: 'Withholding Tax rates' },
    { to: '/small-company-exemption', title: 'Small Company Checker', desc: '0% CIT eligibility' },
    { to: '/rent-relief-2026', title: 'Rent Relief Calculator', desc: '2026 Rent Relief' },
  ];

  const guides = [
    { to: '/blog/tax-reforms-2026-summary', title: 'Nigeria Tax Reforms 2026: Full Summary' },
    { to: '/blog/small-company-cit-exemption', title: '0% CIT for Small Companies Guide' },
    { to: '/blog/pit-paye-guide-2026', title: 'PIT & PAYE Guide 2026' },
    { to: '/blog/tax-guide-tech-startups', title: 'Tax Guide for Tech Startups' },
    { to: '/faq', title: '30+ Nigerian Tax FAQs Answered' },
    { to: '/tax-logic', title: 'Tax Logic Reference (All Formulas)' },
  ];

  return (
    <>
      <SEOHead
        title="Free Nigerian Tax Resources & Downloads 2026 | TaxForge"
        description="Download free Nigerian tax templates, checklists, and guides. 2026 reform summary, PAYE worksheets, VAT registration guide, WHT rate card, and more."
        canonicalPath="/resources"
        keywords="Nigerian tax resources, free tax templates Nigeria, PAYE worksheet, VAT registration guide, tax reform summary 2026"
        schema={schema}
      />

      <PageLayout maxWidth="4xl">
          <article>
              <PageBreadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Resources' },
              ]} />
              <ContentMeta published="2026-02-09" publishedLabel="9 February 2026" updated="2026-02-13" updatedLabel="13 February 2026" />

              <header>
                <SEOHero
                  badge="Resources"
                  title="Free Tax Templates"
                  titleHighlight="& Downloads"
                  subtitle="Checklists, worksheets, rate cards, and guides — everything you need for Nigerian tax compliance in 2026, completely free."
                />
              </header>

              {/* Downloadable Resources */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Downloadable Resources</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {downloads.map((item, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-6 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-bold text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow">{item.description}</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload(item.title)}>
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Online Tools */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Online Tax Tools</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {tools.map((tool) => (
                    <Link key={tool.to} to={tool.to} className="rounded-lg border border-border bg-card p-5 hover:border-primary/40 transition-all group">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                        {tool.title} <ArrowRight className="h-3 w-3" />
                      </h3>
                      <p className="text-sm text-muted-foreground">{tool.desc}</p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Guides & Articles */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">In-Depth Guides</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {guides.map((g) => (
                    <Link key={g.to} to={g.to} className="glass-frosted rounded-xl p-4 hover-lift transition-all group">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm flex items-center gap-2">
                        {g.title} <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <CTASection
                variant="gradient"
                headline="Calculate Your Taxes Now"
                subtext="Use our free calculator to get your 2026 tax breakdown instantly."
                primaryText="Calculate Now"
                primaryLink="/individual-calculator"
                secondaryText="View FAQ"
                secondaryLink="/faq"
              />

              <SEODisclaimer />
          </article>
      </PageLayout>
    </>
  );
};

export default Resources;
