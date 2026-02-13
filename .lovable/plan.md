

# SEO/AEO Phase 6: Content Accuracy Fix, Schema Date, and Remaining Page Consistency

## Summary

After five optimization phases, the site's SEO foundation is strong. This final phase addresses a factual error, a stale schema date, and brings the remaining public sitemap pages up to the same standard as the SEO landing pages.

## Issue 1: Factual Error on Homepage (Critical - E-E-A-T)

The homepage snippet-bait card "Is My Small Company Exempt From CIT?" states the threshold as **"₦25 million"** (line 240 of Index.tsx). Every other page on the site correctly says **₦50 million** (the actual 2026 threshold under the Nigeria Tax Act 2025). Google's Helpful Content system penalizes sites with internally contradictory facts, and AI systems may pick up the wrong figure.

**Fix:** Change "₦25 million" to "₦50 million" and update the description to mention both criteria (turnover AND assets).

## Issue 2: Static Schema dateModified Stale (Low Priority)

The SoftwareApplication schema in `index.html` line 107 still shows `"dateModified": "2026-02-11"`. After five phases of changes, this should be `2026-02-13`.

**Fix:** Update to `2026-02-13`.

## Issue 3: Remaining Public Pages Missing Enhancements (Low Priority)

Five public pages in the sitemap still lack `PageBreadcrumbs`, `ContentMeta`, and `<article>` wrappers that all SEO/blog/state-guide pages now have:

- `/resources` - Has schema but no breadcrumbs/time/article
- `/learn` - Has schema but no breadcrumbs/time/article
- `/success-stories` - Has schema but no breadcrumbs/time/article
- `/roadmap` - Has schema but no breadcrumbs/time/article
- `/pricing` - Has schema but no breadcrumbs/time/article

These are secondary pages but they appear in the sitemap and benefit from consistent semantic markup.

**Fix:** Add `PageBreadcrumbs`, `ContentMeta`, and wrap content in `<article>` on all five pages.

## Changes

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Fix factual error: ₦25M to ₦50M, add assets criterion |
| `index.html` | Update dateModified from 2026-02-11 to 2026-02-13 |
| `src/pages/Resources.tsx` | Add PageBreadcrumbs, ContentMeta, article wrapper |
| `src/pages/Learn.tsx` | Add PageBreadcrumbs, ContentMeta, article wrapper |
| `src/pages/SuccessStoriesPage.tsx` | Add PageBreadcrumbs, ContentMeta, article wrapper |
| `src/pages/Roadmap.tsx` | Add PageBreadcrumbs, ContentMeta, article wrapper |
| `src/pages/Pricing.tsx` | Add PageBreadcrumbs, ContentMeta, article wrapper |

### Technical Details

**Homepage factual fix (Index.tsx line 240):**
Change from:
"Yes -- if your company's gross turnover is ₦25 million or less, you pay 0% Company Income Tax under the 2026 rules."

Change to:
"Yes -- if your company's turnover is ₦50 million or less AND fixed assets are ₦250 million or less, you pay 0% Company Income Tax under the 2026 rules."

**Schema date fix (index.html line 107):**
`"dateModified": "2026-02-11"` becomes `"dateModified": "2026-02-13"`

**Secondary page pattern (same as previous phases):**
Each page gets PageBreadcrumbs, ContentMeta, and an article wrapper around the main content area.

### What This Does NOT Address

- Off-page SEO (backlinks, domain authority) -- requires external outreach
- Pre-rendering/SSR -- architecture migration, out of scope
- Internal cross-linking between content clusters -- would be a larger content strategy project
- The Learn page's Articles tab has slightly outdated PIT rates ("15%, 19%, 21%, 25%" instead of "15%, 18%, 21%, 23%, 25%") -- this is a content accuracy issue but is inside the app behind tabs, not a high-priority SEO surface

**Total: 7 files modified, 0 new files created**

