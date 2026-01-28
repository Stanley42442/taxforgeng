

# Safe Storage Migration - Complete Code Consistency Plan

## Overview

This plan migrates all remaining raw `localStorage` and `sessionStorage` calls to use the `safeLocalStorage` and `safeSessionStorage` wrappers for 100% code consistency across the codebase.

While most of these calls are already protected by try-catch blocks, using the unified wrapper ensures:
- Consistent error handling patterns
- Cleaner, more readable code
- Future-proof against any missed edge cases

---

## Files to Modify

### 1. src/pages/Team.tsx (3 occurrences)

| Line | Current Code | Replacement |
|------|-------------|-------------|
| 34 | `localStorage.getItem('taxforge_ng_team')` | `safeLocalStorage.getItem('taxforge_ng_team')` |
| 50 | `localStorage.setItem('taxforge_ng_team', ...)` | `safeLocalStorage.setItem('taxforge_ng_team', ...)` |
| 61 | `localStorage.setItem('taxforge_ng_team', ...)` | `safeLocalStorage.setItem('taxforge_ng_team', ...)` |

**Changes:**
- Add import: `import { safeLocalStorage } from "@/lib/safeStorage";`
- Replace all 3 localStorage calls with safeLocalStorage equivalents
- Remove surrounding try-catch blocks (now handled by wrapper)

---

### 2. src/pages/Dashboard.tsx (6 occurrences)

| Line | Current Code | Replacement |
|------|-------------|-------------|
| 108 | `localStorage.getItem('dashboard_summary_expanded')` | `safeLocalStorage.getItem('dashboard_summary_expanded')` |
| 116 | `localStorage.getItem('dashboard_date_range')` | `safeLocalStorage.getItem('dashboard_date_range')` |
| 124 | `localStorage.setItem('dashboard_date_range', ...)` | `safeLocalStorage.setItem('dashboard_date_range', ...)` |
| 128 | `localStorage.setItem('dashboard_summary_expanded', ...)` | `safeLocalStorage.setItem('dashboard_summary_expanded', ...)` |
| 147-149 | `localStorage.getItem('taxforge_disclaimer_accepted')` | `safeLocalStorage.getItem('taxforge_disclaimer_accepted')` |
| 405 | `localStorage.getItem('taxforge_welcome_shown')` | `safeLocalStorage.getItem('taxforge_welcome_shown')` |

**Changes:**
- Add import: `import { safeLocalStorage } from "@/lib/safeStorage";`
- Replace all 6 localStorage calls with safeLocalStorage equivalents
- Simplify try-catch blocks to direct calls

---

### 3. src/pages/Notifications.tsx (4 occurrences)

| Line | Current Code | Replacement |
|------|-------------|-------------|
| 82-84 | `localStorage.getItem('notification-sound-enabled')` | `safeLocalStorage.getItem('notification-sound-enabled')` |
| 110 | `localStorage.setItem('notification-sound-enabled', ...)` | `safeLocalStorage.setItem('notification-sound-enabled', ...)` |
| 121 | `localStorage.setItem('notification-browser-enabled', ...)` | `safeLocalStorage.setItem('notification-browser-enabled', ...)` |

**Changes:**
- Add import: `import { safeLocalStorage } from "@/lib/safeStorage";`
- Replace all localStorage calls with safeLocalStorage equivalents
- Remove try-catch wrappers

---

### 4. src/pages/Settings.tsx (1 occurrence)

| Line | Current Code | Replacement |
|------|-------------|-------------|
| 546 | `localStorage.removeItem('cache-version')` | `safeLocalStorage.removeItem('cache-version')` |

**Changes:**
- Add import: `import { safeLocalStorage } from "@/lib/safeStorage";`
- Replace the localStorage call with safeLocalStorage

---

### 5. src/hooks/useReminderNotifications.ts (1 occurrence)

| Line | Current Code | Replacement |
|------|-------------|-------------|
| 34 | `localStorage.getItem('notification-sound-enabled')` | `safeLocalStorage.getItem('notification-sound-enabled')` |

**Changes:**
- Add import: `import { safeLocalStorage } from "@/lib/safeStorage";`
- Replace localStorage call with safeLocalStorage
- Remove try-catch wrapper (now handled by safeLocalStorage)

---

## Summary Table

| File | Raw Calls | Safe Wrapper Import |
|------|-----------|---------------------|
| Team.tsx | 3 | Add safeLocalStorage |
| Dashboard.tsx | 6 | Add safeLocalStorage |
| Notifications.tsx | 4 | Add safeLocalStorage |
| Settings.tsx | 1 | Add safeLocalStorage |
| useReminderNotifications.ts | 1 | Add safeLocalStorage |
| **Total** | **15** | |

---

## Technical Details

### Before (Example from Team.tsx)

```typescript
const [members, setMembers] = useState<TeamMember[]>(() => {
  try {
    const saved = localStorage.getItem('taxforge_ng_team');
    return saved ? JSON.parse(saved) : MOCK_MEMBERS;
  } catch {
    return MOCK_MEMBERS;
  }
});
```

### After (Cleaner with safeLocalStorage)

```typescript
import { safeLocalStorage } from "@/lib/safeStorage";

const [members, setMembers] = useState<TeamMember[]>(() => {
  return safeLocalStorage.getJSON('taxforge_ng_team', MOCK_MEMBERS);
});
```

---

## Benefits

1. **Code Consistency**: All storage access uses the same pattern
2. **Cleaner Code**: Remove redundant try-catch blocks
3. **DRY Principle**: Error handling is centralized in the wrapper
4. **Maintainability**: Easier to audit and update storage patterns
5. **Documentation Compliance**: Aligns with CODE_STANDARDS.md requirements

---

## Documentation Update

Update `docs/CHANGELOG.md` to document the complete safe storage migration.

