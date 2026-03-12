

## Fix PWA Update Notification

### Problem
The VitePWA config has `registerType: 'autoUpdate'` combined with `skipWaiting: true` and `clientsClaim: true`. This means the new service worker installs and activates silently — `needRefresh` is never set to `true`, so the update toast never appears.

### Fix

**File: `vite.config.ts`** — Change `registerType` from `'autoUpdate'` to `'prompt'` and remove `skipWaiting: true` / `clientsClaim: true`. This lets the new service worker install but wait for user confirmation before activating, which triggers `needRefresh = true` and shows the toast.

```
registerType: 'prompt',
// Remove: skipWaiting: true
// Remove: clientsClaim: true
```

Everything else stays the same. The `PWAUpdatePrompt` component already handles the prompt flow correctly — it shows a toast with an "Update Now" button that calls `updateServiceWorker(true)` (which triggers `skipWaiting` on demand).

