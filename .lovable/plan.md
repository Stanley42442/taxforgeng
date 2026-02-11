

# S-Tier SEO/AEO Optimization Plan

## What's Already Done (No Action Needed)
- Viewport meta tag: Already in `index.html`
- robots.txt: Already whitelists all major AI crawlers and references llms.txt
- sitemap.xml: Complete with all public URLs
- FAQPage schema on /faq: Already implemented with 30+ Q&As
- HowTo schema on calculator/guide pages: Already on all SEO landing pages
- Organization schema: Already defined in SEOHead.tsx
- BreadcrumbList schema: Already on all SEO/blog/state-guide pages
- Canonical URLs: Already set by SEOHead on all pages that use it

## What Needs to Be Added

### 1. SEOHead on Homepage (`src/pages/Index.tsx`)
The homepage is the highest-traffic page but has NO dynamic SEO tags. Add:
- SEOHead with the Grok-suggested meta description
- Organization + SoftwareApplication + LocalBusiness schemas (already defined in SEOHead.tsx, just need to be called)
- Canonical URL for `/`

### 2. SEOHead on Calculator Page (`src/pages/Calculator.tsx`)
Add SEOHead with:
- Title: "Nigerian Tax Calculator 2026 - CIT, PIT, VAT, WHT | TaxForge"
- Meta description (150-160 chars, keyword-rich)
- HowTo schema with calculator steps
- BreadcrumbList schema
- Canonical `/calculator`

### 3. SEOHead on Pricing Page (`src/pages/Pricing.tsx`)
Add SEOHead with:
- Title: "Pricing - Nigerian Tax Calculator Plans | TaxForge NG"
- Meta description
- BreadcrumbList schema
- Canonical `/pricing`

### 4. SEOHead on Blog Hub (`src/pages/Blog.tsx`)
Currently missing SEOHead. Add:
- Title: "Nigerian Tax Blog 2026 - Expert Guides & Analysis | TaxForge"
- Meta description
- BreadcrumbList schema
- Canonical `/blog`

### 5. Alt Text Audit
Review all `<img>` tags across the site for missing or generic alt text. Key areas:
- Homepage hero/carousel icons (currently Lucide icons, which are SVG components and don't need alt text)
- Blog card thumbnails (no actual images used, so N/A)
- OG image references (meta tags, not visible images)

Since the site primarily uses Lucide icon components (SVGs rendered inline) rather than `<img>` tags, alt text gaps are minimal. The few `<img>` uses (logo, placeholder.svg) will be checked and updated.

### 6. Heading Hierarchy Review
Ensure each page has exactly one `<h1>`. The `PageLayout` component already renders an `<h1>` for the title prop. Key pages to verify:
- Homepage: Currently uses `<h2>` for section headings but no explicit `<h1>` at the top -- needs one
- Calculator: Uses PageLayout which provides `<h1>`
- SEO pages: Use SEOHero which provides `<h1>`

### 7. Service Worker Error
The error "Failed to update a ServiceWorker... An unknown error occurred when fetching the script" is a transient network issue. It happens when:
- The CDN temporarily returns an error for the SW script
- The browser is on a flaky connection
- A deployment is in progress

The current config (`skipWaiting: true`, `autoUpdate`, `NetworkFirst` for JS/CSS) is correct and self-heals. No code change needed -- this is an infrastructure/CDN-level transient issue.

---

## Technical Implementation Details

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Add SEOHead with homepage meta, Organization + SoftwareApplication schema, add visible `<h1>` tag |
| `src/pages/Calculator.tsx` | Add SEOHead with calculator meta, HowTo + Breadcrumb schema |
| `src/pages/Pricing.tsx` | Add SEOHead with pricing meta, Breadcrumb schema |
| `src/pages/Blog.tsx` | Add SEOHead with blog meta, Breadcrumb schema |

### Files NOT Modified (already complete)
- `index.html` -- viewport, CSP, OG tags, structured data all present
- `robots.txt` -- AI crawlers already whitelisted
- `public/sitemap.xml` -- all URLs present
- `src/pages/FAQ.tsx` -- FAQPage schema already implemented
- All `src/pages/seo/*.tsx` -- full schema coverage
- All `src/pages/blog/*.tsx` -- Article schema + FAQ schema
- `src/components/seo/SEOHead.tsx` -- all schema generators exist

### Specific Meta Descriptions

**Homepage:** "TaxForge NG: Free Nigerian tax calculator for CIT, VAT, WHT, PIT with 2026 reforms. Business advisory, sector guides, and small company tools. No signup needed."

**Calculator:** "Calculate Nigerian CIT, PIT, PAYE, VAT, and WHT instantly. 2026 tax reform rules built in. Compare Business Name vs LLC. Free, no signup required."

**Pricing:** "TaxForge NG pricing plans from free to ₦8,999/month. PDF reports, payroll calculator, expense tracking, OCR scanning. Start free, upgrade anytime."

**Blog:** "Expert Nigerian tax guides for 2026. PIT/PAYE calculation walkthroughs, CIT exemption analysis, VAT filing tips, and sector-specific advice from TaxForge NG."

### Homepage H1 Addition
Add a visible, semantic `<h1>` to the hero section:
```
<h1>Nigerian Tax Calculator & Business Advisory for 2026</h1>
```
Currently the hero uses `<h3>` for carousel items. The `<h1>` will be the primary page heading above or within the hero area.

### Schema Additions for Homepage
Combine three schemas into an array for comprehensive coverage:
- `createSoftwareApplicationSchema()` -- for rich app results
- `createOrganizationSchema()` -- for knowledge panel
- `createLocalBusinessSchema()` -- for local search

**Total: 4 files modified, 0 new files created.**

