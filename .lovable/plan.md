
## Reduce Cloud Hosting Costs — Cron Job Optimisation

### Root Cause of Overspend

There are currently **two overlapping cron jobs** both calling the `check-reminders` edge function:

- `check-reminders-every-minute` — fires every 1 minute (`* * * * *`) = **1,440 invocations/day**
- `daily-reminder-check` — fires once at 8am (`0 8 * * *`) = **1/day**

The 1-minute job is the primary cost driver. Tax deadlines do not change minute-to-minute — reminders only need to be checked a few times a day. The function already has a built-in duplicate-prevention guard (`last_notified_at` within the last hour), so high-frequency polling is completely wasted compute.

### All Changes (Zero User-Facing Impact)

#### 1. Drop the 1-minute cron job (SQL — no migration needed, data-only)

Delete the `check-reminders-every-minute` job from `cron.job`. The `daily-reminder-check` at 8am already covers tax deadline reminders (VAT, PAYE, PIT, CIT). This alone reduces invocations from **1,440/day → 1/day** for this function.

For custom reminders (which fire at an exact time), we'll replace the 1-minute job with a smarter **every-15-minutes** job. This means a custom reminder fires within 15 minutes of the set time — imperceptible to users, but 96x cheaper (96 calls/day instead of 1,440).

```sql
-- Drop the expensive every-minute job
SELECT cron.unschedule('check-reminders-every-minute');

-- Add a replacement every-15-minutes job (covers custom reminders)
SELECT cron.schedule(
  'check-reminders-every-15-min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://uhuxqrrtsiintcwpxxwy.supabase.co/functions/v1/check-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodXhxcnJ0c2lpbnRjd3B4eHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNzA1MDcsImV4cCI6MjA4MjY0NjUwN30.cRyLR7E_0o6jEsa4fEODCqo-LwccYEoXt01FtmunrUc"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

#### 2. Widen the custom-reminder time window in `check-reminders/index.ts`

The current code only triggers a custom reminder if the due time is **within 5 minutes** of now. Since we're now checking every 15 minutes, we need to widen this window to **20 minutes** to ensure no custom reminder is ever missed.

```typescript
// BEFORE (index.ts line ~238)
const isTimeToSend = timeDiff >= 0 && timeDiff <= 5 * 60 * 1000;

// AFTER
const isTimeToSend = timeDiff >= 0 && timeDiff <= 20 * 60 * 1000;
```

The `last_notified_at` duplicate guard (already in place) ensures the email is only ever sent once even if the wider window causes multiple checks to "see" the reminder.

### Projected Savings

| Job | Before | After | Reduction |
|---|---|---|---|
| check-reminders (1-min job) | 1,440/day | **deleted** | -1,440/day |
| check-reminders (15-min job) | 0/day | 96/day | replacement |
| check-reminders (daily 8am) | 1/day | 1/day | unchanged |
| send-scheduled-reports (hourly) | 24/day | 24/day | unchanged |
| All others | 3/day | 3/day | unchanged |
| **Total** | **1,468/day** | **124/day** | **~91% reduction** |

### What Does NOT Change

- Users still receive email reminders for VAT, PAYE, PIT, CIT deadlines
- Custom reminders still fire — just within a 15-minute window instead of 5 minutes
- The daily 8am check remains in place as the primary reminder sweep
- No database schema changes
- No UI or page changes
- No authentication or subscription logic touched
- `send-scheduled-reports`, trial reminders, and winback emails are all already on sensible daily/hourly schedules — no changes needed

### Files to Modify

| File | Change |
|---|---|
| `supabase/functions/check-reminders/index.ts` | Widen custom reminder window from 5 min to 20 min |
| Database (SQL via insert tool) | Drop 1-min cron, add 15-min cron |
