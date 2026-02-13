

# SEO/AEO Phase 33: Final FIRS-to-NRS Sweep (5 Remaining References)

## Research Summary

After Phases 29-32, the codebase is factually accurate on all tax calculations, penalties, and R&D rules. However, a final full-text search reveals **5 standalone "FIRS" references** that were missed -- these are NOT in SEO keywords (which intentionally keep "FIRS" for search coverage) and NOT in "formerly FIRS" contextual mentions.

### Verified: No Factual Errors Remain

- PIT bands (6 bands, 0-25%): Correct
- CIT threshold (N50M turnover + N250M assets): Correct
- Development Levy (4%): Correct
- R&D cap (5% of turnover): Fixed in Phase 30
- VAT penalties (N100k/N50k): Fixed in Phases 30 + 32
- FIRS-to-NRS migration: Nearly complete, 5 references remain

### What Still Says "FIRS" (Should Say "NRS")

| # | File | Line(s) | Current Text | Fix |
|---|------|---------|-------------|-----|
| 1 | `src/pages/Calculator.tsx` | 430 | Badge: "FIRS Compliant" | "NRS Compliant" |
| 2 | `src/pages/blog/TaxCalendar2026.tsx` | 71 | Table cell: "FIRS" (VAT authority) | "NRS" |
| 3 | `src/pages/blog/TaxCalendar2026.tsx` | 72 | Table cell: "FIRS" (WHT authority) | "NRS" |
| 4 | `src/pages/blog/TaxCalendar2026.tsx` | 167 | "FIRS can audit tax returns" | "NRS can audit tax returns" |
| 5 | `src/contexts/LanguageContext.tsx` | 3808 | "consult FIRS/state IRS" (EN, PCM, YO, HA, IG) | "consult NRS/state IRS" in all 5 languages |
| 6 | `src/contexts/LanguageContext.tsx` | 3834 | "consult FIRS, state IRS" (EN, PCM, YO, HA, IG) | "consult NRS, state IRS" in all 5 languages |

### Intentionally Kept as "FIRS" (No Change Needed)

These are correct and should NOT be changed:
- SEO keywords containing "FIRS compliant" or "FIRS 2026" (for search engine coverage of the old name)
- Contextual "NRS (formerly FIRS)" references throughout the site
- The tax-assistant edge function already says "NRS, formerly FIRS"

## Changes

| File | What Changes |
|------|-------------|
| `src/pages/Calculator.tsx` | Change badge from "FIRS Compliant" to "NRS Compliant" (line 430) |
| `src/pages/blog/TaxCalendar2026.tsx` | Replace 3 standalone "FIRS" with "NRS" (lines 71, 72, 167) |
| `src/contexts/LanguageContext.tsx` | Update 2 disclaimer strings: replace "FIRS" with "NRS" in all 5 languages (lines 3808, 3834) |

## Technical Details

- 3 files modified, 0 new files created
- 6 individual text replacements (some spanning multiple languages within one line)
- No logic changes -- purely text corrections
- After this phase, zero standalone "FIRS" references remain outside of intentional SEO keywords

