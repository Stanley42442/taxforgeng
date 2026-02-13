

# SEO/AEO Phase 10: Pre-2026 TET Rate Inconsistency and Tax Quiz Errors

## Summary

After Phases 7-9 corrected all 2026-era content, a cross-file audit reveals a **pre-2026 Tertiary Education Tax (TET) rate inconsistency** and **two quiz/content errors** in the tax myths database. The calculator engine correctly uses 3% (per Finance Act 2021), but the display label, PDF export, and test file all say 2%.

All values verified against the Finance Act 2021 (which raised TET from 2% to 2.5%, then Finance Act 2023 further confirmed 3% for assessable profits).

## Errors Found

### Error 1: Pre-2026 TET Display Says "2%" but Code Calculates 3%

In `taxCalculations.ts` line 166, the pre-2026 TET is correctly calculated as `profit * 0.03` (3%). But line 337 displays it as `'2% of profits'` in the breakdown. This means the number shown to the user is correct but the percentage label is wrong.

**Files affected:**
| File | Line | Issue |
|------|------|-------|
| `src/lib/taxCalculations.ts` | 337 | Description says "2% of profits", should say "3% of profits" |
| `src/lib/taxLogicDocumentPdf.ts` | 381 | Table shows "2%", should be "3%" |
| `src/lib/taxLogicDocumentPdf.ts` | 387-388 | Text says "Education Levy (2%)", should say "3%" |
| `src/__tests__/lib/taxCalculations.test.ts` | 207, 214 | Test name says "2%" and expects 2,000,000 instead of 3,000,000 |

### Error 2: Quiz Answer Shows "25%" and "20% medium company rate" (taxMyths.ts)

The quiz for the "small-company-automatic" myth (line 270-278) has two wrong answer options:
- `'25% - exceeds asset threshold'` -- should be `'30% - exceeds asset threshold'` (correct answer, index 1)
- `'20% - medium company rate'` -- medium company category does not exist under NTA 2025

### Error 3: Free Zone Content Says "Domestic portion: 25% CIT" (taxMyths.ts)

Line 946 states "Domestic portion: 25% CIT" in the free zone sector guide. The standard CIT rate is 30%.

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/taxCalculations.ts` | Fix description "2% of profits" to "3% of profits" (line 337) |
| `src/lib/taxLogicDocumentPdf.ts` | Fix "2%" to "3%" in table and text (lines 381, 387-388) |
| `src/__tests__/lib/taxCalculations.test.ts` | Fix test name and expected value: "3% Education Levy", expect 3,000,000 (lines 207, 214) |
| `src/lib/taxMyths.ts` | Fix quiz options: "30%" instead of "25%", remove "20% medium company" option (lines 273-274); fix "25% CIT" to "30% CIT" (line 946) |

## Technical Details

**taxCalculations.ts line 337:**
- From: `'2% of profits'`
- To: `'3% of profits'`

**taxLogicDocumentPdf.ts lines 381, 387-388:**
- From: `['All Companies', '30%', '2%']` and `"Education Levy (2%)"`
- To: `['All Companies', '30%', '3%']` and `"Education Levy (3%)"`

**taxCalculations.test.ts lines 207, 214:**
- From: `'should apply 2% Education Levy'`, `expect(result.devLevy).toBe(2000000)`
- To: `'should apply 3% Education Levy'`, `expect(result.devLevy).toBe(3000000)`

**taxMyths.ts lines 273-274:**
- From: `'25% - exceeds asset threshold'`, `'20% - medium company rate'`
- To: `'30% - standard large company rate'`, `'15% - reduced rate applies'` (plausible wrong answer)

**taxMyths.ts line 946:**
- From: `Domestic portion: 25% CIT`
- To: `Domestic portion: 30% CIT`

**Total: 4 files modified, 0 new files created**
