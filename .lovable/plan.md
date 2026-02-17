
## Fix Broken CSP Meta Tag in index.html

### Problem
Line 9 of `index.html` has two CSP `<meta>` tags merged into a single malformed line, causing a parse5 build error ("missing-whitespace-between-attributes"). The build is completely blocked.

### Root Cause
During previous edits, the CSP meta tag was duplicated — the original (without GA4 domains) and the updated version (with GA4 domains) got concatenated on the same line instead of the old one being replaced.

### Fix
Replace the malformed line 9 with a single, correct CSP meta tag containing all required domains:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://api.ipify.org https://cdn.gpteng.co https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.gpteng.co; font-src 'self' https://fonts.gstatic.com https://cdn.gpteng.co data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://api.ipify.org https://fonts.googleapis.com https://fonts.gstatic.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net; base-uri 'self'; form-action 'self';">
```

### Files Modified
- `index.html` (line 9 only) -- replace the duplicated/malformed CSP tag with a single correct one

### Summary of Your SEO/AEO Status

The analysis you were given contains several inaccuracies:

- **Dynamic meta tags**: Already implemented via your custom `SEOHead` component across 35+ pages (equivalent to react-helmet)
- **Dynamic JSON-LD schemas**: Already implemented with 9+ schema generators (`createCalculatorSchema`, `createFAQSchema`, `createArticleSchema`, `createHowToSchema`, `createTaxRateSchema`, `createSpeakableSchema`, `createBreadcrumbSchema`, `createSoftwareApplicationSchema`, `createOrganizationSchema`)
- **AEO optimization**: Already advanced -- Speakable schema, DefinedTermSet, AI meta tags, llms.txt files
- **Only real limitation**: No SSR/prerendering (CSR-only via Vite), which can slightly delay Google indexing but is not critical
