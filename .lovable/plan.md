

# SEO/AEO Refinements: Lessons from TaxFoundation.org

## Research Summary

I fetched and analyzed TaxFoundation.org's actual HTML source (their 2026 Tax Brackets page) and compared it against the current TaxForge implementation. Here's what the leading tax authority sites do that TaxForge doesn't yet:

## Genuine Remaining Gaps

### 1. Visible Breadcrumb Navigation (High Impact)

**What TaxFoundation does:** Renders a clickable breadcrumb trail in the UI (e.g., "Home > Data > Federal > 2026 Tax Brackets") alongside their BreadcrumbList schema.

**TaxForge status:** The `breadcrumb.tsx` UI component exists but is never rendered on any page. Only the JSON-LD `createBreadcrumbSchema()` is used (invisible to users). Google values breadcrumbs that are BOTH in the HTML and in schema -- having schema alone without visible breadcrumbs is less effective.

**Fix:** Add a reusable `<PageBreadcrumbs>` component and render it on all SEO landing pages. This improves both UX (users can navigate up the hierarchy) and SEO (Google shows breadcrumb trails in search results).

### 2. Semantic `<time>` Elements with `datetime` Attributes (Medium Impact)

**What TaxFoundation does:** Uses `<time datetime="2026-01-01T17:08:57-05:00">January 1, 2026</time>` and `<time class="updated" datetime="2026-02-11">` directly in the visible page body.

**TaxForge status:** Zero `<time>` elements anywhere in the SEO pages. Dates only exist in JSON-LD schema (invisible to non-JS crawlers). Google uses `<time>` elements to determine content freshness -- critical for "2026 tax" queries where recency matters.

**Fix:** Add visible "Published" and "Last Updated" dates with `<time datetime="...">` on all SEO landing pages and blog posts.

### 3. Source Citations on Data Tables (Medium Impact)

**What TaxFoundation does:** Every data table has a visible source citation: "Source: Internal Revenue Service, Revenue Procedure 2025-32."

**TaxForge status:** Tax band tables have no source citations. Adding "Source: Nigeria Tax Act 2025 (Official Gazette)" beneath data tables signals E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) to both search engines and AI crawlers.

**Fix:** Add a standardized citation line beneath all tax data tables on SEO pages.

### 4. Table of Contents on Long SEO Pages (Low-Medium Impact)

**What TaxFoundation does:** Every long article has a collapsible Table of Contents with anchor links to each H2 section.

**TaxForge status:** `TableOfContents` component exists and is used on blog posts, but NOT on the 10 SEO landing pages (which are 400-500 lines each with 8+ sections). A ToC generates intra-page anchor links that Google can show as "jump-to" sitelinks in search results.

**Fix:** Add `<TableOfContents>` to the longer SEO landing pages (TaxReforms2026, PITPAYECalculator, FreeCalculator, CITCalculator).

## Changes

### Files to Modify

| File | Change |
|------|--------|
| `src/components/seo/PageBreadcrumbs.tsx` | **NEW** -- Reusable visible breadcrumb component using existing `breadcrumb.tsx` UI primitives |
| `src/components/seo/DataSourceCitation.tsx` | **NEW** -- Standardized source citation component for tax data tables |
| `src/pages/seo/PITPAYECalculator.tsx` | Add visible breadcrumbs, `<time>` elements, source citation, Table of Contents |
| `src/pages/seo/CITCalculator.tsx` | Add visible breadcrumbs, `<time>` elements, source citation |
| `src/pages/seo/VATCalculator.tsx` | Add visible breadcrumbs, `<time>` elements, source citation |
| `src/pages/seo/WHTCalculator.tsx` | Add visible breadcrumbs, `<time>` elements, source citation |
| `src/pages/seo/TaxReforms2026.tsx` | Add visible breadcrumbs, `<time>` elements, Table of Contents |
| `src/pages/seo/FreeCalculator.tsx` | Add visible breadcrumbs, `<time>` elements |
| `src/pages/seo/SmallCompanyExemption.tsx` | Add visible breadcrumbs, `<time>` elements, source citation |
| `src/pages/seo/RentRelief2026.tsx` | Add visible breadcrumbs, `<time>` elements |

### Technical Details

**PageBreadcrumbs component:**
```text
<nav aria-label="Breadcrumb" class="mb-6">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/free-tax-calculator">Tax Tools</a></li>
    <li aria-current="page">PIT/PAYE Calculator</li>
  </ol>
</nav>
```
Uses the existing `@/components/ui/breadcrumb` primitives (Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage).

**Time elements:**
```text
<div class="text-sm text-muted-foreground">
  Published: <time datetime="2026-01-15">January 15, 2026</time>
  | Updated: <time datetime="2026-02-13">February 13, 2026</time>
</div>
```

**Source citation:**
```text
<p class="text-xs text-muted-foreground mt-3 italic">
  Source: Nigeria Tax Act 2025 (Official Gazette, Federal Republic of Nigeria)
</p>
```

### What This Does NOT Address

- **Off-page SEO** (backlinks, domain authority) -- requires external outreach, not code
- **Glossary tooltips** -- TaxFoundation uses these but they require significant content authoring effort; lower priority
- **Data download buttons** (CSV/Excel/PDF on tables) -- nice-to-have but already available for authenticated users

**Total: 2 new files, 8 files modified**

