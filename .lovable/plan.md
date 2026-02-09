

# Phase 5: Create New Pages (About, Resources, State Guides, Additional Blog Posts)

## Overview

All existing pages are verified working with full production content. This phase creates the **new pages** that don't yet exist in the codebase.

---

## New Pages to Create

### 1. About Page (/about)
**File:** `src/pages/About.tsx` (NEW)

Content includes:
- Company story: TaxForge NG founded in Port Harcourt by Gillespie Benjamin Mclee (OptiSolve Labs)
- Mission statement: Making Nigerian tax compliance simple, accurate, and affordable
- Port Harcourt base with Rivers State context
- Platform statistics (calculators used, tax saved, etc.)
- Technology section (built with modern web tech, FIRS-compliant calculations)
- SEO: Organization schema, breadcrumbs
- Links to /team, /pricing, /blog

### 2. Resources Page (/resources)
**File:** `src/pages/Resources.tsx` (NEW)

Content includes:
- Free Templates & Checklists grid:
  - 2026 Tax Reform Summary (PDF placeholder button)
  - Small Company Exemption Checklist (PDF placeholder)
  - PAYE Calculation Worksheet (PDF placeholder)
  - VAT Registration Guide (PDF placeholder)
  - Tax Calendar 2026 (link to /tax-calendar)
  - WHT Rate Card (PDF placeholder)
- Links to all calculators, blog posts, and FAQ
- Download buttons (placeholder -- toast "Coming soon")
- SEO: WebPage schema, breadcrumbs

### 3. State Guides Hub (/state-guides)
**File:** `src/pages/seo/StateGuidesHub.tsx` (NEW)

A directory page linking to:
- Port Harcourt (existing: /port-harcourt-tax-guide)
- Lagos (/state-guides/lagos)
- Abuja (/state-guides/abuja)
- Kano (/state-guides/kano)

Each card shows the state name, key tax facts, and a link.

### 4. Lagos Tax Guide (/state-guides/lagos)
**File:** `src/pages/seo/LagosGuide.tsx` (NEW)

~800 words covering:
- LIRS (Lagos Internal Revenue Service) overview
- Lagos-specific levies and taxes
- Business registration requirements
- Common mistakes for Lagos businesses
- FAQ accordion (6 questions)
- Article + FAQPage + HowTo schema

### 5. Abuja Tax Guide (/state-guides/abuja)
**File:** `src/pages/seo/AbujaGuide.tsx` (NEW)

~800 words covering:
- FCT-IRS overview
- Abuja-specific tax considerations
- Government contractor WHT obligations
- Common mistakes
- FAQ accordion (6 questions)

### 6. Kano Tax Guide (/state-guides/kano)
**File:** `src/pages/seo/KanoGuide.tsx` (NEW)

~800 words covering:
- KIRS (Kano Internal Revenue Service) overview
- Northern Nigeria trade/commerce tax considerations
- Agricultural sector exemptions
- Common mistakes
- FAQ accordion (6 questions)

### 7-10. Four Additional Blog Posts

Using the existing `BlogPostLayout` component, create 4 new long-form articles:

**7. VAT Guide for Nigerian Businesses** (`src/pages/blog/VATGuideNigeria.tsx`)
- Slug: `/blog/vat-guide-nigeria`
- ~1,500 words: registration threshold, filing, input vs output, exempt items, penalties
- TOC, old-vs-new table, worked examples, FAQ (5 questions)

**8. Withholding Tax Explained** (`src/pages/blog/WHTExplained.tsx`)
- Slug: `/blog/wht-explained`
- ~1,500 words: WHT rates by type, credit notes, final tax vs credit, remittance
- TOC, rate comparison table, FAQ (5 questions)

**9. Payroll Tax Guide for Employers** (`src/pages/blog/PayrollTaxGuide.tsx`)
- Slug: `/blog/payroll-tax-guide`
- ~1,500 words: employer obligations, PAYE calculation, pension, NHF, filing deadlines
- TOC, step-by-step, FAQ (5 questions)

