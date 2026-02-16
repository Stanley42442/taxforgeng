

# Embed Security Fixes + Partner Distribution Strategy

## Part 1: Remaining Security Fixes

### Fix 1: Add `sandbox` attribute to embed.js iframe
The iframe created by `embed.js` has no `sandbox` attribute. Adding `sandbox="allow-scripts allow-forms allow-same-origin"` prevents the embedded calculator from navigating the parent page, opening popups, or accessing parent cookies.

### Fix 2: Validate API key format in edge function
The edge function accepts any string as an API key and hits the database. Adding a format check (`txf_` prefix, correct length) rejects garbage input before it touches the database, reducing load from scanners and bots.

### Fix 3: Remove `postMessage` wildcard fallback
`EmbedCalculator.tsx` falls back to `'*'` when `document.referrer` is empty. Instead, it should silently skip sending the message. The calculation result is not sensitive (it's just tax numbers), but the wildcard is unnecessary -- if there's no referrer, there's no legitimate parent listening.

### Fix 4: Remove `clipboard-write` permission
`embed.js` sets `iframe.allow = 'clipboard-write'` which is unnecessary for a calculator widget. Removing it reduces the iframe's capability surface.

### Fix 5: Add API key length validation
The `apiKey` parameter in `EmbedCalculator.tsx` should be checked for reasonable length before sending to the edge function, preventing excessively long payloads.

### Fix 6: Rate limit default for `business` tier
`ApiDocs.tsx` line 100 sets `rate_limit_daily: 1000` for `business` tier (only `corporate` gets 10,000). This should be updated to use the new tiered defaults (10,000 for business).

## Part 2: Partner Distribution Strategy

Currently, only Business/Corporate tier users can generate API keys. This means if you want to distribute the embed widget to external sites, you have two realistic options:

### Option A: You generate keys for them (recommended to start)
You keep one Business/Corporate account, generate API keys from your `/api-docs` page, set each key's `allowed_origins` to the partner's domain, and hand them the embed snippet. The partner never needs a TaxForge account. You control everything.

### Option B: Add an admin function to create partner keys
Create a simple admin-only edge function or page that lets you (as admin) generate API keys for any partner without them needing an account. You'd enter:
- Partner name
- Their website domain(s)  
- Daily rate limit tier

This gives you a clean management workflow without requiring partners to sign up at all.

**We will implement Option B** -- an "Admin Partner Management" section on your existing API Docs page that lets you create keys for external partners with their domain restrictions pre-configured.

## Files to Modify

| File | Changes |
|------|---------|
| `public/embed.js` | Add `sandbox` attribute, remove `clipboard-write` |
| `src/pages/EmbedCalculator.tsx` | Remove `'*'` fallback, add key length validation |
| `supabase/functions/validate-embed-key/index.ts` | Add `txf_` prefix + length validation |
| `src/pages/ApiDocs.tsx` | Fix business tier rate limit default, add admin partner creation section with domain input |

## Technical Details

### embed.js sandbox attribute
```javascript
iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
```
`allow-same-origin` is needed so the iframe can call the edge function (cross-origin fetch). `allow-scripts` runs the React app. `allow-forms` allows the calculator input fields.

### API key format validation (edge function)
```typescript
if (!apiKey.startsWith('txf_') || apiKey.length < 20 || apiKey.length > 50) {
  return 401 "Invalid API key format"
}
```
This rejects random strings before they hit the database.

### Admin partner creation
The existing API Docs page will get an additional form field for "Partner Domain(s)" so when you generate a key for an external site, you can set their allowed origins at creation time. The key is then ready to hand to the partner along with the embed code snippet.

### postMessage fix
```typescript
const targetOrigin = getTargetOrigin();
if (targetOrigin !== '*') {
  window.parent.postMessage({ type: 'taxforge-calculation', data: result }, targetOrigin);
}
```
If no referrer is available, skip the postMessage entirely rather than broadcasting to all origins.

