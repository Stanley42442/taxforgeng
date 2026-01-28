

# Final Safe Storage Migration Plan

## Overview

This is the final migration to achieve **100% safe storage consistency** across the entire codebase. Two files still contain raw `localStorage` calls that need to be migrated to the `safeLocalStorage` wrapper.

---

## Files to Modify

### 1. src/hooks/useRealtimeNotifications.ts

**Current State**: 2 raw `localStorage` calls with manual try-catch blocks

| Line | Current Code | Action |
|------|-------------|--------|
| 32 | `localStorage.getItem('notification-sound-enabled')` | Replace with `safeLocalStorage.getItem()` |
| 41 | `localStorage.getItem('notification-browser-enabled')` | Replace with `safeLocalStorage.getItem()` |

**Changes:**
1. Add import: `import { safeLocalStorage } from "@/lib/safeStorage";`
2. Simplify both `getSoundEnabled` and `getBrowserEnabled` callbacks by removing try-catch wrappers

---

### 2. src/lib/notifications.ts

**Current State**: 12 raw `localStorage` calls with manual try-catch blocks

| Line | Function | Current Code |
|------|----------|-------------|
| 38 | `playNotificationSound` | `localStorage.getItem('notification-sound-enabled')` |
| 78 | `showBrowserNotification` | `localStorage.getItem('notification-browser-enabled')` |
| 190 | `addNotificationToLocalStorage` | `localStorage.getItem('app-notifications')` |
| 193 | `addNotificationToLocalStorage` | `localStorage.setItem('app-notifications', ...)` |
| 218 | `getNotifications` | `localStorage.getItem('app-notifications')` |
| 260 | `markNotificationRead` | `localStorage.getItem('app-notifications')` |
| 264 | `markNotificationRead` | `localStorage.setItem('app-notifications', ...)` |
| 295 | `markAllNotificationsRead` | `localStorage.getItem('app-notifications')` |
| 297 | `markAllNotificationsRead` | `localStorage.setItem('app-notifications', ...)` |
| 328 | `deleteNotification` | `localStorage.getItem('app-notifications')` |
| 330 | `deleteNotification` | `localStorage.setItem('app-notifications', ...)` |
| 361 | `clearAllNotifications` | `localStorage.removeItem('app-notifications')` |

**Changes:**
1. Add import: `import { safeLocalStorage } from "@/lib/safeStorage";`
2. Replace all 12 localStorage calls with safeLocalStorage equivalents
3. Remove redundant inner try-catch wrappers

---

### 3. docs/CHANGELOG.md

Update to document the completion of the safe storage migration.

---

## Technical Implementation Details

### useRealtimeNotifications.ts - Before & After

**Before:**
```typescript
const getSoundEnabled = useCallback(() => {
  try {
    const saved = localStorage.getItem('notification-sound-enabled');
    return saved !== null ? saved === 'true' : true;
  } catch {
    return true;
  }
}, []);
```

**After:**
```typescript
import { safeLocalStorage } from "@/lib/safeStorage";

const getSoundEnabled = useCallback(() => {
  const saved = safeLocalStorage.getItem('notification-sound-enabled');
  return saved !== null ? saved === 'true' : true;
}, []);
```

### notifications.ts - Example Transformation

**Before:**
```typescript
try {
  const notifications = JSON.parse(localStorage.getItem('app-notifications') || '[]');
  const updated = notifications.filter((n: AppNotification) => n.id !== id);
  localStorage.setItem('app-notifications', JSON.stringify(updated));
} catch {
  // Silent fail
}
```

**After:**
```typescript
const notifications = safeLocalStorage.getJSON<AppNotification[]>('app-notifications', []);
const updated = notifications.filter((n: AppNotification) => n.id !== id);
safeLocalStorage.setJSON('app-notifications', updated);
```

---

## Summary

| File | Raw Calls to Migrate |
|------|---------------------|
| useRealtimeNotifications.ts | 2 |
| notifications.ts | 12 |
| **Total** | **14** |

---

## Benefits

1. **100% Code Consistency** - All storage access uses the unified safe wrapper
2. **Cleaner Code** - Removes 14 redundant try-catch blocks
3. **DRY Principle** - Error handling centralized in the safeLocalStorage wrapper
4. **Maintainability** - Single pattern for all storage operations
5. **Documentation Compliance** - Full alignment with CODE_STANDARDS.md

---

## Expected Outcome

After this migration:
- Zero raw `localStorage` or `sessionStorage` calls in the codebase
- Complete private browsing mode reliability
- Unified error handling for all storage operations

