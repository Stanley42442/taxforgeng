

# AEO Enhancement: NTA Citations, Remote Work FAQ, and Schema Upgrade

Three targeted enhancements to strengthen E-E-A-T signals and improve AI citation likelihood.

---

## Enhancement 1: NTA Section Citations in Content

Add specific Nigeria Tax Act 2025 section references inline to boost authority. This tells both human readers and AI crawlers that the content is sourced from specific legislation, not guesswork.

### Files to update:

**`src/pages/seo/CITCalculator.tsx`** -- Add NTA section numbers to FAQ answers:
- Small Company Exemption: cite "NTA Sec 40"
- Development Levy: cite "NTA Sec 58"
- Professional services exclusion: cite "NTA Sec 40(3)"

**`src/pages/seo/PITPAYECalculator.tsx`** -- Add section references:
- Tax-free threshold: cite "NTA Sec 33"
- Rent Relief: cite "NTA Sec 36"
- PIT bands: cite "NTA Sixth Schedule"

**`src/pages/seo/VATCalculator.tsx`** -- Add references:
- VAT rate: cite "NTA Sec 19"
- Small business exemption: cite "NTAA Sec 22"
- Filing penalties: cite "NTA Sec 23"

**`src/pages/FAQ.tsx`** -- Add NTA section citations to key answers across all categories (PIT, CIT, VAT, WHT, Reforms). This is the highest-impact file since it feeds FAQSchema to Google directly.

**`src/pages/seo/FreeCalculator.tsx`** -- Add citations to FAQ answers for accuracy and "How It Works" step descriptions.

---

## Enhancement 2: Remote Work / Foreign Income FAQ Section

Add a new FAQ category targeting high-intent Gen Z queries about remote work taxes, crypto, and foreign income. This fills a gap identified in the AEO analysis.

### File: `src/pages/FAQ.tsx`

Add a new category "Remote Work & Foreign Income" with 5 FAQs:

1. **"Do I pay Nigerian tax on remote work income from abroad?"**
   Answer: Yes, Nigerian residents are taxed on worldwide income (NTA Sec 3). Remote work for foreign clients is taxable. WHT may apply if paid through Nigerian entities.

2. **"How is cryptocurrency income taxed in Nigeria?"**
   Answer: Crypto gains are treated as capital gains under the Capital Gains Tax Act. The 10% CGT rate applies. Small investor exemption (gains up to 10M and proceeds under 150M) may apply.

3. **"Can I claim double taxation relief on foreign income?"**
   Answer: Yes, if Nigeria has a tax treaty with the country where tax was paid. You can claim credit for foreign tax paid against your Nigerian liability (NTA Sec 43).

4. **"Do freelancers on Upwork/Fiverr need to file taxes?"**
   Answer: Yes. Freelance income is taxable as personal or business income. If you earn above the ₦800k threshold, you owe PIT. Professional service freelancers also face 10% WHT.

5. **"What if my employer is abroad but I work from Nigeria?"**
   Answer: You are still a Nigerian tax resident and must file. Your foreign employer is not required to deduct PAYE, so you must self-assess and file directly with NRS.

These will automatically be included in the FAQSchema via the existing `allFaqsForSchema` extraction logic.

---

## Enhancement 3: Upgrade Calculator Schema Markup

Replace `createWebApplicationSchema` (generic) with `createSoftwareApplicationSchema` (richer, includes features, pricing, and metadata) on the 6 SEO landing pages that currently use the simpler schema.

### Current state:
- `Index.tsx`: Already uses `createSoftwareApplicationSchema` -- no change needed
- 6 SEO calculator pages use `createWebApplicationSchema` -- needs upgrade

### Approach:
Rather than replacing with the global `createSoftwareApplicationSchema()` (which is homepage-specific with all features), create a new **`createCalculatorSchema`** helper in `SEOHead.tsx` that generates a `SoftwareApplication` schema with:
- Page-specific name and description (passed as params)
- `applicationCategory: 'FinanceApplication'`
- `applicationSubCategory` specific to each calculator type
- `operatingSystem: 'Web Browser'`
- `offers` with free tier info
- `isAccessibleForFree: true`
- `inLanguage: 'en-NG'`
- `areaServed: Nigeria`

### Files to update:
- **`src/components/seo/SEOHead.tsx`**: Add `createCalculatorSchema(name, description, subcategory)` helper
- **`src/pages/seo/FreeCalculator.tsx`**: Replace `createWebApplicationSchema` with `createCalculatorSchema`
- **`src/pages/seo/PITPAYECalculator.tsx`**: Same
- **`src/pages/seo/CITCalculator.tsx`**: Same
- **`src/pages/seo/VATCalculator.tsx`**: Same
- **`src/pages/seo/WHTCalculator.tsx`**: Same
- **`src/pages/seo/TaxReports.tsx`**: Same

---

## Summary

| Enhancement | Files Changed | AEO Impact |
|---|---|---|
| NTA section citations | 5 SEO/FAQ pages | High -- proves legislative sourcing to AI crawlers |
| Remote work FAQ section | `FAQ.tsx` | High -- targets unserved Gen Z queries, feeds FAQSchema |
| Calculator schema upgrade | `SEOHead.tsx` + 6 calculator pages | Medium -- richer structured data for AI indexing |

All changes are content and schema additions. No calculation logic is modified.

