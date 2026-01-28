import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import all device-specific styles - CSS media queries handle when they apply
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/desktop.css";

import { safeLocalStorage, safeSessionStorage } from "./lib/safeStorage";

/**
 * SAFETY: Initialize optional modules with dynamic imports, try-catch, and timeout
 * This prevents white page on devices with restricted localStorage access
 * (private browsing, certain Android browsers, quota exceeded)
 * 
 * These modules import supabase/client.ts which uses raw localStorage.
 * If localStorage is restricted, the import itself crashes.
 * Dynamic imports isolate these crashes so React can still render.
 */
const initializeOptionalModules = async (): Promise<void> => {
  // 3-second timeout - if modules don't load by then, give up
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));
  
  const init = async () => {
    // Error tracking - nice to have, not critical
    try {
      const { initGlobalErrorHandlers } = await import("./lib/errorTracking");
      initGlobalErrorHandlers();
    } catch (e) {
      console.warn('[Init] Error tracking failed to initialize:', e);
    }
    
    // Web vitals monitoring - nice to have, not critical
    try {
      const { initWebVitals } = await import("./lib/webVitals");
      initWebVitals();
    } catch (e) {
      console.warn('[Init] Web vitals failed to initialize:', e);
    }
  };
  
  // Race: either init completes or timeout wins
  await Promise.race([init(), timeout]);
};

// Automatic cache busting - uses build timestamp so every deploy triggers cache clear
const CACHE_VERSION = import.meta.env.VITE_BUILD_TIME || 'dev';

// Auth token key for Supabase
const AUTH_TOKEN_KEY = 'sb-uhuxqrrtsiintcwpxxwy-auth-token';
const SESSION_ONLY_KEY = 'taxforge-session-only';

// Reload loop prevention
const RELOAD_KEY = 'cache-reload-count';
const MAX_RELOADS = 2;

// In-memory guard to prevent reload loops even if storage fails completely
let hasAttemptedCacheClear = false;

// Main initialization - render React IMMEDIATELY, don't block on anything
(() => {
  const lastVersion = safeLocalStorage.getItem('cache-version');
  const reloadCount = parseInt(safeLocalStorage.getItem(RELOAD_KEY) || '0', 10);
  
  // Only attempt cache clear if:
  // 1. Version changed
  // 2. Service workers are supported
  // 3. We haven't exceeded max reloads
  // 4. We haven't already attempted in this session (in-memory guard)
  if (!hasAttemptedCacheClear && lastVersion !== CACHE_VERSION && 'serviceWorker' in navigator && reloadCount < MAX_RELOADS) {
    // Set in-memory flag FIRST - prevents loops even if storage fails
    hasAttemptedCacheClear = true;
    
    // Increment reload counter BEFORE doing anything else
    safeLocalStorage.setItem(RELOAD_KEY, String(reloadCount + 1));
    
    // CRITICAL: Preserve auth token before clearing caches
    const authToken = safeLocalStorage.getItem(AUTH_TOKEN_KEY);
    const sessionOnly = safeSessionStorage.getItem(SESSION_ONLY_KEY);
    
    // Async cache clear - but don't block React render
    (async () => {
      try {
        // Unregister all service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
        
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        // Set version to prevent loop
        safeLocalStorage.setItem('cache-version', CACHE_VERSION);
        
        // CRITICAL: Restore auth token after cache clear
        if (authToken) {
          safeLocalStorage.setItem(AUTH_TOKEN_KEY, authToken);
        }
        if (sessionOnly) {
          safeSessionStorage.setItem(SESSION_ONLY_KEY, sessionOnly);
        }
        
        // Reload to get fresh assets
        window.location.reload();
      } catch (error) {
        // PWA cache clear failed - set version anyway to avoid loops
        safeLocalStorage.setItem('cache-version', CACHE_VERSION);
        // Reset reload counter on error
        safeLocalStorage.removeItem(RELOAD_KEY);
        console.warn('[Init] Cache clear failed:', error);
      }
    })();
    
    // DON'T return here - render React anyway while cache clears
    // The reload will happen async, but user sees the app immediately
  } else {
    // Reset reload counter on successful load (no cache clear needed)
    safeLocalStorage.removeItem(RELOAD_KEY);
  }
  
  // RENDER REACT IMMEDIATELY - don't wait for anything
  createRoot(document.getElementById("root")!).render(<App />);
  
  // Fire-and-forget: Initialize optional modules in background
  // This won't block the app from showing
  initializeOptionalModules().catch(() => {
    // Silently fail - these are truly optional
  });
})();
