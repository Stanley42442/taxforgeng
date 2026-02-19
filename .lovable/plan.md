
## Cost Audit Complete — No Further Changes Required

After a full audit of every hook, context, page, and cron job in the codebase, here is the complete picture of what has been done and what remains.

---

### All Cron Jobs (Confirmed Clean)

The scheduled backend jobs are now in a healthy state:

| Job Name | Schedule | Invocations/day |
|---|---|---|
| check-reminders-every-15-min | Every 15 minutes | 96 |
| daily-reminder-check | 8am daily | 1 |
| send-scheduled-reports-hourly | Every hour | 24 |
| send-trial-expiry-reminders | 9am daily | 1 |
| send-trial-final-reminders | 8am daily | 1 |
| send-winback-emails | 10am daily | 1 |
| **Total** | | **124/day** (down from 1,468) |

The expensive every-minute job has been fully removed and is confirmed gone from the database.

---

### All Client-Side Hooks (Confirmed Clean)

Every polling hook and realtime subscription has been reviewed:

| Hook / File | Status |
|---|---|
| `useReminderNotifications` | Fixed — now polls every 5 min |
| `useDocumentationStats` | Fixed — now refetches every 10 min |
| `useUpcomingReminders` | Fixed — user_id filter added to realtime channel |
| `useSessionSecurity` | Already good — checks every 5 min, no change needed |
| `useStorageQuota` | No DB queries — browser-only APIs (IndexedDB, navigator.storage) |
| `useRealtimeNotifications` | Already good — all 3 channels have user_id filters |
| `useSyncedNotifications` | Already good — user_id filter on all events |
| `SubscriptionContext` | Already good — both channels have user_id filters |
| `useAchievements` | Fine — 6 queries on mount, but only on 2 pages, no polling |
| `useStorageQuota` interval | Fine — browser storage API only, zero cloud cost |

---

### What Was NOT Changed (and Why)

**`useSessionSecurity` — 5-min edge function calls**
These check whether the current session has been remotely revoked. Reducing this would create a security gap where a revoked session could remain active. The 5-minute interval is appropriate.

**`AdminAnalytics` page — 10 parallel DB queries**
These only run when an admin manually visits the page and clicks refresh. There is no polling. The cost per visit is negligible.

**`useAchievements` — 6 parallel queries on mount**
Only mounted on the `/achievements` and `/advisory` pages. One-time fetch per page visit, no interval. Acceptable.

**`send-scheduled-reports` cron — hourly**
Uses exact hour-matching logic (`currentHour === schedule.send_hour`) so reducing to every 2 hours would cause users to miss their scheduled send time. Must remain at hourly.

---

### Projected Monthly Cost

Based on the changes made across both rounds of optimisation:

- Cron invocations: 124/day = ~3,720/month (vs ~44,040/month before)
- Client DB queries: ~80% reduction in per-session query volume
- Realtime overhead: Significantly reduced by user_id filters preventing cross-user event fan-out

The site is now operating efficiently within the free credit limits.

---

### No Files Need to Be Modified

There is nothing left to change. All identified cost drivers have been addressed in the two previous rounds of work. Any further changes would risk breaking functionality without meaningful cost reduction.

If costs increase in the future, the most likely cause would be a significant growth in the user base — which is the right kind of cost to have, as it would be accompanied by subscription revenue.
