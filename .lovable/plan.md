

# Phase 2: Content Volume and Depth

## Overview
Build blog infrastructure, create 4 high-value long-form articles, and add a dedicated FAQ page. All new pages follow the existing SEO page pattern (SEOHead, SEOHero, CTASection, SEODisclaimer) and reuse existing components.

## Scope
- Blog listing page at `/blog`
- 4 long-form blog posts (1200-2000 words each)
- Dedicated `/faq` page with 30+ questions
- Sitemap and robots.txt updates
- Route registration in App.tsx

---

## New Pages

### 1. Blog Hub (`/blog`)
A listing page linking to all blog posts with category filtering.
- SEOHead with BlogPosting schema
- Grid of article cards with title, excerpt, date, category badge
- Categories: "Tax Reforms", "Guides", "Calculators", "Compliance"
- Links to each article page
- CTA at bottom to use the calculator

### 2. Blog Post: "Nigeria Tax Reforms 2026: Full Summary" (`/blog/tax-reforms-2026-summary`)
~1500 words covering:
- Table of Contents (anchor links)
- What changed vs 2025 (comparison table)
- New PIT bands with Naira examples
- CIT changes (25% standard, 0% small company)
- VAT threshold clarification
- WHT as final tax
- Development Levy (4%) replacing TET
- Rent Relief replacing CRA
- Timeline of implementation
- FAQ section (5 questions) with FAQPage schema
- Author box ("TaxForge NG Team, last updated Feb 2026")
- Internal links to calculators and other blog posts

### 3. Blog Post: "0% CIT for Small Companies" (`/blog/small-company-cit-exemption`)
~1500 words covering:
- Qualification criteria (turnover ≤ N50M AND assets ≤ N250M)
- Step-by-step "How to Claim" guide
- Old vs new comparison table (old: 0% on ≤ N25M, new: 0% on ≤ N50M)
- Common mistakes section
- Real Naira worked examples
- FAQ section with schema
- Links to CIT calculator, Small Company Exemption checker

### 4. Blog Post: "PIT/PAYE Calculator Guide 2026" (`/blog/pit-paye-guide-2026`)
~1500 words covering:
- New 2026 tax bands table (N800k exempt, 15%/19%/21%/25%)
- Old vs new band comparison
- Step-by-step calculation walkthrough with Naira example
- Rent Relief integration (20%, max N500k)
- How employers should handle PAYE
- Common mistakes section
- FAQ section with schema
- Links to PIT calculator, Rent Relief page

### 5. Blog Post: "Tax Guide for Tech Startups in Nigeria" (`/blog/tax-guide-tech-startups`)
~1500 words covering:
- Which taxes apply to startups (CIT, VAT, WHT, PAYE)
- Small Company Exemption for early-stage startups
- VAT registration threshold (N25M turnover)
- Pioneer status and tax holidays
- Payroll tax obligations for remote teams
- FIRS e-filing requirements
- Common mistakes section
- FAQ section with schema
- Links to CIT calculator, Small Company page, Payroll

### 6. FAQ Page (`/faq`)
Dedicated page with 30+ questions organized into 6 categories:
- **Personal Tax (PIT/PAYE)** - 6 questions
- **Company Tax (CIT)** - 5 questions
- **VAT** - 5 questions
- **WHT** - 4 questions
- **2026 Reforms** - 5 questions
- **Using TaxForge** - 5 questions

Each answer includes internal links to relevant tools. Full FAQPage schema for all 30+ questions.

---

## Shared Components

### BlogPostLayout
A reusable layout component for all blog posts:
- Author box at top (avatar placeholder, "TaxForge NG Team", date)
- Table of Contents sidebar (auto-generated from H2 headings)
- Content area with proper heading hierarchy
- FAQ accordion at bottom
- Related posts section
- CTA section
- SEODisclaimer

### BlogCard
Card component for the blog listing page:
- Title, excerpt, date, category badge, read time
- Hover effect matching existing glass-frosted pattern

---

## File Structure

```
src/pages/
  Blog.tsx              -- Blog listing hub
  FAQ.tsx               -- Dedicated FAQ page
  blog/
    TaxReforms2026Summary.tsx
    SmallCompanyCITExemption.tsx
    PITPAYEGuide2026.tsx
    TaxGuideTechStartups.tsx

src/components/blog/
  BlogPostLayout.tsx    -- Shared blog post layout
  BlogCard.tsx          -- Card for listing page
  TableOfContents.tsx   -- Auto TOC from headings
  AuthorBox.tsx         -- Author attribution block
```

---

## Route Registration (App.tsx)

New lazy imports and routes:
```
/blog                          -> Blog.tsx
/blog/tax-reforms-2026-summary -> TaxReforms2026Summary.tsx
/blog/small-company-cit-exemption -> SmallCompanyCITExemption.tsx
/blog/pit-paye-guide-2026     -> PITPAYEGuide2026.tsx
/blog/tax-guide-tech-startups -> TaxGuideTechStartups.tsx
/faq                           -> FAQ.tsx
```

---

## SEO Updates

### Sitemap additions (public/sitemap.xml)
Add 6 new URLs with staggered dates:
- `/blog` - priority 0.8, lastmod 2026-02-09
- `/blog/tax-reforms-2026-summary` - priority 0.7, lastmod 2026-02-08
- `/blog/small-company-cit-exemption` - priority 0.7, lastmod 2026-02-05
- `/blog/pit-paye-guide-2026` - priority 0.7, lastmod 2026-01-30
- `/blog/tax-guide-tech-startups` - priority 0.7, lastmod 2026-01-25
- `/faq` - priority 0.6, lastmod 2026-02-07

### Schema per page
- Blog listing: `CollectionPage` schema
- Each blog post: `Article` schema with `author`, `datePublished`, `dateModified`, `inLanguage: 'en-NG'`, `mainEntityOfPage`, plus `FAQPage` for the FAQ section
- FAQ page: `FAQPage` schema with all 30+ questions

---

## Design Approach

All new pages will follow the existing premium design language:
- `glass-frosted` card backgrounds
- `bg-gradient-hero` page backgrounds
- `hover-lift` interaction effects
- `SEOHero` for page headers
- `CTASection variant="gradient"` for bottom CTAs
- `SEODisclaimer` on every page
- Proper H2/H3 heading hierarchy
- Responsive grid layouts
- `animate-slide-up` entrance animations

---

## Content Standards

Every blog post includes:
- **Author box**: "Written by TaxForge NG Team" with last updated date
- **Table of contents**: Auto-generated from H2 headings
- **Comparison tables**: Old vs new rates with clear visual distinction
- **Real Naira examples**: Worked calculations showing actual savings
- **FIRS citations**: References to Nigeria Tax Act 2025 sections
- **Internal links**: Cross-links to calculators and related posts
- **FAQ section**: 5+ questions with FAQPage schema
- **Downloadable checklist**: Placeholder link for future PDF
- **CTA**: Links to relevant calculator tool

---

## Implementation Order

1. Create shared blog components (BlogPostLayout, BlogCard, TableOfContents, AuthorBox)
2. Create FAQ page (/faq)
3. Create Blog listing page (/blog)
4. Create 4 blog posts (one at a time)
5. Register all routes in App.tsx
6. Update sitemap.xml with new URLs
7. Update internal links (NavMenu, footer, existing pages)

