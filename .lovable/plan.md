

# Phase 3: Enhance Existing Pages (Depth + AEO)

## Overview

Add educational depth to all 7 existing SEO calculator/landing pages. Each page gets 3 new content sections: "How This Works" (step-by-step), "Common Mistakes" (warnings), and expanded FAQ accordions using Radix Accordion components. This increases word count by 400-600 words per page and strengthens Answer Engine Optimization.

---

## What Changes Per Page

Each of the 7 SEO pages gets these **3 new sections** inserted between existing content:

### Section 1: "How This Works" (Step-by-Step)
- 4-5 numbered steps in glass-frosted cards
- Uses existing design patterns (icons, rounded-2xl, hover-lift)
- HowTo schema added to pages that don't already have it

### Section 2: "Common Mistakes to Avoid"
- 4-5 warning items with AlertTriangle icons
- Each mistake has a title + explanation paragraph
- Practical "what to do instead" guidance

### Section 3: Expanded FAQ Accordion
- Replace current flat FAQ display with Radix Accordion (already installed)
- Add 3-5 more questions to each page (targeting long-tail search queries)
- Proper open/close interaction for better UX

---

## Page-by-Page Enhancements

### 1. FreeCalculator.tsx (272 lines -> ~420 lines)
**How It Works:**
1. Enter your annual gross income in Naira
2. Add rent paid (for Rent Relief calculation)
3. Include pension and NHF contributions
4. View your tax breakdown with 2026 bands
5. Compare savings vs old rules

**Common Mistakes:**
- Using gross instead of taxable income
- Forgetting to claim Rent Relief
- Assuming CRA still applies under 2026 rules
- Not considering employer pension contributions

**New FAQs:** 3 additional questions about mobile usage, data privacy, saving results

---

### 2. CITCalculator.tsx (370 lines -> ~520 lines)
**How It Works:**
1. Determine your company's annual turnover
2. Calculate total fixed assets value
3. Check which CIT category you fall into
4. Calculate CIT and Development Levy
5. Subtract any WHT credits

**Common Mistakes:**
- Confusing turnover with profit for size classification
- Forgetting the asset test (<=250M) for small company status
- Not filing returns even at 0% CIT rate
- Ignoring the 4% Development Levy

**New FAQs:** 3 additional questions about newly incorporated companies, mixed-income, provisional tax

---

### 3. PITPAYECalculator.tsx (417 lines -> ~570 lines)
**How It Works:**
1. Enter gross annual salary
2. Deduct pension (8%) and NHF (2.5%)
3. Apply Rent Relief (20% of rent, max 500k)
4. Apply progressive tax bands starting at 800k
5. View monthly PAYE amount

**Common Mistakes:**
- Using the old CRA formula (abolished in 2026)
- Not applying the 800k tax-free threshold first
- Confusing annual vs monthly calculations
- Employers not updating payroll systems for new bands

**New FAQs:** 3 additional on dual employment, bonus taxation, arrears

---

### 4. VATCalculator.tsx (361 lines -> ~510 lines)
**How It Works:**
1. Enter sale price (VAT-exclusive or inclusive)
2. Check if item is VAT-exempt
3. Apply 7.5% standard rate
4. Calculate Input vs Output VAT
5. Determine net VAT payable to FIRS

**Common Mistakes:**
- Charging VAT below 25M turnover threshold (voluntary only)
- VAT on exempt items (basic food, medical, education)
- Late monthly filing (due by 21st)
- Not keeping proper VAT invoices

**New FAQs:** 3 additional on e-commerce VAT, cross-border, penalties

---

### 5. WHTCalculator.tsx (395 lines -> ~545 lines)
**How It Works:**
1. Identify the payment type (contract, rent, dividend, etc.)
2. Look up the applicable WHT rate
3. Deduct WHT before making payment
4. Issue WHT credit note to recipient
5. Remit WHT to FIRS within 21 days

