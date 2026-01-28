

# Fix: Infinite Reload Loop in Cache-Busting Logic

## Root Cause Identified

The app is stuck in an **infinite reload loop**. Here's the exact sequence:

1. User loads the app
2. `main.tsx` checks: Is `cache-version` in localStorage different from `CACHE_VERSION`?
3. Yes it is → triggers async cache clear → calls `window.location.reload()`
4. App renders briefly (user sees it for a few seconds)
5. Async cache clear finishes → `window.location.reload()` fires
6. Page reloads → JavaScript reinitializes
7. `hasAttemptedCacheClear` is reset to `false` (it's in-memory, lost on reload)
8. Storage failed to save `cache-version` → back to step 2
9. **Infinite loop**

The in-memory guard `hasAttemptedCacheClear` doesn't work across reloads because JavaScript reinitializes fresh each time.

## Why Storage Might Be Failing

- User's browser in the Lovable preview iframe may have restricted storage
- Third-party iframe storage restrictions (Safari, Firefox strict mode)
- Storage quota exceeded
- `safeLocalStorage.setItem()` silently fails

## Solution

**Remove the automatic reload entirely.** Cache updates should not require a reload - they should just update the version marker and continue. The PWA will naturally use the new assets on next navigation.

### Changes to `src/main.tsx`:

```typescript
// BEFORE: Triggers reload which can loop
(async () => {
  // ... cache clear ...
  window.location.reload(); // ← PROBLEM: This causes the loop
})();

// AFTER: No reload, just update the marker
// Clear caches in background, but NEVER reload
// Users will get fresh assets on next natural page load
```

### Specific Changes:

1. **Remove `window.location.reload()`** from the cache-busting logic
2. **Remove the in-memory guard** (no longer needed)
3. **Remove the reload counter** (no longer needed)
4. Keep the cache clearing for PWA freshness, but don't force a reload

### Why This Is Safe:

- Vite dev server already provides hot module replacement (HMR)
- In production, the service worker will update caches automatically
- Users will get fresh content on their next navigation or page refresh
- Critical: **No more risk of reload loops**

## Implementation

| File | Change |
|------|--------|
| `src/main.tsx` | Remove reload logic, simplify cache version update |

## Technical Details

### Current Code Flow (Broken):
```text
1. Load page
2. Check version mismatch → YES
3. Render app (shows briefly)
4. Async: Clear caches
5. Async: Reload page ← PROBLEM
6. Go to step 1 (infinite loop if storage fails)
```

### Fixed Code Flow:
```text
1. Load page
2. Check version mismatch → YES
3. Update version marker (best effort)
4. Render app immediately
5. Background: Clear stale caches (no reload)
6. Done - user sees app
```

## Expected Outcome

- App loads immediately without getting stuck
- No more reload loops regardless of storage state
- PWA caches still get cleared for freshness
- Version marker updated on best-effort basis

