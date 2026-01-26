
# Comprehensive Review: Soft Delete Implementation + Login/Logout Performance Issues

## Issues Found

### Part A: Soft Delete Implementation Issues

#### Issue 1: Duplicate RLS SELECT Policies (Critical - Causes Unexpected Behavior)
**Problem:** Multiple tables have BOTH old policies (without `deleted_at IS NULL` filter) AND new policies with the filter. This means users can still see soft-deleted records through the old policy.

| Table | Conflicting Policies |
|-------|---------------------|
| `businesses` | "Users can view their own businesses" (no filter) + "Users can view own businesses" (with filter) |
| `expenses` | "Users can view their own expenses" (no filter) + "Users can view own expenses" (with filter) |
| `employees` | "Users manage own employees" (ALL, no filter) + "Users can view own employees" (SELECT with filter) |
| `invoices` | "Users can view their own invoices" (no filter) + "Users can view own invoices" (with filter) |
| `clients` | "Users can view their own clients" (no filter) + "Users can view own clients" (with filter) |
| `compliance_items` | Same pattern |
| `reminders` | Same pattern |
| `tax_calculations` | Same pattern |
| `audit_logs` | Same pattern |

**Fix:** Drop ALL old policies before creating new ones to avoid conflicts.

---

#### Issue 2: `getDeletedBusinesses` Creates Infinite Loop Risk
**File:** `src/pages/SavedBusinesses.tsx` (lines 86-92)

```typescript
useEffect(() => {
  const fetchDeleted = async () => {
    const deleted = await getDeletedBusinesses();
    setDeletedBusinesses(deleted);
  };
  fetchDeleted();
}, [getDeletedBusinesses, savedBusinesses]); // <-- savedBusinesses as dependency
```

**Problem:** The dependency array includes `savedBusinesses`, which changes after every restore/delete operation. This causes `getDeletedBusinesses()` to be called repeatedly.

**Fix:** Remove `savedBusinesses` from the dependency array OR use a separate trigger:
```typescript
useEffect(() => {
  const fetchDeleted = async () => {
    const deleted = await getDeletedBusinesses();
    setDeletedBusinesses(deleted);
  };
  fetchDeleted();
}, [getDeletedBusinesses]); // Remove savedBusinesses
```

---

#### Issue 3: `getDeletedBusinesses` is NOT Memoized
**File:** `src/contexts/SubscriptionContext.tsx` (line 402)

```typescript
const getDeletedBusinesses = async (): Promise<SavedBusiness[]> => {
  // ...
};
```

**Problem:** This function is defined inside the component and recreated on every render. Since it's used as a dependency in `useEffect`, it will cause unnecessary re-fetches.

**Fix:** Wrap with `useCallback`:
```typescript
const getDeletedBusinesses = useCallback(async (): Promise<SavedBusiness[]> => {
  if (!user) return [];
  // ... rest of function
}, [user]);
```

---

#### Issue 4: Missing Refresh After Restore in `handleRestore`
**File:** `src/pages/SavedBusinesses.tsx` (lines 107-118)

**Problem:** After restoring a business, the `deletedBusinesses` state is NOT updated locally. The user has to close/open the collapsible to see the change.

**Fix:** Refresh the deleted businesses list after restore:
```typescript
const handleRestore = async (business: SavedBusiness) => {
  setRestoringId(business.id);
  try {
    await restoreBusiness(business.id);
    // Refresh deleted businesses list
    const updated = await getDeletedBusinesses();
    setDeletedBusinesses(updated);
    toast.success(`"${business.name}" and all related data restored`);
  } catch (error) {
    console.error('Error restoring business:', error);
    toast.error('Failed to restore business');
  } finally {
    setRestoringId(null);
  }
};
```

---

#### Issue 5: `useDeleteWithUndo` Calls `onDelete` After Timeout but `onRestore` is Called from Undo Button
**File:** `src/hooks/useDeleteWithUndo.ts` (lines 97-102)

**Problem:** The business is ALREADY soft-deleted when `confirmDelete` is called (immediately), but the undo button calls `onRestore` which restores it. Then after the timeout, `onDelete` is called AGAIN (which would fail since business is already deleted).

```typescript
// Current flow:
// 1. confirmDelete() → immediately calls removeBusiness (soft delete)
// 2. If undo clicked → calls restoreBusiness
// 3. After timeout → calls onDelete AGAIN (fails because already deleted)
```

Wait, looking more carefully at the code:

Actually the issue is the opposite - `onDelete` is called AFTER the timeout:
```typescript
timeoutRef.current = setTimeout(async () => {
  await onDelete(item);  // Called after timeout
  setPendingItem(null);
}, undoDuration);
```

