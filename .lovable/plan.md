

# SEO/AEO Phase 18: Duplicate Data Source, Blog Excerpt, and CRA Language Errors

## Summary

Four files contain factual inaccuracies: the primary sector data source (`sectorConfig.ts`) still has old Pioneer Status text that was only fixed in the duplicate `SectorPresets.tsx`, the blog listing excerpt references "pioneer status" without EDI, and the multilingual translations incorrectly state that "Consolidated Relief Allowance applies" under 2026 rules when CRA was abolished.

## Errors Found

### Error 1: sectorConfig.ts -- Manufacturing Myth Still Uses Old Pioneer Status Text (line 129)

This is the **primary data source** used by `EnhancedSectorPresets`. Phase 16 updated the duplicate in `SectorPresets.tsx` but missed this file.

- Current: `'Pioneer status requires NIPC approval and specific conditions'`
- Should be: `'Under 2026 rules, Pioneer Status is replaced by EDI (5% annual tax credit for 5 years). Existing approvals continue under original terms'`

### Error 2: sectorConfig.ts -- Healthcare Benefits Still Says "Pioneer Status" (line 249)

Same issue -- Phase 16 fixed `SectorPresets.tsx` line 201 but not the source data file.

- Current: `'Pioneer Status'` in the benefits array
- Should be: `'EDI tax credit (formerly Pioneer Status)'`

### Error 3: Blog.tsx -- Excerpt Mentions "pioneer status" Without EDI (line 71)

The blog card excerpt for the Tech Startup Guide says: "...covering the Small Company Exemption, pioneer status, and payroll." This is the blog listing page visible to all visitors and search engines.

- Current: `'...pioneer status, and payroll.'`
- Should be: `'...EDI incentives (formerly Pioneer Status), and payroll.'`

### Error 4: LanguageContext.tsx -- "Consolidated Relief Allowance applies" in 2026 Context (lines 3393 and 3409)

Two translation keys for the individual calculator say "Consolidated Relief Allowance applies" alongside the ₦800,000 tax-free threshold. Under 2026 rules, CRA was abolished and replaced by Rent Relief and specific deductions. This text appears in English, Pidgin, Yoruba, Hausa, and Igbo -- all five languages contain the error.

- `individual.exemptionNote` (line 3393): Says "Consolidated Relief Allowance applies"
- `individual.2026BenefitsInfo` (line 3409): Same incorrect text

Both should say "Rent Relief and specific deductions apply (CRA abolished)" in all five languages.

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/sectorConfig.ts` | Update manufacturing myth (line 129) and healthcare benefits (line 249) |
| `src/pages/Blog.tsx` | Update tech startup excerpt to mention EDI (line 71) |
| `src/contexts/LanguageContext.tsx` | Fix CRA references in 2 translation keys across 5 languages (lines 3393, 3409) |

## Technical Details

### sectorConfig.ts (line 129)
```
From: { myth: 'Manufacturing always qualifies for pioneer status', truth: 'Pioneer status requires NIPC approval and specific conditions' }
To:   { myth: 'Manufacturing always qualifies for pioneer status', truth: 'Under 2026 rules, Pioneer Status is replaced by EDI (5% annual tax credit for 5 years). Existing approvals continue under original terms' }
```

### sectorConfig.ts (line 249)
```
From: benefits: ['VAT-exempt services', 'Equipment duty waiver', 'Pioneer Status'],
To:   benefits: ['VAT-exempt services', 'Equipment duty waiver', 'EDI tax credit (formerly Pioneer Status)'],
```

### Blog.tsx (line 71)
```
From: excerpt: '...covering the Small Company Exemption, pioneer status, and payroll.',
To:   excerpt: '...covering the Small Company Exemption, EDI incentives (formerly Pioneer Status), and payroll.',
```

### LanguageContext.tsx (line 3393)
Update `individual.exemptionNote` -- all 5 languages:
- English: "First ₦800,000 is tax-exempt. Rent Relief and specific deductions apply (CRA abolished)."
- Pidgin: "First ₦800,000 no get tax. Rent Relief and specific deductions dey apply (CRA don cancel)."
- Yoruba, Hausa, Igbo: Corresponding translations with CRA removal noted

### LanguageContext.tsx (line 3409)
Update `individual.2026BenefitsInfo` -- same correction across all 5 languages.

## What This Addresses

- 2 data source entries in `sectorConfig.ts` that were missed when their duplicates in `SectorPresets.tsx` were updated in Phase 16
- 1 blog listing excerpt visible to search engines presenting Pioneer Status without EDI context
- 2 multilingual translation keys (10 language strings total) incorrectly stating CRA still applies under 2026 rules

**Total: 4 files modified, 0 new files created**

