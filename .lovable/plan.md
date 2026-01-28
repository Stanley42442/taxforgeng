
# TaxForge NG Individual Operator Rebranding Plan

## Overview

This plan updates all PDF exports and related code to reflect TaxForge NG as an individual-operated project by **Gillespie Benjamin Mclee**, removing any references to a registered Limited Liability Company (TIN, RC numbers, corporate addresses) while preserving the premium gold/green branding, layout, and professional feel.

---

## Branding Update Summary

| Element | Old Value | New Value |
|---------|-----------|-----------|
| Company Name | TaxForge Nigeria Limited | TaxForge NG |
| Operator | (none) | Gillespie Benjamin Mclee (OptiSolve Labs) |
| Short Operator | (none) | Gillespie Benjamin Mclee |
| TIN | 12345678-0001 | *Removed* |
| RC Number | RC 1234567 | *Removed* |
| Address | 123 Tax Avenue, Victoria Island, Lagos | *Removed* |
| Location (disclaimers) | (none) | Port Harcourt, Rivers State, Nigeria |
| Email | support@taxforgeng.com | support@taxforgeng.com *(unchanged)* |

---

## Files to Modify

### 1. Core Export Configuration
**File: `src/lib/exportShared.ts`**

Update the central `COMPANY_INFO` constant:

```typescript
export const COMPANY_INFO = {
  name: 'TaxForge NG',
  shortName: 'TaxForge NG',
  logoText: 'TF',
  operator: 'Gillespie Benjamin Mclee (OptiSolve Labs)',
  operatorShort: 'Gillespie Benjamin Mclee',
  location: 'Port Harcourt, Rivers State, Nigeria',
  email: 'support@taxforgeng.com',
  website: 'www.taxforgeng.com',
  liveUrl: 'https://taxforgeng.lovable.app',
} as const;
```

Add a new standard disclaimer constant:

```typescript
export const STANDARD_DISCLAIMER = 
  'TaxForge NG is an educational and planning tool operated by Gillespie Benjamin Mclee as an individual project. ' +
  'All calculations are estimates based on user inputs and publicly available tax rules. ' +
  'Not official tax advice, filing, or legal service. Please consult a certified tax professional for official compliance. ' +
  'Operated in Port Harcourt, Rivers State, Nigeria.';
```

Update `addPDFFooter` function copyright line:
```typescript
`© ${year} ${COMPANY_INFO.shortName} | Operated by ${COMPANY_INFO.operatorShort} | ${COMPANY_INFO.email} | Educational tool only`
```

---

### 2. Payment Invoice PDF
**File: `src/lib/invoicePdfExport.ts`**

Update FROM section:
- Display "TaxForge NG" as header
- Display "Operated by Gillespie Benjamin Mclee (OptiSolve Labs)" below
- Display email address
- Remove TIN line completely
- Remove address line completely
- Add strengthened disclaimer to notes section

---

### 3. Payment Invoice Hook
**File: `src/hooks/usePaymentInvoice.ts`**

Update invoice data:
```typescript
businessName: 'TaxForge NG',
businessOperator: 'Gillespie Benjamin Mclee (OptiSolve Labs)',
businessEmail: 'support@taxforgeng.com',
// Remove: businessAddress, businessTIN
```

---

### 4. Company Tax Report PDF
**File: `src/lib/pdfExport.ts`**

Update entity type display to show individual-friendly labels:
```typescript
const entityLabel = result.entityType === 'Limited Liability Company' 
  ? 'Individual / Sole Proprietorship (for planning purposes)'
  : result.entityType;
```

Update footer to use `STANDARD_DISCLAIMER`.

---

### 5. Individual Tax Report PDF
**File: `src/lib/individualPdfExport.ts`**

Update footer disclaimer to use `STANDARD_DISCLAIMER`.

---

### 6. Business Report PDF
**File: `src/lib/businessReportPdf.ts`**

Update footer text:
```typescript
'© ' + year + ' TaxForge NG | Operated by Gillespie Benjamin Mclee | support@taxforgeng.com | Educational tool only'
```

---

### 7. Project Documentation PDF
**File: `src/lib/documentationPdf.ts`**

- Keep "TaxForge NG" title on cover page
- Keep live stats box unchanged
- Keep QR code unchanged
- Update contact section via shared COMPANY_INFO
- Add standard disclaimer to document

---

### 8. Tax Logic Reference Document PDF
**File: `src/lib/taxLogicDocumentPdf.ts`**

Update footer and add standard disclaimer (uses shared COMPANY_INFO).

---

## Standard Elements for All PDFs

### Copyright Line (Footer):
```
© 2026 TaxForge NG | Operated by Gillespie Benjamin Mclee | support@taxforgeng.com | Educational tool only
```

### Strengthened Disclaimer:
> "TaxForge NG is an educational and planning tool operated by Gillespie Benjamin Mclee as an individual project. All calculations are estimates based on user inputs and publicly available tax rules. Not official tax advice, filing, or legal service. Please consult a certified tax professional for official compliance. Operated in Port Harcourt, Rivers State, Nigeria."

---

## Elements to Keep Unchanged

- "TF" logo icon and "TaxForge NG" title
- All gold (#D4AF37) and green (#008751) branding
- All tables, charts, layouts, fonts, spacing
- QR codes linking to live site
- Live statistics boxes (users, businesses, calculations, AI queries)
- All calculation logic and numbers
- Page numbers
- All icons and visual elements
- "Rules: 2026 (New)" / "Pre-2026" toggle
- PAYMENT CONFIRMED badges on invoices
- All totals, breakdowns, and financial displays

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/lib/exportShared.ts` | Update COMPANY_INFO, add STANDARD_DISCLAIMER, update addPDFFooter |
| `src/lib/invoicePdfExport.ts` | Update FROM section, remove TIN/address, add disclaimer |
| `src/hooks/usePaymentInvoice.ts` | Remove businessTIN, businessAddress |
| `src/lib/pdfExport.ts` | Update entityType label, use new disclaimer |
| `src/lib/individualPdfExport.ts` | Use new disclaimer |
| `src/lib/businessReportPdf.ts` | Update footer with new branding |
| `src/lib/documentationPdf.ts` | Add disclaimer (uses shared COMPANY_INFO) |
| `src/lib/taxLogicDocumentPdf.ts` | Add disclaimer (uses shared COMPANY_INFO) |

---

## Technical Notes

1. **Centralized Changes**: Most changes flow from `exportShared.ts`, ensuring consistency across all PDFs

2. **Legal Protection**: The strengthened disclaimer clearly establishes:
   - Individual operation by Gillespie Benjamin Mclee (not a company)
   - Educational/planning purpose only
   - Not official tax advice
   - Requirement to consult professionals
   - Operating location (Port Harcourt, Rivers State)

3. **No Breaking Changes**: Removing fields from interfaces; existing functionality preserved

4. **PDF Size**: Minimal impact from longer disclaimer text (few bytes)

5. **Print-Friendly**: Disclaimers at 7-8pt font to maintain readability

6. **Future-Proof**: When you register an LLC, simply update `COMPANY_INFO` in one file to restore corporate branding
