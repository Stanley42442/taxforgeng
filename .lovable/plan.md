
## Additional Cost Reductions — Keeping Cloud Balance Under $25/month

This plan addresses every remaining cost driver found in the codebase, ranked from highest to lowest impact. No user-facing functionality changes at all.

---

### What Was Already Fixed
The 1-minute cron job has been dropped and replaced with a 15-minute job. That alone cut ~1,344 daily invocations. The remaining issues below are the next biggest sources of waste.

---

### Issue 1 — Client-Side Reminder Polling (HIGH IMPACT)

**File:** `src/hooks/useReminderNotifications.ts`

This hook runs a `setInterval` that fires **every 60 seconds** for every logged-in user tab. Each tick makes **2 separate database queries** (upcoming reminders + overdue reminders). With even a modest number of active users, this is the biggest remaining cost driver after the cron job.

The fix: increase the polling interval from **1 minute to 5 minutes**. The 5-minute window check in the query logic is also widened to match. Users will still get in-browser toast and sound notifications — just with a maximum 5-minute delay, which is imperceptible for tax deadline reminders.

```typescript
// BEFORE
const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
// ...
.lt("due_date", now.toISOString())
.gte("due_date", new Date(now.getTime() - 5 * 60 * 1000).toISOString());
// ...
setInterval(checkDueReminders, 60 * 1000);

// AFTER
const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);
// ...
.lt("due_date", now.toISOString())
.gte("due_date", new Date(now.getTime() - 20 * 60 * 1000).toISOString());
// ...
setInterval(checkDueReminders, 5 * 60 * 1000);
```

**Estimated saving:** ~80% reduction in reminder-related DB queries per active session.

---

### Issue 2 — Documentation Stats Polling Every 30 Seconds (MEDIUM IMPACT)

**File:** `src/hooks/useDocumentationStats.ts`

The Documentation page polls 8 different database tables every **30 seconds** (`refetchInterval: 30000`). These are aggregate counts (total users, businesses, calculations, etc.) that change slowly. Polling this frequently is pure waste — the numbers shown are for informational purposes only.

The fix: increase `refetchInterval` to **10 minutes** (`600000ms`) and `staleTime` to **5 minutes**. The stats still refresh automatically when the page is opened.

```typescript
// BEFORE
refetchInterval: 30000,
staleTime: 10000,

// AFTER
refetchInterval: 10 * 60 * 1000,  // 10 minutes
staleTime: 5 * 60 * 1000,         // 5 minutes
```

**Estimated saving:** ~95% reduction in documentation stats queries (from 120/hour to 6/hour).

---

### Issue 3 — `send-scheduled-reports` Runs Every Hour Even When Nothing to Send (MEDIUM IMPACT)

**File:** Cron schedule (database only, no code change)

The hourly `send-scheduled-reports` cron invokes the edge function 24 times a day. Looking at the function code, it checks report schedules internally — running hourly is necessary for daily/weekly/monthly reports. However, it can be reduced to **every 2 hours** without any impact, since the function already filters by `currentHour` and `currentDayOfWeek`. A schedule that runs at `:00` and `:30` of each 2-hour block would still catch every report window.

Actually, on review the function uses exact hour matching (`currentHour === schedule.send_hour`). Changing to every 2 hours would cause users to miss their exact scheduled hour. This one should **remain at hourly** — it is already correctly scoped.

---

### Issue 4 — Realtime Channels Open for Tables That Change Rarely (LOW IMPACT)

**File:** `src/contexts/SubscriptionContext.tsx`

The `SubscriptionContext` opens **2 realtime channels per logged-in user**:
- `profile-changes-{userId}` — listens for profile updates (subscription tier changes)
- `business-changes-{userId}` — listens for any business INSERT/UPDATE/DELETE

The business changes channel calls `refreshBusinesses()` on every change, which re-fetches the entire business list. This is fine for correctness but the realtime connection itself adds to the compute bill. These channels are justified since tier changes must propagate in real time. No change recommended here — the benefit outweighs the cost.

---

### Issue 5 — `useUpcomingReminders` Realtime Channel Has No User Filter (LOW IMPACT)

**File:** `src/hooks/useUpcomingReminders.ts`

The realtime subscription listens to `reminders` changes with **no row-level filter**:
```typescript
// CURRENT — listens to ALL reminder changes for all users
event: '*',
schema: 'public',
table: 'reminders',
```

This means Postgres sends the change event to every connected client whenever any user updates a reminder. The fix is to add a user filter so only that user's own changes trigger a re-fetch:
```typescript
filter: `user_id=eq.${user.id}`
```

**Estimated saving:** Reduces unnecessary client-side re-fetches for high-traffic scenarios.

---

### Summary of All Changes

| File | Change | Impact |
|---|---|---|
| `src/hooks/useReminderNotifications.ts` | Poll every 5 min instead of 1 min; widen query window to 20 min | HIGH |
| `src/hooks/useDocumentationStats.ts` | Refetch every 10 min instead of 30 sec | MEDIUM |
| `src/hooks/useUpcomingReminders.ts` | Add `user_id` filter to realtime subscription | LOW |

### What Does NOT Change

- Users still get in-browser toast notifications for due reminders (just up to 5 min later, same as the server-side check)
- Documentation stats page still refreshes automatically (every 10 min instead of 30 sec)
- All realtime channels remain open — no subscriptions removed
- No cron schedules modified (the 15-min job already handles server-side reminders)
- No authentication, payment, or subscription logic touched
- No database schema changes required
- No new files created

### Files to Modify

| File | Change |
|---|---|
| `src/hooks/useReminderNotifications.ts` | Increase polling from 1 min to 5 min; widen query time window |
| `src/hooks/useDocumentationStats.ts` | Increase refetch from 30 sec to 10 min |
| `src/hooks/useUpcomingReminders.ts` | Add `user_id` filter to realtime channel |
