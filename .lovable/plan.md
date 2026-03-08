

## Auth Issue: Missing INSERT Policy on Profiles Table

### Root Cause

The `profiles` table has RLS enabled with only **SELECT** and **UPDATE** policies -- there is **no INSERT policy**. Here's what happens:

1. User signs up -- the `handle_new_user` trigger creates their profile (works because it's `SECURITY DEFINER`)
2. If that trigger fails or the user was created before the trigger existed, no profile row exists
3. `SubscriptionContext.tsx` detects the missing profile (406 / PGRST116 error) and tries a fallback INSERT
4. The INSERT fails with `"new row violates row-level security policy"` because there's no INSERT policy
5. This failure loops on every render, flooding the auth token refresh endpoint and hitting rate limits (429 errors visible in logs)

User `c34c22a5-...` (benjamingillespie001@gmail.com) is in exactly this state -- logged in, but no profile row, and every attempt to create one is blocked by RLS.

### Fix

**1. Database migration** -- Add an INSERT policy on `profiles`:
```sql
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

**2. Code fix** -- Add a guard in `SubscriptionContext.tsx` to prevent the infinite retry loop. The `fetchUserData` function should only attempt the fallback INSERT once and gracefully handle failure instead of re-triggering on every state change.

### Files Changed
- **Database migration**: Add INSERT policy on `profiles` table
- **`src/contexts/SubscriptionContext.tsx`**: Add retry guard to prevent infinite loop when profile creation fails

