

# SEO/AEO Phase 31: Complete FIRS-to-NRS Migration (100+ Remaining References)

## Problem

Despite Phases 27-28 claiming full FIRS-to-NRS migration, **100+ "FIRS" references remain** across 16 files. This undermines our 2026 compliance positioning and creates inconsistency -- some pages say "NRS" while others still say "FIRS".

Additionally, `taxpromax.firs.gov.ng` URLs appear in 2 files and need updating to `taxpromax.nrs.gov.ng`.

## Verified: No New Factual Errors Found

Cross-referencing PwC's "Top 20 Changes" (June 2025), AO2LAW's Section 56 analysis, and Andersen's stamp duty article against our site:

- **CIT threshold (N50M)**: Confirmed correct per AO2LAW's direct quote of NTA Section 56. PwC cites N100M but that is the NTAA "small business" definition for VAT (Section 147), not the NTA "small company" definition for CIT.
- **PIT bands**: Correct (6 bands, 0-25%)
- **Development Levy (4%)**: Correct
- **R&D cap (5% of turnover)**: Fixed in Phase 30
- **VAT penalties (N100k/N50k)**: Fixed in Phase 30
- **Mortgage Interest deduction**: Added in Phase 29
- **CGT rates (30% companies, progressive for individuals)**: Correct
- **EDI replacing Pioneer Status**: Correct

No new factual calculation errors found. The only remaining issue is the incomplete FIRS-to-NRS migration.

## Files to Update (16 files, grouped by priority)

### Group A: SEO Pages (highest impact -- public-facing, indexed by search engines)

| File | FIRS Count | Key Changes |
|------|-----------|-------------|
| `src/pages/seo/TaxReports.tsx` | ~8 | "FIRS Compliant" badges to "NRS Compliant", FAQ answers, SEO meta, descriptions |
| `src/pages/seo/VATCalculator.tsx` | ~4 | Badge text, filing instructions ("FIRS TaxPro Max" to "NRS TaxPro Max") |
| `src/pages/seo/WHTCalculator.tsx` | ~3 | FAQ answers about remitting to FIRS, credit notes |
| `src/pages/seo/CITCalculator.tsx` | ~2 | Badge text, common mistakes section |
| `src/pages/seo/TaxReforms2026.tsx` | ~2 | SEO keywords, FAQ answer |
| `src/pages/seo/PortHarcourtGuide.tsx` | ~5 | Schema markup, how-to steps, section headers, keywords |
| `src/pages/seo/KanoGuide.tsx` | ~1 | Body text |

### Group B: Main Pages

| File | FIRS Count | Key Changes |
|------|-----------|-------------|
| `src/pages/FAQ.tsx` | ~4 | Lines 17, 47, 48, 58 -- filing references and "FIRS website" |
| `src/pages/TaxFiling.tsx` | ~10 | Filing steps, portal links, descriptions, toast messages, `taxpromax.firs.gov.ng` URLs |
| `src/pages/Roadmap.tsx` | ~1 | SEO keywords |

### Group C: Library/PDF Files

| File | FIRS Count | Key Changes |
|------|-----------|-------------|
| `src/lib/taxFormsPdf.ts` | ~5 | PDF form headers, portal URLs, disclaimer text |
| `src/lib/taxLogicDocumentPdf.ts` | ~3 | "Real-Time FIRS Updates" roadmap section |
| `src/lib/taxMyths.ts` | ~8 | Remaining myth explanations and quiz explanations |

### Group D: Edge Functions

| File | FIRS Count | Key Changes |
|------|-----------|-------------|
| `supabase/functions/send-welcome-email/index.ts` | 1 | "pre-filled FIRS forms" |
| `supabase/functions/send-trial-final-reminder/index.ts` | 1 | "Tax filing preparation for FIRS" |

## Replacement Rules

All replacements follow these consistent patterns:
- "FIRS" in general references becomes "NRS" or "NRS (formerly FIRS)" on first mention per page
- "FIRS Compliant" badge text becomes "NRS Compliant"
- "FIRS TaxProMax" becomes "NRS TaxPro Max"
- `taxpromax.firs.gov.ng` URLs become `taxpromax.nrs.gov.ng`
- "Federal Taxes (FIRS)" section headers become "Federal Taxes (NRS)"
- "file with FIRS" becomes "file with NRS"
- SEO keywords keep both "NRS" and "FIRS" for search coverage (e.g., "NRS 2026, FIRS renamed")

## Technical Details

- 16 files modified, 0 new files created
- Approximately 55 individual text replacements
- No logic changes -- purely text/branding updates
- Edge functions will auto-deploy after changes

