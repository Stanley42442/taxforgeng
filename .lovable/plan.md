

# SEO/AEO Phase 32: Final Cleanup — Outdated Penalties and Last FIRS References

## Research Findings

After Phases 29-31, cross-referencing our entire codebase against PwC, EY, KPMG, and AO2LAW confirms:

- PIT bands (6 bands, 0-25%): Correct
- CIT threshold (N50M turnover + N250M assets): Correct
- Development Levy (4%): Correct
- R&D cap (5% of turnover): Fixed in Phase 30
- VAT penalties (N100k/N50k): Fixed in most files in Phase 30, but **missed in 2 files**
- Mortgage Interest deduction: Added in Phase 29
- FIRS-to-NRS migration: Completed in Phase 31, but **missed in 2 files**

No new factual calculation errors found. Only 4 files need minor text corrections.

## Issues Found

### Issue 1: Outdated VAT Penalty Figures (2 files)

These files still show the **pre-2026** penalty amounts:

| File | Line | Current (Wrong) | Correct (NTA 2025) |
|------|------|-----------------|---------------------|
| `src/pages/seo/PortHarcourtGuide.tsx` | 22 | "₦50,000 first month + ₦25,000/month" | "₦100,000 first month + ₦50,000/month" |
| `src/pages/blog/TaxGuideTechStartups.tsx` | 186 | "₦50,000 for the first month" | "₦100,000 for the first month" |

### Issue 2: Remaining FIRS References (1 file)

`src/pages/seo/LagosGuide.tsx` was missed in Phase 31:

| Line | Current | Fix |
|------|---------|-----|
| 94 | "federal (FIRS) and state (LIRS)" | "federal (NRS) and state (LIRS)" |
| 126 | Section header: "Federal (FIRS)" | "Federal (NRS)" |

## Changes

| File | What Changes |
|------|-------------|
| `src/pages/seo/PortHarcourtGuide.tsx` | Update penalty from ₦50k/₦25k to ₦100k/₦50k (line 22) |
| `src/pages/blog/TaxGuideTechStartups.tsx` | Update penalty from ₦50k to ₦100k (line 186) |
| `src/pages/seo/LagosGuide.tsx` | Replace 2 remaining "FIRS" with "NRS" (lines 94, 126) |

## Technical Details

- 3 files modified, 0 new files created
- 4 individual text replacements total
- No logic changes — purely text corrections
- After this phase, zero known factual inaccuracies or outdated FIRS references remain in the codebase

