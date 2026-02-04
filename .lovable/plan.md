
# Fix Expense Cards Shaking Issue (Second Attempt)

## Problem Analysis

The previous fix (removing `mb-3`) was not sufficient because the root cause is different. The `transition-all` class on the expense card container animates **all CSS property changes**, including the height change when a card is expanded. This creates layout instability because:

| What Happens | Why It Shakes |
|--------------|---------------|
| Card expands → height increases | `transition-all` animates the height change over ~300ms |
| Parent recalculates layout | Cards below shift positions during animation |
| Virtual list measures items | Virtualizer detects height change, repositions all items |

## Root Cause

```tsx
// Current code (line 92 of ExpenseListItem.tsx)
className={`rounded-xl p-4 cursor-pointer active:opacity-80 transition-all border ${getCategoryColor(expense.category)}`}
```

The `transition-all` class transitions:
- `opacity` (good - for active state)
- `background-color`, `border-color` (fine - for hover states)
- **`height`, `padding`, all box model properties (BAD - causes layout shifts)**

## Solution

Replace `transition-all` with specific transition properties that should animate, excluding layout-affecting properties:

```tsx
className={`rounded-xl p-4 cursor-pointer active:opacity-80 transition-colors border ${getCategoryColor(expense.category)}`}
```

The `transition-colors` utility only transitions:
- `color`
- `background-color`
- `border-color`
- `text-decoration-color`
- `fill`
- `stroke`

This keeps the visual feedback for interactions while preventing height/layout animations.

## Changes Required

| File | Change |
|------|--------|
| `src/components/expenses/ExpenseListItem.tsx` | Replace `transition-all` with `transition-colors` |

## Why This Fixes Both Issues

1. **Shaking**: Height changes happen instantly instead of animating, so the parent layout recalculates once (not continuously)
2. **Visual polish**: Color transitions for hover/active states still work smoothly
3. **Performance**: Fewer properties to animate = less work for the browser

## Additional Note: Navigation Errors

The "page could not be loaded" error you're seeing is likely due to a temporary deployment issue (the build log shows a rate limit error: `429 ServiceUnavailable`). This means:
- Some code updates may not have deployed yet
- The fix for the shaking issue needs a successful deployment to take effect
- Try refreshing the page or waiting a few minutes for the deployment to retry automatically
