

## Redesign Remaining Unstyled Pages — Phase 4

### Scope

**15 SEO pages** still use the legacy `bg-gradient-hero` + `bg-mesh` + floating blur circles background system instead of the unified `LavaLampBackground` + `bg-ambient` system. Two security pages use hardcoded colors.

### Group 1: SEO Pages — Swap Background System (15 files)

All SEO pages share the same legacy pattern:
```jsx
<div className="min-h-screen flex flex-col">
  <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
  <div className="fixed inset-0 bg-mesh pointer-events-none" />
  <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
  <div className="fixed top-20 ... blur-3xl animate-float-slow pointer-events-none" />
  <div className="fixed bottom-20 ... blur-3xl animate-float pointer-events-none" />
  <main className="relative z-10 flex-grow">
```

These pages cannot use `<PageLayout>` directly because they need `<SEOHead>` outside the layout and use `<article>` semantics with `container mx-auto`. Instead, replace the 4-5 background divs with `<LavaLampBackground />` + `bg-ambient` class:

```jsx
<div className="min-h-screen flex flex-col bg-background bg-ambient">
  <LavaLampBackground />
  <main className="relative z-10 flex-grow">
```

**Files (15):**
- `src/pages/seo/PITPAYECalculator.tsx`
- `src/pages/seo/AbujaGuide.tsx`
- `src/pages/seo/RentRelief2026.tsx`
- `src/pages/seo/WHTCalculator.tsx`
- `src/pages/seo/SmallCompanyExemption.tsx`
- `src/pages/seo/KanoGuide.tsx`
- `src/pages/seo/FreeCalculator.tsx`
- `src/pages/seo/TaxReforms2026.tsx`
- `src/pages/seo/SalaryAfterTax.tsx`
- `src/pages/seo/StateGuidesHub.tsx`
- `src/pages/seo/LagosGuide.tsx`
- `src/pages/seo/VATCalculator.tsx`
- `src/pages/seo/PortHarcourtGuide.tsx`
- `src/pages/seo/CITCalculator.tsx`
- `src/pages/seo/TaxReports.tsx`

### Group 2: Security Pages — Theme-Aware Colors (2 files)

Replace hardcoded `bg-green-100 dark:bg-green-900/30`, `bg-yellow-100`, `bg-red-100`, `bg-blue-100` with semantic tokens (`bg-success/10`, `bg-warning/10`, `bg-destructive/10`, `bg-primary/10`).

**Files:**
- `src/pages/SecurityTestResults.tsx`
- `src/pages/SecurityDashboard.tsx`

### Total: 17 files

