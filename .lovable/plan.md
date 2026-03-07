

## Fix: Feature Comparison Table Blank Space on Desktop/Tablet

### Problem
The feature comparison table has a visible blank space (gap) on the right side on desktop and possibly tablet screens. The table uses `table-fixed` with `min-w-[900px]` and percentage-based column widths that total 100%, but the outer container is wider than the table content, leaving an unfilled gap.

### Root Cause
The table is wrapped in `overflow-x-auto` with `min-w-[900px]` and `table-fixed`. On wider screens, the `min-w-[900px]` constraint means the table *can* expand but the fixed percentage widths (28% + 72%) may not cleanly fill the rounded container, especially with `border-collapse` behavior.

### Fix (single file: `src/pages/Pricing.tsx`)

1. **Remove `min-w-[900px]`** from the table — it's unnecessary since the container already handles overflow
2. **Change `table-fixed` to `table-auto`** or keep `table-fixed` but ensure the table always fills 100% width
3. **Add `w-full`** explicitly and remove the inline `borderSpacing` style that may interfere
4. **Ensure the outer container doesn't create a gap** — the `overflow-x-auto` div should match the rounded border container seamlessly

Specifically on line 537, change:
```tsx
// From:
<table className="w-full min-w-[900px] table-fixed" style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>

// To:
<table className="w-full table-fixed border-collapse">
```

And wrap the `overflow-x-auto` div with responsive handling so it only scrolls on small screens:
```tsx
<div className="overflow-x-auto md:overflow-visible">
```

This ensures on desktop/tablet the table fills the full container width with no trailing blank space, while still allowing horizontal scroll on mobile where the 7-column layout genuinely needs it.

