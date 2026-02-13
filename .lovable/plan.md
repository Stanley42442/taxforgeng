

# SEO/AEO Phase 9: Remaining Factual Errors in Blog Posts, Comparison Table, and Translations

## Summary

After Phases 7 and 8 corrected errors in the SEO landing pages, FAQ, and Tax Breakdown, several blog posts, the ComparisonTable component, and a translation string still contain factual errors that contradict the Nigeria Tax Act 2025 (effective 2026) and the site's own calculator engine.

## Errors Found

### Error 1: Wrong PIT Bands in PITPAYEGuide2026.tsx (Blog Post)

Lines 66-70 show a 4-band structure with a **19%** rate, missing the **18%** and **23%** bands entirely. The thresholds are also wrong (uses ₦2M/₦8M increments instead of ₦2.2M/₦9M).

**Currently shows:**
| Band | Rate |
|------|------|
| First 800k | 0% |
| Next 2,000,000 | 15% |
| Next 8,000,000 | 19% |
| Next 39,200,000 | 21% |
| Above 50,000,000 | 25% |

**Should be (per NTA 2025, Fourth Schedule):**
| Band | Rate |
|------|------|
| First 800,000 | 0% |
| Next 2,200,000 (800k-3M) | 15% |
| Next 9,000,000 (3M-12M) | 18% |
| Next 13,000,000 (12M-25M) | 21% |
| Next 25,000,000 (25M-50M) | 23% |
| Above 50,000,000 | 25% |

The worked example on lines 114-119 also uses the wrong 19% rate, producing an incorrect tax figure. The comparison table on lines 93-99 with "Old vs New" tax amounts will also need recalculation to match correct bands.

### Error 2: Wrong PIT Bands in PayrollTaxGuide.tsx (Blog Post)

Lines 87-91 show the same wrong 4-band structure with 19% rate and wrong thresholds (₦2,800,000 and ₦10,800,000 instead of ₦3,000,000 and ₦12,000,000).

The worked example on line 103 calculates tax using the wrong 19% rate, producing "₦550,040" which is incorrect.

### Error 3: "Medium Company Rate: 20%" in ComparisonTable.tsx

Line 108 still shows a "Medium Company Rate" row with "20%" for both pre-2026 and post-2026. The medium company category is eliminated under the NTA 2025. This component is used across multiple pages via the ComparisonTable component.

### Error 4: "CIT (25% + 4% Levy)" in LanguageContext.tsx

Line 3799 contains the translation key `businessReport.citRate` with value "CIT (25% + 4% Levy)" across all 4 languages (en, pcm, yo, ha, ig). The CIT rate is 30%, not 25%.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/blog/PITPAYEGuide2026.tsx` | Fix PIT band table (lines 66-70) to 6 bands with correct rates/thresholds; fix worked example (lines 114-119) to use 18% rate; recalculate comparison table amounts (lines 93-99) |
| `src/pages/blog/PayrollTaxGuide.tsx` | Fix PIT band table (lines 87-91) to 6 bands; fix worked example (line 103) to use 18% rate and recalculate |
| `src/components/seo/ComparisonTable.tsx` | Remove "Medium Company Rate" row (line 108); add note about Dev Levy exemption for small companies |
| `src/contexts/LanguageContext.tsx` | Change "CIT (25% + 4% Levy)" to "CIT (30% + 4% Levy)" across all language variants (line 3799) |

## Technical Details

### PITPAYEGuide2026.tsx PIT table fix (lines 66-70)

Replace 5-row table with correct 6-band NTA structure:
```text
First ₦800,000         | 0%  | ₦0
Next ₦2,200,000        | 15% | ₦330,000
Next ₦9,000,000        | 18% | ₦1,950,000
Next ₦13,000,000       | 21% | ₦4,680,000
Next ₦25,000,000       | 23% | ₦10,430,000
Above ₦50,000,000      | 25% | --
```

### PITPAYEGuide2026.tsx worked example fix (lines 114-119)

For ₦5,352,000 taxable income:
- First ₦800,000 at 0%: ₦0
- Next ₦2,200,000 at 15%: ₦330,000
- Remaining ₦2,352,000 at 18%: ₦423,360
- Total: ₦753,360 annual / ₦62,780 monthly PAYE

### PITPAYEGuide2026.tsx comparison table recalculation (lines 93-99)

Recalculate all "2026 Tax" column values using correct bands:
- ₦1,200,000: First 800k = ₦0, next 400k at 15% = ₦60,000
- ₦3,000,000: First 800k = ₦0, next 2,200,000 at 15% = ₦330,000
- ₦5,000,000: ₦330,000 + 2,000,000 at 18% = ₦690,000
- ₦10,000,000: ₦330,000 + 7,000,000 at 18% = ₦1,590,000
- ₦25,000,000: ₦330,000 + 9,000,000 at 18% + 13,000,000 at 21% = ₦4,680,000

### PayrollTaxGuide.tsx worked example fix (line 103)

For ₦4,116,000 taxable income:
- First ₦800,000 at 0%: ₦0
- Next ₦2,200,000 at 15%: ₦330,000
- Remaining ₦1,116,000 at 18%: ₦200,880
- Total: ₦530,880 annual / ₦44,240 monthly PAYE

### ComparisonTable.tsx fix (line 108)

Remove the entire row: `{ feature: 'Medium Company Rate', pre2026: '20%', post2026: '20%' }`

The NTA 2025 eliminates the medium company category. Companies are either Small (0% CIT) or Large (30% CIT).

### LanguageContext.tsx fix (line 3799)

Change all 5 language variants from "25%" to "30%":
- en: "CIT (30% + 4% Levy)"
- pcm: "CIT (30% + 4% Levy)"
- yo: "CIT (30% + 4% Owó)"
- ha: "CIT (30% + 4% Haraji)"
- ig: "CIT (30% + 4% Ụtụ)"

## What This Addresses

- 2 blog posts with wrong PIT bands and worked examples (high-traffic educational content)
- 1 reusable comparison component with a non-existent "Medium Company" category
- 1 translation file with wrong CIT rate visible in business reports across 5 languages

## What This Does NOT Address

- The NASENI Levy reference in TaxGuideTechStartups.tsx is factually correct (0.25% for companies above ₦100M turnover) and does not need changes
- Off-page SEO, backlinks, pre-rendering

**Total: 4 files modified, 0 new files created**

