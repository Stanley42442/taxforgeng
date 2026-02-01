
# Bug Fixes: Expenses, Notifications, and Dashboard Issues

## Issues Identified

### Issue 1: Hardcoded Recurring Templates Appearing as Expenses
**Location**: `src/pages/Expenses.tsx` lines 192-196

The recurring expense templates are initialized with default values in localStorage. These default templates (Office Rent, Internet & Phone, Staff Salaries) are:
- Stored in localStorage, NOT in the database
- Being displayed alongside actual expenses when applied via the template system
- When a template is "applied", it creates a database expense WITHOUT a `business_id`

**Root Cause**: The default templates are only meant to be quick-add shortcuts, but they persist in localStorage and auto-populate even for new users. Additionally, expenses created from templates don't have proper business association.

---

### Issue 2: Notification Error in Calculator Results Page
**Location**: `src/pages/Results.tsx` lines 73-91 and `src/lib/notifications.ts` line 399

The `notifyTaxCalculation()` function is called after saving a tax calculation. The issue is:
- If the user is not authenticated or the `user_notifications` table has issues, the notification fails
- The error is silently caught but may cause UI inconsistencies
- The notification uses `result.entityType` which displays raw values like "company" or "business_name" instead of user-friendly names

**Root Cause**: The notification system handles errors gracefully but the entity type formatting is poor.

---

### Issue 3: Dashboard Not Updating Income/Expenses Overview
**Location**: `src/pages/Dashboard.tsx` lines 152-214

The dashboard fetches expenses once and calculates totals, but:
1. The summary is computed from ALL expenses at lines 179-183
2. But the UI displays `filteredSummary` which uses date filtering
3. The `expenseSummary` state (unfiltered totals) is calculated but never displayed - only `filteredSummary` is shown
4. There's no real-time subscription to expense changes - the dashboard only updates when you navigate away and back

**Root Cause**: Dashboard uses `filteredSummary` (date-filtered) for display but calculates `expenseSummary` (all-time) which goes unused. Additionally, no realtime updates when expenses change.

---

## Technical Solution

### Fix 1: Remove Default Recurring Templates
**File**: `src/pages/Expenses.tsx`

Change the default initialization from hardcoded values to an empty array:

```typescript
// BEFORE (line 192-196)
return safeLocalStorage.getJSON('recurringTemplates', [
  { id: '1', description: 'Office Rent', amount: 150000, category: 'rent', dueDay: 1 },
  { id: '2', description: 'Internet & Phone', amount: 25000, category: 'utilities', dueDay: 15 },
  { id: '3', description: 'Staff Salaries', amount: 350000, category: 'salary', dueDay: 25 },
]);

// AFTER
return safeLocalStorage.getJSON('recurringTemplates', []);
```

This ensures users start with a clean slate - they can create their own templates.

---

### Fix 2: Improve Notification Error Handling and Formatting
**File**: `src/lib/notifications.ts`

Update the `notifyTaxCalculation` function to use proper entity type labels:

```typescript
// BEFORE (line 399)
export const notifyTaxCalculation = (entityType: string, totalTax: number) => {
  // ...uses raw entityType like "company"

// AFTER
export const notifyTaxCalculation = (entityType: string, totalTax: number) => {
  const entityLabels: Record<string, string> = {
    'company': 'Limited Company',
    'business_name': 'Business Name'
  };
  const displayName = entityLabels[entityType] || entityType;
  // ...use displayName in message
```

---

### Fix 3: Dashboard Real-time Updates
**File**: `src/pages/Dashboard.tsx`

Add a Supabase realtime subscription to the expenses table to update the summary when expenses change:

1. Subscribe to expenses table changes on mount
2. Refetch data when INSERT, UPDATE, or DELETE events occur
3. Clean up subscription on unmount

Also ensure the data fetching triggers when `savedBusinesses` updates (currently in the dependency array but the filter logic may not be applied correctly).

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Expenses.tsx` | Remove default recurring templates initialization |
| `src/lib/notifications.ts` | Improve entity type formatting in tax calculation notification |
| `src/pages/Dashboard.tsx` | Add realtime subscription for expenses and ensure proper refetch logic |

---

## Expected Results

1. **Recurring Templates**: Users start with no pre-populated templates - they create their own
2. **Notifications**: Tax calculation notifications show "Limited Company" instead of "company"
3. **Dashboard**: Income/Expenses/Net values update in real-time when expenses are added, edited, or deleted without needing to refresh the page
