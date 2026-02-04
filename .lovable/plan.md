
# Fix Pricing Table Overflow on Tablet Viewports

## Issue Identified

The feature comparison table on the Pricing page is being **clipped/cut off on the right side** at tablet widths (834px). This happens because:

1. The outer container has `overflow-hidden` which clips content
2. The table uses `table-fixed` with percentage widths (28% + 6×12% = 100%)
3. On narrower viewports, 12% per column is too small for content, but the table can't expand
4. The combination prevents proper horizontal scrolling

## Root Cause (Lines 515-517 in Pricing.tsx)

```tsx
<div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">  <!-- PROBLEM: overflow-hidden clips the table -->
  <div className="overflow-x-auto">  <!-- This should allow horizontal scroll, but parent blocks it -->
    <table className="w-full min-w-full table-fixed">  <!-- table-fixed with % widths doesn't scale well -->
```

## Solution

1. **Remove `overflow-hidden` from outer container** - replace with `overflow-visible` or remove entirely
2. **Set a minimum table width** - ensure the table has enough space for all columns (e.g., `min-w-[900px]`)
3. **Remove `table-fixed`** - let the table auto-size based on content
4. **Remove percentage widths from columns** - use min-width or auto-sizing instead

## Changes Required

### File: `src/pages/Pricing.tsx`

**Line 515 - Fix outer container:**
```tsx
// BEFORE
<div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">

// AFTER
<div className="rounded-2xl border border-border bg-card shadow-card">
```

**Line 517 - Fix table styling:**
```tsx
// BEFORE
<table className="w-full min-w-full table-fixed" style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>

// AFTER
<table className="w-full min-w-[900px]" style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
```

**Lines 520-526 - Remove fixed column widths from header:**
```tsx
// BEFORE
<th className="text-left p-4 font-semibold text-foreground w-[28%]">Feature</th>
<th className="text-center p-4 font-semibold text-foreground w-[12%]">Individual</th>
// ... etc

// AFTER
<th className="text-left p-4 font-semibold text-foreground min-w-[200px]">Feature</th>
<th className="text-center p-4 font-semibold text-foreground min-w-[100px]">Individual</th>
// ... etc (min-w-[100px] for all tier columns)
```

**Lines 544-550 - Remove fixed widths from body cells:**
```tsx
// BEFORE
<td className="p-4 text-sm text-foreground w-[28%]">{feature.name}</td>
<td className="p-4 text-center w-[12%]">...

// AFTER
<td className="p-4 text-sm text-foreground">{feature.name}</td>
<td className="p-4 text-center">...
```

## Expected Result

After the fix:
- Table will have a minimum width of 900px
- On tablet (834px), horizontal scrolling will work properly
- On desktop, table expands to fill available space
- All tier columns remain visible and accessible via scroll

## Summary of Changes

| Line | Change |
|------|--------|
| 515 | Remove `overflow-hidden` from outer container |
| 517 | Replace `min-w-full table-fixed` with `min-w-[900px]` |
| 520-526 | Change header `w-[%]` to `min-w-[px]` values |
| 544-550 | Remove `w-[%]` from body cells |
