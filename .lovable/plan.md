

# SEO/AEO Phase 5: Cleanup, Consistency, and Unused Assets

## Research Findings

After four optimization phases, the site has strong schema coverage, semantic HTML on SEO pages, and good AEO foundations. However, several consistency gaps and a schema error remain.

## Issue 1: Duplicate FAQ Question in index.html (Bug - High Priority)

The static FAQPage schema in `index.html` contains "What is the VAT rate in Nigeria?" twice (lines 148-155 and lines 188-195) with slightly different answers. Google's Rich Results validator will flag this as invalid structured data, potentially disqualifying ALL 9 FAQ questions from rich results.

**Fix:** Remove the duplicate entry (lines 188-195).

## Issue 2: SpeakableSpecification Never Used (Medium Priority)

`createSpeakableSchema()` was built in SEOHead.tsx but never applied to any page. Google supports Speakable for news and informational articles — it tells voice assistants which sections to read aloud. The 4 homepage FAQ cards and the PIT/PAYE tax bands section are ideal candidates.

**Fix:** Apply `createSpeakableSchema` to `PITPAYECalculator`, `CITCalculator`, `VATCalculator`, and `WHTCalculator` pages, targeting the definition list sections and FAQ headings.

## Issue 3: Secondary Pages Missing SEO Enhancements (Medium Priority)

Previous phases enhanced all 10 SEO landing pages and 4 state guides, but these public-facing pages still lack breadcrumbs, `<article>` wrapping, and `<time>` elements:

- `/faq` (30+ questions, high search value)
- `/about` (E-E-A-T signal page)
- `/blog` (index page)

These pages already have schema markup but lack the visible UI enhancements that reinforce it.

**Fix:** Add `PageBreadcrumbs`, `ContentMeta`, and `<article>` wrapping to all three pages.

## Issue 4: BlogPostLayout Missing Semantic Wrapping (Low-Medium Priority)

`BlogPostLayout.tsx` wraps only the children content in `<article>`, not the full page including hero, author box, and FAQ section. The FAQ section, related posts, CTA, and disclaimer all sit outside the `<article>` element — search engines may treat them as unrelated chrome.

**Fix:** Move the `<article>` wrapper to encompass the full content block (from hero through disclaimer). Add `PageBreadcrumbs` and `ContentMeta` to the layout since all 8 blog posts share it.

## Issue 5: Sitemap lastmod Dates Stale (Low Priority)

Sitemap dates are hardcoded and haven't been updated since Phase 3. Several pages now show `ContentMeta` dates of February 13, 2026 but sitemap still says February 9 or 11. While not a ranking factor, stale sitemaps can slow re-crawling.

**Fix:** Update all sitemap `lastmod` dates to `2026-02-13` to reflect the latest changes.

## Changes

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Remove duplicate VAT FAQ question (lines 188-195) |
| `src/pages/seo/PITPAYECalculator.tsx` | Add Speakable schema targeting tax bands and FAQ sections |
| `src/pages/seo/CITCalculator.tsx` | Add Speakable schema |
| `src/pages/seo/VATCalculator.tsx` | Add Speakable schema |
| `src/pages/seo/WHTCalculator.tsx` | Add Speakable schema |
| `src/pages/FAQ.tsx` | Add breadcrumbs, ContentMeta, article wrapper |
| `src/pages/About.tsx` | Add breadcrumbs, ContentMeta, article wrapper |
| `src/pages/Blog.tsx` | Add breadcrumbs, ContentMeta, article wrapper |
| `src/components/blog/BlogPostLayout.tsx` | Expand article wrapper to full content, add PageBreadcrumbs and ContentMeta |
| `public/sitemap.xml` | Update all lastmod dates to 2026-02-13 |

### Technical Details

**Duplicate FAQ removal (index.html):**
Remove the second "What is the VAT rate in Nigeria?" entry at lines 188-195. The first entry at lines 148-155 has the more complete answer and should be kept.

**Speakable schema pattern (applied to calculator pages):**
```text
createSpeakableSchema(
  'PIT/PAYE Calculator Nigeria 2026',
  'https://taxforgeng.com/pit-paye-calculator',
  ['#tax-bands', '#faq', 'dl']  // CSS selectors for voice-readable sections
)
```
This tells Google Assistant, Siri, and Alexa: "These sections contain the answer-ready content you can read aloud."

**BlogPostLayout expanded article wrapper:**
Currently the article element only wraps `{children}`. After the change, it wraps from the SEOHero through the SEODisclaimer, making the entire page content semantically unified.

**FAQ/About/Blog page pattern:**
```text
<article className="max-w-4xl mx-auto">
  <PageBreadcrumbs items={[...]} />
  <ContentMeta published="2026-02-09" ... />
  <header>
    <SEOHero ... />
  </header>
  ... existing content ...
</article>
```

### What This Does NOT Address

- Off-page SEO (backlinks, domain authority) — external activity
- Pre-rendering/SSR — would require architecture migration, out of scope
- Image SEO — the site is text/calculator-heavy by design with no content images on SEO pages

**Total: 10 files modified, 0 new files created**
