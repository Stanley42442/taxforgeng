

## Fix: Profile Fetch Loop Still Happening

### Root Cause

Two compounding issues:

**1. `fetchUserData` dependency on `user` object reference causes infinite re-triggering.**
`onAuthStateChange` fires on every `TOKEN_REFRESHED` event (which happens frequently), calling `setUser(session?.user)` with a new object reference each time. Since `fetchUserData` has `[user]` in its `useCallback` dependency array, it gets recreated on every token refresh, which re-triggers the `useEffect` that calls it. With the profile missing (406), this creates a tight loop of SELECT queries.

**2. The profile INSERT may still be failing.**
The INSERT RLS policy migration was created but the network logs show no POST to profiles -- the `profileCreationAttempted` ref may have been set to `true` before the migration took effect, or the INSERT failed for another reason. Either way, the user `c34c22a5` still has no profile row.

### Fix

**1. `src/contexts/SubscriptionContext.tsx` -- Stop the loop**
- Change `useCallback` dependency from `[user]` to `[user?.id]` so `fetchUserData` is only recreated when the user ID actually changes (not on every token refresh)
- Use `user?.id` and `user?.email` inside the callback, referencing them via a ref or passing them directly
- Add a simple debounce: if `fetchUserData` was called within the last 2 seconds and got a 406, don't call it again

**2. Database migration -- Ensure profile exists for stuck user**
- Run `INSERT INTO profiles (id, email, subscription_tier) VALUES ('c34c22a5-0edb-4b0e-9bbc-9502a1f8d59b', 'benjamingillespie001@gmail.com', 'free') ON CONFLICT (id) DO NOTHING;` to unstick this specific user
- Also create a more robust `handle_new_user` trigger that uses `INSERT ... ON CONFLICT DO NOTHING` to prevent this from happening to future users

### Files Changed
- `src/contexts/SubscriptionContext.tsx` -- Fix `useCallback` dependency to `[user?.id]`, add ref to store user email, prevent re-fetch loop
- Database migration -- Insert missing profile row for the stuck user

