

## New Blog Post: "7 PIT Myths Nigerians Still Believe in 2026"

A myth-busting, fact-driven blog post that naturally follows the PIT calculator promotion. It addresses common misconceptions about the 2026 PIT rules, integrates Rent Relief education, and links back to the calculator.

---

### Content Structure

The post will use the existing `BlogPostLayout` component (same pattern as all 8 current posts) and cover these sections:

| Section ID | Topic |
|---|---|
| `why-myths-matter` | Why PIT myths are dangerous (penalties, overpayment) |
| `myth-1` | "The ₦800k threshold means I pay no tax" — clarifies it applies only to the first ₦800k, not total income |
| `myth-2` | "CRA still applies in 2026" — CRA is abolished, replaced by six specific deductions |
| `myth-3` | "Everyone gets Rent Relief automatically" — requires actual rent payments + documentation |
| `myth-4` | "Freelancers don't pay PIT" — all income sources must be aggregated |
| `myth-5` | "My employer handles everything, I don't need to file" — self-assessment scenarios |
| `myth-6` | "Minimum wage earners are fully exempt" — they pay near-zero, not zero (₦6,000/year) |
| `myth-7` | "The old 6-band rates (7%–24%) still work" — new bands are 0%–25% with different thresholds |
| `rent-relief-facts` | Rent Relief: what it actually is, how to claim it, the ₦500k cap |
| `faq` | 5–6 FAQs with FAQPage schema |

### Technical Implementation

**1. Create `src/pages/blog/PITMyths2026.tsx`**
- Uses `BlogPostLayout` with all SEO props (article schema, FAQ schema, breadcrumbs)
- ~1,500 words, authoritative tone matching existing posts
- Links to PIT/PAYE Calculator (`/pit-paye-calculator`), Rent Relief Calculator (`/rent-relief-2026`), and the existing PIT guide
- Related posts: Tax Reforms Summary, PIT & PAYE Guide, Small Company CIT Exemption
- Related tools: PIT/PAYE Calculator, Rent Relief Calculator

**2. Register route in `src/App.tsx`**
- Add lazy import and route at `/blog/pit-myths-2026`

**3. Add to blog listing in `src/pages/Blog.tsx`**
- New entry in the `POSTS` array with category "Guides", today's date

**4. Update sitemap (`public/sitemap.xml`)**
- Add `/blog/pit-myths-2026` entry

