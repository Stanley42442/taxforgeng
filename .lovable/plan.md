

# Security Audit and Rate Limiting Improvements for Embed Widget

## Current Security Status

### What's Already Secure
- Server-side API key validation via `validate-embed-key` edge function (uses service role, bypasses RLS safely)
- Origin validation against `allowed_origins` / `embed_allowed_domains` arrays
- Only theme/branding data returned to the client (no secrets, no `api_secret_hash`)
- `postMessage` uses `document.referrer` origin instead of wildcard `'*'` when available
- `embed.js` SDK verifies `event.source === iframe.contentWindow` to prevent spoofing
- API key input validation (must be non-empty string)

### Issues Found

#### 1. CRITICAL: `requests_today` never resets
There is no cron job, trigger, or scheduled function that resets `requests_today` back to 0 at midnight. Once a partner hits their daily limit, they are **permanently blocked** until someone manually resets it. This is a serious operational bug.

#### 2. Rate limit default is too low for production embeds
The default `rate_limit_daily = 1000` means a partner site with 1,000 daily visitors would exhaust the quota. A popular site with 10,000+ visitors would be blocked before noon. The limit should scale by tier:
- **Basic**: 10,000/day (small sites)
- **Pro**: 100,000/day (medium traffic)
- **Enterprise**: 1,000,000/day (high traffic)

#### 3. No per-minute/per-second burst protection
The daily limit alone does not prevent a DDoS-style burst. An attacker could send 1,000 requests in 1 second. A short-window rate limit (e.g., 60 requests per minute per API key) is needed.

#### 4. `validate-embed-key` does not increment `requests_total`
The `partner-api` function increments both `requests_today` and `requests_total`. The embed validation function only increments `requests_today`, losing lifetime analytics.

#### 5. API key stored as plain text
The `api_key` column stores keys in cleartext. While not as critical as passwords (API keys are meant to be used in requests), best practice is to store a hash and compare. However, this would require changes to the lookup logic (can't query by hash directly without knowing the key). The current approach is acceptable for this use case since the key is already visible in the embed URL.

#### 6. CORS allows all origins at the edge function level
The edge function has `Access-Control-Allow-Origin: '*'`. This is actually correct for an embeddable widget -- it must be callable from any domain. The origin restriction logic inside the function provides the real access control. No change needed.

## Plan

### 1. Create a daily reset function and cron trigger

Add a database function that resets `requests_today` to 0 for all partners, and schedule it to run at midnight UTC daily using `pg_cron` (via a Supabase cron job edge function, since pg_cron may not be available).

Alternatively, change the rate limiting approach to be **time-window based**: instead of a counter that needs resetting, store `rate_limit_window_start` and compare against `now()`. If more than 24 hours have passed since the window start, reset the counter automatically.

The time-window approach is more robust (no cron dependency):

```text
IF now() - partner.rate_limit_window_start > 24 hours:
    reset requests_today = 1, rate_limit_window_start = now()
ELSE:
    increment requests_today
```

### 2. Add a `rate_limit_window_start` column to `partners`

New column: `rate_limit_window_start TIMESTAMPTZ DEFAULT now()`

This lets the edge function auto-reset the counter when a new 24-hour window begins, with no external cron needed.

### 3. Increase default rate limits by tier

| Tier | Current Default | New Default |
|------|----------------|-------------|
| Basic | 1,000 | 10,000 |
| Pro | 1,000 | 100,000 |
| Enterprise | 1,000 | 1,000,000 |

Update existing partner rows to the new defaults.

### 4. Add per-minute burst protection

Add a `requests_this_minute` counter and `minute_window_start` column, or use an in-memory approach in the edge function. The simplest approach: use the existing `api_rate_limits` table to track per-minute usage per API key, leveraging the `rate_limit_check` function pattern already in the codebase.

### 5. Fix `requests_total` tracking in validate-embed-key

Add `requests_total` increment alongside `requests_today`.

### 6. Add `Retry-After` header to 429 responses

When rate-limited, include a `Retry-After` header telling the client when to try again. This is an HTTP standard for 429 responses.

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/validate-embed-key/index.ts` | Modify | Add auto-reset logic, burst protection, increment `requests_total`, add `Retry-After` header |
| Database migration | Create | Add `rate_limit_window_start` column, update default `rate_limit_daily` per tier, add `minute_window_start` and `requests_this_minute` columns |
| `supabase/functions/partner-api/index.ts` | Modify | Add same auto-reset logic for consistency |

## Technical Details

### Updated validate-embed-key flow

```text
1. Receive POST { apiKey }
2. Validate apiKey exists and is_active
3. Check origin against allowed_origins
4. Check if 24h window has elapsed:
   - YES: reset requests_today = 0, update rate_limit_window_start
   - NO: continue
5. Check if requests_today >= rate_limit_daily -> 429 with Retry-After
6. Check per-minute burst (60 req/min max) -> 429 if exceeded
7. Increment requests_today + requests_total
8. Return theme data
```

### Migration SQL (summary)

```sql
-- Add window tracking columns
ALTER TABLE partners ADD COLUMN rate_limit_window_start TIMESTAMPTZ DEFAULT now();
ALTER TABLE partners ADD COLUMN requests_this_minute INTEGER DEFAULT 0;
ALTER TABLE partners ADD COLUMN minute_window_start TIMESTAMPTZ DEFAULT now();

-- Update defaults based on tier
UPDATE partners SET rate_limit_daily = 10000 WHERE tier = 'basic' AND rate_limit_daily = 1000;
UPDATE partners SET rate_limit_daily = 100000 WHERE tier = 'pro' AND rate_limit_daily = 1000;
UPDATE partners SET rate_limit_daily = 1000000 WHERE tier = 'enterprise' AND rate_limit_daily = 1000;

-- Update column default
ALTER TABLE partners ALTER COLUMN rate_limit_daily SET DEFAULT 10000;
```

