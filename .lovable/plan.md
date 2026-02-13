

# SEO/AEO Phase 8: Critical Factual Corrections — Alignment with Nigeria Tax Act 2025

## Summary

A thorough cross-reference of the site's content against the Nigeria Tax Act 2025 (NTA) and authoritative sources (PwC, KPMG, EY, AO2LAW, SOW Professional) has uncovered **multiple factual errors** that contradict both the NTA and the site's own calculator logic. These errors are concentrated in blog posts, FAQ answers, and the Tax Breakdown page.

The calculator engine (`taxCalculations.ts`) is correct. The errors are in the **content layer** — the human-readable descriptions that Google, AI crawlers, and users read.

## Verified Reference Data (Nigeria Tax Act 2025, Section 56, Fourth Schedule)

Sources: KPMG Flash Alert 2025-168, PwC Top 20 Changes PDF (June 2025), AO2LAW legal analysis (November 2025), SOW Professional compliance guide (January 2026), Finance in Africa analysis (January 2026).

| Item | Correct Value |
|------|--------------|
| PIT Bands | 0-800k: 0%, 800k-3M: 15%, 3M-12M: 18%, 12M-25M: 21%, 25M-50M: 23%, 50M+: 25% |
| Small Company CIT | Turnover up to 50M AND assets up to 250M = 0% CIT, 0% CGT, 0% Development Levy |
| Large Company CIT | 30% (not 25%) |
| Development Levy | 4% — applies to non-small companies ONLY |
| Professional Services | Excluded from small company definition (law, accounting, medical, engineering) |
| CGT (Companies) | 30% (increased from 10%) |
| CGT (Individuals) | Progressive PIT rates (replaces flat 10%) |
| Medium Company Category | Eliminated under NTA — companies are either Small or Large |

## Errors Found

### Error 1: CIT Rate Stated as 25% (Should be 30%)

The standard CIT rate for large companies is 30%, not 25%. This error appears in three places:

| File | Line | Wrong Text |
|------|------|-----------|
| `src/pages/FAQ.tsx` | 25 | "standard Company Income Tax rate is 25%" |
| `src/pages/TaxBreakdown.tsx` | 86 | "Under 2026 rules, CIT is 25%." |
| `src/pages/blog/SmallCompanyCITExemption.tsx` | 20 | "liable for CIT at the standard 25% rate" |

**Fix:** Change all instances to 30%.

### Error 2: Development Levy Incorrectly Applied to Small Companies

Per NTA Section 56 and confirmed by PwC, AO2LAW, and SOW Professional: small companies are **exempt** from the Development Levy. The site's own calculator (`taxCalculations.ts` line 154) correctly returns `devLevy: 0` for small companies. But the content pages claim the opposite.

| File | Lines | Wrong Text |
|------|-------|-----------|
| `src/pages/blog/SmallCompanyCITExemption.tsx` | 18 | FAQ: "applies to all companies regardless of size" |
| `src/pages/blog/SmallCompanyCITExemption.tsx` | 114 | Step 4: "4% Development Levy still applies" |
| `src/pages/blog/SmallCompanyCITExemption.tsx` | 138 | Example 1 calculates Dev Levy of 320,000 for small company |
| `src/pages/blog/SmallCompanyCITExemption.tsx` | 150 | Example 2 calculates Dev Levy of 480,000 for small company |
| `src/pages/blog/SmallCompanyCITExemption.tsx` | 161 | "applies to all companies" |
| `src/pages/blog/SmallCompanyCITExemption.tsx` | 172-179 | Entire section "Development Levy Still Applies" |
| `src/pages/FAQ.tsx` | 27 | "applies to all companies regardless of size" |
| `src/pages/blog/TaxReforms2026Summary.tsx` | 157 | "This applies to all companies" |
| `src/pages/blog/TaxGuideTechStartups.tsx` | 18 | "The Development Levy applies once you have assessable profits" |

**Fix:** Correct all to state that small companies are exempt from the Development Levy. Update worked examples to show Dev Levy = 0 for qualifying small companies. Rewrite the "Development Levy Still Applies" section to clarify it only applies to non-small companies.

### Error 3: PIT Bands Wrong in TaxBreakdown.tsx

The Tax Breakdown page displays incorrect PIT bands for 2026:

