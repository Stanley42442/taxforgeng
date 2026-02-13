
# SEO/AEO Phase 4: Semantic HTML and Coverage Gaps

## Research Findings

Based on analysis of top-ranking tax authority sites and current SEO best practices (SearchAtlas Semantic HTML Guide 2025, Google's structured data documentation), three genuine remaining gaps exist:

## Gap 1: No Semantic HTML5 Elements (High Impact)

**The problem:** Every SEO landing page wraps content in `<div>` tags. Zero usage of `<article>`, `<main>`, `<aside>`, or `<header>` on any of the 10 SEO pages. Google and LLMs use these semantic landmarks to identify the "main content" vs. navigation/chrome. Without them, crawlers treat everything as equal-weight content.

**What top sites do:** TaxFoundation.org wraps each page's content in `<article>` with `<header>` for the title block and `<section>` for each H2 block. Investopedia uses `<article>` with explicit `role="article"`.

**Fix:** Wrap page content in `<article>` elements on all 10 SEO pages and 4 state guides. The `<main>` tag already exists on StateGuidesHub.tsx — replicate it everywhere. Add `<header>` around the hero/title block.

## Gap 2: State Guides and TaxReports Missing Enhancements (Medium Impact)

**The problem:** The previous optimization phases added breadcrumbs, `<time>` elements, and source citations to 8 of the 10 SEO pages but missed:
- `/state-guides` hub page
- `/port-harcourt-tax-guide`
- `/state-guides/lagos`
- `/state-guides/abuja`
- `/state-guides/kano`
- `/tax-reports`

These pages have schema markup but no visible breadcrumbs, no `<time>` publish dates, and no source citations — creating an inconsistent experience and weaker SEO signals.

**Fix:** Add `PageBreadcrumbs`, `ContentMeta`, and `DataSourceCitation` to all 6 missing pages.

## Gap 3: Homepage Snippet-Bait Section Uses `<article>` Correctly but FAQ Section Lacks Schema Alignment (Low-Medium Impact)

**The problem:** The homepage has a 4-card snippet-bait FAQ section (lines 218-278 in Index.tsx) with great content, but each card uses `<article>` without corresponding FAQ schema for those specific questions. The static FAQ schema in `index.html` covers 5 different questions. This mismatch means the visible FAQ answers don't align with the structured data.

**Fix:** Add the 4 homepage FAQ questions to the static FAQPage schema in `index.html` so visible content and structured data match.

## Changes

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/seo/PITPAYECalculator.tsx` | Wrap content in `<article>`, add `<header>` around hero |
| `src/pages/seo/CITCalculator.tsx` | Wrap content in `<article>`, add `<header>` around hero |
| `src/pages/seo/VATCalculator.tsx` | Wrap content in `<article>`, add `<header>` around hero |
| `src/pages/seo/WHTCalculator.tsx` | Wrap content in `<article>`, add `<header>` around hero |
| `src/pages/seo/TaxReforms2026.tsx` | Wrap content in `<article>`, add `<header>` around hero |
| `src/pages/seo/FreeCalculator.tsx` | Wrap content in `<article>`, add `<header>` around hero |
| `src/pages/seo/SmallCompanyExemption.tsx` | Wrap content in `<article>`, add `<header>` around hero |
| `src/pages/seo/RentRelief2026.tsx` | Wrap content in `<article>`, add `<header>` around hero |
| `src/pages/seo/TaxReports.tsx` | Add breadcrumbs, content meta, wrap in `<article>` |
| `src/pages/seo/StateGuidesHub.tsx` | Add breadcrumbs, content meta |
| `src/pages/seo/PortHarcourtGuide.tsx` | Add breadcrumbs, content meta, source citation |
| `src/pages/seo/LagosGuide.tsx` | Add breadcrumbs, content meta, source citation |
| `src/pages/seo/AbujaGuide.tsx` | Add breadcrumbs, content meta, source citation |
| `src/pages/seo/KanoGuide.tsx` | Add breadcrumbs, content meta, source citation |
| `index.html` | Add 4 homepage FAQ questions to static FAQPage schema |

### Technical Details

**Semantic HTML pattern (applied to all SEO pages):**

Currently:
```text
<div className="max-w-4xl mx-auto">
  <PageBreadcrumbs ... />
  <ContentMeta ... />
  <SEOHero ... />
  <section>...</section>
</div>
```

After:
```text
<article className="max-w-4xl mx-auto">
  <PageBreadcrumbs ... />
  <ContentMeta ... />
  <header>
    <SEOHero ... />
    <TrustBadges ... />
  </header>
  <section>...</section>
</article>
```

This tells search engines and LLMs: "This is the main content piece on this page" rather than leaving it as ambiguous `<div>` soup.

**Homepage FAQ schema additions (4 new questions in index.html):**
- "How much tax do I pay in Nigeria?" 
- "Is my small company exempt from CIT?"
- "What is the VAT rate in Nigeria?" 
- "When are Nigerian tax deadlines?"

These match the visible snippet-bait cards on the homepage, aligning structured data with visible content (a Google requirement for rich results eligibility).

### What This Does NOT Address

- Off-page SEO (backlinks, domain authority) -- external activity
- Blog post semantic upgrades -- blog posts use `BlogPostLayout` which could be enhanced separately but is lower priority since blog pages already have good schema
- Image SEO -- no images exist on SEO pages to add alt text to; the site is text/calculator-heavy by design

**Total: 15 files modified, 0 new files created**
