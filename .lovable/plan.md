
# SEO/AEO Phase 7: Broken Speakable Selectors, Factual Errors, and Section ID Gaps

## Summary

This phase fixes one structural bug (Speakable schemas pointing to non-existent DOM elements), two factual errors on the Learn page, and adds missing section IDs for anchor navigation across SEO pages.

All tax figures have been verified against the Nigeria Tax Act 2025 (effective January 2026). The correct values used site-wide are:
- PIT bands: First NGN 800,000 tax-free, then 15%, 18%, 21%, 23%, 25%
- CIT: Small (turnover up to NGN 50M AND assets up to NGN 250M) = 0%; Medium (NGN 50M-200M) = 20%; Large (above NGN 200M) = 30%
- VAT: 7.5% standard rate; NGN 25M registration threshold
- WHT: 5% contracts; 10% rent, dividends, interest, royalties, professional/technical/directors fees
- Development Levy: 4% (replaces 3% TET)
- Rent Relief: 20% of annual rent, capped at NGN 500,000
- Loss of Office exemption: NGN 50,000,000

## Issue 1: Speakable Schemas Reference Non-Existent IDs (Bug)

CIT, VAT, and WHT calculator pages declare `createSpeakableSchema()` targeting CSS selectors `#cit-rates`/`#vat-rates`/`#wht-rates`, `#faq`, and `#how-it-works` -- but none of these IDs exist in the DOM on those pages. Google Search Console will flag these as errors. Only PITPAYECalculator.tsx correctly has matching IDs.

**Fix:** Add `id` attributes to the matching sections on all three pages.

## Issue 2: Factual Errors on Learn Page

Line 357 of Learn.tsx states PIT rates as "15%, 19%, 21%, 25%" -- should be "15%, 18%, 21%, 23%, 25%".

Line 361 states CIT "Standard rate reduced to 25%" -- the large company CIT rate is 30%, not 25%. Medium is 20%. Small is 0%.

**Fix:** Correct both values.

## Issue 3: Missing Section IDs on Other SEO Pages

Six additional SEO pages have FAQ and/or How-It-Works sections without `id` attributes. Adding IDs enables anchor navigation and improves crawlability.

Pages affected: FreeCalculator, SmallCompanyExemption, RentRelief2026, TaxReforms2026 (already has `id="faq"` but no `id="how-it-works"`).

## Changes

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/seo/CITCalculator.tsx` | Add `id="cit-rates"` (line 167), `id="how-it-works"` (line 228), `id="faq"` (line 425) |
| `src/pages/seo/VATCalculator.tsx` | Add `id="vat-rates"` (line 268), `id="how-it-works"` (line 168), `id="faq"` (line 396) |
| `src/pages/seo/WHTCalculator.tsx` | Add `id="wht-rates"` (line 157), `id="how-it-works"` (line 200), `id="faq"` (line 408) |
| `src/pages/Learn.tsx` | Fix PIT rates (line 357) and CIT description (line 361) |
| `src/pages/seo/FreeCalculator.tsx` | Add `id="how-it-works"` (line 127), `id="faq"` (line 288) |
| `src/pages/seo/SmallCompanyExemption.tsx` | Add `id="how-it-works"` (line 204), `id="faq"` (line 350) |
| `src/pages/seo/RentRelief2026.tsx` | Add `id="how-it-works"` (line 141), `id="faq"` (line 336) |
| `src/pages/seo/TaxReforms2026.tsx` | Add `id="how-it-works"` to the how-to section (already has `id="faq"`) |

### Technical Details

**Speakable fix pattern (CIT example):**

The existing Speakable schema declares selectors `['#cit-rates', '#faq', '#how-it-works']`. The fix adds matching IDs:

```text
<section id="cit-rates" className="mb-12">   // CIT Rates Overview section
<section id="how-it-works" className="mb-12"> // How to Calculate section
<section id="faq" className="mb-12">          // FAQ accordion section
```

Same pattern for VAT (`#vat-rates`) and WHT (`#wht-rates`).

**Learn page PIT fix (line 357):**
- From: `New rates: 15%, 19%, 21%, 25%.`
- To: `New rates: 15%, 18%, 21%, 23%, 25%. First ₦800,000 is tax-free.`

**Learn page CIT fix (line 361):**
- From: `Standard rate reduced to 25%. Small companies (≤₦50m): 0% CIT.`
- To: `Large companies: 30%. Medium (₦50M-₦200M): 20%. Small (turnover ≤₦50M AND assets ≤₦250M): 0% CIT.`

**Total: 8 files modified, 0 new files created**
