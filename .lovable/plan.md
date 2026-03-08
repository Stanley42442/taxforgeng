

## Problem: Token Refresh Cascade Still Causing Logout

The ref-based fix prevented duplicate `trackDevice` calls, but the core issue remains: `trackDevice` itself fires **~10 parallel authenticated Supabase API calls** (known_devices queries, IP whitelist check, time restriction check, profile query, edge function invocations). When these run simultaneously using the same auth token, one call triggers a token refresh that **revokes the old token**, causing the other in-flight calls to fail and trigger their own refresh attempts. This cascades into 50+ `token_revoked` events and a 429 rate limit, which kills the session.

### Root Cause
```text
trackDevice() fires in parallel:
  ├── getDeviceInfo()
  ├── getClientIP()
  ├── getLocationFromIP()         ── uses auth token
  ├── supabase.from('profiles')   ── uses auth token
  ├── isDeviceBlocked()           ── uses auth token
  ├── checkIPWhitelist()          ── uses auth token (RPC)
  ├── check_time_restrictions()   ── uses auth token (RPC)
  ├── known_devices SELECT        ── uses auth token
  ├── known_devices INSERT/UPDATE ── uses auth token
  └── send-security-alert invoke  ── uses auth token
```
All 10 calls share one token. First refresh revokes it. Cascade ensues.

### Fix: Move Device Tracking to a Single Edge Function

Instead of making 10 parallel client-side API calls, send device info to **one edge function** that performs all tracking server-side using the service role key (no token refresh issues).

**Client side (`useAuth.tsx`):**
- `trackDevice` becomes a single `supabase.functions.invoke('track-device', { body: { deviceInfo, clientIP } })` call
- No more parallel DB queries from the client during login
- Fire-and-forget: don't await, don't block login

**New edge function (`supabase/functions/track-device/index.ts`):**
- Receives device fingerprint, user agent, client IP from the request
- Uses service role key to perform all DB operations (no token refresh)
- Handles: device blocking check, IP whitelist, time restrictions, known_devices upsert, security alerts
- Returns `{ blocked, ipBlocked, timeBlocked }` status

**Auth.tsx changes:**
- After successful `signInWithPassword`, check the `track-device` response
- If blocked/ipBlocked/timeBlocked, sign out and show appropriate message

### Files Changed
1. **`supabase/functions/track-device/index.ts`** (new) — All device tracking logic consolidated server-side
2. **`src/hooks/useAuth.tsx`** — Replace `trackDevice` function body with single edge function call
3. **`supabase/config.toml`** — Add `[functions.track-device]` config (verify_jwt = false, validate in code)

### What This Achieves
- Login triggers exactly **1 network request** for device tracking instead of 10
- Server-side calls use service role key — no token refresh cascade possible
- Login becomes near-instant (no blocking on device tracking)
- All security checks (IP whitelist, time restrictions, device blocking) still enforced

