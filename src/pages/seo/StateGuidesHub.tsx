import { Link } from 'react-router-dom';
import { SEOHead, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { SEOHero } from '@/components/seo/SEOHero';
import { CTASection } from '@/components/seo/CTASection';
import { SEODisclaimer } from '@/components/seo/SEODisclaimer';
import { PageBreadcrumbs } from '@/components/seo/PageBreadcrumbs';
import { ContentMeta } from '@/components/seo/ContentMeta';
import { MapPin, ArrowRight } from 'lucide-react';

const states = [
  { name: 'Port Harcourt', region: 'Rivers State', to: '/port-harcourt-tax-guide', tagline: 'Nigeria\'s oil capital — oil & gas, maritime, manufacturing sector focus.', highlights: ['FIRS & RIRS dual registration', 'Oil & gas sector incentives', 'Free Trade Zone benefits'] },
  { name: 'Lagos', region: 'Lagos State', to: '/state-guides/lagos', tagline: 'Nigeria\'s commercial capital — tech, finance, and trade hub.', highlights: ['LIRS state obligations', 'Tech startup incentives', 'Highest PAYE volume in Nigeria'] },
  { name: 'Abuja', region: 'FCT', to: '/state-guides/abuja', tagline: 'Federal Capital Territory — government contracts and diplomatic sector.', highlights: ['FCT-IRS unique structure', 'Government contractor WHT', 'Diplomatic exemptions'] },
  { name: 'Kano', region: 'Kano State', to: '/state-guides/kano', tagline: 'Northern Nigeria\'s commercial centre — trade, agriculture, and textiles.', highlights: ['KIRS registration', 'Agricultural exemptions', 'Cross-border trade taxes'] },
];

const StateGuidesHub = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Nigerian State Tax Guides 2026',
        description: 'State-by-state tax guides for Nigerian businesses. Port Harcourt, Lagos, Abuja, and Kano — local IRS info, sector tips, and compliance advice.',
        url: 'https://taxforgeng.com/state-guides',
      },
      createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'State Guides', url: 'https://taxforgeng.com/state-guides' },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title="Nigerian State Tax Guides 2026 - Lagos, Abuja, PH, Kano | TaxForge"
        description="State-by-state tax guides for Nigerian businesses. Local IRS info, sector-specific tips, and compliance advice for Lagos, Abuja, Port Harcourt, and Kano."
        canonicalPath="/state-guides"
        keywords="Nigerian state tax guide, Lagos tax, Abuja tax, Port Harcourt tax, Kano tax, state IRS Nigeria"
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
                { label: 'State Guides' },
              ]} />
              <ContentMeta published="2026-02-09" publishedLabel="February 9, 2026" updated="2026-02-13" updatedLabel="February 13, 2026" />

              <header>
                <SEOHero
                  badge="State Guides"
                  title="Tax Guides by State"
                  titleHighlight="Local Compliance Tips"
                  subtitle="Federal taxes are the same nationwide, but state obligations differ. Choose your state for local IRS info, sector advice, and common mistakes to avoid."
                />
              </header>

              <div className="grid gap-6 md:grid-cols-2 mb-12">
                {states.map((s) => (
                  <Link key={s.to} to={s.to} className="glass-frosted rounded-2xl p-6 hover-lift transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{s.name}</h2>
                        <p className="text-xs text-muted-foreground">{s.region}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{s.tagline}</p>
                    <ul className="space-y-1 mb-4">
                      {s.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <span className="text-sm font-medium text-primary flex items-center gap-1">
                      Read Guide <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>

              <CTASection
                variant="gradient"
                headline="Calculate Your Taxes"
                subtext="Use our free calculator with 2026 rules — works for any state."
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

export default StateGuidesHub;