**Common Mistakes:**
- Treating WHT as a final tax (it's usually a credit)
- Not issuing credit notes to recipients
- Applying wrong rate (e.g., 5% for contracts vs 10% for rent)
- Missing the 21-day remittance deadline

**New FAQs:** 3 additional on non-resident WHT, group companies, recoverable credits

---

### 6. TaxReforms2026.tsx (320 lines -> ~470 lines)
**How It Works:** (renamed to "How These Reforms Affect You")
1. Check your income level against new PIT bands
2. Review if your company qualifies for 0% CIT
3. Calculate your Rent Relief entitlement
4. Understand the Development Levy impact
5. Update your compliance calendar

**Common Mistakes:**
- Assuming old CRA still applies
- Thinking all small businesses automatically get 0% CIT (asset test matters)
- Ignoring the Development Levy as a "new" cost
- Not updating filing deadlines

**New FAQs:** 5 additional on transition rules, backdating, state vs federal

---

### 7. SmallCompanyExemption.tsx (345 lines -> ~480 lines)
Already has HowTo schema. Add:

**Common Mistakes:**
- Only checking turnover, not fixed assets
- Not filing returns (still required at 0%)
- Assuming exemption is automatic without proper documentation
- Exceeding thresholds mid-year

**New FAQs:** 3 additional on group companies, dormant companies, transition year

---

### 8. RentRelief2026.tsx (339 lines -> ~480 lines)
**How It Works:**
1. Gather proof of rent paid (receipts, tenancy agreement)
2. Calculate 20% of annual rent
3. Cap at 500,000 maximum
4. Deduct from taxable income before applying PIT bands
5. File with supporting documentation

**Common Mistakes:**
- Claiming without proof of payment
- Exceeding the 500k cap
- Homeowners trying to claim (renters only)
- Not obtaining landlord's TIN for large claims

**New FAQs:** 3 additional on shared accommodation, office rent, mid-year moves

---

## Technical Approach

### FAQ Accordion Upgrade
Replace flat FAQ `div` displays with the existing Radix Accordion component:

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  {faqs.map((faq, i) => (
    <AccordionItem key={i} value={`faq-${i}`}>
      <AccordionTrigger>{faq.question}</AccordionTrigger>
      <AccordionContent>{faq.answer}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

### Schema Updates
- Add `HowTo` schema to pages that don't have it (FreeCalculator, CIT, PIT/PAYE, VAT, WHT, RentRelief)
- SmallCompanyExemption already has HowTo schema
- TaxReforms2026 gets a modified version ("How These Reforms Affect You")

### No New Files
All changes are edits to existing files. No new components needed.

---

## Files Modified

| File | Current Lines | Estimated New Lines | New Sections |
|------|--------------|-------------------|-------------|
| `src/pages/seo/FreeCalculator.tsx` | 272 | ~420 | How It Works, Common Mistakes, Accordion FAQ |
| `src/pages/seo/CITCalculator.tsx` | 370 | ~520 | How It Works, Common Mistakes, Accordion FAQ |
| `src/pages/seo/PITPAYECalculator.tsx` | 417 | ~570 | How It Works, Common Mistakes, Accordion FAQ |
| `src/pages/seo/VATCalculator.tsx` | 361 | ~510 | How It Works, Common Mistakes, Accordion FAQ |
| `src/pages/seo/WHTCalculator.tsx` | 395 | ~545 | How It Works, Common Mistakes, Accordion FAQ |
| `src/pages/seo/TaxReforms2026.tsx` | 320 | ~470 | How Reforms Affect You, Common Mistakes, Accordion FAQ |
| `src/pages/seo/SmallCompanyExemption.tsx` | 345 | ~480 | Common Mistakes, Accordion FAQ |
| `src/pages/seo/RentRelief2026.tsx` | 339 | ~480 | How It Works, Common Mistakes, Accordion FAQ |

**Total: 8 files modified, ~1,200 lines of new content added**

---

## Implementation Order

1. FreeCalculator.tsx (highest traffic page)
2. PITPAYECalculator.tsx
3. CITCalculator.tsx
4. VATCalculator.tsx
5. WHTCalculator.tsx
6. TaxReforms2026.tsx
7. SmallCompanyExemption.tsx
8. RentRelief2026.tsx

