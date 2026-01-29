
# Fix: Notification Errors & Navigation Issues

## Problems Identified

### Issue 1: Notification Constructor Error
**Error Message:** `Failed to construct 'Notification': Illegal constructor. Use ServiceWorkerRegistration.showNotification() instead.`

**Root Cause:** On mobile PWAs (installed to home screen), the `new Notification()` constructor is blocked by browsers. Instead, notifications must go through the Service Worker via `ServiceWorkerRegistration.showNotification()`.

**Affected Files:**
| File | Line | Issue |
|------|------|-------|
| `src/lib/notifications.ts` | 75 | Uses `new Notification()` directly |
| `src/lib/pwaNotifications.ts` | 148 | Fallback uses `new Notification()` |
| `src/pages/Expenses.tsx` | 294 | Uses `new Notification()` directly |

### Issue 2: Navigation from Dashboard to Saved Businesses Broken
**Root Cause:** The Dashboard links to `/saved-businesses` but the actual route defined in `App.tsx` is `/businesses`.

**Evidence:**
- App.tsx line 148: `<Route path="/businesses" element={<SavedBusinesses />} />`
- Dashboard.tsx line 580: `<Link to="/saved-businesses">` (WRONG)
- Dashboard.tsx line 609: `<Link to="/saved-businesses">` (WRONG)

---

## Solution

### Fix 1: Create a PWA-Safe Notification Wrapper
Create a utility function that:
1. First attempts to use Service Worker registration to show notifications
2. Falls back to `new Notification()` only if running in a regular browser tab (not PWA)
3. Wraps all notification calls in try-catch to prevent crashes

**Changes to `src/lib/notifications.ts`:**
```typescript
// New PWA-safe notification function
export const showBrowserNotification = async (
  title: string, 
  body: string, 
  redirectUrl?: string
) => {
  const browserEnabled = safeLocalStorage.getItem('notification-browser-enabled') !== 'false';
  if (Notification.permission !== 'granted' || !browserEnabled) return;
  
  try {
    // Prefer Service Worker method (required for PWA)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${Date.now()}`,
        data: { url: redirectUrl }
      });
      return;
    }
  } catch (e) {
    // Service Worker method failed, try fallback
  }
  
  // Fallback for regular browser tabs only
  try {
    const notification = new Notification(title, { body, icon: '/favicon.ico' });
    notification.onclick = () => { /* ... */ };
  } catch {
    // Silently fail - PWA context doesn't support this
  }
};
```

### Fix 2: Update Expenses.tsx to Use Safe Wrapper
Replace direct `new Notification()` call with the shared utility function.

### Fix 3: Fix Dashboard Navigation Links
Change `/saved-businesses` to `/businesses` in Dashboard.tsx.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/notifications.ts` | Make `showBrowserNotification` async and use Service Worker |
| `src/lib/pwaNotifications.ts` | Wrap fallback `new Notification()` in try-catch |
| `src/pages/Expenses.tsx` | Replace inline notification with shared utility |
| `src/pages/Dashboard.tsx` | Change `/saved-businesses` to `/businesses` (2 locations) |

---

## Expected Results

After these changes:
1. **No more notification errors** - Notifications will work properly in PWA mode
2. **Dashboard navigation works** - Clicking "Businesses" card navigates correctly to the saved businesses page
3. **Graceful degradation** - If notifications can't be shown, the app silently continues without crashing
