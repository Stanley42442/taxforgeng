
# Fix Expense Deletion & Orphaned Expenses

## Issues Identified

### Issue 1: Expense Deletion Problems
The current RLS policy structure creates a problem with the undo/restore feature:

**Current Policies:**
| Policy | Expression |
|--------|------------|
| SELECT | `auth.uid() = user_id AND deleted_at IS NULL` |
| UPDATE | `auth.uid() = user_id AND deleted_at IS NULL` |

**The Problem:**
When you soft-delete an expense (set `deleted_at = NOW()`), the undo operation tries to restore it by setting `deleted_at = NULL`. However, the UPDATE policy only allows updates when `deleted_at IS NULL`, which means you cannot update an expense that's already soft-deleted. The restore operation silently fails.

### Issue 2: Hardcoded Expenses Persisting
Found 22 expenses in the database with `business_id = NULL`. These come from:
1. **CSV Import Mock Data** - The `handleCSVImport` function creates 5 mock expenses without a `business_id`
2. **Recurring Template Expenses** - Some expense creation flows don't require a business

These expenses are intentionally kept by the `validExpenses` filter because they're considered "general expenses" not tied to any business. However, the term "hardcoded" suggests the user may be seeing the CSV import mock data repeatedly.

---

## Solution

### Fix 1: Update RLS Policy for Restore Functionality
Add a new RLS policy that allows users to restore their own soft-deleted expenses:

```sql
-- Allow users to restore their own deleted expenses (set deleted_at back to NULL)
CREATE POLICY "Users can restore their own deleted expenses"
  ON expenses
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL)
  WITH CHECK (auth.uid() = user_id);
```

### Fix 2: Add Option to Delete Orphaned Expenses
Add a "Clear Unlinked Expenses" feature that allows users to delete expenses that aren't associated with any business:

1. Add a button in the expense page filter area to identify and delete orphaned expenses
2. Show a count of expenses without a business association
3. Provide a one-click way to delete them all

### Fix 3: Update CSV Import to Use Selected Business
The mock CSV import should use the currently selected business filter:

```typescript
const handleCSVImport = async () => {
  // ...
  const mockData = [/* ... */];
  
  const businessId = filterBusinessId !== 'all' ? filterBusinessId : null;
  
  const { data, error } = await supabase
    .from('expenses')
    .insert(mockData.map(e => ({ 
      ...e, 
      user_id: user.id,
      business_id: businessId  // Add business association
    })))
    .select();
  // ...
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database Migration | Add new RLS policy for restoring deleted expenses |
| `src/pages/Expenses.tsx` | Add "Clear Unlinked Expenses" button, fix CSV import to include business_id |

---

## Implementation Details

### Database Migration
```sql
-- Add policy to allow restoring soft-deleted expenses
CREATE POLICY "Users can restore their own deleted expenses"
  ON expenses
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL)
  WITH CHECK (auth.uid() = user_id);
```

### Clear Unlinked Expenses UI
Add a section in the Expenses page showing:
```text
+-----------------------------------------------+
| ⚠️ 22 expenses are not linked to any business |
| [View Unlinked] [Delete All Unlinked]         |
+-----------------------------------------------+
```

This provides visibility into orphaned expenses and a way to clean them up.

### CSV Import Fix
Update the import function to attach the business ID if a business filter is active, or prompt the user to select a business before importing.

---

## Technical Notes

### Why the current delete works but restore fails
- **Delete (soft)**: UPDATE where `deleted_at IS NULL` → set `deleted_at = NOW()` ✅ Works
- **Restore**: UPDATE where `deleted_at IS NOT NULL` → set `deleted_at = NULL` ❌ Fails - no policy covers this

### Orphaned Expense Categories
Based on database analysis, orphaned expenses (no `business_id`) include:
- CSV import mock data (Office Rent December, Google Ads Campaign, Staff Salaries, etc.)
- Any manually created expenses where user didn't select a business

### Backward Compatibility
The new RLS policy adds capability without breaking existing functionality. The orphan cleanup is optional and user-initiated.
