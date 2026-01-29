
# Fix: Business Deletion & Page Loading Issues

## Problems Identified

### Issue 1: Slow Page Loading
The recent Service Worker configuration change to `NetworkFirst` for JS/CSS files means:
- Every page load now attempts a network request first
- If network is slow, there's a 5-second timeout before falling back to cache
- This is causing perceived slowness, especially on mobile networks

### Issue 2: Business Deletion Not Working Properly
**Root Cause Found:** The `fetchUserData` function in `SubscriptionContext.tsx` does NOT filter out soft-deleted businesses.

Current query (line 201-205):
```typescript
const { data: businesses } = await supabase
  .from('businesses')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
// ❌ Missing: .is('deleted_at', null)
```

**Symptoms this causes:**
1. After deleting a business, UI shows it's deleted (local state update)
2. Refreshing the page re-fetches ALL businesses including soft-deleted ones
3. Business reappears because the query doesn't filter by `deleted_at`
4. Recently Deleted section doesn't show immediately because `getDeletedBusinesses` is only called once on mount

---

## Solution

### Fix 1: Filter Soft-Deleted Businesses
Add `.is('deleted_at', null)` to the businesses query in `fetchUserData`.

| File | Change |
|------|--------|
| `src/contexts/SubscriptionContext.tsx` | Add filter to exclude soft-deleted businesses |

### Fix 2: Refresh Deleted List After Delete
Update the `removeBusiness` function to refresh the deleted businesses list after a successful soft delete.

| File | Change |
|------|--------|
| `src/pages/SavedBusinesses.tsx` | Add callback to refresh deleted list after delete |

### Fix 3: Optimize Service Worker Timeout
Reduce the network timeout for JS/CSS from 5s to 2s so fallback happens faster on slow networks.

| File | Change |
|------|--------|
| `vite.config.ts` | Reduce `networkTimeoutSeconds` from 5 to 2 |

---

## Technical Implementation

### Change 1: SubscriptionContext.tsx (Line ~201-205)

```typescript
// BEFORE
const { data: businesses } = await supabase
  .from('businesses')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

// AFTER
const { data: businesses } = await supabase
  .from('businesses')
  .select('*')
  .eq('user_id', user.id)
  .is('deleted_at', null)  // ← CRITICAL: Exclude soft-deleted
  .order('created_at', { ascending: false });
```

### Change 2: SavedBusinesses.tsx (Line ~97-110)

```typescript
// BEFORE
const deleteWithUndo = useDeleteWithUndo<SavedBusiness>({
  onDelete: async (business) => {
    await removeBusiness(business.id);
  },
  // ...
});

// AFTER
const deleteWithUndo = useDeleteWithUndo<SavedBusiness>({
  onDelete: async (business) => {
    await removeBusiness(business.id);
    // Immediately refresh deleted list so it shows in Recently Deleted
    const updated = await getDeletedBusinesses();
    setDeletedBusinesses(updated);
  },
  // ...
});
```

### Change 3: vite.config.ts (Line ~44)

```typescript
// BEFORE
networkTimeoutSeconds: 5,

// AFTER
networkTimeoutSeconds: 2,  // Faster fallback on slow networks
```

---

## Expected Results

After these changes:
1. **Deleted businesses stay deleted** - They won't reappear after page refresh
2. **Recently Deleted section updates immediately** - No refresh needed to see it
3. **Faster page loads** - Cache fallback happens in 2s instead of 5s on slow networks

## Files to Modify

| File | Purpose |
|------|---------|
| `src/contexts/SubscriptionContext.tsx` | Filter out soft-deleted businesses |
| `src/pages/SavedBusinesses.tsx` | Refresh deleted list after deletion |
| `vite.config.ts` | Reduce network timeout for faster loading |
