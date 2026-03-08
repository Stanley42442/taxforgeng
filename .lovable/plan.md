

## Fix: Auth Login Still Broken — Two Root Causes Found

### Problem 1: `track-device` not in `config.toml`
The edge function defaults to `verify_jwt = true`, so Supabase rejects the call before our code even runs. Since we validate the JWT manually in the function, it needs `verify_jwt = false`.

### Problem 2: `auth.getClaims()` does not exist
Line 28 of the edge function calls `userClient.auth.getClaims(token)` — this method does not exist in `@supabase/supabase-js@2`. The function crashes immediately on every invocation. Must use `auth.getUser(token)` instead.

### Problem 3: Token cascade still happening
The auth logs from 18:09 show the exact same cascade pattern. Because the edge function fails silently (crash → no response or 500), the client-side `supabase.functions.invoke()` triggers error handling that may cause re-auth attempts. Meanwhile, **other components** (SubscriptionContext, etc.) fire their own authenticated queries on login, contributing to the cascade.

### Fix Plan

**1. Fix `supabase/config.toml`** — Add `track-device` with `verify_jwt = false`

**2. Fix `supabase/functions/track-device/index.ts`** — Replace `getClaims` with `getUser`:
```typescript
// Before (broken):
const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
const userId = claimsData.claims.sub;
const userEmail = claimsData.claims.email;

// After (working):
const { data: { user }, error: userError } = await userClient.auth.getUser(token);
const userId = user.id;
const userEmail = user.email;
```

**3. Redeploy the edge function** and verify it responds correctly.

### Files Changed
- `supabase/config.toml` — add `[functions.track-device]` entry
- `supabase/functions/track-device/index.ts` — fix `getClaims` → `getUser`

