

# Fix: White Page on Mobile Devices (Root Cause Found)

## Problem Identified

After tracing through the changelog and initialization code, I found the **root cause**:

### The Critical Bug

In `src/integrations/supabase/client.ts`:
```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,  // <-- RAW localStorage - crashes on restricted storage!
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

**The Supabase client uses raw `localStorage` directly**, not the safe wrapper. When this fails on devices with storage restrictions (private browsing, certain Android browsers, quota exceeded), the **entire import chain fails**.

### Why This Causes White Page

The initialization flow in `main.tsx` is:

```
1. Import errorTracking.ts (imports supabase/client.ts)
   └── supabase/client.ts uses raw localStorage → CRASH
2. Import webVitals.ts (imports supabase/client.ts)  
   └── Already crashed above
3. initGlobalErrorHandlers() ← Never reached
4. initWebVitals() ← Never reached
5. createRoot().render(<App />) ← NEVER REACHED = WHITE PAGE
```

### Why It's Worse on Low-End Devices

Devices like Redmi 12c often have:
- Aggressive memory management that restricts storage
- Browser privacy modes enabled by default
- Storage quota exhaustion from other apps
- Older WebView versions with stricter security

---

## Solution

### 1. Create Safe Storage Adapter for Supabase

Create a custom storage adapter that wraps localStorage with try-catch, matching the Supabase storage interface:

**New file: `src/lib/supabaseStorage.ts`**
```typescript
/**
 * Safe storage adapter for Supabase Auth
 * Prevents crashes on devices with restricted localStorage access
 */
export const safeSupabaseStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail - user will need to re-login
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },
};
```

### 2. Update Supabase Client to Use Safe Storage

**File: `src/integrations/supabase/client.ts`**

Since this file is auto-generated and we cannot edit it, we need an alternative approach:

**Alternative: Create a wrapper initialization**

Create `src/lib/supabaseClient.ts` that safely initializes the client:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { safeSupabaseStorage } from './supabaseStorage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: safeSupabaseStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

Then update all imports from `@/integrations/supabase/client` to `@/lib/supabaseClient`.

**However**, since the client file is auto-generated and we're told NOT to edit it, we have a constraint. 

### 3. Wrap Initialization in Try-Catch (Alternative Fix)

If we cannot modify the Supabase client, we can wrap the problematic initializers:

**File: `src/main.tsx`**

```typescript
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/desktop.css";

import { safeLocalStorage, safeSessionStorage } from "./lib/safeStorage";

// SAFETY: Wrap initialization modules that import supabase client
// This prevents white page on devices with storage restrictions
const initializeModules = async () => {
  try {
    const { initGlobalErrorHandlers } = await import("./lib/errorTracking");
    initGlobalErrorHandlers();
  } catch (e) {
    console.warn('[Init] Error tracking failed to initialize:', e);
  }
  
  try {
    const { initWebVitals } = await import("./lib/webVitals");
    initWebVitals();
  } catch (e) {
    console.warn('[Init] Web vitals failed to initialize:', e);
  }
};

// ... rest of cache busting logic ...

(async () => {
  // Initialize optional modules (safe to fail)
  await initializeModules();
  
  // ... existing cache logic ...
  
  // This MUST run even if modules above fail
  createRoot(document.getElementById("root")!).render(<App />);
})();
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/main.tsx` | Wrap error tracking and web vitals imports in try-catch with dynamic imports |

---

## Why This Fix Works

| Issue | Before | After |
|-------|--------|-------|
| localStorage crash in Supabase client | Entire app fails to load | Error is caught, app continues |
| Error tracking init fails | White page | Gracefully skipped, app loads |
| Web vitals init fails | White page | Gracefully skipped, app loads |
| React render blocked | Never called | Always called at the end |

---

## Technical Details

### Dynamic Import Benefits
- Errors in dynamically imported modules don't crash the main bundle
- We can catch and handle initialization failures
- The app still loads, just without error tracking/vitals on problematic devices

### Impact on Affected Devices
- **Normal devices**: No change, error tracking and vitals work as before
- **Restricted storage devices**: App loads successfully, just without optional monitoring features

---

## Verification Steps

After implementing:
1. Test on Redmi 12c in normal browser mode
2. Test in Chrome incognito mode
3. Test in Firefox private browsing
4. Test with storage quota exceeded (fill localStorage in devtools)
5. Verify error tracking still works on normal devices

