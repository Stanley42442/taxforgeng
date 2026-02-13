

# SEO/AEO Phase 24: Fix Incorrect Small Company Threshold on Results Page

## Summary

The Results page (`src/pages/Results.tsx`) displays the wrong turnover threshold for the small company exemption. When a user completes a tax calculation and sees their results, the label reads:

> "0% CIT for small companies (≤₦25M turnover)"

This is the pre-2026 threshold. Under 2026 rules (NTA 2025), the correct threshold is ₦50M turnover AND ₦250M assets. The `inputs` object -- which contains `use2026Rules` -- is already available on this page, so the fix is to conditionally display the correct threshold.

This is particularly high-impact because the Results page is seen by every user who completes a calculation. Displaying outdated thresholds undermines trust and contradicts the "Accuracy Verified" badge shown on the same page.

**All other ₦25M references in the codebase were audited and are correctly used in pre-2026 contexts** (comparison tables showing "Pre-2026" columns, historical blog references, pre-2026 test cases).

## Change

**File:** `src/pages/Results.tsx` (line 379)

Update the small company label to reflect whichever tax rules the user selected:

```
From:
  '0% CIT for small companies (≤₦25M turnover)'

To (conditional):
  inputs?.use2026Rules
    ? '0% CIT for small companies (turnover ≤₦50M, assets ≤₦250M)'
    : '0% CIT for small companies (≤₦25M turnover)'
```

## Technical Details

The `inputs` variable is already destructured from `location.state` on line 60 and typed as `TaxInputs`, which includes the `use2026Rules` boolean. No new imports or data are needed.

### Exact edit (line 378-381)

```typescript
// From:
{companyResult.isSmallCompany 
  ? '0% CIT for small companies (≤₦25M turnover)'
  : 'Company Income Tax (CIT) at applicable rate'
}

// To:
{companyResult.isSmallCompany 
  ? inputs?.use2026Rules
    ? '0% CIT for small companies (turnover ≤₦50M, assets ≤₦250M)'
    : '0% CIT for small companies (≤₦25M turnover)'
  : 'Company Income Tax (CIT) at applicable rate'
}
```

## What This Addresses

- 1 user-facing label showing the wrong (pre-2026) small company threshold on the most-viewed results page
- Ensures the "Accuracy Verified" badge is not contradicted by stale content on the same page

**Total: 1 file modified, 0 new files created**

