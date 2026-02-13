

# SEO/AEO Accuracy Audit: Fix Content-Code Discrepancies

Gemini's analysis identified that while the technical foundation is strong, **content-code contradictions** are actively harming AEO citations and YMYL trust signals. This plan addresses every discrepancy found in the codebase.

---

## Issues Found (7 Total)

### Critical: Content contradicts 2026 rules (actively harmful to AEO)

**1. Partner API returns obsolete pre-2026 CIT tiers**
`supabase/functions/partner-api/index.ts` (lines 150-155) returns `mediumCompanyRate: 0.20` and `mediumCompanyTurnoverLimit: 100000000` for the **pre-2026** rules section. While the 2026 section is correct, the pre-2026 data includes the medium tier which is fine historically -- however the structure naming is misleading for AI parsers.

**2. `llms-full.txt` references "medium" companies**
Line 127: *"Company Income Tax rates explained with examples for small, medium, and large companies."* -- This is the AI-facing file. Mentioning "medium" when 2026 abolished it sends mixed signals to LLMs.

**3. CIT Calculator FAQ mentions "small, medium, or large"**
`src/pages/seo/CITCalculator.tsx` line 31: FAQ question text says "small, medium, or large?" -- The answer correctly explains the 2026 two-tier system, but the question itself plants "medium" as a concept.

**4. `MultiYearProjection.tsx` uses 3-tier type system**
Line 26: `companySize: 'small' | 'medium' | 'large'` -- The "medium" value is only used for pre-2026 projections (lines 80-84), which is historically correct. However, this type leaks into labels/charts visible to users and crawlers.

### Moderate: Pre-2026 PIT band (19%) in user-facing content

**5. Pre-2026 bands displayed without clear labeling**
Three files show the old 19% band in content that could confuse AI crawlers if they miss the context switch:
- `src/pages/TaxBreakdown.tsx` (lines 100-106) -- properly wrapped in conditional `inputs.use2026Rules` check
- `src/lib/taxLogicDocumentPdf.ts` (line 297) -- in a "Pre-2026" labeled section
- `src/lib/individualPdfExport.ts` (line 153) -- in a "Pre-2026" labeled section

These are **correctly labeled** as pre-2026. No fix needed, but adding explicit "HISTORICAL" markers improves AEO clarity.

### Minor: Missing trust signals

**6. ComparisonTable correctly shows "ABOLISHED" for medium tier**
`src/components/seo/ComparisonTable.tsx` line 108 -- This is actually correct and helpful. No change needed.

**7. Blog post references old 20% rate correctly in historical context**
`src/pages/blog/SmallCompanyCITExemption.tsx` lines 139, 151 -- Says "Under old rules: would have paid 20% CIT". This is correct historical comparison.

---

## Fixes Required (4 files)

### Fix 1: `public/llms-full.txt` -- Remove "medium" reference
Change line 127 from:
> "Company Income Tax rates explained with examples for small, medium, and large companies."

To:
> "Company Income Tax rates explained. 0% for small companies, 30% for large. Professional services exclusion."

### Fix 2: `src/pages/seo/CITCalculator.tsx` -- Fix FAQ question wording
Change FAQ question (line 31) from:
> "How do I know if my company is small, medium, or large?"

To:
> "How do I know if my company qualifies as small or large under 2026 rules?"

### Fix 3: `supabase/functions/partner-api/index.ts` -- Clean pre-2026 CIT structure
The pre-2026 section (lines 150-155) currently returns `mediumCompanyRate` as a distinct field. Change the structure to clearly label it as historical context and ensure AI parsers understand this is the old regime:
- Add a `rulesVersion: 'Pre-2026 (Historical)'` label
- Rename `mediumCompanyRate` to `historicalMediumRate` or nest under a `historical` key

### Fix 4: `public/llms.txt` -- Already correct, minor enhancement
Add explicit "Professional service firms excluded from small company definition" to the CIT section for AEO completeness.

---

## What Does NOT Need Fixing

These were flagged by Gemini but are already correct in the codebase:

- CIT rates in calculation logic: correctly 0%/30% (not 25%)
- 2026 PIT bands: correctly 0/15/18/21/23/25 everywhere
- Professional services exclusion: mentioned in 6+ pages
- ComparisonTable: correctly shows medium tier as "ABOLISHED"
- Dev Levy: correctly stated as 4% replacing 3% TET
- Disclaimers: present on all pages and PDFs
- Date stamps: ContentMeta component used across SEO pages
- FAQSchema: already implemented on all SEO landing pages

---

## Technical Details

| File | Change | Impact |
|------|--------|--------|
| `public/llms-full.txt` line 127 | Remove "medium" from CIT description | High -- direct AI-facing file |
| `src/pages/seo/CITCalculator.tsx` line 31 | Fix FAQ question wording | Medium -- FAQ schema feeds to Google |
| `supabase/functions/partner-api/index.ts` lines 150-155 | Restructure pre-2026 CIT to avoid confusion | Medium -- API responses consumed externally |
| `public/llms.txt` line 15-20 area | Add professional services exclusion note | Medium -- AI-facing file |

All changes are text-only content corrections. No logic, schema, or architecture changes needed. The calculation engine is already correct.

