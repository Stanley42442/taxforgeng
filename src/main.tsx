import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Dynamic device-specific CSS will be loaded by useDeviceCSS hook
// Import base device styles for initial render
import "./styles/desktop.css";

createRoot(document.getElementById("root")!).render(<App />);
