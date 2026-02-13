

# SEO/AEO Phase 27: Update Remaining FIRS to NRS Across SEO Components and Landing Pages

## Summary

Following Phase 26 (homepage), there are still prominent "FIRS" references in **shared SEO components** that appear on every page, plus the highest-traffic SEO landing pages. Since the Nigeria Revenue Service (Establishment) Act 2025 renamed FIRS to NRS effective January 2026, these references are factually outdated.

This phase targets the **shared components first** (maximum impact per edit) then the top SEO landing pages. Filing-related references (e.g., "file returns with FIRS") are updated to "NRS (formerly FIRS)" for user recognition during the transition period.

## Changes

### File 1: `src/components/seo/SEOHead.tsx` (shared schema markup on every page)

- **Line 130:** Schema description: "FIRS-compliant" to "NRS-compliant"
- **Line 231:** knowsAbout array: "FIRS Compliance" to "NRS Compliance"

### File 2: `src/components/seo/SEODisclaimer.tsx` (shared disclaimer on all SEO pages)

- **Line 37:** "FIRS filing assistance" to "NRS filing assistance"

### File 3: `src/pages/seo/FreeCalculator.tsx` (highest-traffic free tool page)

- **Line 32:** FAQ answer: "verified against FIRS guidelines" to "verified against NRS guidelines"
- **Line 84:** Meta description: "FIRS-compliant results" to "NRS-compliant results"
- **Line 203:** Feature badge: "FIRS Compliant" to "NRS Compliant"
- **Line 204:** Feature description: "FIRS guidelines" to "NRS guidelines"

### File 4: `src/pages/seo/TaxReforms2026.tsx` (2026 reforms overview page)

- **Line 149:** Keywords: "FIRS 2026" to "NRS 2026, FIRS 2026" (dual discoverability)
- **Line 194:** Trust badge: "Official FIRS Rules" to "Official NRS Rules"
- **Line 412:** Link description: "FIRS requirements" to "NRS requirements"

### File 5: `src/pages/seo/SmallCompanyExemption.tsx` (small company checker)

- **Line 22:** HowTo step: "file annual returns with FIRS" to "file annual returns with NRS (formerly FIRS)"
- **Line 32:** FAQ: "file annual returns with FIRS" to "file annual returns with NRS"
- **Line 40:** FAQ: "FIRS may apply" to "NRS may apply"
- **Line 44:** FAQ: "file nil returns with FIRS" to "file nil returns with NRS"
- **Line 116:** Trust badge: "Official FIRS Rules" to "Official NRS Rules"
- **Line 236:** Mistake fix: "file annual returns with FIRS" to "file annual returns with NRS"
- **Line 325:** Filing section: "file returns with FIRS" to "file returns with NRS"
- **Line 331:** Form reference: "Fill out FIRS Form C" to "Fill out NRS Form C"

### File 6: `src/pages/Index.tsx` (one remaining reference)

- **Line 466:** Feature description: "seamless FIRS filing" to "seamless NRS filing"

## What This Addresses

- 20+ outdated "FIRS" references across 6 files, including 2 shared components that affect every page
- Schema markup (SEOHead) crawled by Google and AI engines currently reports the wrong agency name
- Aligns all SEO landing pages with the Nigeria Revenue Service Act 2025
- Retains "FIRS" in keywords meta tags for search discoverability during transition

**Total: 6 files modified, 0 new files created**