But in SavedBusinesses.tsx:
```typescript
const deleteWithUndo = useDeleteWithUndo<SavedBusiness>({
  onDelete: async (business) => {
    await removeBusiness(business.id);  // This is the actual delete
  },
```

**This is a BUG:** The business is NOT deleted until after the undo timeout expires. But the UI immediately removes it from the list because `confirmDelete` sets `pendingItem` which the UI might filter out.

Actually wait - looking at the UI code in SavedBusinesses.tsx, there's no filtering by `pendingItem`. The business is removed from `savedBusinesses` state INSIDE `removeBusiness()` immediately:

```typescript
const removeBusiness = async (id: string) => {
  // ...
  setState(prev => ({
    ...prev,
    savedBusinesses: prev.savedBusinesses.filter(b => b.id !== id),
    // ...
  }));
};
```

**Real Bug:** `removeBusiness()` is called immediately in `onDelete`, but `onDelete` is NOT called until after the timeout. So the business remains visible until the toast disappears. This is actually CORRECT behavior for undo.

The issue is that `onRestore` is called from the undo button, but by then `onDelete` hasn't been called yet (it's scheduled for later). So `onRestore` tries to restore something that hasn't been deleted yet.

**Wait, let me re-read the code flow:**

1. User clicks delete → `requestDelete(business)` → shows dialog
2. User confirms → `confirmDelete()`:
   - Shows toast with Undo button
   - Schedules `onDelete` call after 5 seconds
3. If user clicks Undo within 5 seconds:
   - Clears the timeout (so `onDelete` never runs)
   - Calls `onRestore(item)`
4. If user doesn't click Undo:
   - After 5 seconds, `onDelete` runs → calls `removeBusiness`

**Problem:** If user clicks Undo, `onRestore(restoreBusiness)` is called BUT the business was never deleted! `removeBusiness` only runs after the timeout.

In SavedBusinesses.tsx:
```typescript
onDelete: async (business) => {
  await removeBusiness(business.id);  // This calls soft_delete_business RPC
},
onRestore: async (business) => {
  await restoreBusiness(business.id);  // This calls restore_business RPC
},
```

If user clicks Undo before timeout, `restoreBusiness` is called on a business that was never soft-deleted. This will throw an error: "Business not found, not deleted, or not owned by user"

**Fix:** Don't call `onRestore` if the item was never actually deleted. Or call `onDelete` immediately and use `onRestore` for actual undo:

Option A: Delete immediately, then undo restores
```typescript
const confirmDelete = useCallback(() => {
  if (!itemToDelete) return;
  const item = itemToDelete;
  setShowDialog(false);
  setItemToDelete(null);

  // Delete immediately
  onDelete(item).then(() => {
    // Show toast with undo
    toast(getSuccessMessage(item), {
      action: {
        label: "Undo",
        onClick: async () => {
          if (onRestore) {
            await onRestore(item);
            toast.success(`${getItemName?.(item) || "Item"} restored`);
          }
        },
      },
      duration: undoDuration,
    });
  });
}, [...]);
```

---

### Part B: Login/Logout Performance Issues

#### Issue 6: Slow Logout - `await logAuthEvent` Before `signOut`
**File:** `src/hooks/useAuth.tsx` (lines 515-521)

```typescript
const signOut = async () => {
  if (user) {
    await logAuthEvent(user.id, 'logout');  // <-- Blocks until complete
  }
  await supabase.auth.signOut();
};
```

**Problem:** The logout waits for `logAuthEvent` to complete before actually signing out. If the network is slow, this delays the logout.

**Fix:** Fire-and-forget for non-critical logging:
```typescript
const signOut = async () => {
  if (user) {
    // Fire-and-forget - don't await
    logAuthEvent(user.id, 'logout').catch(console.error);
  }
  await supabase.auth.signOut();
};
```

---

#### Issue 7: Slow Login - `trackDevice` Runs Many Sequential Network Calls
**File:** `src/hooks/useAuth.tsx` (trackDevice function, lines 125-369)

The `trackDevice` function makes MANY sequential network calls:
1. `getDeviceInfo()` - sync, ok
2. `getClientIP()` - external API call to ipify.org
3. `getLocationFromIP()` - edge function call
4. `supabase.from('profiles').select(...)` - DB query
5. `isDeviceBlocked()` - DB query
6. `checkIPWhitelist()` - RPC call
7. `supabase.rpc('check_time_restrictions')` - RPC call
8. `supabase.from('known_devices').select(...)` - DB query
9. `supabase.from('known_devices').update/insert(...)` - DB mutation
10. Multiple `supabase.functions.invoke('send-security-alert')` calls

