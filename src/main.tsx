import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import all device-specific styles - CSS media queries handle when they apply
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/desktop.css";

import { safeLocalStorage } from "./lib/safeStorage";

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

/**
 * Background cache clearing - NO RELOAD
 * 
 * This clears stale PWA caches when a new version is deployed.
 * CRITICAL: We NEVER reload the page. The reload was causing infinite loops
 * when localStorage failed to persist the version marker.
 * 
 * Users will get fresh assets on their next natural page navigation.
 */
const clearStaleCaches = async (): Promise<void> => {
  const lastVersion = safeLocalStorage.getItem('cache-version');
  
  // Only clear if version changed and caches API is available
  if (lastVersion !== CACHE_VERSION && 'caches' in window) {
    try {
      // Only clear caches, do NOT unregister service workers
      // The service worker must stay registered for PWA installability
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      console.log('[Init] Stale caches cleared for version:', CACHE_VERSION);
    } catch (error) {
      console.warn('[Init] Cache clear failed:', error);
    }
    
    // Update version marker (best effort - may fail in restricted environments)
    safeLocalStorage.setItem('cache-version', CACHE_VERSION);
  }
};

// RENDER REACT IMMEDIATELY - don't wait for anything
createRoot(document.getElementById("root")!).render(<App />);

// Fire-and-forget: Clear stale caches in background (NO RELOAD)
clearStaleCaches().catch(() => {
  // Silently fail - cache clearing is optional
});

// Fire-and-forget: Initialize optional modules in background
initializeOptionalModules().catch(() => {
  // Silently fail - these are truly optional
});
