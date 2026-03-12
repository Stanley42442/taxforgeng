

## Make PWA Usable Offline

### Problem
The PWA correctly caches assets and serves the app shell offline, but when opened offline it just shows "You're offline — Viewing cached data (read-only)" with no usable features. The entire app is gated behind Supabase queries that fail offline, making every feature inaccessible.

### Root Cause
The offline infrastructure (IndexedDB, compression, sync queue) exists but is **never connected** to the actual feature hooks. All data hooks (`SubscriptionContext`, `useAuth`, `useEmployees`, etc.) query Supabase directly with no fallback. When offline, every query fails and the app renders in a broken/empty state.

### Approach: Graceful Degradation
Make pure-computation features fully work offline, show cached data for data-dependent features, and clearly indicate which features need internet.

### Changes

**1. `src/contexts/SubscriptionContext.tsx` — Cache businesses to IndexedDB on fetch, fall back to cached data when offline**
- After successfully fetching businesses from the database, save them to IndexedDB via `saveBusinesses()`
- When offline (`!navigator.onLine`), load businesses from IndexedDB via `getBusinesses()` instead of querying the database
- Cache the profile tier in `safeLocalStorage` so we know the user's tier offline
- This unlocks the Dashboard, Calculator, and business-related features offline

**2. `src/hooks/useAuth.tsx` — Preserve session offline**
- The auth session is already persisted in localStorage by the Supabase client (`persistSession: true`)
- Add a check: if offline and we have a cached session/user, use it instead of blocking on network requests
- Skip device tracking, IP checks, and auth event logging when offline

**3. `src/pages/IndividualCalculator.tsx` — Already works offline (pure computation)**
- The individual tax calculator uses `calculateIndividualTax()` which is pure math — no network needed
- Only change: suppress the Supabase calls for saving calculation history when offline (queue them instead)

**4. `src/pages/Calculator.tsx` — Enable offline with cached businesses**
- When offline, load saved businesses from the SubscriptionContext cache (from change #1)
- Suppress expense fetching from Supabase; use cached expenses from IndexedDB
- The tax calculation itself (`calculateTax()`) is pure computation and works offline

**5. `src/pages/Dashboard.tsx` — Show cached data when offline**
- When offline, load expenses and reminders from IndexedDB cache instead of Supabase
- Show a subtle indicator that data may be stale
- Disable actions that require network (add business, delete, etc.)

**6. `src/components/OfflineBanner.tsx` — Improve messaging**
- Instead of "Viewing cached data (read-only)", show: "You're offline — Calculators and cached data available"
- List what works: Tax calculators, saved businesses, cached dashboard data
- List what needs internet: AI assistant, payments, syncing

**7. `src/contexts/OfflineDataContext.tsx` — Auto-cache on data fetch**
- Add a `cacheOnFetch` pattern: whenever online data is fetched successfully by any hook, automatically cache it to IndexedDB
- This ensures the IndexedDB cache stays fresh without requiring manual cache management

### Technical detail

```text
Online flow (no change):
  useAuth → Supabase session → SubscriptionContext → Supabase queries → render

Offline flow (new):
  useAuth → localStorage session (cached) → SubscriptionContext → IndexedDB cache → render
  Tax calculators → pure computation (no network needed)
  Dashboard → IndexedDB cached expenses/reminders → render with stale indicator
  AI chat, payments → disabled with clear messaging
```

### Files to modify
- `src/contexts/SubscriptionContext.tsx` — Add IndexedDB cache/fallback for businesses and tier
- `src/hooks/useAuth.tsx` — Skip network calls when offline, use cached session
- `src/pages/Dashboard.tsx` — Fall back to IndexedDB data when offline
- `src/pages/Calculator.tsx` — Use cached data when offline
- `src/components/OfflineBanner.tsx` — Better offline messaging
- `src/contexts/OfflineDataContext.tsx` — Wire auto-caching into data flow

