

# Distribution Strategy: "Salary After Tax" Landing Page

## Context

Both Gemini and Perplexity now agree: your technical SEO/AEO is effectively "done." The gap is **distribution and authority**. Two high-impact, code-implementable actions were identified:

1. **"Salary After Tax" SEO landing page** -- captures the consumer search term HRPayHub dominates
2. **Embeddable widget improvements** -- already built at `/embed/calculator` with full partner branding

This plan focuses on **#1** since the embed infrastructure already exists. The widget route (`/embed/calculator`), the `EmbeddableCalculator` component, and the `PartnerBranding` dashboard are all fully functional.

## What We Will Build

A new SEO landing page at `/salary-after-tax-nigeria` that reframes the existing `QuickTaxCalculator` component and `individualTaxCalculations` logic using consumer-friendly language ("take-home pay", "net salary", "salary after tax") instead of technical tax terminology.

## Page Structure

| Section | Purpose |
|---------|---------|
| SEOHead with full schema | SoftwareApplication, FAQPage, HowTo, Breadcrumb, Speakable, DefinedTermSet |
| Hero | H1: "Salary After Tax Calculator Nigeria (2026 Updates)" |
| QuickTaxCalculator (reused) | Above-the-fold tool with "Monthly Take-Home Pay" framing |
| "How It Works" steps | HowTo schema: 5 consumer-friendly steps |
| Monthly breakdown table | Visual: Gross -> Pension -> Tax -> Net |
| Salary comparison bands | Common salary levels (₦100k-₦2M/month) with net pay |
| 8-10 FAQs | Consumer questions: "What is my take-home on ₦500k?", "Is minimum wage taxed?" etc. |
| CTA | Links to full Individual Calculator and Reverse Salary tab |
| Trust badges + disclaimer | Reused components |

## Target Keywords

- "salary after tax Nigeria"
- "take home pay calculator Nigeria 2026"  
- "net salary calculator Nigeria"
- "how much tax do I pay on my salary Nigeria"
- "PAYE calculator Nigeria 2026"

## Files Changed

| File | Change |
|------|--------|
| `src/pages/seo/SalaryAfterTax.tsx` | New page (~400 lines, follows exact pattern of PITPAYECalculator.tsx) |
| `src/App.tsx` | Add lazy import + route at `/salary-after-tax-nigeria` |
| `public/sitemap.xml` | Add new URL entry |
| `index.html` | Add noscript fallback content for the salary-after-tax keyword cluster |

## Technical Details

- Reuses `QuickTaxCalculator` component (already computes net pay, effective rate, and 2026 vs pre-2026 comparison)
- Reuses `calculatePersonalIncomeTax` from `individualTaxCalculations.ts` for the salary band comparison table
- Follows the exact SEO page architecture established in `PITPAYECalculator.tsx`: SEOHead with multi-schema `@graph`, breadcrumbs, content sections, accordion FAQs, trust badges, disclaimer
- All schema helpers (`createCalculatorSchema`, `createFAQSchema`, `createHowToSchema`, `createSpeakableSchema`, `createTaxRateSchema`, `createBreadcrumbSchema`) already exist and will be reused
- Consumer-language FAQs will complement (not duplicate) the existing PIT/PAYE FAQs

## What This Does NOT Do

- Does not duplicate calculator logic -- reuses existing components and functions
- Does not change any existing pages or routes
- Does not affect the embed widget (already fully functional)

