

## Upgrade Blog Page and Cards to Match Dashboard Fintech Style

### Problem
The Blog page and its cards use `glass-frosted` translucent styling instead of the solid `bg-card border border-border` pattern used on the Dashboard. The same issue exists in related link cards across `BlogPostLayout.tsx`, `Resources.tsx`, `StateGuidesHub.tsx`, and `Roadmap.tsx`.

### Changes

**1. `src/components/blog/BlogCard.tsx`** — Replace `glass-frosted` card with solid Card component style:
- Import `Card` from ui/card
- Replace `glass-frosted rounded-2xl p-6 hover-lift` with `rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all`
- Add icon-colored accent dot or top border accent per category
- Keep existing content structure (badge, title, excerpt, date, arrow)

**2. `src/pages/Blog.tsx`** — Improve category filter badges styling:
- Add `transition-colors` to badges for smoother interaction

**3. `src/components/blog/BlogPostLayout.tsx`** — Replace `glass-frosted rounded-xl p-4 hover-lift` on Related Posts and Related Tools links (lines 147, 167) with `rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-all`

**4. `src/pages/Resources.tsx`** — Replace `glass-frosted rounded-xl p-4 hover-lift` on guide links (line 129) with `rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-all`

**5. `src/pages/seo/StateGuidesHub.tsx`** — Replace `glass-frosted rounded-2xl p-6 hover-lift` (line 68) with `rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all`

**6. `src/pages/Roadmap.tsx`** — Replace `glass-frosted rounded-2xl p-6 hover-lift` (line 164) with `rounded-xl border border-border bg-card p-6 hover:shadow-md transition-all`

### Summary
6 files, replacing `glass-frosted` translucent cards with solid `bg-card border border-border` cards matching the Dashboard's fintech aesthetic.

