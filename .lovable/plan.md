

# PWA Professional Standards & Session Persistence Fix Plan

## Issues Identified

### 1. CRITICAL: Session Persistence Problem in PWA

**Root Cause Found**: The cache-busting mechanism in `src/main.tsx` uses **direct `localStorage` access without try-catch**, and more importantly, on **every new build**, it:
1. Clears all service worker caches
2. Clears all browser caches
3. Triggers a hard reload

**Problem**: When a new version is deployed, the auth token (`sb-uhuxqrrtsiintcwpxxwy-auth-token`) may not survive the cache clearing process on some browsers/PWA contexts. The `localStorage.getItem('cache-version')` call also uses raw localStorage which can fail in private browsing.

**Additionally**: The `beforeunload` handler in `useAuth.tsx` removes the auth token for "Remember Me = false" users, but this doesn't work reliably in PWA standalone mode since PWAs don't fire `beforeunload` consistently when the app is suspended/closed.

### 2. PWA Manifest Missing Professional Features

The current manifest lacks:

| Feature | Current Status | Professional Standard |
|---------|---------------|----------------------|
| Screenshots | Missing | Required for app store listings |
| Shortcuts | Missing | Quick actions from home screen |
| Scope | Missing | Defines PWA boundary |
| Share Target | Missing | Allows sharing to app |
| Additional Icons | Only 192/512 | Need 48, 96, 128, 256, 384 sizes |
| Splash Screen Config | Missing | iOS launch images |
| handle_links | Missing | Link handling preference |

### 3. Auth Page Using Unsafe localStorage

`src/pages/Auth.tsx` still uses raw `localStorage` in 4 places:
- Lines 42, 63: `localStorage.getItem()` for rememberMe and termsAccepted
- Lines 172, 315: `localStorage.setItem()` for saving preferences

### 4. main.tsx Using Unsafe localStorage

`src/main.tsx` uses raw `localStorage` without try-catch on lines 14, 31, 36, which can crash in private browsing mode.

---

## Implementation Plan

### Phase 1: Fix Critical Auth Persistence Issue

**File: `src/main.tsx`**

1. Use `safeLocalStorage` for all localStorage calls
2. **CRITICALLY**: Preserve auth token during cache clearing by:
   - Reading the auth token before clearing
   - Restoring it after cache clear
   - This prevents logout on every deploy

```typescript
// Before clearing, preserve auth
const authToken = localStorage.getItem('sb-uhuxqrrtsiintcwpxxwy-auth-token');

// ... clear caches ...

// Restore auth token after cache clear
if (authToken) {
  localStorage.setItem('sb-uhuxqrrtsiintcwpxxwy-auth-token', authToken);
}
```

**File: `src/pages/Auth.tsx`**

1. Import and use `safeLocalStorage` for all localStorage operations
2. Change all `localStorage.getItem()` to `safeLocalStorage.getItem()`
3. Change all `localStorage.setItem()` to `safeLocalStorage.setItem()`

**File: `src/hooks/useAuth.tsx`**

1. Use `safeLocalStorage.removeItem()` instead of direct `localStorage.removeItem()`
2. Use `safeSessionStorage.getItem()` for session-only check

### Phase 2: Enhance PWA Manifest to Professional Standards

**File: `public/manifest.json`**

Add missing professional features:

```json
{
  "name": "TaxForge NG",
  "short_name": "TaxForge",
  "description": "Smart tax advice for Nigerian businesses. Calculate CIT, PIT, VAT and get business structure recommendations.",
  "start_url": "/",
  "scope": "/",
  "id": "/",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "background_color": "#0a0a0b",
  "theme_color": "#16a34a",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ],
  "shortcuts": [
    {
      "name": "Calculate Tax",
      "short_name": "Calculator",
      "description": "Open the tax calculator",
      "url": "/calculator",
      "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
    },
    {
      "name": "My Dashboard",
      "short_name": "Dashboard",
      "description": "View your dashboard",
      "url": "/dashboard",
      "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
    },
    {
      "name": "Expenses",
      "short_name": "Expenses",
      "description": "Manage business expenses",
      "url": "/expenses",
      "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
    }
  ],
  "screenshots": [
    {
      "src": "/og-image.png",
      "sizes": "1200x630",
      "type": "image/png",
      "form_factor": "wide",
      "label": "TaxForge NG Dashboard"
    }
  ],
  "categories": ["finance", "business", "productivity"],
  "lang": "en-NG",
  "dir": "ltr",
  "handle_links": "preferred",
  "launch_handler": {
    "client_mode": "navigate-existing"
  }
}
```

