import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import all device-specific styles - CSS media queries handle when they apply
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/desktop.css";

// Register service worker for PWA features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[Main] SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('[Main] SW registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
