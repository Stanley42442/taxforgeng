

# Fix Rate Limit Tier Alignment and Clarify Model

## Problem
The rate limit display shows three tiers (Basic 10k, Pro 100k, Enterprise custom) but the code assigns the same 10,000 limit to both Business and Corporate subscription users. There is no way for users to upgrade their API rate limit, and the "Pro: 100,000" tier is never actually assigned.

## Solution
Align the rate limits with the existing subscription tiers so the displayed numbers match reality, and give Corporate users their higher limit.

## Changes

### 1. Fix `src/pages/ApiDocs.tsx` -- Key creation logic (line 115)
Update the `generateApiKey` function so Corporate tier users actually get a higher rate limit:
- Business tier: creates `basic` keys with **10,000/day**
- Corporate tier: creates `pro` keys with **100,000/day**

Change line 115 from:
```
rate_limit_daily: tier === 'corporate' ? 10000 : 10000,
```
to:
```
rate_limit_daily: tier === 'corporate' ? 100000 : 10000,
```

### 2. Fix `src/pages/ApiDocs.tsx` -- Rate limit display (lines 671-675)
Update the display to clearly tie rate limits to subscription tiers:
- Business plan: 10,000 requests/day
- Corporate plan: 100,000 requests/day  
- Partner keys (admin-created): Custom limits

### 3. No other files need changes
The `validate-embed-key` edge function already reads `rate_limit_daily` from the database per-key, so it will automatically enforce the correct limit once the keys are created with the right values.

## How the model works (for your reference)
- Users pay for a Business or Corporate subscription
- Their subscription tier determines the rate limit on any API keys they create
- Admin-created partner keys have custom limits set at creation time
- There is no separate "rate limit upgrade" -- upgrading your subscription is how you get higher limits

