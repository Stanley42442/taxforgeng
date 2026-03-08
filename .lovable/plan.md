

## Fix: Persistent Logout — Three Root Causes Found

### Evidence from Network Logs

The network logs from this login attempt show **8 `refresh_token` calls within 3 seconds** of a successful password login, plus a `GET /auth/v1/user` call. The session replay confirms the user lands on a "Login Required" screen on `/personal-expenses`. Here's exactly what's happening and why:

### Root Cause 1: `onAuthStateChange` re-renders on every TOKEN_REFRESHED

The current dedup logic compares `access_token`:
```
setSession(prev => {
  if (prev?.access_token === session?.access_token) return prev;
  return session;
});
```
Every TOKEN_REFRESHED event has a **new** access_token, so this check ALWAYS passes. Each session state update triggers React re-renders. Those re-renders trigger more Supabase API calls (SubscriptionContext, Reminders, etc.), which can trigger more token refreshes, creating a cascade.

**Fix**: Skip state updates entirely for `TOKEN_REFRESHED` events. Only `session` from useAuth is consumed by `useSessionSecurity` (Security Dashboard page only). The supabase client stores the refreshed token internally — React state doesn't need to track every token change.

### Root Cause 2: Auth.tsx calls `mfa.listFactors()` which triggers `getUser()`

At line 220, Auth.tsx calls `supabase.auth.mfa.listFactors()` after every login. Internally in supabase-js v2, this calls `getUser()` — a network call (`GET /auth/v1/user`) that can trigger yet another token refresh. This is the `getUser()` call visible in the network logs at 05:18:14.

**Fix**: Only call `mfa.listFactors()` if the user has MFA configured (check user metadata), or remove it entirely since MFA enrollment is rare. Also, consolidate by using `useAuth().signIn()` instead of calling `signInWithPassword` directly (currently Auth.tsx bypasses the hook).

### Root Cause 3: Pages show "Login Required" without checking `loading`

PersonalExpenses (line 196) checks `if (!user)` but NOT `if (loading)`. During any transient moment where `user` is null — initial page load, HMR reload, token refresh failure — the page immediately shows "Login Required" instead of a spinner. The same pattern exists in Dashboard, LoyaltyRewards, CancelSubscription, BillingHistory, Referrals.

**Fix**: Add `loading` guard: `if (loading) return <spinner>; if (!user) return <login required>`.

### Implementation

**File 1: `src/hooks/useAuth.tsx`**
- In `onAuthStateChange`, check the `event` parameter. Only update `session`/`user` state for `SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED`, `PASSWORD_RECOVERY`. For `TOKEN_REFRESHED`, skip state updates entirely — the supabase client already stores the refreshed token internally.
- This eliminates the cascade: no state update → no re-render → no concurrent API calls → no refresh storm.

**File 2: `src/pages/Auth.tsx`**
- Remove the direct `supabase.auth.signInWithPassword()` call (line 185). Use `signIn()` from `useAuth()` instead.
- Remove `mfa.listFactors()` (line 220). If MFA support is needed, check `user_metadata` first or defer the check to after navigation.

**File 3: `src/pages/PersonalExpenses.tsx`**
- Add `loading` from useAuth. Show a loading spinner when `loading` is true, before checking `!user`.

**File 4: `src/pages/Dashboard.tsx`**
- Same loading guard fix (line 391 already has `!user` check without `loading`).

**File 5: `src/pages/LoyaltyRewards.tsx`** — Same loading guard.

**File 6: `src/pages/CancelSubscription.tsx`** — Same loading guard.

**File 7: `src/pages/BillingHistory.tsx`** — Same loading guard.

**File 8: `src/pages/Referrals.tsx`** — Same loading guard.

### Why This Will Actually Work This Time

Previous fixes targeted `getUser()` → `getSession()` swaps. That was necessary but insufficient because:
- The `onAuthStateChange` handler still fired state updates on every TOKEN_REFRESHED, causing cascading re-renders
- Auth.tsx still triggered `getUser()` via `mfa.listFactors()`
- Pages still showed "Login Required" during any transient null-user moment

This fix attacks the problem at the root: stop the cascade from starting in the first place (don't re-render on token refresh), remove the hidden `getUser()` call (MFA check), and make pages resilient to transient auth states (loading guards).

