import { SEOHead, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { BlogCard, type BlogPostMeta } from '@/components/blog/BlogCard';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const POSTS: BlogPostMeta[] = [
  {
    slug: 'pit-myths-2026',
    title: '7 PIT Myths Nigerians Still Believe in 2026',
    excerpt: 'The Nigeria Tax Act 2025 rewrote the PIT rules — but dangerous misconceptions persist. We debunk seven myths that could cost you money or trigger penalties.',
    date: 'March 5, 2026',
    category: 'Guides',
    readTime: '8 min read',
  },
  {
    slug: 'tax-reforms-2026-summary',
    title: 'Nigeria Tax Reforms 2026: Complete Summary',
    excerpt: 'Everything that changed under the Nigeria Tax Act 2025 — new PIT bands, CIT thresholds, Rent Relief, Development Levy, and what it means for you.',
    date: 'February 8, 2026',
    category: 'Tax Reforms',
    readTime: '8 min read',
  },
  {
    slug: 'vat-guide-nigeria',
    title: 'VAT Guide for Nigerian Businesses',
    excerpt: 'Registration threshold, filing deadlines, exempt items, input vs output VAT, and penalties — everything you need for VAT compliance in 2026.',
    date: 'February 9, 2026',
    category: 'VAT',
    readTime: '10 min read',
  },
  {
    slug: 'wht-explained',
    title: 'Withholding Tax (WHT) Explained',
    excerpt: 'WHT rates by payment type, credit notes, final tax treatment, non-resident WHT, and remittance deadlines for Nigerian businesses.',
    date: 'February 9, 2026',
    category: 'WHT',
    readTime: '10 min read',
  },
  {
    slug: 'payroll-tax-guide',
    title: 'Payroll Tax Guide for Employers',
    excerpt: 'PAYE calculation under 2026 bands, pension contributions, NHF, ITF, NSITF, Rent Relief, and monthly filing deadlines for Nigerian employers.',
    date: 'February 9, 2026',
    category: 'Payroll',
    readTime: '10 min read',
  },
  {
    slug: 'tax-calendar-2026',
    title: 'Tax Calendar 2026: Key Deadlines',
    excerpt: 'Month-by-month guide to every CIT, VAT, WHT, PAYE, and pension filing deadline — with penalties for late filing.',
    date: 'February 9, 2026',
    category: 'Guides',
    readTime: '8 min read',
  },
  {
    slug: 'small-company-cit-exemption',
    title: '0% CIT for Small Companies: Complete Guide',
    excerpt: 'How to qualify for the Small Company Exemption under the 2026 rules. Turnover threshold doubled to ₦50M — here\'s everything you need to know.',
    date: 'February 5, 2026',
    category: 'Guides',
    readTime: '7 min read',
  },
  {
    slug: 'pit-paye-guide-2026',
    title: 'PIT & PAYE Calculator Guide 2026',
    excerpt: 'Step-by-step walkthrough of personal income tax under the new 2026 bands. Includes worked Naira examples and Rent Relief integration.',
    date: 'January 30, 2026',
    category: 'Guides',
    readTime: '7 min read',
  },
  {
    slug: 'tax-guide-tech-startups',
    title: 'Tax Guide for Tech Startups in Nigeria',
    excerpt: 'CIT, VAT, WHT, PAYE — which taxes apply to your startup? A practical guide covering the Small Company Exemption, EDI incentives (formerly Pioneer Status), and payroll.',
    date: 'January 25, 2026',
    category: 'Guides',
    readTime: '8 min read',
  },
];

const CATEGORIES = ['All', 'Tax Reforms', 'Guides', 'VAT', 'WHT', 'Payroll'];

const Blog = () => {
  const [category, setCategory] = useState('All');
  const filtered = category === 'All' ? POSTS : POSTS.filter((p) => p.category === category);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'TaxForge NG Blog',
    description: 'Expert articles on Nigerian tax rules, 2026 reforms, and practical guides for individuals and businesses.',
    url: 'https://taxforgeng.com/blog',
    breadcrumb: createBreadcrumbSchema([
      { name: 'Home', url: 'https://taxforgeng.com/' },
      { name: 'Blog', url: 'https://taxforgeng.com/blog' },
    ]),
  };

  return (
    <>
      <SEOHead
        title="Nigerian Tax Blog 2026 - Expert Guides & Analysis | TaxForge"
        description="Expert articles on Nigerian tax reforms, PIT/PAYE guides, CIT exemptions, and practical tax advice for individuals and businesses in 2026."
        canonicalPath="/blog"
        keywords="Nigeria tax blog, tax reform articles, PIT guide Nigeria, CIT guide 2026, Nigerian tax advice"
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
                { label: 'Blog' },
              ]} />
              <ContentMeta published="2026-01-25" publishedLabel="January 25, 2026" updated="2026-02-13" updatedLabel="February 13, 2026" />

              <header>
                <SEOHero
                  badge="Blog"
                  title="Nigerian Tax Insights"
                  titleHighlight="Expert Guides"
                  subtitle="In-depth articles on the 2026 tax reforms, practical guides, and worked examples to help you navigate Nigerian taxes."
                />
              </header>

              {/* Category filter */}
              <div className="flex gap-2 mb-8 flex-wrap justify-center">
                {CATEGORIES.map((c) => (
                  <Badge
                    key={c}
                    variant={c === category ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-1.5 text-sm"
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>

              {/* Post grid */}
              <div className="grid gap-6 md:grid-cols-2 mb-12">
                {filtered.map((post) => (
                  <BlogCard key={post.slug} {...post} />
                ))}
              </div>

              <CTASection
                variant="gradient"
                headline="Ready to Calculate?"
                subtext="Use our free calculator to see your 2026 tax breakdown instantly."
                primaryText="Calculate Now"
                primaryLink="/individual-calculator"
                secondaryText="View FAQ"
                secondaryLink="/faq"
              />

              <SEODisclaimer />
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default Blog;
