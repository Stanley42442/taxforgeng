

## Enhanced Embeddable Widget: Tabbed Multi-Calculator

### Bug Fix

**Redundant PIT display**: When entity type is "Business Name", the results show a "PIT" line item whose value is identical to "Total Tax Payable". This happens because for business names, PIT is the only tax component -- so displaying it separately is redundant. The fix is to replace the single "PIT" line with a **band-by-band breakdown** showing how income is taxed across the 6 progressive PIT bands (matching the main app's behavior).

### New Feature: Tabbed Interface

Transform the single-calculator widget into a **three-tab layout**:

| Tab | Purpose | Key Inputs |
|-----|---------|------------|
| **Business** | Current business/company calculator (enhanced) | Entity type, turnover, expenses, fixed assets, rent paid |
| **Personal (PIT)** | Individual salary/income tax | Gross salary, pension, NHF, NHIS, rent relief, life insurance, mortgage interest |
| **VAT** | Simple VAT calculator | Amount, direction (inclusive/exclusive), VAT rate |

### Tab Details

**Business Tab (enhanced from current)**
- Keep existing entity type selector (Business Name / Company)
- Add "Rent Paid" input for business names (enables rent relief calculation)
- Replace redundant PIT line with progressive band breakdown
- Show CIT + Development Levy breakdown for companies
- Show small company exemption alert when applicable

**Personal (PIT) Tab**
- Gross annual salary input
- Optional deduction inputs: Pension (8% cap), NHF, NHIS, Life Insurance, Annual Rent (for rent relief), Mortgage Interest
- Uses 2026 rules (6-band PIT with 800k exemption)
- Shows: net taxable income, tax per band, total tax, effective rate, monthly take-home
- Monthly take-home formula: `(gross - pension - annual_tax) / 12`

**VAT Tab**
- Amount input
- Toggle: "Calculate VAT on amount" vs "Extract VAT from amount"
- VAT rate: default 7.5%, editable
- Shows: VAT amount, total (inclusive), net (exclusive)
- Small business exemption note (turnover under 25M)

### Technical Approach

All changes are contained within `src/components/EmbeddableCalculator.tsx`:

1. **Add tab state** and a simple custom tab bar styled with the partner's theme colors (no external UI library dependency -- the widget uses inline styles for iframe isolation)
2. **Reuse the 2026 PIT band logic** directly in the component (same constants and progressive calculation already present, just needs band-level output)
3. **Business tab**: Add rent paid input, replace PIT result line with band breakdown items
4. **Personal tab**: New input section with salary + 6 optional deduction fields, calculate using the same progressive band logic with relief subtraction
5. **VAT tab**: Simple two-field calculator with direction toggle
6. **Results section**: Each tab renders its own result card with relevant breakdown items
7. **CTA link**: Add a subtle "Get full features on TaxForge NG" link in results pointing to the main app (not just powered-by)
8. **iframe height**: Update `embed.js` default height from 650 to ~750 to accommodate tabs

### What stays out of the widget (conversion drivers)

- No OCR receipt scanning
- No PDF export
- No save/history
- No comparison mode (2026 vs pre-2026)
- No sector presets
- No reverse salary solver
- No authentication or database calls

Everything remains purely client-side with manual inputs.

