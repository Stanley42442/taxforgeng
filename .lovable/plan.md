

## Update Favicon for Search Engines & Add Standard Sizes

### Problem
- `index.html` has no `<link rel="icon" href="/favicon.ico">` tag — search engines look for this first
- `public/favicon.ico` likely contains old branding while the PNG icons are already correct
- No 16x16 or 32x32 favicon references exist

### Fix

**File: `index.html`** — Add standard favicon references pointing to the already-correct PNG icons:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
```

These go alongside the existing 192/512 icon links. Browsers and Google will pick up the PNG versions which already have the correct green shield TF branding.

**Note:** `public/favicon.ico` still exists with potentially old branding. Since we cannot generate a new `.ico` file programmatically, the PNG references will take priority in modern browsers and crawlers. If you have an updated `.ico` file, upload it and we can replace it.

After deploying, request Google re-index via Google Search Console to speed up the favicon update.

