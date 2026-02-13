
# SEO/AEO Phase 29: Add Missing NTA 2025 Deduction (Mortgage Interest) and Exemption Rules

## Research Findings

Competitor analysis of SME Payroll (smepayroll.com.ng), NairaTax (nairatax.com), PwC Tax Summaries, and Giddaa reveals that TaxForge NG is missing one of the **six eligible deductions** under the Nigeria Tax Act 2025, plus three exemption rules that competitors prominently feature.

**Our site vs competitors:**

| Feature | TaxForge | SME Payroll | PwC |
|---------|----------|-------------|-----|
| 6 PIT bands (correct) | Yes | Yes | Yes |
| Pension deduction | Yes | Yes | Yes |
| NHF deduction | Yes | Yes | Yes |
| NHIS deduction | Yes | Yes | Yes |
| Rent Relief | Yes | Yes | Yes |
| Life Insurance | Yes | Yes | Yes |
| **Mortgage Interest** | **No** | **Yes** | **Yes** |
| Min wage exemption note | No | Yes | -- |
| Military salary exemption | No | Yes | -- |
| Employment comp exemption | No | Yes | -- |

Note: NairaTax has **incorrect** data (still shows old CIT at 20% for small companies at N25M threshold, and only 4 PIT bands topping at 24%). Our calculations are verified correct.

## What Needs to Change

### 1. Add Mortgage Interest Deduction to Calculator Engine

**File: `src/lib/individualTaxCalculations.ts`**

Add a new input field `mortgageInterest` to `IndividualTaxInputs` interface and include it in the deduction logic alongside the existing 5 deductions. Per PwC and Giddaa (citing NTA 2025 directly):
- Only interest on loans used to **build** (not buy) an owner-occupied residential house qualifies
- Only the **interest portion** is deductible, not principal
- Property must be self-occupied (not rental/investment)

Add the field after `annualRentPaid`:
```typescript
mortgageInterest?: number; // Interest on loan for building owner-occupied home
```

Add deduction logic in the `calculatePersonalIncomeTax` function (2026 rules block only, after rent relief):
```typescript
if (inputs.mortgageInterest && inputs.mortgageInterest > 0) {
  reliefs.push({
    name: 'Mortgage Interest (Owner-Occupied)',
    amount: inputs.mortgageInterest,
    description: 'Interest on loan for building owner-occupied home'
  });
  totalReliefs += inputs.mortgageInterest;
}
```

### 2. Add Mortgage Interest Input to Calculator UI

**File: `src/pages/IndividualCalculator.tsx`**

Add a new input field for mortgage interest in the PIT calculator form, near the existing rent/housing fields. Include a tooltip explaining the narrow qualification criteria.

### 3. Add Exemption Alerts to Calculator

**File: `src/lib/individualTaxCalculations.ts`**

Add three new alerts in the `calculatePersonalIncomeTax` function:

- When gross income equals national minimum wage (~N840,000/year): "National minimum wage earners (N70,000/month) are exempt from income tax under 2026 rules"
- A general info alert about military salary exemption
- A general info alert about employment compensation <= N50M exemption

### 4. Update Educational Content

**File: `src/pages/seo/PITPAYECalculator.tsx`**

Add mortgage interest to the "How It Works" steps and FAQ section. Add a new FAQ:
- "Can I deduct mortgage interest from my tax?" with the answer explaining the build-only, owner-occupied restriction.

**File: `src/pages/blog/PITPAYEGuide2026.tsx`**

Add a mention of the 6th deduction (mortgage interest) and the minimum wage exemption in the content body.

### 5. Update AEO Documentation

**File: `public/llms-full.txt`**

Add "Mortgage Interest (building owner-occupied home)" to the Statutory Deductions table. Add a new "Exemptions" section listing minimum wage, military salary, and employment compensation exemptions.

**File: `public/llms.txt`**

Add mortgage interest to the deductions list.

### 6. Update SEO Landing Page Content

**File: `src/pages/seo/RentRelief2026.tsx`**

Update the "Common Mistakes" section: the current text says homeowners with mortgages don't qualify for Rent Relief. This is correct but should now cross-reference the separate mortgage interest deduction so users know there IS a deduction available for building their own home.

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/individualTaxCalculations.ts` | Add `mortgageInterest` field, deduction logic, and exemption alerts |
| `src/pages/IndividualCalculator.tsx` | Add mortgage interest input field to PIT form |
| `src/pages/seo/PITPAYECalculator.tsx` | Add FAQ and How-To step for mortgage interest |
| `src/pages/blog/PITPAYEGuide2026.tsx` | Add deduction and exemption content |
| `src/pages/seo/RentRelief2026.tsx` | Cross-reference mortgage interest deduction |
| `public/llms-full.txt` | Add mortgage interest deduction and exemptions section |
| `public/llms.txt` | Add mortgage interest to deductions list |

## What This Addresses

- Closes the only factual gap in our calculator vs competitors (6th eligible deduction)
- Adds three exemption rules that SME Payroll features but we do not
- Strengthens AEO accuracy: AI engines will now find complete deduction coverage
- Maintains our advantage over NairaTax (which has incorrect CIT/PIT data)

**Total: 7 files modified, 0 new files created**
