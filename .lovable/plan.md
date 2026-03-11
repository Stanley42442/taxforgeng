

## Problem: PWA Install Prompt Not Appearing

### Root Cause

There are **two issues** working against each other:

1. **`clearStaleCaches` in `main.tsx` unregisters ALL service workers on every new build.** The `CACHE_VERSION` is set to `import.meta.env.VITE_BUILD_TIME`, which changes on every build. So every deploy nukes the service worker. Without a registered service worker, the browser will **never** fire the `beforeinstallprompt` event, which means the install prompt cannot appear.

2. **Duplicate manifest files.** There's a hand-written `public/manifest.json` AND VitePWA generates its own manifest. The `index.html` hardcodes `<link rel="manifest" href="/manifest.json">`, but VitePWA injects its own manifest link. This can cause conflicts.

### Fix

**File: `src/main.tsx`** — Stop unregistering service workers on every build. The `clearStaleCaches` function should only clear caches, not unregister the service worker itself. The service worker is needed for PWA installability.

```typescript
const clearStaleCaches = async (): Promise<void> => {
  const lastVersion = safeLocalStorage.getItem('cache-version');
  
  if (lastVersion !== CACHE_VERSION && 'caches' in window) {
    try {
      // Only clear caches, do NOT unregister service workers
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[Init] Stale caches cleared for version:', CACHE_VERSION);
    } catch (error) {
      console.warn('[Init] Cache clear failed:', error);
    }
    safeLocalStorage.setItem('cache-version', CACHE_VERSION);
  }
};
```

**File: `index.html`** — Remove the hardcoded `<link rel="manifest" href="/manifest.json">` since VitePWA auto-injects its own manifest link.

**File: `public/manifest.json`** — Delete this file. VitePWA generates the manifest from `vite.config.ts`, so having a second one causes conflicts and confusion.

### Result
The service worker stays registered across deploys (VitePWA's `autoUpdate` handles updates properly), and the browser can fire `beforeinstallprompt` again, restoring the install prompt.

