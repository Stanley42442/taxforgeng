

## Root Cause: Token Refresh Storm from Concurrent `getUser()` Calls

The auth logs show **dozens of concurrent `refresh_token` requests per second** immediately after login, each revoking the previous token, until a 429 rate limit is hit. This is **still happening** despite previous fixes.

### The Mechanism

After a successful password login, the following happens simultaneously:

1. **`onAuthStateChange`** fires `SIGNED_IN` → updates React state → triggers re-renders
2. **`trackDevice()`** fires from `onAuthStateChange` → calls `notifyIPBlocked()` / `notifyTimeRestricted()` which call `addNotification()` → each calls `supabase.auth.getUser()`
3. **`SubscriptionContext.fetchUserData()`** fires on user state change → makes DB queries
4. **`webVitals.ts`** fires `supabase.auth.getUser()` for every metric (FCP, LCP, CLS, TTFB, INP — up to 5 concurrent calls)
5. **`errorTracking.ts`** calls `supabase.auth.getUser()` on any error
6. **`ReminderNotificationProvider`** mounts → `useReminderNotifications` fires → DB queries
7. **`useSyncedNotifications`** (if Notifications page visited) → `getNotifications()` → `supabase.auth.getUser()`
8. **`notifications.ts`** — every function (`addNotification`, `getNotifications`, `markNotificationRead`, etc.) independently calls `supabase.auth.getUser()`

The Supabase JS client's `getUser()` method checks the local session token and, if it's near expiry or stale, **triggers a token refresh**. With 10+ concurrent `getUser()` calls, each triggers an independent refresh. Each refresh revokes the previous token. The next refresh sees a revoked token, refreshes again, and so on — creating an exponential storm.

The `autoRefreshToken: true` setting adds yet another concurrent refresh timer on top of all this.

### Why Previous Fixes Didn't Work

The SubscriptionContext `authLoading` gate only prevents DB queries from firing before auth is ready. It does **not** prevent `getUser()` calls from `webVitals`, `errorTracking`, `notifications`, and `trackDevice` — which are the actual source of the concurrent refresh storm.

### Fix Plan (4 files)

#### 1. `src/lib/webVitals.ts` — Stop calling `getUser()` on every metric

Replace `supabase.auth.getUser()` with `supabase.auth.getSession()` which reads from local cache and does NOT trigger a network refresh. Or better yet, just skip user_id — it's optional metadata on web vitals.

**Change**: Replace `supabase.auth.getUser().then(...)` with synchronous session check via `supabase.auth.getSession()` (local cache, no network call). If no session, just queue without user_id.

#### 2. `src/lib/errorTracking.ts` — Stop calling `getUser()` on every error

Same pattern: replace `await supabase.auth.getUser()` with `await supabase.auth.getSession()` which reads the cached session without hitting the auth server.

#### 3. `src/lib/notifications.ts` — Stop calling `getUser()` in every function

All 7 exported functions independently call `supabase.auth.getUser()`. Replace all with `supabase.auth.getSession()` which returns the cached session. The user ID is available from `session.user.id`.

#### 4. `src/hooks/useAuth.tsx` — Deduplicate the `onAuthStateChange` handler

The `onAuthStateChange` handler fires for `TOKEN_REFRESHED` events too, triggering `setUser`/`setSession` state updates that cascade through the entire component tree. Add a check: only update state if the user ID actually changed (skip pure token refreshes).

```typescript
// Before (fires on every token refresh):
setSession(session);
setUser(session?.user ?? null);

// After (only update on meaningful changes):
setSession(prev => {
  if (prev?.access_token === session?.access_token) return prev;
  return session;
});
setUser(prev => {
  const newUser = session?.user ?? null;
  if (prev?.id === newUser?.id) return prev;
  return newUser;
});
```

### Summary

| File | Problem | Fix |
|---|---|---|
| `webVitals.ts` | `getUser()` on every metric (5+ concurrent) | Use `getSession()` (cached, no network) |
| `errorTracking.ts` | `getUser()` on every error | Use `getSession()` (cached, no network) |
| `notifications.ts` | `getUser()` in all 7 functions | Use `getSession()` (cached, no network) |
| `useAuth.tsx` | State updates on every `TOKEN_REFRESHED` event cascade re-renders | Skip state updates when user ID unchanged |

This eliminates all concurrent `getUser()` network calls that trigger the refresh storm. The `getSession()` method reads from local memory/storage and never hits the auth server.

