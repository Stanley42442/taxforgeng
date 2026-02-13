

# SEO/AEO Phase 16: State Guides and SectorPresets Still Reference Pioneer Status as Current Law

## Summary

Four files reference Pioneer Status as the current incentive regime without mentioning that NTA 2025 replaced it with the Economic Development Incentive (EDI). The blog post was updated in Phase 15, but the state-level SEO guides and the legacy SectorPresets component still present Pioneer Status as active law.

## Errors Found

### Error 1: LagosGuide.tsx — Pioneer Status as Current Incentive (2 references)

**File:** `src/pages/seo/LagosGuide.tsx`

- Line 19 FAQ answer: "Pioneer status may also apply to qualifying tech companies" — no EDI mention
- Line 31 sector tip: "Pioneer status for qualifying tech" — presents as current

**Fix:** Add "(now replaced by EDI under 2026 rules)" context to both references.

### Error 2: KanoGuide.tsx — Pioneer Status Tax Holiday Described as Current (3 references)

**File:** `src/pages/seo/KanoGuide.tsx`

- Line 19 FAQ answer: "may qualify for Pioneer Status incentives, providing a tax holiday of up to 5 years" — describes the old regime as current
- Line 31 sector tip: "Pioneer status for value-addition"
- Line 33 sector tip: "Pioneer status incentives"

**Fix:** Update the FAQ answer to explain that Pioneer Status is replaced by EDI (5% annual credit for 5 years). Update sector tips to reference "EDI/Pioneer Status".

### Error 3: SectorPresets.tsx — Pioneer Status in Myths and Benefits (2 references)

**File:** `src/components/SectorPresets.tsx`

- Line 122: Manufacturing myth says "Pioneer status requires NIPC approval" — should note EDI replacement
- Line 201: Healthcare benefits list includes "Pioneer Status" — should say "EDI (formerly Pioneer Status)"

**Fix:** Update myth truth text and benefits label to reflect EDI transition.

### Error 4: AbujaGuide.tsx — Misleading VAT Phrasing

**File:** `src/pages/seo/AbujaGuide.tsx`, line 32

The consulting sector tip says "VAT on services above ₦25M" which implies VAT only applies above ₦25M turnover. In reality, ₦25M is the mandatory registration threshold — VAT applies to all vatable supplies once registered. This could mislead businesses into thinking they don't need to charge VAT.

**Fix:** Change to "VAT registration mandatory above ₦25M turnover"

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/seo/LagosGuide.tsx` | Add EDI context to 2 Pioneer Status references (lines 19, 31) |
| `src/pages/seo/KanoGuide.tsx` | Update Pioneer Status to EDI in FAQ answer and 2 sector tips (lines 19, 31, 33) |
| `src/components/SectorPresets.tsx` | Update myth text (line 122) and benefits label (line 201) to reference EDI |
| `src/pages/seo/AbujaGuide.tsx` | Fix misleading VAT phrasing in consulting sector tip (line 32) |

## Technical Details

### LagosGuide.tsx

Line 19 (FAQ answer):
- From: `Pioneer status may also apply to qualifying tech companies.`
- To: `Pioneer Status (now replaced by EDI under 2026 rules) may also apply to qualifying tech companies, providing a 5% annual tax credit for 5 years on qualifying capex.`

Line 31 (sector tip):
- From: `Pioneer status for qualifying tech`
- To: `EDI tax credit for qualifying tech (replaces Pioneer Status)`

### KanoGuide.tsx

Line 19 (FAQ answer):
- From: `The textile industry may qualify for Pioneer Status incentives, providing a tax holiday of up to 5 years.`
- To: `Under 2026 rules, the textile industry may qualify for the Economic Development Incentive (EDI), which replaces Pioneer Status and provides a 5% annual tax credit for 5 years on qualifying capital expenditure. Companies with existing Pioneer Status approvals continue under their original terms.`

Line 31 (sector tip):
- From: `Pioneer status for value-addition`
- To: `EDI tax credit for value-addition (replaces Pioneer Status)`

Line 33 (sector tip):
- From: `Pioneer status incentives`
- To: `EDI incentives (replaces Pioneer Status)`

### SectorPresets.tsx

Line 122 (Manufacturing myth):
- From: `truth: 'Pioneer status requires NIPC approval and specific conditions'`
- To: `truth: 'Under 2026 rules, Pioneer Status is replaced by EDI (5% annual tax credit for 5 years). Existing approvals continue under original terms'`

Line 201 (Healthcare benefits):
- From: `'Pioneer Status'`
- To: `'EDI tax credit (formerly Pioneer Status)'`

### AbujaGuide.tsx

Line 32 (consulting sector tip):
- From: `'VAT on services above ₦25M'`
- To: `'VAT registration mandatory above ₦25M turnover'`

## What This Addresses

- 7 references across 3 SEO pages presenting Pioneer Status as current law without EDI context
- 2 references in the legacy SectorPresets component using outdated incentive terminology
- 1 misleading VAT phrasing that could cause businesses to incorrectly believe VAT doesn't apply below ₦25M

**Total: 4 files modified, 0 new files created**

