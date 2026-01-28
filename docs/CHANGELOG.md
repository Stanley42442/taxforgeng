# TaxForge NG - Changelog

All notable changes to this project are documented in this file.

---

## Phase 3: Security Hardening & Code Quality ✅ COMPLETE

### Completed

#### Security Scanner Updates
- Marked `clients` table RLS warning as false positive (verified `auth.uid() = user_id` policies)
- Marked `paystack_subscriptions` table RLS warning as false positive (verified user-scoped access)
- Documented `login_attempts` INSERT policy as intentionally permissive (required for unauthenticated logging)

#### parseInt Radix Fixes
- `src/components/BlockedLoginAttemptsLog.tsx` - Added radix `10` to `parseInt(hourMatch[1], 10)`
- `src/components/PayrollAnalyticsDashboard.tsx` - Added radix `10` to year parsing (2 occurrences)

#### localStorage to safeLocalStorage Migration
Migrated files to use safe wrappers that prevent crashes in private browsing mode:

| File | Status |
|------|--------|
| `src/pages/IndividualCalculator.tsx` | ✅ Migrated |
| `src/pages/Expenses.tsx` | ✅ Migrated |
| `src/components/ThemeProvider.tsx` | ✅ Migrated |
| `src/hooks/useCalculatorPersistence.ts` | ✅ Migrated |
| `src/pages/Dashboard.tsx` | ✅ Migrated |
| `src/pages/Team.tsx` | ✅ Migrated |
| `src/components/WelcomeSplash.tsx` | ✅ Migrated |
| `src/hooks/useRealtimeNotifications.ts` | ✅ Already safe (try-catch) |
| `src/hooks/useAuth.tsx` | ⚠️ Intentional (Supabase token key) |
| `src/main.tsx` | ⚠️ Already wrapped in try-catch |

---

## Phase 2: Optimization & Error Handling

### Error Handling Improvements
- Migrated all `catch (error)` to `catch (error: unknown)` with proper type handling
- Created `src/lib/errorUtils.ts` with `getErrorMessage()` helper
- Replaced raw `console.*` calls with `logger.*` throughout codebase

### Logging System
- Created `src/lib/logger.ts` for environment-aware logging
- Production: Only errors logged
- Development: Full debug, info, warn, error support

### Database Query Safety
- Replaced `.single()` with `.maybeSingle()` for optional data queries
- Prevents runtime crashes when records don't exist

### Component Error Boundaries
- Created `src/components/LazyRouteErrorBoundary.tsx`
- Catches chunk loading failures and network errors in lazy routes

---

## Phase 1: Initial Development

### Core Features
- Nigerian tax calculator (CIT, VAT, PIT, WHT)
- 2026 tax rules support
- Multi-business management
- Expense tracking with deductibility
- Invoice generation
- Tax reminders and calendar
- Payroll calculator with PAYE

### PWA Features
- Offline support with IndexedDB storage
- Data compression using lz-string (~70% reduction)
- SHA-256 checksums for data integrity
- Background sync for mutations
- Storage quota monitoring

### Authentication & Security
- Supabase Auth integration
- Row Level Security (RLS) on all tables
- Device tracking and fingerprinting
- IP whitelisting support
- 2FA for payment operations
- Session management

### Subscription System
- Tiered pricing (Individual, Starter, Basic, Professional, Business, Corporate)
- Paystack payment integration
- Trial period support
- Loyalty points program

---

## Known Accepted Risks

### pg_net Extension
- Installed in `public` schema (Supabase default)
- Moving requires careful testing and admin access
- No security impact

### React 18.3.1 CVEs
- CVE-2024-53986, CVE-2024-53989, CVE-2024-53990
- Requires user-controlled iframe content (not used in this app)
- NOT EXPLOITABLE in current codebase
- Plan upgrade to React 19 when convenient

### Intentional Permissive Policies
| Table | Policy | Reason |
|-------|--------|--------|
| `login_attempts` | INSERT `true` | Must log before authentication |
| `document_verifications` | SELECT `true` | Public QR verification |
| `sector_presets` | SELECT `true` | Public reference data |
| `user_reviews` | SELECT approved | Public testimonials |

---

## File Reference

### Safe Storage Wrapper
```typescript
// src/lib/safeStorage.ts
import { safeLocalStorage } from '@/lib/safeStorage';

safeLocalStorage.getItem('key');
safeLocalStorage.setItem('key', 'value');
safeLocalStorage.getJSON('key', defaultValue);
safeLocalStorage.setJSON('key', data);
```

### Error Message Extraction
```typescript
// src/lib/errorUtils.ts
import { getErrorMessage } from '@/lib/errorUtils';

catch (error: unknown) {
  const message = getErrorMessage(error);
  logger.error('Operation failed:', message);
}
```

### Logger Usage
```typescript
// src/lib/logger.ts
import logger from '@/lib/logger';

logger.debug('Detailed info for development');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred:', error);
```
