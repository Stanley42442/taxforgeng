

## Fix: Auth Token Not Attached to API Requests

### Root Cause

The `onAuthStateChange` listener fires `INITIAL_SESSION` immediately when set up -- before `getSession()` resolves. This sets `user` in React state while `loading` is still `true`. SubscriptionContext sees `user` change and immediately calls `fetchUserData`. But the Supabase client hasn't fully attached the JWT to its internal state yet, so all requests go out with the **anon key** instead of the user's JWT.

Evidence from network logs: every request has `authorization: Bearer <anon_key>` -- the user's JWT is never used. RLS blocks profile access because `auth.uid()` is null, returning 0 rows. The context then tries to create a profile (also blocked by RLS), and this loops endlessly.

The auth server logs confirm: dozens of `token_revoked` + login events per second, eventually hitting a 429 rate limit.

### Fix (1 file)

**`src/contexts/SubscriptionContext.tsx`** -- Gate `fetchUserData` on auth readiness:

1. Destructure `loading` (rename to `authLoading`) from `useAuth()` alongside `user`
2. In `fetchUserData`, return early if `authLoading` is true (session not yet restored)
3. Add `authLoading` to the useCallback dependency array
4. Add a `profileCreateAttempted` ref to prevent multiple create attempts in the same session

This ensures no database queries fire until `getSession()` has resolved and the JWT is properly attached to the Supabase client.

### Why this fixes both preview and published

- Preview (iframe): stricter storage timing makes the race condition happen every time
- Published mobile: faster storage access means `getSession()` often resolves before `onAuthStateChange` fires, so the JWT is attached in time -- but it's still a race

By explicitly waiting for `loading === false`, we eliminate the race entirely.

