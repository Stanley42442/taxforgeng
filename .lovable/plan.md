

# Final SEO/AEO Improvements -- Remaining Items

## What's Already Complete (No Changes Needed)

All core Grok prompt items (1-7) plus the 9 public pages from the previous plan are done. ComparisonTable already uses semantic HTML `<table>` elements (AI/crawler-friendly). The `llms.txt` and `llms-full.txt` are in place. FAQ has full schema. Blog posts now use `og:type: article`. hreflang is implemented.

## What Still Needs Work

### 1. SEOHead on 3 Remaining Sitemap Pages

These pages appear in `sitemap.xml` but have no `SEOHead`, meaning Google sees generic fallback metadata:

| Page | Route | Fix |
|------|-------|-----|
| Terms/Privacy/Refund | `/terms` | Add SEOHead with title "Terms of Service & Privacy Policy - TaxForge NG" |
| Success Stories | `/success-stories` | Add SEOHead with title "Nigerian Business Tax Success Stories - TaxForge NG" |
| Tax Calendar | `/tax-calendar` | Add SEOHead with title "Nigerian Tax Deadlines & Calendar 2026 - TaxForge NG" |

Each gets: unique title, 150-160 char meta description, canonical URL, BreadcrumbList schema.

### 2. Snippet-First Voice-Search Headings on Key SEO Pages

The S+ Grok prompt recommends using **conversational, question-based H2 headings** that match voice queries (e.g., "How much tax do I pay on a 100k salary?"). Several SEO pages already do this well, but the homepage and main calculator lack question-format headings that could capture "People Also Ask" boxes.

**Add a small FAQ-style section to the homepage** with 3-4 question-based H2s and direct 40-60 word answers. These are not full FAQ accordions (that's on /faq) but "snippet bait" paragraphs. Examples:
- "How Much Tax Do I Pay in Nigeria?" -- short answer + link to calculator
- "Is My Small Company Exempt From CIT?" -- short answer + link to /small-company-exemption

### 3. Homepage `<h1>` Visibility Check

The previous plan added SEOHead to the homepage but the plan mentioned adding a visible `<h1>` tag. Need to verify this was actually added -- the current code shows `<h3>` tags in the carousel but no explicit `<h1>`. If missing, add one.

---

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Terms.tsx` | Add SEOHead import + component with terms-specific meta |
| `src/pages/SuccessStoriesPage.tsx` | Add SEOHead import + component with testimonial-focused meta |
| `src/pages/TaxCalendar.tsx` | Add SEOHead import + component with deadline/calendar meta |
| `src/pages/Index.tsx` | Add visible `<h1>` if missing + snippet-bait FAQ section with question H2s |

### Specific Meta Descriptions

**Terms:** "TaxForge NG terms of service, privacy policy, and refund policy. How we handle your data, your rights, and our commitment to Nigerian tax compliance."

**Success Stories:** "See how Nigerian businesses use TaxForge NG to save on taxes. Real success stories from SMEs, freelancers, and companies across Lagos, Abuja, and Port Harcourt."

**Tax Calendar:** "Never miss a Nigerian tax deadline. 2026 tax calendar with FIRS filing dates for VAT, CIT, PAYE, WHT returns. Set reminders and download your schedule."

### Homepage Snippet-Bait Section

A new section between the hero and features, containing 3 question-answer pairs in this format:

```
<section>
  <h2>How Much Tax Do I Pay in Nigeria?</h2>
  <p>Under the 2026 rules, the first 800,000 of your income is tax-free. Above that, 
  rates range from 15% to 25%. Use our free calculator to see your exact breakdown 
  in seconds -- no signup required.</p>
  <Link to="/individual-calculator">Calculate Now</Link>
</section>
```

This format is optimized for:
- Google Featured Snippets (direct answer under question heading)
- "People Also Ask" boxes (question format matches)
- Voice search / AI answer engines (conversational, extractable)

### Homepage `<h1>` Addition

If not already present, add above the carousel:
```
<h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
  Nigerian Tax Calculator & Business Tools for 2026
</h1>
```

**Total: 4 files modified, 0 new files created**
