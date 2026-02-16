

# Security Hardening: Embeddable Widget and Partner API

## Problems Found

### Critical Bug
The embed calculator is **completely broken**. The `partners` table has RLS policies that only allow `auth.uid() = user_id` for SELECT. When an unauthenticated visitor loads the embed iframe, the query returns zero rows, so every partner sees "Invalid API key." The embed has never worked in production.

### Security Vulnerabilities
1. **No public read policy** for partner theme data -- needs a narrowly-scoped anonymous SELECT policy
2. **API key exposed in URL** with no origin validation enforced
3. **No rate limiting** on embed page loads (bypasses the partner-api edge function limits)
4. **`postMessage('*')`** sends data to any origin
5. **`allowed_origins` columns exist** but are never checked
6. **Client-side calculation** bypasses the rate-limited server-side API

## Plan

### 1. Add a narrow public SELECT policy for partner embed data

Create a new RLS policy that allows anonymous users to read ONLY the branding/theme columns from `partners`, and ONLY for active partners. This is safe because it only exposes cosmetic data (colors, font, brand name), not secrets.

```sql
CREATE POLICY "Public can read active partner themes"
ON public.partners
FOR SELECT
USING (is_active = true);
```

The existing user-scoped policy already lets owners see their own records. This new one lets anonymous embed visitors fetch theme data. The `api_secret_hash` is in the table but is never selected by the embed code -- it only selects theme columns.

### 2. Create a server-side embed validation edge function

Instead of querying the database directly from the browser (which requires the public policy above to be very permissive), move the partner validation to a new edge function: `validate-embed-key`.

This function will:
- Accept the API key and the requesting origin (from `Referer` or `Origin` header)
- Validate the key exists and is active
- Check the requesting origin against `allowed_origins` / `embed_allowed_domains`
- Increment the partner's request counter (rate limiting)
- Return ONLY the theme/branding data (never the secret hash)
- Return 429 if daily limit exceeded

The embed page (`EmbedCalculator.tsx`) will call this edge function instead of querying the `partners` table directly.

### 3. Restrict the public RLS policy (or remove it)

With the edge function handling validation using the service role key, the anonymous SELECT policy becomes unnecessary. We can keep it removed entirely -- the edge function bypasses RLS with the service role.

So the final approach: **No new public RLS policy needed.** The edge function uses the service role key (like `partner-api` already does) to read partner data server-side.

### 4. Add origin validation

The edge function will check the `Origin` or `Referer` header against the partner's `allowed_origins` array. If the array is empty/null, allow all origins (backwards compatible). If populated, reject requests from unlisted domains.

### 5. Fix postMessage target origin

Change `'*'` to the actual parent origin. Since the embed doesn't know the parent origin at build time, it can read it from the `Referer` header or accept it as a query parameter, then use that as the `postMessage` target.

A simpler approach: since the data sent (tax calculation results) is not sensitive, and the `event.source` check in `embed.js` already prevents spoofing on the receiving end, the risk is low. But we should still tighten it by using `document.referrer` as the target origin when available.

### 6. Add embed load rate limiting

The new `validate-embed-key` edge function inherently rate-limits because it increments `requests_today`. Each embed page load = 1 API call = 1 rate limit count.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/validate-embed-key/index.ts` | Create | New edge function for server-side API key validation, origin checking, and rate limiting |
| `src/pages/EmbedCalculator.tsx` | Modify | Replace direct Supabase query with call to `validate-embed-key` edge function |
| `src/pages/EmbedCalculator.tsx` | Modify | Use `document.referrer` for `postMessage` target origin instead of `'*'` |

## What This Fixes

- Embed will actually work (currently broken due to RLS)
- API key validation happens server-side (not exposed to browser DB queries)
- Origin validation enforced using existing `allowed_origins` column
- Rate limiting applied to embed loads (not just API calls)
- `postMessage` tightened to use referrer origin
- No new public RLS policies needed (edge function uses service role)

## What Partners Need to Do

Nothing changes for partners. Their existing API keys and embed snippets continue to work. If they want to restrict which domains can use their embed, they populate the `allowed_origins` array in their partner settings (already a column in the database).

## Technical Details

### validate-embed-key Edge Function

```
POST /validate-embed-key
Body: { "apiKey": "..." }
Headers: Origin or Referer (checked against allowed_origins)

Response 200: { theme: { brandName, primaryColor, ... } }
Response 401: { error: "Invalid API key" }
Response 403: { error: "Origin not allowed" }
Response 429: { error: "Rate limit exceeded" }
```

The function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS (same pattern as `partner-api/index.ts`).