**All of these run SEQUENTIALLY**, blocking the login flow.

**Fix:** Parallelize independent calls and fire-and-forget non-critical ones:
```typescript
// Run independent checks in parallel
const [clientIP, deviceInfo] = await Promise.all([
  getClientIP(),
  getDeviceInfo()
]);

const [location, profile, blocked] = await Promise.all([
  clientIP ? getLocationFromIP(clientIP) : Promise.resolve(null),
  supabase.from('profiles').select('whatsapp_number').eq('id', userId).single(),
  isDeviceBlocked(userId, deviceInfo.fingerprint)
]);

// Fire-and-forget security alerts
supabase.functions.invoke('send-security-alert', {...}).catch(console.error);
```

---

#### Issue 8: Slow Initial Load - Multiple Parallel Subscriptions
**Problem:** When the app loads with a logged-in user, these all fire simultaneously:
- `SubscriptionContext.fetchUserData()` - fetches profile + businesses
- `useSyncedNotifications` - fetches notifications + sets up realtime
- `useNotificationCount` - fetches notification count
- `useReminderNotifications` - queries reminders
- `useUpcomingReminders` - queries reminders again
- Profile realtime channel setup

**Fix:** Consider consolidating notification hooks and caching:
- Merge `useNotificationCount` logic into `useSyncedNotifications` (already calculates unreadCount)
- Add debouncing/caching for repeat queries

---

#### Issue 9: `useSyncedNotifications.loadNotifications` Called Multiple Times
**File:** `src/hooks/useSyncedNotifications.ts` (lines 133-153)

```typescript
useEffect(() => {
  const handleNotificationAdded = () => {
    loadNotifications();  // Full refetch on every notification-added event
  };
  window.addEventListener('notification-added', handleNotificationAdded);
  // ...
}, [loadNotifications]);
```

**Problem:** Every time a notification is added (even from the same tab), `loadNotifications()` does a full database query. Combined with realtime updates, this causes duplicate fetches.

**Fix:** Since realtime already handles updates, the local event listener should only handle localStorage fallback cases.

---

### Part C: Missing RLS Policies for UPDATE on Soft Delete

#### Issue 10: Soft Delete Functions Use UPDATE but Missing Update on `deleted_at`
The `soft_delete_business` and `restore_business` functions use `SECURITY DEFINER` so they bypass RLS. This is correct.

However, if any frontend code tried to directly UPDATE the `deleted_at` column, the existing UPDATE policies allow it since they don't check `deleted_at`.

**Status:** Not a bug currently, but could be a security consideration.

---

## Summary of Fixes Required

| Priority | Issue | File(s) | Fix |
|----------|-------|---------|-----|
| Critical | Duplicate RLS policies allowing deleted records to show | Database | Drop old policies before creating new ones |
| High | `useDeleteWithUndo` calls `onRestore` before `onDelete` | `useDeleteWithUndo.ts` | Restructure to delete immediately |
| High | Slow logout due to `await logAuthEvent` | `useAuth.tsx` | Fire-and-forget the log |
| High | Sequential network calls in `trackDevice` | `useAuth.tsx` | Parallelize with `Promise.all` |
| Medium | `getDeletedBusinesses` not memoized | `SubscriptionContext.tsx` | Wrap with `useCallback` |
| Medium | Infinite loop risk in `useEffect` | `SavedBusinesses.tsx` | Remove `savedBusinesses` dependency |
| Medium | Missing refresh after restore | `SavedBusinesses.tsx` | Call `getDeletedBusinesses()` after restore |
| Low | Duplicate notification fetches | Multiple hooks | Consolidate notification hooks |

---

## Database Migration Required

To fix the duplicate RLS policies, a new migration should:
1. Drop ALL old SELECT policies (the ones without `deleted_at` filter)
2. Ensure only the new policies with `deleted_at IS NULL` remain

```sql
-- Drop duplicate/conflicting policies
DROP POLICY IF EXISTS "Users can view their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view their own employees" ON employees;
DROP POLICY IF EXISTS "Users manage own employees" ON employees;
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can view their own compliance items" ON compliance_items;
DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can view their own calculations" ON tax_calculations;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;

-- Re-add ALL policy for employees that respects deleted_at
DROP POLICY IF EXISTS "Users manage own employees" ON employees;
CREATE POLICY "Users manage own employees"
ON employees FOR ALL
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);
```

---

## Testing Checklist

1. After fixing duplicate policies, verify soft-deleted records don't appear in normal queries
2. Test delete → undo flow works correctly
3. Test delete → wait for timeout → verify record is in "Recently Deleted"
4. Measure logout time before/after fix
5. Measure login time before/after parallelization
6. Verify notifications load correctly on login
