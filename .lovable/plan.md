

## Make "Install App" Work Across All Browsers

Firefox (and some Linux browsers) do not support the `beforeinstallprompt` API, so we need browser-specific guided instructions as a fallback.

### Approach

**File: `src/components/NavMenu.tsx`** — Update `handleInstallClick` to detect the browser and show appropriate install guidance:

1. **Chrome/Edge (desktop & Android)**: Use native `beforeinstallprompt` when available — triggers one-click install dialog
2. **Firefox**: Show a dialog/toast with Firefox-specific steps:
   - Desktop Firefox doesn't support PWA install natively. Show instructions to use the "Add to Home Screen" on Android Firefox, or suggest using the production URL in Chrome/Edge for desktop
   - On Android Firefox: "Tap the 3-dot menu → Install" 
3. **iOS Safari**: Existing share → Add to Home Screen toast
4. **Fallback**: Open production URL (`taxforgeng.com`) in a new tab with instructions

**New file: `src/components/InstallAppDialog.tsx`** — A small dialog component that shows browser-specific install instructions with screenshots/icons:

- Detect browser via `navigator.userAgent` (Firefox, Chrome, Edge, Safari, Samsung, Opera)
- Show step-by-step instructions tailored to that browser
- For desktop Firefox specifically: explain that Firefox desktop doesn't support PWA install, suggest opening in Chrome/Edge, with a "Copy Link" button for `taxforgeng.com`
- For Android Firefox: show "Menu → Install" steps
- Include a "Copy Link" button so users can paste into a supported browser

### Technical details

Browser detection logic:
```text
if (deferredPrompt)         → native install (Chrome/Edge)
if (isIOS && isSafari)      → iOS instructions  
if (isFirefox && isAndroid) → Firefox Android: "Menu → Install"
if (isFirefox && isDesktop) → "Firefox desktop doesn't support PWA. Open in Chrome/Edge" + copy link
else                        → generic: open taxforgeng.com + browser install instructions
```

The dialog uses the existing `Dialog` component from shadcn/ui and closes the Sheet menu first.

