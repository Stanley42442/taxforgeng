

## Fix: Partner Key Creation Failing Due to Tier Constraint

### Root Cause

The database has a check constraint on the `partners` table:
```
CHECK (tier IN ('basic', 'pro', 'enterprise'))
```

But the `create-partner-key` edge function inserts with `tier: 'partner'`, which is rejected by this constraint. The error from the logs:

```
new row for relation "partners" violates check constraint "partners_tier_check"
```

### Solution

Update the database check constraint to also allow `'partner'` as a valid tier value. This is the correct fix because `'partner'` is a legitimate tier used for admin-created partner keys (distinct from self-service keys which use `'basic'`/`'pro'`/`'enterprise'`).

### Changes

| Item | Change |
|------|--------|
| Database migration | Drop and recreate `partners_tier_check` to include `'partner'` in the allowed values |

The migration SQL:
```sql
ALTER TABLE public.partners DROP CONSTRAINT partners_tier_check;
ALTER TABLE public.partners ADD CONSTRAINT partners_tier_check CHECK (tier = ANY (ARRAY['basic', 'pro', 'enterprise', 'partner']));
```

No edge function or frontend code changes are needed -- the `create-partner-key` function already correctly sets `tier: 'partner'`.

