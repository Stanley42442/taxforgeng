

## Add "Install App" option to hamburger menu

**File: `src/components/NavMenu.tsx`**

Add a "Install App" button in the hamburger menu footer (above the sign-in/sign-out section). It will:

1. Capture the `beforeinstallprompt` event in the NavMenu component (reusing the same pattern from `InstallPWAPrompt.tsx`)
2. Show a "Install App" button with a `Download` icon when:
   - The app is NOT already running in standalone/PWA mode
   - The `beforeinstallprompt` event has fired (Android/Desktop), OR show iOS instructions via a toast
3. Hide the button when already installed as PWA
4. On click: trigger `deferredPrompt.prompt()` for Android/Desktop, or show a toast with iOS Safari instructions

The button goes in the footer area of the Sheet, just before the user auth section. This keeps it visible without cluttering the nav groups.

### Implementation details

- Add state: `deferredPrompt`, `isStandalone`, `platform` detection (same logic as InstallPWAPrompt)
- Add a `useEffect` to listen for `beforeinstallprompt`
- Render a button conditionally in the Sheet footer with `Download` icon + "Install App" label
- For iOS: clicking shows a toast with share > add to home screen instructions
- Wrap in `SheetClose` so the menu closes after clicking

