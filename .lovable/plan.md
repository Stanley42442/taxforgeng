

# SEO/AEO Phase 15: Advisory Logic Wrong PIT Rate and Blog Pioneer Status Without EDI Update

## Summary

Two files contain factual inaccuracies about the 2026 tax regime. The advisory recommendation engine quotes the wrong top PIT rate and the old small company threshold. The tech startup blog post presents Pioneer Status as the current incentive regime without mentioning that NTA 2025 replaced it with the Economic Development Incentive (EDI).

## Errors Found

### Error 1: advisoryLogic.ts -- Wrong Top PIT Rate (24% instead of 25%)

**File:** `src/lib/advisoryLogic.ts`, line 87

The LLC recommendation pros list says:

> "Lower corporate income tax rate (30% vs up to 24% PIT)"

The top PIT rate under 2026 rules is **25%** (above N50M), not 24%. The 24% rate was the pre-2026 top band. This is a user-facing recommendation that directly compares entity types.

**Fix:** Change "up to 24% PIT" to "up to 25% PIT"

### Error 2: advisoryLogic.ts -- Stale Small Company Threshold Reference

**File:** `src/lib/advisoryLogic.ts`, line 113

The Business Name pros list says:

> "Lower tax rates for income under N25M"

Under 2026 rules, the small company CIT exemption threshold is N50M (turnover) not N25M. The N25M figure was the pre-2026 threshold. This advisory recommendation feeds directly into entity-type decisions.

**Fix:** Change to "Lower tax rates for income under N50M (2026 small company threshold)"

### Error 3: TaxGuideTechStartups.tsx -- Pioneer Status Without EDI Context

**File:** `src/pages/blog/TaxGuideTechStartups.tsx`, lines 118-135

The blog post presents Pioneer Status (via NIPC) as the current incentive regime. However, the NTA 2025 replaced Pioneer Status with the **Economic Development Incentive (EDI)**: a 5% annual tax credit for 5 years on qualifying capital expenditure. The calculation engine already handles this distinction (taxCalculations.ts lines 214-224), but the blog does not.

This is an authoritative SEO article targeting "Nigeria tech startup tax guide" -- it must reflect the 2026 law.

**Fix:** Add a paragraph noting that under 2026 rules, Pioneer Status is replaced by EDI, while preserving the existing Pioneer Status information as context for companies with existing approvals.

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/advisoryLogic.ts` | Fix "24% PIT" to "25% PIT" (line 87); update "under N25M" to "under N50M" (line 113) |
| `src/pages/blog/TaxGuideTechStartups.tsx` | Add EDI context to Pioneer Status section (lines 118-135) |

## Technical Details

### advisoryLogic.ts (line 87)
- From: `'Lower corporate income tax rate (30% vs up to 24% PIT)',`
- To: `'Lower corporate income tax rate (30% vs up to 25% PIT)',`

### advisoryLogic.ts (line 113)
- From: `'Lower tax rates for income under ₦25M',`
- To: `'Lower tax rates for income under ₦50M (2026 small company threshold)',`

### TaxGuideTechStartups.tsx (lines 118-135)

Update the section heading to "Pioneer Status, EDI & Tax Holidays" and add a paragraph after line 121 explaining:
- Under 2026 rules, the Economic Development Incentive (EDI) replaces Pioneer Status
- EDI provides a 5% annual tax credit for 5 years on qualifying capital expenditure
- Companies with existing Pioneer Status approvals continue under the old terms
- New applicants should apply for EDI through the relevant channels

## What This Addresses

- 1 advisory engine quoting the wrong top PIT rate (24% vs 25%), affecting entity-type recommendations
- 1 advisory engine using a stale N25M small company threshold (should be N50M)
- 1 authoritative blog post presenting an abolished incentive as current law without mentioning its EDI replacement

**Total: 2 files modified, 0 new files created**

