

# Final Housekeeping: Sitemap Sync and Schema Cleanup

## Why This Matters

With all page-level SEO now complete, these last items ensure Google's crawl infrastructure matches the work we've done. Without them, some optimized pages won't appear in Google's index, and the homepage has conflicting schema data.

## Changes

### 1. Add Missing Pages to sitemap.xml

These public pages have SEOHead but are NOT in the sitemap, meaning Google may never discover them:

| Route | Priority | Description |
|-------|----------|-------------|
| `/tax-calendar` | 0.70 | Tax deadline calendar with reminders |
| `/documentation` | 0.50 | Platform documentation and stats |
| `/tax-logic` | 0.50 | Tax rules reference |

### 2. Remove Duplicate Schema from index.html

Lines 74-88 of `index.html` contain a basic `WebApplication` JSON-LD block. The homepage now injects a much richer version dynamically (with pricing tiers, feature lists, Organization, and LocalBusiness schemas). The static one should be removed to avoid conflicting signals.

### 3. Update sitemap.xml lastmod Dates

Update `lastmod` to `2026-02-11` for all pages that were modified in this SEO overhaul (homepage, calculator, pricing, terms, success-stories, individual-calculator, advisory, learn, sector-guide, roadmap).

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `public/sitemap.xml` | Add 3 missing URLs, update lastmod dates |
| `index.html` | Remove lines 74-88 (redundant static JSON-LD) |

**Total: 2 files modified, 0 new files created**

