

# SEO/AEO Phase 12: Inline Calculator Engines with Wrong 2026 PIT Bands and CIT Rates

## Summary

Four components contain their own "quick estimate" tax calculators that bypass the main verified engine in `taxCalculations.ts`. All four have the same two errors: wrong 2026 PIT bands (using 19% instead of 18%, missing the 23% band, wrong thresholds) and wrong CIT rate (25% instead of 30%).

## Errors Found

### Error 1: EmbeddableCalculator.tsx — Wrong CIT (25%) and Wrong PIT Bands

Lines 235 and 242-249: The embeddable widget (used on external sites) calculates CIT at `0.25` and uses a 4-band PIT structure with 19% rate and wrong thresholds (300k/600k/1.1M).

### Error 2: ApiDocs.tsx — Wrong CIT (25%) and Flat PIT

Line 193: The API documentation demo calculator uses `taxableIncome * 0.25` for companies and a flat 18% for all PIT (no progressive bands at all).

### Error 3: Expenses.tsx — Wrong PIT Bands (19% instead of 18%, missing 23%)

Lines 132-156: The expense tracker's inline tax estimator uses 4 bands with 19% rate and a wrong ₦7M second band width (should be ₦9M at 18%). Missing the 23% band entirely.

### Error 4: BusinessReport.tsx — Wrong CIT (25%) and Wrong PIT Bands

Lines 145-167: The business report's inline estimator uses `0.25` for CIT and the same wrong 4-band PIT structure with 19% and wrong thresholds.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/EmbeddableCalculator.tsx` | Fix CIT 0.25 to 0.30 (line 235); rewrite PIT to 6 correct bands (lines 242-249) |
| `src/pages/ApiDocs.tsx` | Fix CIT 0.25 to 0.30 (line 193); add progressive PIT bands (lines 195-197) |
| `src/pages/Expenses.tsx` | Rewrite PIT bands: 15%/18%/21%/23%/25% with correct thresholds (lines 138-154) |
| `src/pages/BusinessReport.tsx` | Fix CIT 0.25 to 0.30 (line 147); rewrite PIT bands to correct 5-band structure (lines 153-165) |

## Technical Details

### Correct 2026 PIT band logic (to apply in all 4 files)

```text
After ₦800,000 exemption:
Band 1: Next ₦2,200,000 at 15%
Band 2: Next ₦9,000,000 at 18%
Band 3: Next ₦13,000,000 at 21%
Band 4: Next ₦25,000,000 at 23%
Band 5: Above ₦50,000,000 at 25%
```

### EmbeddableCalculator.tsx (lines 235, 242-249)

- Line 235: `cit = taxableIncome * 0.25` changes to `cit = taxableIncome * 0.30`
- Lines 242-249: Replace 4-band structure with correct 5-band logic using thresholds 2200000, 11200000, 24200000, 49200000

### ApiDocs.tsx (lines 193, 195-197)

- Line 193: `taxableIncome * 0.25` changes to `taxableIncome * 0.30`
- Lines 195-197: Replace flat `(taxableIncome - 800000) * 0.18` with progressive 5-band calculation

### Expenses.tsx (lines 138-154)

Replace 4 bands with correct 5 bands:
- Band widths: 2200000 (15%), 9000000 (18%), 13000000 (21%), 25000000 (23%), remainder (25%)

### BusinessReport.tsx (lines 147, 153-165)

- Line 147: `income * 0.25 + income * 0.04` changes to `income * 0.30 + income * 0.04`
- Lines 153-165: Replace 3-band structure (15%/19%/21%) with correct 5-band structure (15%/18%/21%/23%/25%)

## What This Addresses

- 4 inline calculator engines producing incorrect tax estimates
- The embeddable widget (shared on external sites) returning wrong figures
- The API docs demo misleading potential API consumers
- Expense and business report pages showing wrong tax projections

**Total: 4 files modified, 0 new files created**

