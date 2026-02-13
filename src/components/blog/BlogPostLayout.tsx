import { ReactNode } from 'react';
import { SEOHead, createArticleSchema, createFAQSchema, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { AuthorBox } from './AuthorBox';
import { TableOfContents } from './TableOfContents';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface RelatedPost {
  title: string;
  slug: string;
}

interface RelatedTool {
  title: string;
  to: string;
}

export interface BlogPostLayoutProps {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  keywords: string;
  badge?: string;
  datePublished: string;
  dateModified: string;
  toc: { id: string; label: string }[];
  faqs: FAQ[];
  relatedPosts: RelatedPost[];
  relatedTools?: RelatedTool[];
  ctaHeadline?: string;
  ctaSubtext?: string;
  ctaPrimaryLink?: string;
  children: ReactNode;
}

export const BlogPostLayout = ({
  title,
  titleHighlight,
  subtitle,
  seoTitle,
  seoDescription,
  canonicalPath,
  keywords,
  badge = 'Blog',
  datePublished,
  dateModified,
  toc,
  faqs,
  relatedPosts,
  relatedTools,
  ctaHeadline,
  ctaSubtext,
  ctaPrimaryLink = '/individual-calculator',
  children,
}: BlogPostLayoutProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      createArticleSchema(seoTitle, seoDescription, datePublished, dateModified, `https://taxforgeng.com${canonicalPath}`),
      createFAQSchema(faqs),
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Blog', url: 'https://taxforgeng.com/blog' },
        { name: title, url: `https://taxforgeng.com${canonicalPath}` },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        keywords={keywords}
        schema={schema}
        ogType="article"
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
                { label: 'Blog', href: '/blog' },
                { label: title },
              ]} />
              <ContentMeta published={datePublished} publishedLabel={datePublished} updated={dateModified} updatedLabel={dateModified} />

              <header>
                <SEOHero badge={badge} title={title} titleHighlight={titleHighlight} subtitle={subtitle} />
              </header>

              <AuthorBox date={datePublished} updated={dateModified} />

              <TableOfContents items={toc} />

              {/* Article content */}
              <div className="prose-custom space-y-8 mb-12">
                {children}
              </div>

              {/* FAQ Section */}
              {faqs.length > 0 && (
                <section className="mb-12" id="faq">
                  <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <div key={i} className="glass-frosted rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-xl font-bold text-foreground mb-4">Related Articles</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {relatedPosts.map((post) => (
                      <Link
                        key={post.slug}
                        to={`/blog/${post.slug}`}
                        className="glass-frosted rounded-xl p-4 hover-lift transition-all group"
                      >
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm flex items-center gap-2">
                          {post.title} <ArrowRight className="h-3 w-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Tools */}
              {relatedTools && relatedTools.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-xl font-bold text-foreground mb-4">Related Tools</h2>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {relatedTools.map((tool) => (
                      <Link
                        key={tool.to}
                        to={tool.to}
                        className="glass-frosted rounded-xl p-4 hover-lift transition-all group"
                      >
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm flex items-center gap-2">
                          {tool.title} <ArrowRight className="h-3 w-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <CTASection
                variant="gradient"
                headline={ctaHeadline || 'Try the Calculator Now'}
                subtext={ctaSubtext || 'Get your personalised tax breakdown in seconds.'}
                primaryText="Calculate Now"
                primaryLink={ctaPrimaryLink}
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
