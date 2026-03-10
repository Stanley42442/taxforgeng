

## Fill Empty Space in PayrollCalculator on Desktop/Tablet

### Problem
The PayrollCalculator uses a `grid grid-cols-1 md:grid-cols-2` layout where the right column only renders when results exist. Before calculating, the form inputs sit in the left half with empty space on the right.

### Fix

**`src/components/PayrollCalculator.tsx`** — Make the grid responsive to whether results exist:
- No results: form spans full width (`grid-cols-1`)
- With results: two-column layout (`md:grid-cols-2`)

Line 162: Change from static `md:grid-cols-2` to conditional:
```tsx
<div className={`grid grid-cols-1 ${result ? 'md:grid-cols-2' : ''} gap-6`}>
```

This way the form inputs stretch across the full card width on PC/tablet until the user clicks Calculate, at which point results appear side-by-side.

### Files (1)
1. `src/components/PayrollCalculator.tsx` — 1 line change

