
# Plan: Notification Hook Consolidation + Login Performance Optimization

## Overview
This plan implements three optimizations: (1) adding debouncing to `useNotificationCount`, (2) consolidating overlapping notification hooks to reduce redundant WebSocket connections and database queries, and (3) further parallelizing the `trackDevice` function for faster login.

---

## Current State Analysis

### Notification Hooks Overlap
Currently there are **three** notification-related hooks that create **duplicate realtime subscriptions**:

| Hook | Realtime Channels | Purpose |
|------|-------------------|---------|
| `useNotificationCount` | `notification-count-sync` (user_notifications) | Badge count only |
| `useSyncedNotifications` | `user-notifications-sync` (user_notifications) | Full notification list + count |
| `useRealtimeNotifications` | `user-notification-deliveries`, `user-reminders-realtime`, `user-auth-events-realtime` | Security alerts, reminders, auth events |

**Problem:** `useNotificationCount` and `useSyncedNotifications` BOTH subscribe to the same `user_notifications` table, creating 2 redundant WebSocket channels.

### Login Performance
The `trackDevice` function has two remaining sequential queries (lines 216-228):
```typescript
const { data: existingDevice } = await supabase.from('known_devices')...; // Sequential
const { data: previousDevices } = await supabase.from('known_devices')...; // Sequential
```

These can be parallelized since they don't depend on each other.

---

## Solution

### Part 1: Add Debouncing to `useNotificationCount`

Add the same debouncing pattern that exists in `useSyncedNotifications` to prevent rapid API calls:

```typescript
// In useNotificationCount.ts
useEffect(() => {
  let debounceTimer: NodeJS.Timeout | null = null;
  
  const debouncedLoad = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadCount();
    }, 300);
  };

  const handleNotificationAdded = () => {
    debouncedLoad();
  };

  window.addEventListener('notification-added', handleNotificationAdded);
  
  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    window.removeEventListener('notification-added', handleNotificationAdded);
  };
}, [loadCount]);
```

---

### Part 2: Consolidate Notification Hooks

#### Strategy: Deprecate `useNotificationCount` in favor of `useSyncedNotifications`

Since `useSyncedNotifications` already:
- Fetches all notifications
- Calculates `unreadCount` (line 168: `const unreadCount = notifications.filter(n => !n.read).length;`)
- Has proper realtime subscription
- Has debouncing

**The `useNotificationCount` hook is redundant.**

#### Changes Required:

**File: `src/components/NavMenu.tsx`**
Replace:
```typescript
import { useNotificationCount } from "@/hooks/useNotificationCount";
// ...
const { unreadCount: notificationCount } = useNotificationCount();
```

With:
```typescript
import { useSyncedNotifications } from "@/hooks/useSyncedNotifications";
// ...
const { unreadCount: notificationCount } = useSyncedNotifications();
```

**File: `src/hooks/useNotificationCount.ts`**
- Keep the file but export a thin wrapper that uses `useSyncedNotifications` internally (for backward compatibility)
- OR deprecate entirely and update all imports

**Recommended Approach:** Replace entirely since there's only 1 usage in `NavMenu.tsx`.

---

### Part 3: Optimize Login Parallelization in `trackDevice`

Parallelize the `existingDevice` and `previousDevices` queries:

**Before (lines 216-228):**
```typescript
const { data: existingDevice } = await supabase
  .from('known_devices')
  .select('id, is_trusted, last_country')
  .eq('user_id', userId)
  .eq('device_fingerprint', deviceInfo.fingerprint)
  .single();

const { data: previousDevices } = await supabase
  .from('known_devices')
  .select('last_country')
  .eq('user_id', userId)
  .not('last_country', 'is', null);
```

**After:**
```typescript
const [existingDeviceResult, previousDevicesResult] = await Promise.all([
  supabase
    .from('known_devices')
    .select('id, is_trusted, last_country')
    .eq('user_id', userId)
    .eq('device_fingerprint', deviceInfo.fingerprint)
    .single(),
  supabase
    .from('known_devices')
    .select('last_country')
    .eq('user_id', userId)
    .not('last_country', 'is', null)
]);

const existingDevice = existingDeviceResult.data;
const previousDevices = previousDevicesResult.data;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useNotificationCount.ts` | Delete or deprecate (redundant) |
| `src/components/NavMenu.tsx` | Replace `useNotificationCount` with `useSyncedNotifications` |
| `src/hooks/useAuth.tsx` | Parallelize `existingDevice` + `previousDevices` queries |

---

## Benefits

| Optimization | Impact |
|--------------|--------|
| Debouncing in `useNotificationCount` | Prevents rapid API calls during notification bursts |
| Consolidate notification hooks | **Reduces WebSocket connections from 2 to 1** for `user_notifications` table |
| Parallelize device queries | **Saves ~100-200ms** on login by running 2 queries simultaneously |

---

## Technical Implementation Details

### Updated NavMenu.tsx Import
```typescript
// Remove this import
import { useNotificationCount } from "@/hooks/useNotificationCount";

// Add this import (if not already present)
import { useSyncedNotifications } from "@/hooks/useSyncedNotifications";

// In the component:
const { unreadCount: notificationCount, isConnected: isNotificationsConnected } = useSyncedNotifications();
```

### Consideration: Performance of Full Notification Fetch vs Count-Only

The old `useNotificationCount` did a lightweight `head: true` count query, while `useSyncedNotifications` fetches full notification objects.

**Mitigation:** This is acceptable because:
1. Notifications are limited to 50 items max (`.slice(0, 50)`)
2. The data is reused in the Notifications page anyway
3. Eliminating duplicate realtime subscriptions has a bigger performance benefit
4. The realtime handler in `useSyncedNotifications` handles INSERT/UPDATE/DELETE efficiently without full refetch

---

## Testing Checklist

1. Verify notification badge count updates correctly in NavMenu
2. Verify notifications page still loads and syncs correctly
3. Measure login time improvement after parallelization
4. Verify no duplicate realtime connections in browser DevTools (Network > WS)
5. Rapidly add notifications and verify debouncing prevents excessive API calls
