
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

## TODO - Sub-phase B: Enhanced Tabs + Employer Cost

### 1b. New Tab: "Rental Income" (`rental`) in IndividualCalculator
- Inputs: annual rental income, maintenance costs, insurance, management fees, WHT already deducted (10%)
- Calculates net rental tax position after WHT credits
- Integration with PIT bands for total tax liability

### 1c. Enhanced "Investment" Tab
- Add dedicated Capital Gains Tax section with asset type selector, acquisition/disposal costs, holding period
- 2026 small investor exemption logic (gains <= N10M AND proceeds < N150M)

### 1d. Enhanced "Informal" Tab (Freelancer)
- Add professional services distinction, WHT implications, VAT threshold check
- Toggle between presumptive and formal PIT paths, home office deduction

### Employer Cost Calculator (Payroll page new tab)
- Inputs: employee gross salary
- Auto-calculates employer contributions: Pension (10%), NSITF (1%), ITF (1%)
- Shows total cost-to-company vs employee take-home

---

## TODO - Sub-phase C: Tax Professional Directory + Nav Updates

### Tax Professional Directory (New Page)
- `src/pages/TaxProfessionalDirectory.tsx` + `src/lib/taxProfessionals.ts`
- Searchable directory by state, specialty, professional body
- SEO schema: LocalBusiness structured data

### Navigation & Routes
- Add route in App.tsx
- Add "Find a Tax Pro" link in NavMenu Resources group