| Shown (Wrong) | Correct |
|---------------|---------|
| 800k - 3m: 15% | 800k - 3m: 15% (OK) |
| 3m - 10m: 19% | 3m - 12m: 18% |
| 10m - 50m: 21% | 12m - 25m: 21%, 25m - 50m: 23% |
| Above 50m: 25% | Above 50m: 25% (OK) |

The 18% and 23% bands are completely missing, and the 19% rate does not exist in the NTA.

**Fix:** Replace with the correct six-band structure.

### Error 4: Professional Services Exclusion Missing

The NTA explicitly states: "any business providing professional services shall not be classified as a small company." This applies to law firms, accounting firms, medical practices, engineering consultancies, and other licensed professions. This critical exclusion is entirely absent from the site.

**Fix:** Add a note about the professional services exclusion to the SmallCompanyCITExemption blog post, the SmallCompanyExemption SEO page, and the FAQ.

### Error 5: "Medium Company" Category References

The NTA 2025 eliminates the old medium company category. Per Finance in Africa: "This change scraps the regular medium-sized firms category." Companies are now classified as Small (0%) or Large (30%). The calculator already implements this correctly (no 20% rate exists in the code). But multiple content pages reference "medium companies (50M-200M) at 20%."

| File | Lines |
|------|-------|
| `src/pages/seo/CITCalculator.tsx` | 18, 20, 32, 65-68, 82 |
| `src/pages/seo/TaxReforms2026.tsx` | 29 |
| `src/pages/Learn.tsx` | 361 |
| `src/pages/seo/SmallCompanyExemption.tsx` | 36, 169 |

**Fix:** Remove medium company references. State that companies are either Small (0%) or Large (30%). Note in CITCalculator that this is a simplification and professional advice should be sought for companies near the threshold.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/TaxBreakdown.tsx` | Fix PIT bands (lines 93-99), fix CIT rate 25% to 30% (line 86) |
| `src/pages/FAQ.tsx` | Fix CIT rate (line 25), fix Dev Levy for small companies (line 27) |
| `src/pages/blog/SmallCompanyCITExemption.tsx` | Fix Dev Levy exemption (FAQ, step 4, examples, common mistakes, dedicated section), fix CIT rate, add professional services exclusion, remove medium company reference |
| `src/pages/blog/TaxReforms2026Summary.tsx` | Fix Dev Levy scope (line 157) |
| `src/pages/blog/TaxGuideTechStartups.tsx` | Fix Dev Levy for small companies (line 18) |
| `src/pages/seo/CITCalculator.tsx` | Remove medium company references, update to Small/Large only, add professional services note |
| `src/pages/seo/TaxReforms2026.tsx` | Remove medium company reference (line 29), add professional services note |
| `src/pages/Learn.tsx` | Remove medium company reference (line 361) |
| `src/pages/seo/SmallCompanyExemption.tsx` | Remove medium company references, add professional services exclusion note |

## Technical Details

**TaxBreakdown.tsx PIT bands fix (lines 93-99):**
```text
From:
- 800k - 3m: 15%
- 3m - 10m: 19%
- 10m - 50m: 21%
- Above 50m: 25%

To:
- 800k - 3m: 15%
- 3m - 12m: 18%
- 12m - 25m: 21%
- 25m - 50m: 23%
- Above 50m: 25%
```

**TaxBreakdown.tsx CIT fix (line 86):**
- From: "Under 2026 rules, CIT is 25%."
- To: "Under 2026 rules, CIT is 30% for large companies. Small companies (turnover up to 50M, assets up to 250M) pay 0%."

**SmallCompanyCITExemption.tsx worked example fix (line 138):**
- From: "Development Levy = 4% x 8,000,000 = 320,000"
- To: "Development Levy = 0 (small companies are exempt)"
- Savings recalculated accordingly

**CITCalculator.tsx rate table fix:**
- Remove "Medium Company" row entirely
- Update to show only Small (0%) and Large (30%)

**Professional services exclusion text (to add):**
"Important: Professional service providers (law firms, accounting firms, medical practices, engineering consultancies) are excluded from the small company definition regardless of their turnover or asset size."

## What This Does NOT Address

- FIRS vs NRS naming: Many authoritative sources still use "FIRS" during the transition period. This is a cosmetic issue and both names are currently in use.
- The `verification.ts` constants file correctly has all values and does not need changes.
- The calculator engine (`taxCalculations.ts`, `individualTaxCalculations.ts`) is correct and does not need changes.
- Off-page SEO, backlinks, pre-rendering.

**Total: 9 files modified, 0 new files created**

