

# Remaining SEO/AEO Improvements

## Status: What's Already Complete

All 7 items from the Grok prompt have been addressed:
1. Meta descriptions on homepage, calculator, pricing, blog, FAQ, all SEO pages, all blog posts, about, resources, state guides -- DONE
2. Alt text -- audited; site uses Lucide SVG icons (no alt needed), the 2 actual `<img>` tags already have alt text -- DONE
3. Schema markup (FAQPage, HowTo, Organization, BreadcrumbList) -- DONE across 21+ pages
4. Heading hierarchy -- homepage has `<h1>`, all other pages use PageLayout or SEOHero which provide `<h1>` -- DONE
5. Viewport meta tag -- already in index.html -- DONE
6. Canonical URLs -- set by SEOHead on every page that uses it -- DONE
7. robots.txt + sitemap.xml with AI crawler support -- DONE

## What Still Needs SEOHead (Public Pages Missing It)

Several public-facing pages indexed in sitemap.xml have NO dynamic SEO meta tags:

| Page | Route | Currently Has SEOHead? |
|------|-------|----------------------|
| Individual Calculator | `/individual-calculator` | NO |
| Advisory | `/advisory` | NO |
| Learn | `/learn` | NO |
| Tax Breakdown | `/tax-breakdown` | NO |
| Sector Guide | `/sector-guide` | NO |
| Roadmap | `/roadmap` | NO |
| Documentation | `/documentation` | NO |
| Tax Logic Reference | `/tax-logic` | NO |
| Results | `/results` | NO |

These pages rely on the static `index.html` title/description, which means Google sees the same generic meta for all of them -- hurting SEO.

## Recommended Changes

### 1. Add SEOHead to 9 remaining public pages

Each page gets:
- Unique `<title>` (60-70 chars, keyword-rich)
- Unique `<meta description>` (150-160 chars)
- Canonical URL
- BreadcrumbList schema
- HowTo schema where applicable (Individual Calculator, Advisory)

**Files to modify:**
- `src/pages/IndividualCalculator.tsx` -- "Personal Income Tax Calculator Nigeria 2026"
- `src/pages/Advisory.tsx` -- "Free Nigerian Tax Advisory Tool"
- `src/pages/Learn.tsx` -- "Learn Nigerian Tax Rules 2026"
- `src/pages/TaxBreakdown.tsx` -- "Nigerian Tax Breakdown & Analysis"
- `src/pages/SectorGuide.tsx` -- "Nigerian Tax Rates by Industry Sector"
- `src/pages/Roadmap.tsx` -- "TaxForge NG Product Roadmap"
- `src/pages/Documentation.tsx` -- "TaxForge NG Documentation & Tax Rules"
- `src/pages/TaxLogicReference.tsx` -- "Nigerian Tax Logic Reference 2026"
- `src/pages/Results.tsx` -- "Tax Calculation Results | TaxForge NG"

### 2. Add Open Graph article tags to all blog posts

The `SEOHead` component already sets `og:type` to "website" for everything. Blog posts should use `og:type: article` with `article:published_time` and `article:author` for richer social sharing. This requires a small update to `SEOHead.tsx` to accept an optional `ogType` prop.

### 3. Add `hreflang` tag for en-NG

Since the site targets Nigerian English specifically, adding `<link rel="alternate" hreflang="en-NG">` signals to Google that this is Nigerian-localized content. This can be added to the `SEOHead` component.

## Technical Details

### SEOHead additions per page (example for IndividualCalculator)

```tsx
<SEOHead
  title="Personal Income Tax Calculator Nigeria 2026 - PIT & PAYE | TaxForge"
  description="Calculate your Nigerian personal income tax with 2026 rules. First 800k tax-free, new PIT bands, Rent Relief. Free, instant, no signup required."
  canonicalPath="/individual-calculator"
  keywords="PIT calculator Nigeria, PAYE calculator, personal income tax Nigeria 2026, salary tax calculator"
  schema={createBreadcrumbSchema([
    { name: 'Home', url: 'https://taxforgeng.com/' },
    { name: 'Personal Tax Calculator', url: 'https://taxforgeng.com/individual-calculator' },
  ])}
/>
```

### SEOHead.tsx update for og:type and hreflang

Add two optional props:
- `ogType?: 'website' | 'article'` (default: 'website')
- `hreflang?: string` (default: 'en-NG')

This is a small, backward-compatible change.

## Summary

| Change | Files | Impact |
|--------|-------|--------|
| SEOHead on 9 public pages | 9 files modified | Each page gets unique Google snippet instead of generic fallback |
| og:type for blog posts | 1 file (SEOHead.tsx) + 0 blog files (BlogPostLayout handles it) | Richer social sharing cards |
| hreflang en-NG | 1 file (SEOHead.tsx) | Signals Nigerian localization to Google |

**Total: 10 files modified, 0 new files created**

