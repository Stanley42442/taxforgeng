

# Phase 1: Technical SEO and Foundation Overhaul

## Overview
Clean up the sitemap, update robots.txt to block internal app paths, and ensure all public pages have proper meta foundations. This is the technical groundwork before content expansion in Phase 2.

## Changes

### 1. Sitemap Cleanup (public/sitemap.xml)

**Remove** these internal/app-only pages that shouldn't be indexed:
- /dashboard
- /expenses
- /invoices
- /compliance
- /reminders
- /profit-loss
- /payroll
- /auth
- /referrals (internal feature)

**Keep** all public/marketing pages with **varied lastmod dates**:
- Homepage: 2026-02-09 (today)
- SEO landing pages: staggered 2026-01-25 to 2026-02-07
- Calculator pages: 2026-02-01 to 2026-02-05
- Informational pages (learn, pricing, terms): 2026-01-15 to 2026-01-28
- Success stories, roadmap: 2026-01-20 to 2026-02-03

Final sitemap will have ~20 public URLs (down from 30+).

### 2. Robots.txt Update (public/robots.txt)

Add `Disallow` rules for internal app paths while keeping all crawler welcomes:

```
Disallow: /dashboard
Disallow: /expenses
Disallow: /invoices
Disallow: /compliance
Disallow: /reminders
Disallow: /profit-loss
Disallow: /payroll
Disallow: /auth
Disallow: /settings
Disallow: /security
Disallow: /notifications
Disallow: /transactions
Disallow: /audit-log
Disallow: /billing
Disallow: /cancel-subscription
Disallow: /payment-callback
Disallow: /admin/
Disallow: /offline
Disallow: /rewards
Disallow: /referrals
Disallow: /achievements
Disallow: /businesses
Disallow: /calculation-history
Disallow: /e-filing
Disallow: /personal-expenses
Disallow: /accountant-portal
Disallow: /business-report
Disallow: /embed/
```

### 3. Meta/Schema Verification

The existing SEOHead.tsx and page-level schemas are already excellent (verified in previous audits). No changes needed here -- all 10 SEO pages already have:
- Unique titles and descriptions
- Open Graph and Twitter Card tags
- JSON-LD (FAQPage, Article, HowTo, WebApplication, BreadcrumbList)
- Canonical URLs

## Technical Details

### Files Modified
| File | Change |
|------|--------|
| `public/sitemap.xml` | Remove ~10 internal URLs, vary lastmod dates across remaining ~20 |
| `public/robots.txt` | Add Disallow rules for all internal app paths |

### No Changes Needed
- `src/components/seo/SEOHead.tsx` -- already complete
- `index.html` -- already has AI meta tags, hreflang, preconnects
- `public/_headers` -- already configured
- Core Web Vitals -- already optimized (lazy loading, code splitting, PWA)

## What Comes Next (Phase 2 Preview)
After Phase 1 approval, Phase 2 will build:
- Blog infrastructure with /blog route and listing page
- 4 highest-value long-form posts (1200-2000 words each)
- /faq dedicated page with 30+ questions
- Blog post template with author box, TOC, FAQ section

