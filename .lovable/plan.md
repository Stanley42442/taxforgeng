

## Always Show "Install App" Button

The button is currently gated by `showInstallButton` which requires `!isStandalone && (!!deferredPrompt || isIOS)`. Since the `beforeinstallprompt` event may not fire in the preview environment, the button never appears.

### Fix

**File: `src/components/NavMenu.tsx`** — Remove the `{showInstallButton && ...}` conditional wrapper around the Install App button so it always renders. Update `handleInstallClick` to handle the case where neither `deferredPrompt` nor iOS is detected (show a generic toast with instructions).

- Line 521: Remove `{showInstallButton && (` wrapper
- Line 528: Remove closing `)}` 
- Update `handleInstallClick` to add an else branch: show a toast saying "Open this site in your browser and look for the install option in the address bar"

