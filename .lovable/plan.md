

# Fix: App Stuck on Loading Screen

## Problem Summary

The user reports the app shows briefly then gets stuck on a loading spinner after reload. Based on investigation:

1. **App works initially** - Shows for a few seconds
2. **After reload** - Stuck on loading with no progress
3. **Works in my testing** - Remote browser shows app functioning correctly

## Root Causes Identified

### Issue 1: Blocking `await` in `main.tsx`

**Location**: `src/main.tsx` lines 51-54

```typescript
(async () => {
  // These AWAIT before React renders - if they hang, app never shows
  await initializeOptionalModules();  
  // ... cache logic ...
  createRoot(document.getElementById("root")!).render(<App />);
})();
```

**Problem**: If `initializeOptionalModules()` hangs (slow network, failed imports), React never mounts. The HTML fallback spinner shows forever.

### Issue 2: Cache-busting Reload Logic

**Location**: `src/main.tsx` lines 56-101

```typescript
if (lastVersion !== CACHE_VERSION && ...) {
  // ... tries to save to localStorage ...
  window.location.reload();  // ← Reloads page
  return;  // ← Exits without rendering React
}
```

**Problem**: If `safeLocalStorage.setItem()` silently fails (storage full, private mode), the cache version is never saved. On next load, it thinks the version changed again and tries to reload. The `MAX_RELOADS` check helps, but if the counter also fails to save, it creates an infinite loop.

## Solution

### Fix 1: Don't block on optional modules - make them truly fire-and-forget

Change `await initializeOptionalModules()` to non-blocking:

```typescript
// BEFORE (blocking)
await initializeOptionalModules();

// AFTER (non-blocking - render React immediately)
initializeOptionalModules().catch(() => {
  // Silently fail - these are truly optional
});
```

### Fix 2: Make cache-busting safer with in-memory fallback

Add an in-memory flag to detect if we've already attempted cache clear in this session:

```typescript
// Add at top of main.tsx
let hasAttemptedCacheClear = false;

// Then in the IIFE, check this flag first:
if (!hasAttemptedCacheClear && lastVersion !== CACHE_VERSION && ...) {
  hasAttemptedCacheClear = true;  // Set before any async ops
  // ... cache clear logic ...
}
```

This ensures that even if storage fails completely, we only attempt one cache clear per page load session.

### Fix 3: Add timeout to `initializeOptionalModules()`

Wrap the initialization in a race with a timeout:

```typescript
const initializeOptionalModules = async (): Promise<void> => {
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));
  
  const init = async () => {
    try {
      const { initGlobalErrorHandlers } = await import("./lib/errorTracking");
      initGlobalErrorHandlers();
    } catch {}
    
    try {
      const { initWebVitals } = await import("./lib/webVitals");
      initWebVitals();
    } catch {}
  };
  
  // Race: either init completes or timeout wins
  await Promise.race([init(), timeout]);
};
```

## Files to Modify

| File | Change |
|------|--------|
| `src/main.tsx` | Remove blocking await, add safety guards |

## Technical Details

### Current Flow (Problematic)
```text
1. Load main.tsx
2. AWAIT initializeOptionalModules() ← BLOCKS HERE
3. Check cache version
4. Maybe reload ← CAN LOOP
5. Render React
```

### New Flow (Safe)
```text
1. Load main.tsx
2. Check cache version (with in-memory guard)
3. Render React IMMEDIATELY
4. Fire-and-forget: initializeOptionalModules()
```

## Why This Will Work

| Scenario | Before | After |
|----------|--------|-------|
| Slow network | Stuck forever | Renders immediately |
| Storage fails completely | Possible reload loop | Single attempt, then renders |
| Normal operation | Works | Works (no change) |

## Testing Recommendation

After implementing, the user should:
1. Open the preview in the Lovable interface
2. Reload the page 2-3 times
3. Test on their Redmi 12c mobile device after publishing

