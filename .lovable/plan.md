
# Fix: Complete the Safe Supabase Client Migration

## Root Cause Confirmed

The app crashes on restricted devices (like Redmi 12c) because **32 files were missed during the migration** from the unsafe Supabase client to the safe one.

The most critical file is `src/hooks/useAuth.tsx` which is imported by `App.tsx` and runs before React can mount. When it imports `@/integrations/supabase/client`, that client uses raw `localStorage` which throws a synchronous error on restricted devices, preventing the app from ever loading.

## Files That Need Import Updates

All 32 files need their import changed from:
```typescript
import { supabase } from '@/integrations/supabase/client';
```
to:
```typescript
import { supabase } from '@/lib/supabaseClient';
```

### Critical Priority (App initialization chain):
1. `src/hooks/useAuth.tsx`
2. `src/contexts/SubscriptionContext.tsx`
3. `src/lib/webVitals.ts`

### Hooks:
4. `src/hooks/useSessionSecurity.ts`
5. `src/hooks/useEmployees.ts`
6. `src/hooks/usePersonalExpenses.ts`
7. `src/hooks/usePayrollHistory.ts`
8. `src/hooks/useLeaveManagement.ts`
9. `src/hooks/usePayment2FA.ts`
10. `src/hooks/useDocumentationStats.ts`
11. `src/hooks/useOfflineSync.ts`

### Components:
12. `src/components/PaymentMethodsManager.tsx`
13. `src/components/TierSelectionModal.tsx`
14. `src/components/TierSelectionWrapper.tsx`
15. `src/components/TierUpgradeRequirements.tsx`

### Pages:
16. `src/pages/CancelSubscription.tsx`
17. `src/pages/VerifyDocument.tsx`
18. `src/pages/CalculationHistory.tsx`
19. (Plus remaining files from the search results)

## Why This Wasn't Caught

The previous edit session updated many files but ran into the context limit before completing all 48 files. The most critical ones (`useAuth.tsx`, `SubscriptionContext.tsx`) were unfortunately among those not updated.

## Implementation

Simple find-and-replace in each file:
- Find: `from '@/integrations/supabase/client'`
- Replace: `from '@/lib/supabaseClient'`

## Expected Result

After this fix:
- App will load on Redmi 12c and all restricted-storage devices
- Users on private browsing will see the app (though they'll need to re-login each session)
- Normal devices continue working exactly as before
