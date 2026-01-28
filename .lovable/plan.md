

# Fix: White Page Issue

## Problem Identified

The white page is caused by a **race condition** in the cache-busting logic in `src/main.tsx`. The current code has these issues:

1. **Non-blocking async function**: The cache-busting runs as an immediately-invoked async function (IIFE), but React rendering happens simultaneously outside this function
2. **Potential reload loops**: If localStorage access fails or the cache version comparison doesn't work correctly, it can cause:
   - The page to reload before React mounts
   - Multiple reloads in quick succession
   - React and the reload fighting each other
3. **No visual feedback**: During cache clearing/reload, users see a completely blank white page

**Current problematic code:**
```typescript
(async () => {
  const lastVersion = safeLocalStorage.getItem('cache-version');
  if (lastVersion !== CACHE_VERSION && 'serviceWorker' in navigator) {
    // ... cache clearing ...
    window.location.reload();
    return;  // Only exits IIFE, not the module
  }
})();  // Runs async, non-blocking

createRoot(document.getElementById("root")!).render(<App />);  // Always runs immediately
```

---

## Solution

### 1. Make Cache Busting Blocking

Move the React render inside the async function so it only runs after cache-busting completes:

```typescript
(async () => {
  const lastVersion = safeLocalStorage.getItem('cache-version');
  
  if (lastVersion !== CACHE_VERSION && 'serviceWorker' in navigator) {
    try {
      // Preserve auth tokens...
      // Clear caches...
      safeLocalStorage.setItem('cache-version', CACHE_VERSION);
      // Restore auth tokens...
      window.location.reload();
      return; // Stop here - page will reload
    } catch (error) {
      safeLocalStorage.setItem('cache-version', CACHE_VERSION);
    }
  }
  
  // Only render after cache check is complete
  createRoot(document.getElementById("root")!).render(<App />);
})();
```

### 2. Add Loading Indicator in HTML

Add a visible loading state in `index.html` that shows before React loads, preventing the blank white page:

```html
<div id="root">
  <!-- Initial loading state - hidden when React mounts -->
  <div id="initial-loader" style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8faf9;">
    <div style="text-align:center;">
      <div style="width:48px;height:48px;border:3px solid #e5e7eb;border-top-color:#16a34a;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
      <p style="color:#6b7280;font-family:system-ui;">Loading TaxForge...</p>
    </div>
  </div>
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
</div>
```

React will automatically replace this content when it mounts.

### 3. Add Reload Loop Prevention

Add a counter to prevent infinite reload loops:

```typescript
const RELOAD_KEY = 'cache-reload-count';
const MAX_RELOADS = 2;

const reloadCount = parseInt(safeLocalStorage.getItem(RELOAD_KEY) || '0', 10);

if (lastVersion !== CACHE_VERSION && reloadCount < MAX_RELOADS) {
  safeLocalStorage.setItem(RELOAD_KEY, String(reloadCount + 1));
  // ... clear caches and reload ...
} else {
  // Reset counter on successful load
  safeLocalStorage.removeItem(RELOAD_KEY);
}
```

### 4. Remove Invalid Meta Tag

The console shows an error for X-Frame-Options in a meta tag. This should be removed as it's ineffective:

```html
<!-- REMOVE THIS LINE -->
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
```

X-Frame-Options only works as an HTTP header, not a meta tag.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/main.tsx` | Make cache-busting blocking, add reload loop prevention |
| `index.html` | Add loading indicator, remove invalid X-Frame-Options meta |

---

## Technical Details

### Why This Happens on Some Browsers

- **Chrome with extensions**: Extensions can intercept/delay JavaScript execution
- **Slow network/CPU**: Race between async function and render
- **Private browsing**: localStorage failures can disrupt the version check
- **Service Worker issues**: Stale workers can interfere with fresh loads

### Expected Behavior After Fix

1. User opens page → sees loading spinner immediately
2. Cache version checked → if outdated, reload happens (max 2 times)
3. React mounts → spinner replaced with app
4. No more white pages

