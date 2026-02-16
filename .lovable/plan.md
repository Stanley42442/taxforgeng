

# Fix: Take-Home Pay Accuracy + Noscript Corrections

## Problem Found

The "Salary After Tax" page has an accuracy bug: the take-home pay column in the salary comparison table and the QuickTaxCalculator "Net Pay" figure show **gross minus tax** but forget to subtract the **8% pension deduction**, which is a real paycheck deduction. This makes the numbers appear ~8% higher than reality and contradicts the hardcoded breakdown example on the same page.

Additionally, the noscript fallback has minor inaccuracies.

## What Needs to Change

### 1. Fix salary band table calculation (SalaryAfterTax.tsx line 37)

Change:
```
monthlyNet: Math.round((annual - result.taxPayable) / 12)
```
To:
```
monthlyNet: Math.round((annual - pension - result.taxPayable) / 12)
```

This will produce correct take-home values:
| Salary | Before Fix | After Fix |
|--------|-----------|-----------|
| 70,000 | 70,000 | 64,400 |
| 500,000 | 434,700 | 394,700 |
| 1,000,000 | 851,900 | 771,900 |

### 2. Fix QuickTaxCalculator net pay (QuickTaxCalculator.tsx line 54)

Change:
```
netPay2026: annual - result2026.taxPayable
```
To:
```
netPay2026: annual - pension - result2026.taxPayable
```

### 3. Update hardcoded breakdown example (SalaryAfterTax.tsx lines 226-245)

Update the PAYE Tax amount from the approximated -70,000 to -65,300 and take-home from 390,000 to 394,700 to match the corrected dynamic calculation.

### 4. Fix noscript fallback (index.html lines 251-258)

- Minimum wage: change "~69,500 (effective rate: ~0.7%)" to "~64,400 (effective rate: 0%)"
- ₦200k: update take-home to match corrected calculation (~166,400)
- ₦500k: confirm ~394,700
- ₦1M: update to ~771,900

### 5. Update FAQ answer (SalaryAfterTax.tsx line 55)

The FAQ about ₦500k salary says "around 390,000-430,000" -- update to reflect the corrected range.

## SEO/AEO Verification Summary

Both Gemini and Perplexity's technical SEO criticisms were **factually wrong** -- all structured data, schemas, meta tags, and crawler fallbacks are already implemented. Their one valid observation -- that authority/backlinks are the real gap -- is a marketing problem, not a code problem. The embeddable widget and content clusters they recommended are already built.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/seo/SalaryAfterTax.tsx` | Fix monthlyNet calculation, update hardcoded breakdown, update FAQ answer |
| `src/components/seo/QuickTaxCalculator.tsx` | Fix netPay2026 to subtract pension |
| `index.html` | Fix noscript salary/take-home approximations |

