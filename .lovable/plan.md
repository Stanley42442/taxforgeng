
# Fix Business Expense Deletion

## Root Cause Found

The delete queries in the **Business Expenses page** are missing the `user_id` filter. The RLS policy requires `auth.uid() = user_id` to verify ownership, but the update queries only filter by `id`:

**Broken Code (line 678-681):**
```typescript
const { error } = await supabase
  .from('expenses')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', deletedExpense.id);  // ← Missing user_id filter
```

**Why Personal Expenses Work:**
Personal expenses use hard deletes (`.delete()`) with the user_id filter included (line 149-153):
```typescript
await supabase
  .from('personal_expenses')
  .delete()
  .eq('id', id)
  .eq('user_id', user.id);  // ← Has user_id filter
```

---

## Solution

Add `.eq('user_id', user.id)` to all expense update/delete operations in `src/pages/Expenses.tsx`:

| Location | Operation | Fix |
|----------|-----------|-----|
| Line 678-681 | Soft delete expense | Add `user_id` filter |
| Line 699-702 | Restore (undo) expense | Add `user_id` filter |
| Line 435-439 | Delete unlinked expenses | Already has `user_id` filter ✅ |

---

## Code Changes

**File: `src/pages/Expenses.tsx`**

### Fix 1: Soft Delete (around line 678)
```typescript
// Before
const { error } = await supabase
  .from('expenses')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', deletedExpense.id);

// After
const { error } = await supabase
  .from('expenses')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', deletedExpense.id)
  .eq('user_id', user.id);  // ← Add this
```

### Fix 2: Restore/Undo (around line 699)
```typescript
// Before
const { error: restoreError } = await supabase
  .from('expenses')
  .update({ deleted_at: null })
  .eq('id', deletedExpense.id);

// After
const { error: restoreError } = await supabase
  .from('expenses')
  .update({ deleted_at: null })
  .eq('id', deletedExpense.id)
  .eq('user_id', user?.id);  // ← Add this
```

---

## Why This Works

RLS policies evaluate the `WHERE` clause of your query. By adding `.eq('user_id', user.id)`, the query explicitly matches the RLS policy condition `auth.uid() = user_id`, allowing the operation to proceed.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Expenses.tsx` | Add `user_id` filter to soft-delete and restore operations |

---

## Expected Result

After this fix:
- Delete button on business expenses → Works
- Undo/restore → Works
- No RLS policy violations
