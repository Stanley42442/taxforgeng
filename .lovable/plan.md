
# Fix Business Expense Deletion - RLS Policy Update

## Issue Confirmed via Live Testing

I logged in with your credentials (`benjamingillespie001@gmail.com` / `Stanley@382018`) and tested deleting an expense. The delete operation failed with:

```json
{
  "code": "42501",
  "message": "new row violates row-level security policy for table \"expenses\""
}
```

The request correctly includes both filters: `id=eq.f3c0dc62-...&user_id=eq.c34c22a5-...`

---

## Root Cause

The SELECT policy on the `expenses` table requires `deleted_at IS NULL`:

```sql
-- Current SELECT policy
USING ((auth.uid() = user_id) AND (deleted_at IS NULL))
```

**Why this breaks soft-delete:**

```text
┌─────────────────────────────────────────────────────────────────┐
│  1. UPDATE sets deleted_at = '2026-02-02...'                    │
│  2. PostgreSQL checks if modified row passes SELECT policy     │
│  3. SELECT policy requires: deleted_at IS NULL                  │
│  4. Modified row has: deleted_at IS NOT NULL                    │
│  5. Result: 403 Forbidden                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Solution

Update the SELECT policy to allow users to see their own rows regardless of `deleted_at` status. The application already filters deleted rows in the query.

**Database Migration:**

```sql
-- Remove the old SELECT policy
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;

-- Create new SELECT policy without deleted_at restriction
CREATE POLICY "Users can view own expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

---

## Why This Is Safe

The application already filters deleted expenses at the query level:

```typescript
// src/pages/Expenses.tsx (line ~320)
.is('deleted_at', null)
```

Users will only see active expenses in the UI, but the database allows the soft-delete and restore operations to complete.

---

## Changes Required

| Type | Description |
|------|-------------|
| Database Migration | Update SELECT policy to remove `deleted_at IS NULL` restriction |

---

## Expected Result

After this fix:
- Delete button → Sets `deleted_at` timestamp
- Undo button → Clears `deleted_at`
- No more RLS violations
- Users still only see active expenses in the UI