**File: `vite.config.ts`**

Update VitePWA manifest config to match the enhanced manifest.

### Phase 3: Improve PWA Offline Handling

**File: `src/components/PWAUpdatePrompt.tsx`**

Add periodic update checking (every 60 minutes) to ensure users get updates:

```typescript
useEffect(() => {
  // Check for updates periodically
  const intervalId = setInterval(() => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
    }
  }, 60 * 60 * 1000); // Every hour

  return () => clearInterval(intervalId);
}, []);
```

### Phase 4: Add iOS-Specific PWA Enhancements

**File: `index.html`**

Add iOS-specific meta tags for better PWA experience:

```html
<!-- iOS PWA Enhancements -->
<meta name="apple-mobile-web-app-title" content="TaxForge">
<link rel="apple-touch-startup-image" href="/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/main.tsx` | Use safeLocalStorage, preserve auth token during cache clear |
| `src/pages/Auth.tsx` | Migrate 4 localStorage calls to safeLocalStorage |
| `src/hooks/useAuth.tsx` | Use safe storage wrappers |
| `public/manifest.json` | Add shortcuts, screenshots, scope, launch_handler |
| `vite.config.ts` | Sync manifest config with enhanced manifest.json |
| `index.html` | Add iOS-specific PWA meta tags |
| `src/components/PWAUpdatePrompt.tsx` | Add periodic update checking |
| `docs/CHANGELOG.md` | Document PWA improvements |

---

## Technical Details

### Auth Token Preservation During Cache Bust

The key fix is in `src/main.tsx`:

```typescript
import { safeLocalStorage, safeSessionStorage } from "./lib/safeStorage";

const CACHE_VERSION = import.meta.env.VITE_BUILD_TIME || 'dev';

(async () => {
  const lastVersion = safeLocalStorage.getItem('cache-version');
  
  if (lastVersion !== CACHE_VERSION && 'serviceWorker' in navigator) {
    try {
      // CRITICAL: Preserve auth token before clearing
      const authToken = safeLocalStorage.getItem('sb-uhuxqrrtsiintcwpxxwy-auth-token');
      const sessionOnly = safeSessionStorage.getItem('taxforge-session-only');
      
      // Unregister service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
      
      // Clear caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Set version
      safeLocalStorage.setItem('cache-version', CACHE_VERSION);
      
      // CRITICAL: Restore auth token after clearing
      if (authToken) {
        safeLocalStorage.setItem('sb-uhuxqrrtsiintcwpxxwy-auth-token', authToken);
      }
      if (sessionOnly) {
        safeSessionStorage.setItem('taxforge-session-only', sessionOnly);
      }
      
      window.location.reload();
      return;
    } catch (error) {
      safeLocalStorage.setItem('cache-version', CACHE_VERSION);
    }
  }
})();
```

### PWA Shortcuts

Adding shortcuts allows users to:
- Long-press the app icon on mobile
- Right-click the app icon on desktop
- Access common features directly

### Why Updates Affect Auth

Every deploy generates a new `VITE_BUILD_TIME`, triggering the cache-bust logic. Without preserving the auth token, users are logged out on every update (which can happen multiple times daily).

---

## Summary

**What this plan fixes:**

1. **Critical Auth Persistence**: Users will stay logged in across app updates
2. **Safe Storage**: All localStorage access will be protected with try-catch
3. **Professional PWA**: Shortcuts, screenshots, and proper scope for app store quality
4. **iOS Compatibility**: Enhanced meta tags for better iOS PWA experience
5. **Reliable Updates**: Periodic update checking for consistent experience

**After implementation:**
- Users remain logged in when the app updates
- PWA meets professional app store standards
- Better iOS PWA experience
- More resilient to storage restrictions

