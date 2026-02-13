
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

## ✅ COMPLETED - Sub-phase A

### Reverse Salary Calculator (new tab in IndividualCalculator)
- Created `src/lib/reverseSalaryCalculation.ts` with iterative binary search solver
- Added "Reverse" tab to IndividualCalculator with monthly net pay input, pension rate, NHF/NHIS toggles, rent relief, life insurance, mortgage interest
- Results show required gross salary, take-home, effective rate, deduction breakdown

### Tax Band Visualization
- Created `src/components/TaxBandVisualization.tsx` with Framer Motion animated bars
- 6 bands with green-to-red color gradient, fill animations
- Integrated into IndividualCalculator results (PIT + Investment) and Reverse Salary results

---

## ✅ COMPLETED - Sub-phase B: Enhanced Tabs + Employer Cost

### Rental Income Tab (IndividualCalculator)
- Added "Rental" tab with annual rental income, WHT deducted, maintenance/insurance/management fee inputs
- New `calculateRentalTax()` function with WHT credit logic and PIT band integration
- Shows net tax payable after WHT credits with detailed breakdown

### Enhanced Investment Tab (CGT)
- Added dedicated Capital Gains Tax section with asset type selector (property/shares/other)
- Acquisition cost, improvement costs, disposal proceeds inputs with auto-calculated gains
- Existing simple capital gains input preserved as override option

### Enhanced Informal Tab (Freelancer)
- Added "Use Formal PIT Path" toggle for professional/freelance services
- Service type selector, business expenses, home office % deduction
- 10% WHT credit calculation for professional services
- VAT registration threshold warning (>₦25M)

### Employer Cost Calculator (Payroll page)
- New "Cost to Co." tab at Basic tier
- Calculates employer pension (10%), NSITF (1%), ITF (1%), employee take-home
- Bulk mode: add multiple salary levels with aggregate totals

---

## TODO - Sub-phase C: Tax Professional Directory + Nav Updates

### Tax Professional Directory (New Page)
- `src/pages/TaxProfessionalDirectory.tsx` + `src/lib/taxProfessionals.ts`
- Searchable directory by state, specialty, professional body
- SEO schema: LocalBusiness structured data

### Navigation & Routes
- Add route in App.tsx
- Add "Find a Tax Pro" link in NavMenu Resources group
