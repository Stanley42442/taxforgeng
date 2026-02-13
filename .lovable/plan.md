

# SEO/AEO Phase 11: Partner API Calculation Errors and PDF Export Band Mismatch

## Summary

After Phases 7-10 corrected all user-facing content pages, two backend/export files still contain calculation errors that produce **incorrect tax figures** for API consumers and PDF downloads.

The most critical is the **partner API edge function**, which is a live endpoint returning wrong tax amounts to third-party integrators. The second is the individual tax PDF export, which hardcodes pre-2026 PIT bands and displays them even when 2026 rules are selected.

## Errors Found

### Error 1: Partner API — Wrong CIT Rate (25% instead of 30%)

`supabase/functions/partner-api/index.ts` line 34 uses `0.25` for the 2026 CIT rate. The correct rate is `0.30` per NTA 2025. This means every API call for a large company under 2026 rules returns a CIT figure that is **16.7% too low**.

### Error 2: Partner API — Wrong Pre-2026 TET Rate (2% instead of 3%)

Line 39 uses `0.02` for the pre-2026 Education Levy. The correct rate is `0.03` per Finance Act 2023. This matches the same error fixed in Phase 10 for the main calculator.

### Error 3: Partner API — Wrong 2026 PIT Bands

Lines 42-54 implement only 4 PIT bands with a **19%** rate and wrong thresholds. The correct 2026 structure has 6 bands (15%, 18%, 21%, 23%, 25%) with the ₦800,000 exemption applied differently. The current code also starts the first band at ₦300,000 width instead of ₦2,200,000.

**Current (wrong):**
```text
Band 1: Next 300,000 at 15%
Band 2: Next 300,000 at 19%
Band 3: Next 500,000 at 21%
Band 4: Above at 25%
```

**Correct (NTA 2025):**
```text
Band 1: Next 2,200,000 (800k-3M) at 15%
Band 2: Next 9,000,000 (3M-12M) at 18%
Band 3: Next 13,000,000 (12M-25M) at 21%
Band 4: Next 25,000,000 (25M-50M) at 23%
Band 5: Above 50,000,000 at 25%
```

### Error 4: Individual PDF Export — Hardcoded Pre-2026 Bands

`src/lib/individualPdfExport.ts` lines 142-149 hardcode the pre-2026 PIT band table (7%, 11%, 15%, 19%, 21%, 24%) and display it regardless of whether the user selected 2026 rules. When a user generates a PDF with 2026 rules, they see pre-2026 rates in the "Progressive Tax Bands Applied" section, contradicting the actual calculated amounts.

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/partner-api/index.ts` | Fix CIT rate 0.25 to 0.30 (line 34); fix TET 0.02 to 0.03 (line 39); rewrite 2026 PIT bands to 6-band structure (lines 42-54) |
| `src/lib/individualPdfExport.ts` | Make PIT band table conditional on `inputs.use2026Rules`, showing correct 2026 bands (0%, 15%, 18%, 21%, 23%, 25%) or pre-2026 bands (7%, 11%, 15%, 19%, 21%, 24%) |

## Technical Details

### partner-api/index.ts CIT fix (line 34)
- From: `const citRate = use2026Rules ? 0.25 : 0.30;`
- To: `const citRate = 0.30;` (30% for both regimes; small companies already handled above)

### partner-api/index.ts TET fix (line 39)
- From: `developmentLevy = use2026Rules ? taxableIncome * 0.04 : taxableIncome * 0.02;`
- To: `developmentLevy = use2026Rules ? taxableIncome * 0.04 : taxableIncome * 0.03;`
- Additionally: small companies should get 0 Development Levy under 2026 rules (needs check)

### partner-api/index.ts 2026 PIT bands rewrite (lines 42-54)
Replace the 4-band structure with the correct 6-band NTA 2025 structure:
```text
Exemption: First 800,000 at 0%
Band 1: 800,001 - 3,000,000 at 15%
Band 2: 3,000,001 - 12,000,000 at 18%
Band 3: 12,000,001 - 25,000,000 at 21%
Band 4: 25,000,001 - 50,000,000 at 23%
Band 5: Above 50,000,000 at 25%
```

### individualPdfExport.ts conditional bands (lines 142-149)
Add a condition based on `inputs.use2026Rules`:
- **2026 bands:** First 800,000 (0%), Next 2,200,000 (15%), Next 9,000,000 (18%), Next 13,000,000 (21%), Next 25,000,000 (23%), Above 50,000,000 (25%)
- **Pre-2026 bands:** Keep existing (7%, 11%, 15%, 19%, 21%, 24%)

## What This Addresses

- 1 live API endpoint returning incorrect tax calculations to third-party consumers
- 1 PDF export showing wrong tax bands when 2026 rules are selected
- Synchronization of all calculation paths with the verified main engine in `taxCalculations.ts`

**Total: 2 files modified (1 edge function + 1 lib file), 0 new files created**
