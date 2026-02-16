

# Create `public/embed.js` — JavaScript SDK for Embeddable Calculator

## Problem

The Partner Branding page (`/partner-branding`) provides a "Script Embed" code snippet that references `public/embed.js`, but this file does not exist. Partners copying the snippet get a 404, making the JavaScript SDK integration method broken.

## Solution

Create a single file: `public/embed.js`

This is a lightweight, zero-dependency vanilla JS script (~80 lines) that:

1. Exposes a global `TaxForge.init()` method matching the snippet already shown on the Partner Branding page
2. Dynamically creates an iframe pointing to `/embed/calculator?key=PARTNER_KEY`
3. Listens for `postMessage` events from the iframe to relay calculation results via an optional `onCalculate` callback
4. Auto-detects its own origin URL so the embed works from any domain

## How Partners Use It

```html
<div id="taxforge-calculator"></div>
<script src="https://taxforgeng.com/embed.js"></script>
<script>
  TaxForge.init({
    container: '#taxforge-calculator',
    apiKey: 'PARTNER_API_KEY',
    onCalculate: function(result) {
      console.log('Tax result:', result);
    }
  });
</script>
```

This matches exactly what the Partner Branding page already generates.

## File Created

| File | Description |
|------|-------------|
| `public/embed.js` | ~80-line vanilla JS IIFE. No build step needed -- served as a static asset. |

## Technical Details

- Uses an IIFE to avoid polluting the global scope (only `window.TaxForge` is exposed)
- Auto-discovers the base URL from its own `<script>` tag src, with fallback to `https://taxforgeng.com`
- Sets `loading="lazy"`, `border: none`, `colorScheme: light` on the iframe
- Validates required options (`container`, `apiKey`) and logs clear console errors if missing
- Filters `postMessage` events by `type === 'taxforge-calculation'` and verifies `event.source` matches the iframe to prevent spoofing

