

# SEO/AEO Phase 17: Remaining Pioneer Status References, PDF Export, and Tax Myths Without EDI Context

## Summary

Five files still present Pioneer Status as the current incentive regime without mentioning the Economic Development Incentive (EDI) replacement under NTA 2025. These are user-facing SEO pages, a PDF export module, an AI assistant system prompt, and an educational tax myths module.

## Errors Found

### Error 1: SmallCompanyCITExemption.tsx -- FAQ Describes Pioneer Status as Current (line 21)

The FAQ answer says: "No. Pioneer Status is a separate incentive for specific industries that provides a tax holiday for up to 5 years."

This describes Pioneer Status as active law without noting its replacement by EDI under 2026 rules.

**Fix:** Update to: "No. Pioneer Status (now replaced by EDI under 2026 rules) was a separate incentive. The EDI provides a 5% annual tax credit for 5 years on qualifying capex, rather than a full tax holiday. The Small Company Exemption is automatic based on turnover."

### Error 2: PortHarcourtGuide.tsx -- FAQ Mentions Pioneer Status Without EDI (line 18)

The FAQ says: "Yes, Pioneer Status incentives may apply. Also, companies in designated Free Trade Zones enjoy tax holidays."

This is vague and doesn't mention the EDI transition.

**Fix:** Update to: "Under 2026 rules, Pioneer Status is replaced by the Economic Development Incentive (EDI), providing a 5% annual tax credit for 5 years. Free Trade Zone benefits (Onne Oil & Gas FTZ) continue. Consult a tax professional for current eligibility."

### Error 3: pdfExport.ts -- PDF Shows "Pioneer Status: Tax Holiday Eligible" (line 352)

When generating PDFs for sectors with `pioneerStatus: true`, the export says "Pioneer Status: Tax Holiday Eligible" without any EDI context. This is a downloadable document users may share with accountants.

**Fix:** Change to conditionally show EDI context: "EDI Tax Credit (replaces Pioneer Status)" when the result uses 2026 rules, keeping "Pioneer Status: Tax Holiday Eligible" for pre-2026 reports.

### Error 4: taxMyths.ts -- Pioneer Status Myth Without EDI Update (lines 366-384)

The "pioneer-easy" myth entry explains Pioneer Status mechanics (NIPC application, 5-year holiday) without mentioning that NTA 2025 replaced it with EDI. Users reading this educational content would believe Pioneer Status is still the active regime.

**Fix:** Update the `truth` and `explanation` fields to note that Pioneer Status is replaced by EDI under 2026 rules, while preserving the educational content about the application process.

### Error 5: tax-assistant/index.ts -- System Prompt Lists "Pioneer Status incentives" (line 74)

The AI assistant's system prompt lists "Pioneer Status incentives" as a topic without EDI context. When users ask the assistant about tax incentives, it may describe Pioneer Status as current law.

**Fix:** Update the system prompt line to "Pioneer Status / EDI incentives (EDI replaces Pioneer Status under 2026 rules)" and add an EDI section to the key tax rules.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/blog/SmallCompanyCITExemption.tsx` | Update FAQ answer about Pioneer Status (line 21) |
| `src/pages/seo/PortHarcourtGuide.tsx` | Update oil & gas FAQ to reference EDI (line 18) |
| `src/lib/pdfExport.ts` | Update Pioneer Status label to show EDI context (line 352) |
| `src/lib/taxMyths.ts` | Update pioneer-easy myth with EDI replacement info (lines 366-384) |
| `supabase/functions/tax-assistant/index.ts` | Update system prompt to reference EDI (line 74, add EDI section) |

## Technical Details

### SmallCompanyCITExemption.tsx (line 21)

- From: `'No. Pioneer Status is a separate incentive for specific industries that provides a tax holiday for up to 5 years. The Small Company Exemption is automatic based on turnover and available to all sectors.'`
- To: `'No. Pioneer Status (replaced by EDI under 2026 rules) was a separate incentive. The Economic Development Incentive (EDI) now provides a 5% annual tax credit for 5 years on qualifying capex. The Small Company Exemption is automatic based on turnover and available to all sectors.'`

### PortHarcourtGuide.tsx (line 18)

- From: `'Yes, Pioneer Status incentives may apply. Also, companies in designated Free Trade Zones enjoy tax holidays. However, the 2026 rules have modified some incentives - consult a tax professional for current eligibility.'`
- To: `'Under 2026 rules, Pioneer Status is replaced by the Economic Development Incentive (EDI), providing a 5% annual tax credit for 5 years on qualifying capex. Free Trade Zone benefits (e.g., Onne Oil & Gas FTZ) continue to apply. Consult a tax professional for current eligibility.'`

### pdfExport.ts (line 352)

- From: `ruleItems.push('Pioneer Status: Tax Holiday Eligible');`
- To: `ruleItems.push('EDI Tax Credit (replaces Pioneer Status): 5% annual credit for 5 years');`

### taxMyths.ts (lines 366-384)

Update the myth entry:
- `myth`: Keep as-is (still a valid myth to debunk)
- `truth`: Change to `'Pioneer Status required formal application to NIPC. Under 2026 rules, it is replaced by EDI (5% annual tax credit for 5 years on qualifying capex).'`
- `explanation`: Add a sentence noting that existing Pioneer Status approvals continue but new applicants should apply for EDI
- `quiz.explanation`: Update to mention EDI replacement

### tax-assistant/index.ts (line 74)

- From: `- Pioneer Status incentives`
- To: `- Pioneer Status / EDI incentives (EDI replaces Pioneer Status under 2026 rules: 5% annual tax credit for 5 years on qualifying capex)`

Add after the CIT section (around line 103):

```
ECONOMIC DEVELOPMENT INCENTIVE (EDI):
- Replaces Pioneer Status under NTA 2025
- 5% annual tax credit for 5 years on qualifying capital expenditure
- Applies to designated sectors (tech, manufacturing, agriculture, etc.)
- Existing Pioneer Status approvals continue under original terms
```

## What This Addresses

- 1 SEO blog FAQ presenting Pioneer Status as current law
- 1 SEO state guide FAQ omitting EDI in oil & gas incentives context
- 1 PDF export labeling Pioneer Status without EDI transition
- 1 educational myth module describing Pioneer Status mechanics without noting its replacement
- 1 AI assistant system prompt that could cause incorrect responses about incentives

**Total: 5 files modified, 0 new files created**

