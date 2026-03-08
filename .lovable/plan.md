

## Problem: Token Refresh Storm Causing Auth Failures

The auth logs reveal a **critical token refresh loop**. After a successful password login at 17:35:28, there are 50+ `token_revoked`/`login` events in the next 14 seconds, eventually hitting a **429 rate limit** that blocks further auth operations.

### Root Cause

Two issues in `src/hooks/useAuth.tsx`:

1. **Stale closure bug**: `isInitialLoad` and `lastSessionId` are React state variables used inside `onAuthStateChange`, but the `useEffect` has `[]` deps. Inside the callback, `isInitialLoad` is always `true` and `lastSessionId` is always `null` -- so the guard `!isInitialLoad || lastSessionId !== currentSessionId` is **always true**. Every `SIGNED_IN` event triggers `trackDevice`.

2. **`trackDevice` causes token refresh cascade**: `trackDevice` fires ~10 parallel Supabase API calls (`getDeviceInfo`, `getClientIP`, `checkIPWhitelist`, `check_time_restrictions`, known_devices queries, inserts, edge function invocations). Each call uses the auth token. When multiple calls race simultaneously, they can each trigger independent token refreshes (via `autoRefreshToken`), causing a chain reaction of `token_revoked` → new token → more refreshes → 429 rate limit.

### Fix Plan

#### 1. Fix stale closure in `useAuth.tsx` (lines 377-428)
- Convert `isInitialLoad` and `lastSessionId` from `useState` to `useRef` so the `onAuthStateChange` callback always reads current values
- Add a `trackingInProgress` ref guard to prevent concurrent `trackDevice` calls

#### 2. Debounce/guard `trackDevice` calls
- Add a ref-based lock (`isTracking`) so only one `trackDevice` invocation runs at a time
- If a second `SIGNED_IN` event fires while tracking is in progress, skip it

#### 3. Auth.tsx login flow (no changes needed)
- Auth.tsx correctly calls `supabase.auth.signInWithPassword` directly (line 185) and relies on `onAuthStateChange` for device tracking (line 231 comment confirms this). The fix is entirely in useAuth.tsx.

### Files Changed
- `src/hooks/useAuth.tsx` -- fix stale refs + add tracking guard

### Technical Detail
```typescript
// Before (broken - stale closure):
const [isInitialLoad, setIsInitialLoad] = useState(true);
const [lastSessionId, setLastSessionId] = useState<string | null>(null);

// After (fixed - refs always current):
const isInitialLoadRef = useRef(true);
const lastSessionIdRef = useRef<string | null>(null);
const isTrackingRef = useRef(false);

// Inside onAuthStateChange:
if (isTrackingRef.current) return; // prevent concurrent tracking
isTrackingRef.current = true;
trackDevice(...).finally(() => { isTrackingRef.current = false; });
```

