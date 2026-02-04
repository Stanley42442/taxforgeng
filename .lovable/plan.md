
# Fix Expense Cards Shaking Issue

## Root Cause

The `mb-3` margin added to expanded cards conflicts with existing spacing:

| List Type | Existing Spacing | Added `mb-3` | Result |
|-----------|------------------|--------------|--------|
| Regular (`<50` items) | `space-y-3` (12px gap) | +12px margin | 24px total = layout jump |
| Virtual (`>50` items) | `paddingBottom: 12px` | +12px margin | Virtualizer recalculates = shaking |

The `transition-all` class animates the margin change, amplifying the visual instability.

## Solution

Remove the dynamic `mb-3` from `ExpenseListItem` and instead handle expanded card spacing at the parent level where the spacing context is known.

### Changes Required

| File | Change |
|------|--------|
| `src/components/expenses/ExpenseListItem.tsx` | Remove `${isExpanded ? 'mb-3' : ''}` from className |

### Why This Works

- The regular list already uses `space-y-3` which provides consistent 12px gaps
- The virtual list already uses `paddingBottom: '12px'` in the wrapper
- Both spacing systems are adequate for expanded cards - the original "touching" issue was likely a visual perception rather than actual overlap
- Removing the dynamic margin eliminates the layout shift that causes shaking

### Alternative Approach (if cards still appear too close when expanded)

If after removing `mb-3` the cards still feel too close when expanded, we can increase the static spacing slightly:

- Regular list: Change `space-y-3` to `space-y-4` 
- Virtual list: Change `paddingBottom: '12px'` to `paddingBottom: '16px'`

This provides more breathing room without causing layout shifts during expansion.
