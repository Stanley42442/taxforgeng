

# AEO Deep Optimization: Machine-Readable Tax Data

## Overview

This plan addresses the genuine gaps identified: making tax data directly extractable by AI crawlers and search bots that cannot execute JavaScript. The goal is to move from "tool-first" (humans click calculators) to "data-first" (bots can read tax rates directly).

## Changes

### 1. Add Static Tax Data + FAQ Schema to index.html

Add a static `noscript` block and JSON-LD to `index.html` so non-JS crawlers can access core tax information:

- **Static FAQPage schema** with the 5 most-searched Nigerian tax questions (pulled from the FAQ page)
- **Dataset-style structured data** exposing PIT bands, CIT rates, and VAT rate as machine-readable JSON-LD
- A `<noscript>` HTML block containing a plain-text summary of key tax rates (visible to crawlers that don't run JS)

### 2. Add DefinedTermSet Schema to SEOHead

Create a new schema generator `createTaxRateSchema()` that outputs structured tax rate data using Schema.org `DefinedTermSet` markup. This tells AI bots "here are the exact tax rates" in a format they can directly extract.

Apply it to:
- `/pit-paye-calculator` (PIT bands)
- `/cit-calculator` (CIT tiers)
- `/vat-calculator` (VAT rate + exemptions)

### 3. Convert Tax Definitions to Semantic dl Elements

Replace paragraph-based tax term explanations with HTML `<dl>` (definition list) elements on key SEO pages. This is the semantic markup that answer engines prioritize for "What is X?" queries.

Pages to update:
- `/pit-paye-calculator` -- tax band descriptions
- `/cit-calculator` -- company size definitions
- `/vat-calculator` -- exempt items list
- `/wht-calculator` -- WHT rate categories

### 4. Add aria-label and Descriptive Alt Text

Add `alt` attributes to images and `aria-label` to icon-heavy UI components across SEO-facing pages. This improves both accessibility and Google Images discoverability.

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Add static FAQPage JSON-LD, noscript tax summary block |
| `src/components/seo/SEOHead.tsx` | Add `createTaxRateSchema()` generator |
| `src/pages/seo/PITPAYECalculator.tsx` | Add DefinedTermSet schema, convert to `dl` elements |
| `src/pages/seo/CITCalculator.tsx` | Add DefinedTermSet schema, convert to `dl` elements |
| `src/pages/seo/VATCalculator.tsx` | Add DefinedTermSet schema, convert to `dl` elements |
| `src/pages/seo/WHTCalculator.tsx` | Add DefinedTermSet schema, convert to `dl` elements |

### New Schema Example (DefinedTermSet)

```text
{
  "@type": "DefinedTermSet",
  "name": "Nigeria PIT Tax Bands 2026",
  "definedTerm": [
    {
      "@type": "DefinedTerm",
      "name": "Tax-Free Threshold",
      "description": "First NGN 800,000 of annual income: 0% tax rate"
    },
    {
      "@type": "DefinedTerm",
      "name": "First Taxable Band",
      "description": "NGN 800,001 to NGN 3,000,000: 15% tax rate"
    }
  ]
}
```

### noscript Block Example

```text
<noscript>
  <div>
    <h1>TaxForge NG - Nigerian Tax Calculator 2026</h1>
    <h2>PIT Tax Bands (Nigeria Tax Act 2025)</h2>
    <dl>
      <dt>First NGN 800,000</dt><dd>0% (Tax-free)</dd>
      <dt>NGN 800,001 - NGN 3,000,000</dt><dd>15%</dd>
      <dt>NGN 3,000,001 - NGN 12,000,000</dt><dd>18%</dd>
      <dt>NGN 12,000,001 - NGN 25,000,000</dt><dd>21%</dd>
      <dt>NGN 25,000,001 - NGN 50,000,000</dt><dd>23%</dd>
      <dt>Above NGN 50,000,000</dt><dd>25%</dd>
    </dl>
    <h2>CIT Rates</h2>
    <dl>
      <dt>Small Company (turnover up to NGN 50M)</dt><dd>0%</dd>
      <dt>Medium Company (NGN 50M - NGN 200M)</dt><dd>20%</dd>
      <dt>Large Company (above NGN 200M)</dt><dd>30%</dd>
    </dl>
    <p>VAT: 7.5% | Development Levy: 4%</p>
  </div>
</noscript>
```

### What This Does NOT Address

- **Off-page SEO** (backlinks, domain authority) -- cannot be fixed with code
- **Content siloing** -- the existing internal link structure across SEO pages is already solid with contextual cross-links in FAQ answers
- **Server-side rendering** -- would require architecture migration to Next.js/Remix, out of scope

**Total: 7 files modified, 0 new files created**
