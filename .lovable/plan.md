

## Fix Subscription Lifecycle: Expiry Alerts, Grace Period, and Auto-Downgrade

### Problems Identified

1. **No renewal reminders for paid subscriptions** — The `send-trial-expiry-reminder` function only targets *trial* users (checks `created_at` 5 days ago for free-tier users). Paid subscribers with active Paystack subscriptions get no warning before their next payment date or when their subscription lapses.

2. **No grace period** — When `subscription.disable` fires from Paystack, the webhook marks the subscription as cancelled but says "don't immediately downgrade." However, there is no mechanism that ever *does* downgrade them later. The comment says "the webhook will handle the actual downgrade when subscription expires" but no such webhook event processing exists.

3. **No expiry detection cron** — There are no scheduled cron jobs running. The `check-trial-expiry` function exists but is never invoked on a schedule. Same for `cleanup-logs`, `send-trial-expiry-reminder`, etc. They're all manual-only.

4. **Trial reminder is broken** — `send-trial-expiry-reminder` queries for `subscription_tier = 'free'` users who signed up 5 days ago. But trial users have their tier set to the trial tier (e.g. `business`), not `free`. So this function finds nobody.

### Plan

**1. Create a new edge function: `check-subscription-expiry`**
This is the core lifecycle manager. It runs on a schedule and handles:
- **Renewal reminders (7 days before):** Find active `paystack_subscriptions` where `next_payment_date` is within 7 days. Send notification + email.
- **Renewal reminders (1 day before):** Same but 1-day window, more urgent messaging.
- **Grace period start:** Find subscriptions where `next_payment_date` has passed and status is still `active` or `non_renewing`. Mark them with a new `grace_period_ends_at` column (3 days from now). Send "your subscription has lapsed, you have 3 days" notification.
- **Grace period expired — auto-downgrade:** Find subscriptions where `grace_period_ends_at` has passed. Downgrade the user's `profiles.subscription_tier` to `free`, mark subscription as `expired`, send downgrade notification + email.

**2. Fix `send-trial-expiry-reminder`**
Change the query from `subscription_tier = 'free'` to checking `trial_expires_at` directly (users whose `trial_expires_at` is 2 days from now).

**3. Fix `check-trial-expiry`**
Currently only checks `subscription_tier = 'business'` trials. Change to check any tier with a non-null `trial_expires_at` that has passed.

**4. Add `grace_period_ends_at` column to `paystack_subscriptions`**
New nullable timestamp column to track when the grace period ends.

**5. Set up cron jobs**
Schedule `check-subscription-expiry` to run every 6 hours. Schedule `check-trial-expiry` daily. Schedule `send-trial-expiry-reminder` daily.

**6. Add frontend grace period banner**
In `SubscriptionContext`, fetch the user's subscription status including grace period. Show a `GracePeriodBanner` component (similar to `TrialBanner`) when the user is in a grace period.

### Database changes
```sql
ALTER TABLE paystack_subscriptions 
  ADD COLUMN grace_period_ends_at timestamptz DEFAULT NULL;
```

### Files to create/modify
1. **New:** `supabase/functions/check-subscription-expiry/index.ts` — Main lifecycle cron
2. **Modify:** `supabase/functions/send-trial-expiry-reminder/index.ts` — Fix trial query
3. **Modify:** `supabase/functions/check-trial-expiry/index.ts` — Fix tier filter
4. **New:** `src/components/GracePeriodBanner.tsx` — Grace period warning UI
5. **Modify:** `src/contexts/SubscriptionContext.tsx` — Fetch grace period status, expose it
6. **Modify:** `supabase/config.toml` — Add new function config
7. **SQL migration:** Add `grace_period_ends_at` column
8. **SQL insert:** Set up cron jobs for the 3 scheduled functions

