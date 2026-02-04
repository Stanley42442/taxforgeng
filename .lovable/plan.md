
# Fix React Hooks Violation in Expenses Page

## Problem Identified

The Expenses page has a **React hooks rule violation** that causes a crash with the error:
```
Error: Rendered more hooks than during the previous render
```

### Root Cause Analysis

| Location | Issue |
|----------|-------|
| Lines 498-518 | Early return for free tier users (upgrade prompt) |
| Lines 522-535 | `useFormFeedback` hook called **after** the early return |

React requires that hooks are called in the **same order** on every render. When the component returns early for free-tier users, the `useFormFeedback` hook is skipped. If the tier changes or during certain re-renders, React detects a different number of hooks and crashes.

```tsx
// CURRENT CODE (BROKEN)
if (!isBasicPlus) {
  return (<UpgradePrompt />);  // <-- Early return
}

const expenseFormFeedback = useFormFeedback({...});  // <-- Hook after return = VIOLATION
```

## Solution

Move the `useFormFeedback` hook **before** the early return statement. All hooks must be called unconditionally at the top of the component, before any conditional returns.

### Changes Required

| File | Change |
|------|--------|
| `src/pages/Expenses.tsx` | Move `useFormFeedback` call from line ~522 to before line 498 |

### Updated Code Structure

```tsx
// All hooks at the top, unconditionally
const { tier, savedBusinesses } = useSubscription();
const { user } = useAuth();
const navigate = useNavigate();
// ... other useState hooks ...

const EXPENSE_CATEGORIES = getExpenseCategories();  // Move this up too

// Move hook BEFORE any early returns
const expenseFormFeedback = useFormFeedback({
  successDuration: 3000,
  onSuccess: () => {
    setShowAddDialog(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: 'other',
      businessId: '',
    });
  }
});

// NOW the early return is safe
if (!isBasicPlus) {
  return (<UpgradePrompt />);
}

// Rest of component...
```

## Why This Also Fixes the Shaking Issue

The crash is happening when React tries to reconcile the component state after the hooks mismatch. This causes repeated re-renders and error recovery attempts, which manifests as "shaking" in the UI before the error boundary catches it and shows "Something Went Wrong".

Once the hooks violation is fixed:
1. The component will render correctly for all users
2. State changes (like expanding expense cards) won't trigger the hooks error
3. The `transition-colors` fix we applied will work as intended

## Verification Steps

After the fix:
1. Log in with a paid tier account
2. Navigate to /expenses
3. Page should load without "Something Went Wrong" error
4. Expand/collapse expense cards - no shaking should occur
5. Add and delete expenses - UI should remain stable
