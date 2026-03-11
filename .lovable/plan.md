

## Make Pricing Feature Comparison Table Responsive for Mobile/Tablet

### Problem
The feature comparison table is a 7-column `table-fixed` layout that forces horizontal scrolling on mobile and tablet. With 6 tier columns plus a feature name column, the content is cramped and hard to read on smaller screens.

### Solution
Replace the horizontal scroll table with a **card-based accordion layout** on mobile/tablet (below 1024px), while keeping the full table on desktop.

**Mobile/Tablet view:** Show each tier as a collapsible card listing its features. Users tap a tier to expand and see what's included — no horizontal scrolling needed.

**Desktop view:** Keep the existing full comparison table unchanged.

### Implementation

**File: `src/pages/Pricing.tsx`**

1. Import `useIsMobile` from `use-mobile` and add a `useMediaQuery` check for tablet (`< 1024px`)
2. Create a `MobileFeatureComparison` component that renders tier cards:
   - Each tier gets a card with its name as header
   - Inside: list features grouped by category with check/cross/value indicators
   - Use Radix Accordion so users can expand one tier at a time
3. Conditionally render: show `MobileFeatureComparison` when `< 1024px`, show the existing table when `>= 1024px`

### Design
- Cards use existing `rounded-2xl border border-border bg-card` styling
- Category headers with icon + name (same as table)
- Feature rows: feature name on left, value/check on right
- Business tier card gets a subtle primary border highlight
- Compact padding matching mobile design system

