import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import all device-specific styles - CSS media queries handle when they apply
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/desktop.css";

// Automatic cache busting - uses build timestamp so every deploy triggers cache clear
const CACHE_VERSION = import.meta.env.VITE_BUILD_TIME || 'dev';

(async () => {
  const lastVersion = localStorage.getItem('cache-version');
  
  if (lastVersion !== CACHE_VERSION && 'serviceWorker' in navigator) {
    // PWA cache clearing - production-only logging via console since logger may not be loaded
    
    try {
      // Unregister all service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
      // SW unregistered
      
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      // Caches cleared
      
      // Set version and reload
      localStorage.setItem('cache-version', CACHE_VERSION);
      window.location.reload();
      return;
    } catch (error) {
      // PWA cache clear failed - set version anyway to avoid loops
      localStorage.setItem('cache-version', CACHE_VERSION);
    }
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
