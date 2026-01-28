
# Complete Safe Storage Migration - Final 2 Files

## Status

The Safe Storage Migration plan is **95% complete**. Two files still use raw `localStorage` calls (though they are protected by try-catch blocks). For 100% code consistency and compliance with CODE_STANDARDS.md, these should be migrated to use `safeLocalStorage`.

---

## Files to Migrate

### 1. src/hooks/useRealtimeNotifications.ts (2 occurrences)

| Line | Current Code | Replacement |
|------|-------------|-------------|
| 32 | `localStorage.getItem('notification-sound-enabled')` | `safeLocalStorage.getItem('notification-sound-enabled')` |
| 41 | `localStorage.getItem('notification-browser-enabled')` | `safeLocalStorage.getItem('notification-browser-enabled')` |

**Changes:**
- Add import: `import { safeLocalStorage } from "@/lib/safeStorage";`
- Replace localStorage calls with safeLocalStorage
- Remove try-catch wrappers (now handled by safeLocalStorage)

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
const getSoundEnabled = useCallback(() => {
  const saved = safeLocalStorage.getItem('notification-sound-enabled');
  return saved !== null ? saved === 'true' : true;
}, []);
```

---

### 2. src/lib/notifications.ts (12 occurrences)

| Line | Current Code | Description |
|------|-------------|-------------|
| 38 | `localStorage.getItem('notification-sound-enabled')` | Sound preference check |
| 78 | `localStorage.getItem('notification-browser-enabled')` | Browser notification check |
| 190 | `localStorage.getItem('app-notifications')` | Get notifications (fallback) |
| 193 | `localStorage.setItem('app-notifications', ...)` | Save notification (fallback) |
| 218 | `localStorage.getItem('app-notifications')` | Get notifications (fallback) |
| 260 | `localStorage.getItem('app-notifications')` | Mark as read (fallback) |
| 264 | `localStorage.setItem('app-notifications', ...)` | Save after mark read |
| 295 | `localStorage.getItem('app-notifications')` | Mark all read (fallback) |
| 297 | `localStorage.setItem('app-notifications', ...)` | Save after mark all |
| 328 | `localStorage.getItem('app-notifications')` | Delete notification (fallback) |
| 330 | `localStorage.setItem('app-notifications', ...)` | Save after delete |
| 361 | `localStorage.removeItem('app-notifications')` | Clear all (fallback) |

**Changes:**
- Add import: `import { safeLocalStorage } from "@/lib/safeStorage";`
- Replace all localStorage calls with safeLocalStorage equivalents
- Remove inner try-catch wrappers (now handled by safeLocalStorage)

---

## Summary Table

| File | Raw Calls | Status |
|------|-----------|--------|
| useRealtimeNotifications.ts | 2 | To migrate |
| notifications.ts | 12 | To migrate |
| **Total** | **14** | |

---

## Benefits

1. **100% Code Consistency**: All storage access uses the same pattern
2. **Cleaner Code**: Remove redundant try-catch blocks in notification utilities
3. **DRY Principle**: Error handling is centralized in the wrapper
4. **Documentation Compliance**: Full alignment with CODE_STANDARDS.md

---

## Documentation Update

Update `docs/CHANGELOG.md` to document the final safe storage migration completion.

---

## Technical Note

These files currently have try-catch protection, so there's no functional bug. However, migrating them ensures:
- Uniform codebase patterns
- Easier future auditing
- Single point of control for storage error handling
