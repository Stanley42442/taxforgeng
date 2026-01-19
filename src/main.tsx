import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import "./index.css";

// Import all device-specific styles - CSS media queries handle when they apply
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/desktop.css";

// Register VitePWA service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available. Update now?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('[PWA] Ready for offline use');
  },
  onRegistered(registration) {
    console.log('[PWA] Service worker registered:', registration?.scope);
  },
  onRegisterError(error) {
    console.error('[PWA] Service worker registration failed:', error);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
