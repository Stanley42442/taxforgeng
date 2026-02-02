

# Fix Expense Deletion RLS Policy

## Problem Identified

The database logs show: **"new row violates row-level security policy for table 'expenses'"**

This happens because the current UPDATE policy is misconfigured:

| Policy | USING (before update) | WITH CHECK (after update) |
|--------|----------------------|---------------------------|
| "Users can update their own expenses" | `auth.uid() = user_id AND deleted_at IS NULL` | **None (defaults to USING)** |

When you soft-delete an expense by setting `deleted_at = NOW()`:
- **Before**: Row has `deleted_at = NULL` → passes USING check
- **After**: Row has `deleted_at = timestamp` → fails the WITH CHECK (which defaults to requiring `deleted_at IS NULL`)

## Solution

Update the RLS policy to include a proper `WITH CHECK` clause that only validates user ownership, allowing the `deleted_at` field to be modified:

```sql
-- Drop and recreate the policy with correct WITH CHECK
DROP POLICY "Users can update their own expenses" ON expenses;

CREATE POLICY "Users can update their own expenses"
  ON expenses
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);
```

## Technical Explanation

| Check Type | Purpose | Expression |
|------------|---------|------------|
| **USING** | Controls which rows can be selected for update | Must be non-deleted AND owned by user |
| **WITH CHECK** | Validates the new row after update | Only checks user ownership (allows deleted_at changes) |

This allows:
- Selecting only non-deleted expenses owned by the user
- Updating those expenses to set `deleted_at` (soft-delete)
- The restore policy (already created) handles the reverse operation

## Files to Modify

| Change | Description |
|--------|-------------|
| Database Migration | Drop and recreate "Users can update their own expenses" policy with proper WITH CHECK |

## Expected Result

After this fix:
- Delete button → Sets `deleted_at = NOW()` → **Works**
- Undo button → Sets `deleted_at = NULL` → **Works** (via restore policy)
- Normal edits → Continue working as before

