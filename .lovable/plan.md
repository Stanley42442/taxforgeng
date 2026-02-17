

## Fix Google Analytics 4 Not Being Detected

### Problem
The GA4 tag is correctly placed in `index.html`, but the Content Security Policy (CSP) is blocking some of the network requests that `gtag.js` makes. Specifically, the Google tag sends data to regional endpoints like `https://region1.google-analytics.com` and also loads scripts from `https://www.googletagmanager.com`, which need wildcard coverage for subdomains.

### Solution
Update the CSP `connect-src` directive to use a wildcard pattern that covers all Google Analytics endpoints.

### Changes (1 file)

**index.html (line 9)** -- Update the Content Security Policy meta tag:

Current `connect-src`:
```
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://api.ipify.org https://fonts.googleapis.com https://fonts.gstatic.com https://www.google-analytics.com https://analytics.google.com;
```

Updated `connect-src`:
```
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://api.ipify.org https://fonts.googleapis.com https://fonts.gstatic.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net;
```

The key addition is `https://*.google-analytics.com` (covers `region1.google-analytics.com` and similar regional endpoints) and `https://stats.g.doubleclick.net` (used for conversion tracking).

### After This Change
1. Publish the site again
2. Wait 1-2 minutes for the published site to update
3. Go to Google Analytics > Admin > Data Streams > your stream > click "Test" again
4. It should now detect the tag

### Technical Details
- GA4's `gtag.js` sends beacons to regional endpoints (`region1.google-analytics.com`, etc.)
- The existing CSP only allowed `www.google-analytics.com` and `analytics.google.com`, missing the regional subdomains
- Without these in `connect-src`, the browser silently blocks the outgoing tracking requests
- The tag appears installed in the HTML source but cannot actually send data

