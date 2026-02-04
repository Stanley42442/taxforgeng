
# Fix Expanded Expense Cards Overlapping

## Problem
When expense cards are expanded, they show additional content (category label and full amount breakdown) which increases their height. Currently:
- The virtual list uses a fixed `estimateSize` of 120px
- The regular list uses `space-y-3` (12px gap) which doesn't account for expanded height
- Expanded cards grow taller but the spacing doesn't adjust, causing cards to touch/overlap

## Solution
Add margin-bottom to the ExpenseListItem component that increases when expanded, ensuring consistent spacing regardless of expansion state.

## Changes Required

| File | Change |
|------|--------|
| `src/components/expenses/ExpenseListItem.tsx` | Add dynamic margin class based on `isExpanded` state |

## Technical Details

Update the container div className to include:
```tsx
className={`rounded-xl p-4 cursor-pointer active:opacity-80 transition-all border 
  ${getCategoryColor(expense.category)} 
  ${isExpanded ? 'mb-3' : ''}`}
```

This adds a 12px bottom margin when expanded, creating visual separation between cards without affecting the collapsed state.

## Why This Works
- Collapsed cards: No extra margin needed, existing spacing is sufficient
- Expanded cards: Additional margin creates breathing room for the extra content
- Works for both virtual and regular list rendering
- Maintains the smooth transition animation