**10. Tax Calendar 2026: Key Deadlines** (`src/pages/blog/TaxCalendar2026.tsx`)
- Slug: `/blog/tax-calendar-2026`
- ~1,200 words: monthly/quarterly/annual deadlines, penalties for late filing
- TOC, deadline table by month, FAQ (5 questions)

---

## Routing Updates

**File:** `src/App.tsx`

Add lazy imports and routes for all 10 new pages:
- `/about` -> About
- `/resources` -> Resources
- `/state-guides` -> StateGuidesHub
- `/state-guides/lagos` -> LagosGuide
- `/state-guides/abuja` -> AbujaGuide
- `/state-guides/kano` -> KanoGuide
- `/blog/vat-guide-nigeria` -> BlogVATGuideNigeria
- `/blog/wht-explained` -> BlogWHTExplained
- `/blog/payroll-tax-guide` -> BlogPayrollTaxGuide
- `/blog/tax-calendar-2026` -> BlogTaxCalendar2026

---

## Blog Hub Update

**File:** `src/pages/Blog.tsx`

- Add the 4 new blog posts to the POSTS array
- Add new categories: "VAT", "WHT", "Payroll" (or group under existing "Guides")
- Total posts: 8

---

## Navigation Updates

**File:** `src/components/NavMenu.tsx`

Add to the Resources group:
- About (/about)
- Resources (/resources)
- State Guides (/state-guides)

---

## Sitemap Update

**File:** `public/sitemap.xml`

Add entries for all 10 new URLs with appropriate priorities:
- /about (0.60)
- /resources (0.65)
- /state-guides (0.65)
- /state-guides/lagos (0.65)
- /state-guides/abuja (0.65)
- /state-guides/kano (0.65)
- /blog/vat-guide-nigeria (0.70)
- /blog/wht-explained (0.70)
- /blog/payroll-tax-guide (0.70)
- /blog/tax-calendar-2026 (0.70)

---

## Homepage Update

**File:** `src/pages/Index.tsx`

- Update blog section to show latest 4 posts (may include new ones)
- Add link to /about in footer area or appropriate section

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/About.tsx` | CREATE | Company story, mission, Port Harcourt base |
| `src/pages/Resources.tsx` | CREATE | Templates, checklists, download placeholders |
| `src/pages/seo/StateGuidesHub.tsx` | CREATE | Directory of state guides |
| `src/pages/seo/LagosGuide.tsx` | CREATE | Lagos tax guide (~800 words) |
| `src/pages/seo/AbujaGuide.tsx` | CREATE | Abuja tax guide (~800 words) |
| `src/pages/seo/KanoGuide.tsx` | CREATE | Kano tax guide (~800 words) |
| `src/pages/blog/VATGuideNigeria.tsx` | CREATE | VAT guide (~1,500 words) |
| `src/pages/blog/WHTExplained.tsx` | CREATE | WHT guide (~1,500 words) |
| `src/pages/blog/PayrollTaxGuide.tsx` | CREATE | Payroll guide (~1,500 words) |
| `src/pages/blog/TaxCalendar2026.tsx` | CREATE | Deadlines guide (~1,200 words) |
| `src/App.tsx` | MODIFY | Add 10 new routes |
| `src/pages/Blog.tsx` | MODIFY | Add 4 new posts to index |
| `src/components/NavMenu.tsx` | MODIFY | Add About, Resources, State Guides links |
| `public/sitemap.xml` | MODIFY | Add 10 new URLs |
| `src/pages/Index.tsx` | MODIFY | Update blog section |

**Total: 10 new files, 5 modified files**

---

## Implementation Order

1. About.tsx + Resources.tsx (standalone pages)
2. State guide pages (Hub + Lagos + Abuja + Kano)
3. Blog posts (VAT + WHT + Payroll + Calendar)
4. App.tsx routing + Blog.tsx index update
5. NavMenu.tsx + sitemap.xml + Index.tsx updates

