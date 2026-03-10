

## Blog Total Makeover

### Scope
All 4 shared blog components + all 9 blog post pages + the Blog index page. Replace `glass-frosted` with solid cards, upgrade typography, improve content section styling, and add visual polish.

### Changes

**1. `src/components/blog/AuthorBox.tsx`** — Solid card style
- Replace `glass-frosted rounded-xl` with `rounded-xl border border-border bg-card`
- Add a subtle separator between avatar and text

**2. `src/components/blog/TableOfContents.tsx`** — Solid card, two-column on desktop
- Replace `glass-frosted rounded-xl` with `rounded-xl border border-border bg-card`
- Use `sm:grid-cols-2` for TOC items when there are 6+ entries
- Add hover background on each link (`hover:bg-muted/50 rounded px-2 py-1`)

**3. `src/components/blog/BlogPostLayout.tsx`** — Major layout upgrade
- Replace raw `div` wrapper with `PageLayout` for consistent background/spacing (removes manual fixed gradient divs on lines 94-96)
- Upgrade FAQ section: use Radix `Accordion` instead of flat cards for a collapsible, interactive feel
- Related Posts: add category-colored left border accent and short description
- Related Tools: add icon (Calculator/Wrench) before each tool name
- Import `Accordion, AccordionItem, AccordionTrigger, AccordionContent` from ui/accordion

**4. `src/components/blog/BlogCard.tsx`** — Feature the first/latest post
- Add a `featured` boolean prop
- When featured: full-width card with larger title (`text-xl`), a colored top border (`border-t-2 border-primary`), and more padding
- Blog index: render first post as featured (spanning full grid width with `md:col-span-2`)

**5. `src/pages/Blog.tsx`** — Index page polish
- First post renders as featured card spanning full width
- Add post count indicator next to category badges (e.g., "Guides (5)")
- Wrap category badges in a solid `bg-card border rounded-lg p-3` toolbar

**6. All 9 blog post pages** — Replace every `glass-frosted rounded-xl p-5` content block with `rounded-xl border border-border bg-card p-5`
Files: `TaxReforms2026Summary.tsx`, `PITMyths2026.tsx`, `PITPAYEGuide2026.tsx`, `PayrollTaxGuide.tsx`, `SmallCompanyCITExemption.tsx`, `TaxCalendar2026.tsx`, `TaxGuideTechStartups.tsx`, `VATGuideNigeria.tsx`, `WHTExplained.tsx`

### Summary
- 4 shared components upgraded (AuthorBox, TableOfContents, BlogPostLayout, BlogCard)
- 1 index page polished (Blog.tsx)
- 9 blog post pages: bulk `glass-frosted` to `bg-card border` replacement
- FAQ upgraded to accordion
- Featured post card pattern added
- ~14 files total

