
# Phase 34: New Calculators, Visual Tax Breakdown, and Tax Professional Directory

This phase integrates new features into existing pages where they fit naturally, and only creates new pages where truly necessary.

---

## Where Each Feature Lives

```text
+------------------------------------------+-----------------------------------+
| Feature                                  | Destination                       |
+------------------------------------------+-----------------------------------+
| Reverse Salary Calculator                | IndividualCalculator - new tab    |
| Capital Gains Tax Calculator             | IndividualCalculator - enhance    |
|                                          | existing "investment" tab         |
| Rental Income Calculator                 | IndividualCalculator - new tab    |
| Freelancer/Self-Employment Calculator    | IndividualCalculator - enhance    |
|                                          | existing "informal" tab           |
| Employer Cost Calculator                 | Payroll page - new tab            |
| Visual Tax Band Breakdown               | IndividualCalculator - results    |
| Tax Professional Directory               | New standalone page (no fit)      |
+------------------------------------------+-----------------------------------+
```

---

## Feature 1: IndividualCalculator Enhancements (4 features in 1 page)

The Individual Calculator already has a tab system with: `pit`, `crypto`, `investment`, `informal`, `foreign_income`. We add two new tabs and enhance two existing ones.

### 1a. New Tab: "Reverse Salary" (`reverse`)
- User enters desired net/take-home pay
- Iterative solver calculates required gross salary
- Shows all deductions applied (pension, NHF, NHIS, PIT bands, rent relief)
- Effective rate and total deductions summary

### 1b. New Tab: "Rental Income" (`rental`)
- Inputs: annual rental income, maintenance costs, insurance, management fees, WHT already deducted (10%)
- Calculates net rental tax position after WHT credits
- Integration with PIT bands for total tax liability

### 1c. Enhanced "Investment" Tab
- Add dedicated Capital Gains Tax section with:
  - Asset type selector (property, shares, crypto -- crypto already has its own tab, so focus on property/shares)
  - Acquisition cost, improvement costs, disposal proceeds, holding period
  - 2026 small investor exemption logic (gains <= N10M AND proceeds < N150M)
  - Progressive PIT rates for larger gains

### 1d. Enhanced "Informal" Tab (Freelancer)
- Add professional services distinction (consulting, legal, medical, etc.)
- WHT implications for professional services (10% WHT deducted at source)
- VAT registration threshold check (N25M)
- Toggle between presumptive tax path and formal PIT path
- Home office deduction percentage input

---

## Feature 2: Visual Progressive Tax Breakdown

New component: `src/components/TaxBandVisualization.tsx`

- 6 horizontal animated bars (one per 2026 PIT band) using Framer Motion
- Each bar fills proportionally to show how much income falls in that band
- Color gradient: green (0%) through amber to deep red (25%)
- Shows: band range, rate, amount taxed, tax collected per band
- Pre-2026 mode shows old 6-band structure
- Responsive: stacks vertically on mobile
- Integrated into IndividualCalculator results section (appears after calculation)

---

## Feature 3: Employer Cost Calculator (Payroll Page Tab)

The Payroll page already has 7 tabs. We add an 8th: "Cost to Company".

- Inputs: employee gross salary
- Auto-calculates employer contributions: Pension (10%), NSITF (1%), ITF (1%)
- Shows total cost-to-company vs employee take-home
- Bulk mode: enter multiple salary levels to compare
- Available at Basic tier (same as single payroll calculator)

---

## Feature 4: Tax Professional Directory (New Page)

This is the only feature requiring a new page -- no existing page fits a searchable directory.

New page: `src/pages/TaxProfessionalDirectory.tsx`
New data file: `src/lib/taxProfessionals.ts`

- Searchable directory of tax professionals organized by Nigerian state
- Filters: state, specialty (CIT, PIT, VAT, Payroll), professional body (CITN, ICAN)
- Cards showing: firm name, location, specialties, contact info, membership
- Links to CITN and ICAN verification portals
- SEO schema: LocalBusiness structured data
- Disclaimer: "TaxForge does not endorse or guarantee any listed professional"

---

## Files to Create (4 new files, down from 9)

| File | Purpose |
|------|---------|
| `src/lib/reverseSalaryCalculation.ts` | Net-to-gross iterative solver algorithm |
| `src/components/TaxBandVisualization.tsx` | Animated progressive band visualization |
| `src/pages/TaxProfessionalDirectory.tsx` | Directory page |
| `src/lib/taxProfessionals.ts` | Professional listings data |

## Files to Modify (4 files)

| File | Changes |
|------|---------|
| `src/pages/IndividualCalculator.tsx` | Add "reverse" and "rental" tabs, enhance "investment" and "informal" tabs, integrate TaxBandVisualization into results |
| `src/pages/Payroll.tsx` | Add "Employer Cost" tab |
| `src/App.tsx` | Add 1 new lazy route (tax-professionals) |
| `src/components/NavMenu.tsx` | Add "Find a Tax Pro" link to Resources group |

## Phased Delivery

1. **Sub-phase A:** Reverse Salary tab + Tax Band Visualization + enhanced Investment/Informal tabs in IndividualCalculator
2. **Sub-phase B:** Rental Income tab + Employer Cost tab in Payroll
3. **Sub-phase C:** Tax Professional Directory page + nav/route updates

All calculators use 2026 NTA rules and follow existing code patterns (CurrencyInput, PageLayout, SEOHead, safeLocalStorage persistence).
