

# SEO/AEO Phase 14: Wrong Asset Threshold in Calculator Tooltip and Stale CIT Tier References

## Summary

Three files contain outdated references to the pre-2026 CIT regime (which had three tiers: 0% small, 20% medium, 30% large) without clarifying that the 2026 rules simplified this to just two tiers (0% small, 30% large). One critical user-facing tooltip displays the wrong fixed assets threshold.

## Errors Found

### Error 1: Calculator.tsx -- Wrong Fixed Assets Threshold in Tooltip

**File:** `src/pages/Calculator.tsx`, line 697

The tooltip for the "Fixed Assets Value" input reads:

> "Used to determine small company status (<=₦100M for 0% CIT under 2026 rules)"

The correct threshold under NTA 2025 Section 56 is **₦250M**, not ₦100M. This directly misleads users entering their asset values -- a company with ₦200M in assets would think it doesn't qualify when it actually does.

### Error 2: VATCalculator.tsx -- Stale "20%" CIT Reference

**File:** `src/pages/seo/VATCalculator.tsx`, line 427

The related tools link says:

> "Calculate CIT at 0%, 20%, or 30%"

The 20% medium-company tier was abolished under the 2026 rules. The current structure is 0% (small) or 30% (large). This is a public SEO page that should reflect the current law.

**Fix:** Change to "Calculate CIT at 0% or 30% under 2026 rules"

### Error 3: E2E Test -- Pre-2026 CIT Tiers Without Regime Labels

**File:** `src/__tests__/e2e/calculator.e2e.test.ts`, lines 11-25 and 103-120

The test describes:
- "0% rate for small companies (under 25M)" -- uses the pre-2026 ₦25M threshold (2026 threshold is ₦50M)
- "20% rate for medium companies (25M-100M)" -- this tier doesn't exist under 2026 rules
- "0.5% minimum tax" -- minimum tax was abolished for small companies under 2026

These tests don't exercise actual app code (they're standalone math), but they serve as documentation and should reflect correct 2026 rules or be clearly labeled as pre-2026 regime tests.

**Fix:** Restructure the CIT test section into two sub-describes: "2026 Rules" (0% small with ₦50M/₦250M thresholds, 30% large) and "Pre-2026 Rules" (0%/20%/30% tiers with ₦25M/₦100M thresholds).

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Calculator.tsx` | Fix tooltip: change "₦100M" to "₦250M" (line 697) |
| `src/pages/seo/VATCalculator.tsx` | Change "0%, 20%, or 30%" to "0% or 30% under 2026 rules" (line 427) |
| `src/__tests__/e2e/calculator.e2e.test.ts` | Restructure CIT tests into 2026 and pre-2026 sections with correct thresholds; label minimum tax tests by regime (lines 11-25, 103-120) |

## Technical Details

### Calculator.tsx (line 697)
- From: `tooltip="Used to determine small company status (≤₦100M for 0% CIT under 2026 rules)"`
- To: `tooltip="Used to determine small company status (≤₦250M for 0% CIT under 2026 rules)"`

### VATCalculator.tsx (line 427)
- From: `Calculate CIT at 0%, 20%, or 30%`
- To: `Calculate CIT at 0% or 30% under 2026 rules`

### calculator.e2e.test.ts CIT section (lines 10-25)
Replace the current three tests with properly labeled tests:
- "2026 Rules: 0% CIT for small companies (turnover ≤ ₦50M AND assets ≤ ₦250M)"
- "2026 Rules: 30% CIT for large companies"
- "Pre-2026 Rules: 20% CIT for medium companies (₦25M-₦100M)" (preserved but clearly labeled as legacy)

### calculator.e2e.test.ts Minimum Tax section (lines 103-120)
Label these tests as "Pre-2026" since minimum tax (0.5%) applied under the old CITA but small companies are now exempt under NTA 2025.

## What This Addresses

- 1 user-facing tooltip showing the wrong asset threshold (₦100M vs ₦250M) that could cause users to miscalculate their eligibility
- 1 SEO page referencing an abolished 20% CIT tier
- 1 test file documenting outdated CIT tiers as if they were current law

**Total: 3 files modified, 0 new files created**

