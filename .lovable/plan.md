
# Fix Empty Space in Pricing Feature Table

## Issue Identified

The feature comparison table has **empty whitespace on the right side** on both tablet and PC views. This happens because:

1. The previous fix removed `table-fixed` layout and replaced percentage widths with `min-w-[px]` values
2. `min-w-[100px]` only sets a minimum - it doesn't tell columns to expand and fill available space
3. Without `table-fixed`, the table columns only use their minimum widths and don't distribute remaining space

## Solution

Restore `table-fixed` layout while keeping the minimum width for scrollability:

1. **Add back `table-fixed`** - This ensures columns distribute equally across the full table width
2. **Use percentage widths for columns** - Ensures proportional distribution
3. **Keep `min-w-[900px]`** - Maintains horizontal scroll on narrow screens

## Changes Required

### File: `src/pages/Pricing.tsx`

**Line 517 - Add back table-fixed:**
```tsx
// BEFORE
<table className="w-full min-w-[900px]" style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>

// AFTER
<table className="w-full min-w-[900px] table-fixed" style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
```

**Lines 520-526 - Restore percentage widths to headers:**
```tsx
// BEFORE
<th className="text-left p-4 font-semibold text-foreground min-w-[200px]">Feature</th>
<th className="text-center p-4 font-semibold text-foreground min-w-[100px]">Individual</th>
// ... etc

// AFTER  
<th className="text-left p-4 font-semibold text-foreground w-[28%]">Feature</th>
<th className="text-center p-4 font-semibold text-foreground w-[12%]">Individual</th>
<th className="text-center p-4 font-semibold text-foreground w-[12%]">Starter</th>
<th className="text-center p-4 font-semibold text-foreground w-[12%]">Basic</th>
<th className="text-center p-4 font-semibold text-foreground w-[12%]">Professional</th>
<th className="text-center p-4 font-semibold text-primary w-[12%]">Business ✦</th>
<th className="text-center p-4 font-semibold text-foreground w-[12%]">Corporate</th>
```

**Lines 544-550 - Restore percentage widths to body cells:**
```tsx
// BEFORE
<td className="p-4 text-sm text-foreground">{feature.name}</td>
<td className="p-4 text-center"><FeatureValue value={feature.free} /></td>
// ... etc

// AFTER
<td className="p-4 text-sm text-foreground w-[28%]">{feature.name}</td>
<td className="p-4 text-center w-[12%]"><FeatureValue value={feature.free} /></td>
<td className="p-4 text-center w-[12%]"><FeatureValue value={feature.starter} /></td>
<td className="p-4 text-center w-[12%]"><FeatureValue value={feature.basic} /></td>
<td className="p-4 text-center w-[12%]"><FeatureValue value={feature.professional} /></td>
<td className="p-4 text-center w-[12%]"><FeatureValue value={feature.business} /></td>
<td className="p-4 text-center w-[12%]"><FeatureValue value={feature.corporate} /></td>
```

## How This Fixes Both Issues

| Viewport | Behavior |
|----------|----------|
| **Desktop (>900px)** | `table-fixed` + percentage widths = columns fill 100% of container width, no empty space |
| **Tablet (<900px)** | `min-w-[900px]` forces table to maintain minimum width, `overflow-x-auto` enables horizontal scroll |

## Summary of Changes

| Line | Change |
|------|--------|
| 517 | Add `table-fixed` back to table class |
| 520-526 | Change header `min-w-[px]` back to `w-[%]` values |
| 544-550 | Add `w-[%]` to body cells |

## Expected Result

- **PC view**: Table fills the full width of the card with no empty space on the right
- **Tablet view**: Table scrolls horizontally with all columns properly sized
- **Mobile view**: Same horizontal scroll behavior as tablet
