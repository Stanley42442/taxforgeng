
## Add Google Analytics 4 (GA4) Tracking

### What This Does
Adds Google Analytics 4 to your site using your Measurement ID `G-04PEEW31NE`. This will let you see detailed traffic data including human vs bot filtering, demographics, page flows, and custom events.

### Changes

**1. Update Content Security Policy (index.html, line 8)**
Add `https://www.googletagmanager.com` and `https://www.google-analytics.com` to the `script-src` and `connect-src` directives so the GA4 scripts are allowed to load and send data.

**2. Add GA4 script tags (index.html, inside `<head>`)**
Insert the standard Google Analytics `gtag.js` snippet right after the CSP meta tags:
- An async script loading `https://www.googletagmanager.com/gtag/js?id=G-04PEEW31NE`
- An inline script initializing `gtag()` with your Measurement ID

### Technical Details

The CSP `script-src` directive will be updated from:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://api.ipify.org https://cdn.gpteng.co
```
to:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://api.ipify.org https://cdn.gpteng.co https://www.googletagmanager.com
```

The `connect-src` directive will add `https://www.google-analytics.com https://analytics.google.com` so GA4 can send tracking data.

The GA4 snippet inserted will be:
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-04PEEW31NE"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-04PEEW31NE');
</script>
```

### Files Modified
- `index.html` -- CSP update + GA4 script tags (only file changed)

### What You'll See After
Within 24-48 hours, data will start appearing in your GA4 dashboard at [analytics.google.com](https://analytics.google.com). You'll be able to see real-time visitors, traffic sources, page paths, and GA4's built-in bot filtering.
