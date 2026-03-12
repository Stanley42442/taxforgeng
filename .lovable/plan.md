

## Fix PWA Offline: Expired Token Blocks Session Restoration

### Root Cause
When the PWA opens offline, `supabase.auth.getSession()` reads the stored session from localStorage. If the JWT has expired (tokens expire after 1 hour), the Supabase client attempts to refresh it via a network request. **This fails offline**, returning `null` for the session. The app then treats the user as logged out, setting everything to the `free` tier with zero businesses — effectively showing an empty, useless app with just "You're offline" banners.

### Fix (3 changes)

**1. `src/hooks/useAuth.tsx` — Restore cached user identity when offline**
In the `useEffect` where `getSession()` is called (line 322), add a fallback: if `!navigator.onLine` and `getSession()` returns no session, read the raw auth token from localStorage (`sb-uhuxqrrtsiintcwpxxwy-auth-token`), parse the user object from it, and set it as the current user. The token doesn't need to be cryptographically valid for offline use — we just need the user's `id` and `email` to load cached data from IndexedDB.

Also add `navigator.onLine` check in the `onAuthStateChange` handler (line 299) before calling `trackDevice`.

**2. `src/hooks/useAuth.tsx` — Skip `logAuthEvent` calls when offline**  
The `PASSWORD_RECOVERY` and `USER_UPDATED` event handlers (lines 310-314) call `logAuthEvent` which hits the database. Wrap these in `navigator.onLine` checks.

**3. `src/contexts/SubscriptionContext.tsx` — Handle null user with cached session**  
Currently, if `user` is null (which happens with expired tokens offline), the context sets `loading: false` with empty data (line 193-208). Add a secondary check: if `!isOnline && !user`, attempt `loadOfflineData()` anyway since the cached tier and businesses don't require a valid user object.

### Technical detail
```text
Current offline flow (broken):
  getSession() → token expired → refresh fails → session=null → user=null
  → SubscriptionContext: no user → empty state → useless app

Fixed offline flow:
  getSession() → token expired → refresh fails → session=null
  → fallback: parse user from localStorage token → user={id, email}
  → SubscriptionContext: !isOnline → loadOfflineData() → cached businesses + tier
  → Dashboard: !navigator.onLine → cached expenses → functional app
```

### Files to modify
- `src/hooks/useAuth.tsx` — Offline session fallback + skip network calls
- `src/contexts/SubscriptionContext.tsx` — Handle no-user offline scenario

