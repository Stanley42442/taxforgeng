

# SEO/AEO Phase 23: Add Professional Services Exclusion and Abolished Medium Tier to Comparison Data and FAQ Schema

## Summary

Two factual gaps remain in high-visibility SEO content:

1. **CIT Comparison Table** (`ComparisonTable.tsx`) -- used on 3 SEO landing pages -- omits the abolished medium company tier and the professional services exclusion from the 2026 small company rule. These are the two most significant CIT changes under NTA 2025, and their absence from the comparison table is a content gap for both search engines and AI engines.

2. **Small Company Exemption FAQ** (`SmallCompanyExemption.tsx`) -- the first FAQ answer (indexed via FAQPage schema) omits the professional services exclusion. While the body text (line 169) correctly mentions it, the structured data FAQ does not -- and schema markup is what AI engines and Google rich results consume.

**Source:** NTA 2025 Section 202 excludes professional service providers from the small company definition. Baker Tilly and AO2 Law confirm the medium tier abolition.

## Changes

### Change 1: CIT_COMPARISON_ROWS -- Add abolished medium tier row and professional services note

**File:** `src/components/seo/ComparisonTable.tsx` (lines 104-111)

Add a row showing the abolished medium tier, and update the small company row to note the professional services exclusion in the 2026 column.

```
From:
  { feature: 'Standard Rate', pre2026: '30%', post2026: '30%' },
  { feature: 'Small Company Exemption', pre2026: '₦25M turnover', post2026: '₦50M turnover + ₦250M assets', highlight: true },
  { feature: 'Small Company Rate', pre2026: '0%', post2026: '0%' },
  
  { feature: 'TET (Tertiary Education Tax)', pre2026: '3%', post2026: 'Replaced by Dev Levy' },
  { feature: 'Development Levy', pre2026: false, post2026: '4%', highlight: true },

To:
  { feature: 'Standard Rate', pre2026: '30%', post2026: '30%' },
  { feature: 'Small Company Exemption', pre2026: '₦25M turnover', post2026: '₦50M turnover + ₦250M assets (excl. professional services)', highlight: true },
  { feature: 'Small Company Rate', pre2026: '0%', post2026: '0%' },
  { feature: 'Medium Company Tier (20%)', pre2026: '₦25M-₦100M turnover', post2026: 'ABOLISHED', highlight: true },
  { feature: 'TET (Tertiary Education Tax)', pre2026: '3%', post2026: 'Replaced by Dev Levy' },
  { feature: 'Development Levy', pre2026: false, post2026: '4%', highlight: true },
```

### Change 2: SmallCompanyExemption FAQ -- Add professional services exclusion

**File:** `src/pages/seo/SmallCompanyExemption.tsx` (line 28)

```
From:
  'Your company must have annual turnover of ₦50 million or less AND total fixed assets of ₦250 million or less. Both criteria must be met simultaneously.'

To:
  'Your company must have annual turnover of ₦50 million or less AND total fixed assets of ₦250 million or less. Both criteria must be met simultaneously. Professional service providers (law, accounting, medical, engineering firms) are excluded from the small company definition regardless of turnover or assets.'
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/seo/ComparisonTable.tsx` | Add medium tier abolished row, add professional services note to small company row |
| `src/pages/seo/SmallCompanyExemption.tsx` | Add professional services exclusion to FAQ answer (line 28) |

## Impact

- The CIT comparison table is rendered on 3 high-traffic SEO pages (SmallCompanyExemption, CITCalculator, and any page importing CIT_COMPARISON_ROWS)
- The FAQ schema is consumed by Google rich results and AI engines for the /small-company-exemption page
- Both changes add factual completeness required for AEO accuracy

**Total: 2 files modified, 0 new files created**

