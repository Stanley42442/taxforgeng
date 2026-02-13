

# Phase 34 Verification: Issues Found and Fixes Required

After thorough code review of all files created/modified across the 3 sub-phases, here are the findings organized by severity.

---

## Critical Issues (2)

### 1. Employer Cost Calculator: Net pay estimate is too low
**File:** `src/pages/Payroll.tsx` (lines 43-62)

The simplified PIT calculation in the Employer Cost tab deducts only pension and NHF before applying PIT bands. It does NOT account for:
- **2026 rules:** Rent Relief, NHIS, Life Insurance, or the first 800k exemption band (0% rate is present but no reliefs reduce the taxable base)
- **Pre-2026 rules:** Consolidated Relief Allowance (CRA)

Since no reliefs are applied, the taxable income is inflated and the estimated PAYE/net pay shown to users will be **significantly inaccurate** (overtaxed).

**Fix:** Apply CRA (pre-2026) or at minimum the pension relief to the taxable income calculation. Since this is labeled as an "estimate", adding a clear "(simplified estimate)" disclaimer and applying the 2026 bands correctly (which already include the 0% on first 800k) is acceptable. The 0% band IS already applied, so the issue is smaller than it appears -- the main missing piece is the CRA for pre-2026 mode.

### 2. Investment CGT: Small investor exemption is incomplete
**File:** `src/lib/individualTaxCalculations.ts` (line 622)

The 2026 NTA small investor exemption requires **two conditions**:
- Gains <= 10M **AND**
- Disposal proceeds < 150M

Current code only checks `capitalGains <= 10000000`. The `cgtDisposalProceeds` is available in the inputs interface but NOT checked.

**Fix:** Update the condition at line 622 to:
```
if (capitalGains <= 10000000 && (!inputs.cgtDisposalProceeds || inputs.cgtDisposalProceeds < 150000000))
```

---

## Minor Issues (2)

### 3. Freelancer WHT credit assumes 100% WHT coverage
**File:** `src/lib/individualTaxCalculations.ts` (line 438)

The freelancer formal PIT path calculates `whtCredit = turnover * 0.10`, assuming all turnover has 10% WHT deducted. In reality, only invoiced professional services to corporate clients have WHT withheld.

**Fix:** Add a WHT percentage input field to the freelancer section, or add a disclaimer note: "Assumes all revenue has WHT deducted at source. Adjust if some clients do not withhold."

### 4. Rental income: Maintenance relief shown even when zero
**File:** `src/lib/individualTaxCalculations.ts` (line 530)

`reliefs.push` for maintenance happens when `totalDeductions > 0`, but maintenance itself could be 0 while insurance or management fees are non-zero. The maintenance entry with amount 0 would still be pushed.

**Fix:** Add individual checks: `if (maintenance > 0) reliefs.push(...)`.

---

## Code Quality / Maintenance Observations (non-blocking)

### 5. PIT bands duplicated in 3 files
The same PIT band constants exist in:
- `src/lib/individualTaxCalculations.ts`
- `src/lib/reverseSalaryCalculation.ts`
- `src/components/TaxBandVisualization.tsx`

**Recommendation:** Extract to a shared `src/lib/taxBands.ts` constant and import everywhere. This prevents future drift if bands are updated.

### 6. Existing tests may need updates
The test file `src/__tests__/lib/individualTaxCalculations.test.ts` tests the `calculateInvestmentTax` function but does not test the new `calculateRentalTax` function. Additionally, tests for the CGT small investor exemption (line 620-645) don't validate the proceeds condition since it was missing.

**Recommendation:** Add test cases for:
- `calculateRentalTax` function
- CGT exemption with proceeds >= 150M (should NOT be exempt)
- Freelancer formal PIT path
- Reverse salary convergence edge cases

---

## Security Verification: All Clear

| Check | Status |
|-------|--------|
| No user input flows to `dangerouslySetInnerHTML` | Passed -- only static data from `taxProfessionals.ts` |
| Search input sanitized | Passed -- only used in `.includes()` comparison, never as HTML or SQL |
| External links use `rel="noopener noreferrer"` | Passed |
| No Supabase queries without auth checks | Passed -- `handleSaveCalculation` checks `user` before inserting |
| Database save uses parameterized queries via Supabase SDK | Passed |
| `safeLocalStorage` used for all storage access | Passed |
| No console.log of sensitive data | Passed -- uses `logger` throughout |

---

## Summary of Required Changes

| File | Change | Severity |
|------|--------|----------|
| `src/lib/individualTaxCalculations.ts` (line 622) | Add `cgtDisposalProceeds < 150M` to exemption check | Critical |
| `src/lib/individualTaxCalculations.ts` (line 530) | Add `if (maintenance > 0)` guard | Minor |
| `src/lib/individualTaxCalculations.ts` (line 438) | Add disclaimer about WHT credit assumption | Minor |
| `src/pages/Payroll.tsx` (line 43) | Add note that net pay is simplified estimate, or apply basic reliefs | Critical |

All fixes are small, targeted changes. No architectural refactoring needed.
