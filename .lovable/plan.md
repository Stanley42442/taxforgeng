

## Make "Install App" Button Actually Trigger PWA Install

The `beforeinstallprompt` event only fires in top-level browser contexts (Chrome/Edge) on the actual domain — never inside iframes or preview URLs. The current fallback just shows a toast with vague instructions.

### Fix

**File: `src/components/NavMenu.tsx`** — Update the fallback branch of `handleInstallClick`:

Instead of showing a generic toast, open the published app URL (`https://taxforgeng.lovable.app`) in a new tab so the user can install it from there. Also improve the toast to explain why:

```typescript
} else {
  // Open the published URL in a new tab where PWA install is supported
  window.open("https://taxforgeng.lovable.app", "_blank");
  toast.info("Install TaxForge NG", {
    description: "The app has opened in a new tab. Use your browser's install button (in the address bar) to add it to your device.",
    duration: 8000,
  });
}
```

This ensures:
- If the native `beforeinstallprompt` fires (production Chrome/Edge), clicking triggers the install dialog directly
- If on iOS, shows Share > Add to Home Screen instructions
- Otherwise, opens the real published URL where the browser can offer native PWA install

