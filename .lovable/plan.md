

## Redesign Remaining Pages for Fintech Glassmorphism Consistency

### Scope Assessment

After auditing all 60+ pages, most already use `PageLayout` (53 pages) and many use `glass-frosted` styling. The following groups need updates:

### Group 1: Content/SEO Pages — Upgrade Background System (5 pages)
These pages use a legacy `bg-gradient-hero` + `bg-mesh` background instead of the `PageLayout` + `LavaLampBackground` + `bg-ambient` system used everywhere else.

**Pages:** `About.tsx`, `Blog.tsx`, `Resources.tsx`, `FAQ.tsx`, `PaymentCallback.tsx`

**Change:** Replace the custom wrapper (`<div className="min-h-screen flex flex-col">` + fixed gradient/mesh backgrounds) with `<PageLayout>`, keeping all existing internal content (which already uses `glass-frosted` properly).

### Group 2: Hardcoded Status Colors — Replace with Theme-Aware Classes (3 pages)
These pages use raw Tailwind colors (`bg-yellow-100`, `bg-blue-100`, `bg-red-100`, `bg-green-100`) instead of theme-aware design tokens.

**Pages:** `Compliance.tsx`, `Invoices.tsx`, `BillingHistory.tsx`

**Change:** Replace hardcoded `statusColors` maps with theme-aware alternatives:
- Pending/Draft → `bg-warning/10 text-warning`
- In Progress/Sent → `bg-primary/10 text-primary`
- Completed/Paid → `bg-success/10 text-success`
- Overdue/Cancelled → `bg-destructive/10 text-destructive`

### Group 3: EmbedPartner Page — Full Glassmorphism Upgrade (1 page)
`EmbedPartner.tsx` uses plain `bg-background`, `bg-secondary/20`, bare `Card`s with `border border-border`, and `bg-card border border-border rounded-xl` for step cards. No glass effects at all.

**Change:**
- Wrap in `PageLayout` with `showBackground={true}`
- Hero section: use `glass-frosted` for stats cards
- Feature cards: add `glass-frosted rounded-2xl hover-lift`
- Step cards: `glass-frosted rounded-xl` instead of `bg-card border border-border rounded-xl`
- Section backgrounds: remove `bg-secondary/20` and `bg-secondary/10`, use transparent sections over the ambient background
- Form card: `glass-frosted rounded-2xl shadow-futuristic`

### Group 4: Loading Skeletons — Consistent Glass Treatment (2 pages)
`Settings.tsx` and `ProfitLoss.tsx` have loading states that use raw `min-h-screen` divs without `PageLayout`.

**Change:** Wrap loading states in `<PageLayout>` so even loading states get the ambient background and consistent spacing.

### Files to Edit (11 total)
1. `src/pages/About.tsx` — swap wrapper to PageLayout
2. `src/pages/Blog.tsx` — swap wrapper to PageLayout
3. `src/pages/Resources.tsx` — swap wrapper to PageLayout
4. `src/pages/FAQ.tsx` — swap wrapper to PageLayout
5. `src/pages/PaymentCallback.tsx` — swap wrapper to PageLayout
6. `src/pages/Compliance.tsx` — theme-aware status colors
7. `src/pages/Invoices.tsx` — theme-aware status colors
8. `src/pages/BillingHistory.tsx` — theme-aware status colors
9. `src/pages/EmbedPartner.tsx` — full glassmorphism upgrade
10. `src/pages/Settings.tsx` — loading state in PageLayout
11. `src/pages/ProfitLoss.tsx` — loading state in PageLayout

