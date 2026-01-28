import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import all device-specific styles - CSS media queries handle when they apply
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/desktop.css";

import { safeLocalStorage, safeSessionStorage } from "./lib/safeStorage";
import { initGlobalErrorHandlers } from "./lib/errorTracking";
import { initWebVitals } from "./lib/webVitals";

// Initialize global error handlers for production error tracking
initGlobalErrorHandlers();

// Initialize Web Vitals monitoring for production performance tracking
initWebVitals();

// Automatic cache busting - uses build timestamp so every deploy triggers cache clear
const CACHE_VERSION = import.meta.env.VITE_BUILD_TIME || 'dev';

// Auth token key for Supabase
const AUTH_TOKEN_KEY = 'sb-uhuxqrrtsiintcwpxxwy-auth-token';
const SESSION_ONLY_KEY = 'taxforge-session-only';

// Reload loop prevention
const RELOAD_KEY = 'cache-reload-count';
const MAX_RELOADS = 2;

// Main initialization - blocking to prevent race conditions
(async () => {
  const lastVersion = safeLocalStorage.getItem('cache-version');
  const reloadCount = parseInt(safeLocalStorage.getItem(RELOAD_KEY) || '0', 10);
  
  // Only attempt cache clear if version changed AND we haven't exceeded max reloads
  if (lastVersion !== CACHE_VERSION && 'serviceWorker' in navigator && reloadCount < MAX_RELOADS) {
    try {
      // Increment reload counter BEFORE doing anything else
      safeLocalStorage.setItem(RELOAD_KEY, String(reloadCount + 1));
      
      // CRITICAL: Preserve auth token before clearing caches
      // This prevents users from being logged out on every deploy
      const authToken = safeLocalStorage.getItem(AUTH_TOKEN_KEY);
      const sessionOnly = safeSessionStorage.getItem(SESSION_ONLY_KEY);
      
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
      
      // Reload and exit - don't render React yet
      window.location.reload();
      return;
    } catch (error) {
      // PWA cache clear failed - set version anyway to avoid loops
      safeLocalStorage.setItem('cache-version', CACHE_VERSION);
      // Reset reload counter on error
      safeLocalStorage.removeItem(RELOAD_KEY);
    }
  } else {
    // Reset reload counter on successful load (no cache clear needed)
    safeLocalStorage.removeItem(RELOAD_KEY);
  }
  
  // Only render React AFTER cache check is complete
  createRoot(document.getElementById("root")!).render(<App />);
})();
