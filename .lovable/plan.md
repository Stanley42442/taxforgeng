
# Revert Problematic Changes and Properly Fix Expense List Shaking

## Problem Analysis

The shaking issue persists because the **virtualizer uses a fixed `estimateSize` of 120px** that doesn't account for expanded cards (which are taller). When a card expands:

1. The actual item height changes but virtualizer doesn't know about it
2. Virtualizer positions items using stale height estimates
3. This causes visual "jumping" as items overlap or leave gaps

The previous attempts focused on CSS transitions and hook ordering, but the **root cause is the virtualizer's inability to handle dynamic row heights**.

## Changes Required

### 1. Fix VirtualExpenseList - Use Dynamic Height Measurement

| File | Change |
|------|--------|
| `src/components/expenses/VirtualExpenseList.tsx` | Use `measureElement` for dynamic row heights |

The virtualizer needs to **measure actual DOM elements** instead of using a fixed estimate. This is the standard pattern for variable-height virtualized lists.

**Current Code (broken):**
```tsx
const virtualizer = useVirtualizer({
  count: expenses.length,
  getScrollElement: () => parentRef.current,
  estimateSize: useCallback(() => 120, []), // Fixed size - doesn't work for expanded items
  overscan: 5,
});
```

**Fixed Code:**
```tsx
const virtualizer = useVirtualizer({
  count: expenses.length,
  getScrollElement: () => parentRef.current,
  estimateSize: useCallback((index) => {
    // Estimate: expanded cards are taller (~160px), collapsed are ~120px
    return expandedCardId === expenses[index]?.id ? 160 : 120;
  }, [expandedCardId, expenses]),
  overscan: 5,
});
```

**Also add `data-index` and `ref` for proper measurement:**
```tsx
{virtualizer.getVirtualItems().map((virtualRow) => {
  const expense = expenses[virtualRow.index];
  return (
    <div
      key={expense.id}
      data-index={virtualRow.index}
      ref={virtualizer.measureElement}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${virtualRow.start}px)`,
        paddingBottom: '12px',
      }}
    >
```

### 2. Restore Original ExpenseListItem Styling (if needed)

Looking at the current code, `transition-colors` is already applied (from our earlier fix), which is correct. The issue is purely in the virtualizer.

### 3. Keep the React Hooks Fix

The hook reordering in `Expenses.tsx` (moving `useFormFeedback` before the early return) is correct and should be kept - that prevents the "Rendered more hooks" crash.

## Why This Works

| Before | After |
|--------|-------|
| Fixed 120px estimate for all rows | Dynamic estimate based on expanded state |
| No DOM measurement | Uses `measureElement` for accurate heights |
| Virtualizer doesn't recalculate on expand | Virtualizer recalculates when `estimateSize` deps change |

## Summary of Changes

1. **`src/components/expenses/VirtualExpenseList.tsx`**:
   - Update `estimateSize` to be dynamic based on `expandedCardId`
   - Add `data-index` and `ref={virtualizer.measureElement}` to each row
   - This allows the virtualizer to properly track heights

2. **Keep existing fixes**:
   - `transition-colors` in ExpenseListItem (prevents CSS transition issues)
   - `useFormFeedback` hook before early return in Expenses.tsx (prevents hooks crash)

## Alternative: Simpler Fix

If the above is too complex, we could **disable virtualization for lists under 100 items** (currently threshold is 50). Since most users won't have hundreds of expenses visible at once, this would eliminate the virtualizer issues entirely for the common case.

```tsx
// In VirtualExpenseList.tsx
export const VIRTUALIZATION_THRESHOLD = 100; // Increase from 50
```

This is simpler but trades off performance for large lists.
