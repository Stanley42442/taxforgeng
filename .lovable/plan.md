

## Fix PWA Offline Support

### Root Causes

1. **No navigation fallback** — `navigateFallback: null` in `vite.config.ts` (line 52) means when you go offline and navigate to any route, the service worker has no cached HTML to serve. It just fails.

2. **JS/CSS bundles not precached** — `globPatterns` only includes `*.{ico,png,svg,woff2}` (line 50). The actual app code (JS/CSS) is only cached via runtime `NetworkFirst` strategy, which means on the very first offline load after install, the bundles may not be cached yet if they were never fetched while online.

3. **Cache wiped on every deploy** — `clearStaleCaches` in `main.tsx` (line 59-78) runs `caches.delete()` on ALL cache names every time `VITE_BUILD_TIME` changes. This destroys the runtime caches that hold JS/CSS bundles, effectively breaking offline on every deploy.

### Fix

**File: `vite.config.ts`** — Two changes in the VitePWA config:

1. Set `navigateFallback: '/index.html'` so SPA routing works offline (the service worker returns the cached shell for any navigation request)
2. Add JS/CSS to `globPatterns`: `'**/*.{js,css,ico,png,svg,woff2}'` so the app shell is precached during service worker install, guaranteeing offline availability from first install

Also add `navigateFallbackDenylist: [/^\/api/, /^\/supabase/]` to avoid intercepting API calls.

**File: `src/main.tsx`** — Fix `clearStaleCaches` to only delete known stale caches, not the workbox precache:

Instead of deleting all caches, only delete caches that are NOT the workbox precache manifest (names starting with `workbox-precache`). This preserves the precached app shell while still clearing old runtime caches.

### Technical details

```text
vite.config.ts workbox changes:
  globPatterns: ['**/*.{js,css,ico,png,svg,woff2}']   // was: only static assets
  navigateFallback: '/index.html'                      // was: null
  navigateFallbackDenylist: [/^\/api/, /^\/supabase/]  // new: skip API routes

main.tsx clearStaleCaches change:
  Filter out 'workbox-precache' from cache deletion    // was: delete ALL caches
```

