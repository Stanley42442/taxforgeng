
## Fix: "Cannot read properties of null (reading 'id')" Error

### Root Cause

In `src/hooks/useUpcomingReminders.ts`, the `useEffect` correctly guards the data-fetch with:
```typescript
if (!user) { ... return; }
```

But the realtime channel setup that follows runs **outside** that guard. When `user` is `null` (page load, logged-out visitor, or the brief moment before auth resolves), the code reaches:
```typescript
filter: `user_id=eq.${user.id}`,  // CRASH: user is null
```

This causes the `Cannot read properties of null (reading 'id')` error that breaks the entire page, because `useUpcomingReminders` is called inside `NavMenu`, which renders on every route including the public `/embed-partner` page.

### The Fix

Add a single early-return guard at the top of the `useEffect` — before `fetchReminders()` is called and before the channel is created — so both the fetch and the channel setup are skipped entirely when `user` is `null`.

**Before (broken):**
```typescript
useEffect(() => {
  const fetchReminders = async () => {
    if (!user) {          // ← guard only covers the fetch
      ...return;
    }
    ...fetch data...
  };

  fetchReminders();

  // Channel is always created, even when user is null
  const channel = supabase
    .channel("reminders-changes")
    .on('postgres_changes', {
      filter: `user_id=eq.${user.id}`,  // CRASH when user is null
    }, ...)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [user]);
```

**After (fixed):**
```typescript
useEffect(() => {
  if (!user) {              // ← guard covers EVERYTHING
    setReminders([]);
    setUrgentCount(0);
    setLoading(false);
    return;                 // nothing below runs
  }

  const fetchReminders = async () => {
    ...fetch data...
  };

  fetchReminders();

  const channel = supabase  // only reached when user exists
    .channel("reminders-changes")
    .on('postgres_changes', {
      filter: `user_id=eq.${user.id}`,  // safe: user is guaranteed non-null
    }, ...)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [user]);
```

### File to Modify

| File | Change |
|---|---|
| `src/hooks/useUpcomingReminders.ts` | Move the `if (!user)` guard to the very top of the `useEffect`, before the channel is created |

### No Other Files Need Changing

The crash originates solely in this one hook. The `NavMenu` uses `useUpcomingReminders`, which is why every page crashes — fixing the hook fixes the whole site.
