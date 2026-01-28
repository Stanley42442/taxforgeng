

# Fix: Infinite Loading on Low-Power Mobile Devices

## Problem Analysis

The app hangs indefinitely on Redmi 12c (and similar devices) for these reasons:

### 1. AuthLoadingScreen Never Resolves
The `AuthLoadingScreen` waits for `loading` from `useAuth` to become `false`. This depends on `supabase.auth.getSession()` completing successfully. On slow networks or if Supabase is unreachable, this promise may never resolve, causing an infinite loading screen.

### 2. No Auth Timeout
The current code has no timeout for the auth session check:
```typescript
// useAuth.tsx line 431
supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session);
  setUser(session?.user ?? null);
  setLoading(false);  // <-- Never called if promise hangs
});
```

### 3. Development Mode Creates 150+ Network Requests
Each module is loaded separately, overwhelming low-powered devices with slow CPUs and limited memory.

---

## Solution

### 1. Add Auth Timeout to useAuth

Add a timeout that sets `loading` to `false` after 10 seconds even if Supabase hasn't responded:

```typescript
// In useAuth.tsx useEffect
useEffect(() => {
  // SAFETY: Set loading to false after 10 seconds regardless of auth status
  // This prevents infinite loading on slow networks
  const authTimeout = setTimeout(() => {
    if (loading) {
      setLoading(false);
      console.warn('[Auth] Session check timed out after 10s');
    }
  }, 10000);

  // Existing auth setup...
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
    clearTimeout(authTimeout); // Cancel timeout on success
  });

  return () => {
    clearTimeout(authTimeout);
    // ...existing cleanup
  };
}, []);
```

### 2. Add Race Condition with Promise.race in AuthLoadingScreen

As a secondary safeguard, add a max loading time in the component itself:

```typescript
// AuthLoadingScreen.tsx
useEffect(() => {
  // Force hide splash after 15 seconds as a fallback
  const forceTimeout = setTimeout(() => {
    if (showSplash) {
      setShowSplash(false);
    }
  }, 15000);

  return () => clearTimeout(forceTimeout);
}, []);
```

### 3. Ensure Initial HTML Loader Works

The initial loader in `index.html` shows while React is loading. Once React mounts, `AuthLoadingScreen` takes over. Both should be visible and provide feedback.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Add 10-second auth timeout |
| `src/components/AuthLoadingScreen.tsx` | Add 15-second failsafe timeout |

---

## Expected Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Normal load | Works | Works |
| Slow network (Supabase unreachable) | Infinite spinner | Shows app after 10s (logged out state) |
| Very slow device | May hang forever | Shows app after 15s max |

---

## Technical Notes

- The 10-second timeout matches Supabase's internal timeout for network requests
- Users will be in a "logged out" state if timeout triggers, but can retry login
- The 15-second component timeout is a secondary fallback if the hook fails
- Both timeouts are non-blocking - if auth completes faster, they're cancelled

