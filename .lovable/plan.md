
# Build Error Fixes

## Issue Summary
The build errors are caused by missing `interface` keyword declarations in two files:

### Error 1: `src/components/ErrorBoundary.tsx`
**Lines 6-9** - Missing `interface Props {` declaration before the properties:
```typescript
// Current (broken):
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Should be:
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

### Error 2: `src/hooks/useLoyaltyPoints.ts`
**Lines 5-10** - Missing `interface PointsTransaction {` declaration:
```typescript
// Current (broken):
  id: string;
  points: number;
  action_type: string;
  description: string;
  created_at: string;
}

// Should be:
interface PointsTransaction {
  id: string;
  points: number;
  action_type: string;
  description: string;
  created_at: string;
}
```

## Fix Implementation

### File 1: `src/components/ErrorBoundary.tsx`
Add `interface Props {` on line 6:
```typescript
import logger from "@/lib/logger";
import { sanitizeErrorForDisplay } from "@/lib/errorUtils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

### File 2: `src/hooks/useLoyaltyPoints.ts`
Add `interface PointsTransaction {` on line 5:
```typescript
import logger from '@/lib/logger';

interface PointsTransaction {
  id: string;
  points: number;
  action_type: string;
  description: string;
  created_at: string;
}
```

## Remaining Plan Tasks After Build Fix

Once these build errors are fixed, the remaining implementation items are:

### Phase B Completion (safeLocalStorage migration)
- `src/hooks/useRealtimeNotifications.ts` - Replace direct localStorage with safeLocalStorage
- `src/lib/notifications.ts` - Replace direct localStorage with safeLocalStorage  
- `src/pages/Auth.tsx` - Replace direct localStorage with safeLocalStorage
- `src/pages/Notifications.tsx` - Replace direct localStorage with safeLocalStorage

### Phase C: Additional `.single()` Fixes
- `src/components/OnboardingWizard.tsx` - Change `.single()` to `.maybeSingle()`
- `src/components/EmailRecipientsManager.tsx` - Change `.single()` to `.maybeSingle()`
- `src/pages/EmbedCalculator.tsx` - Change `.single()` to `.maybeSingle()`
- `src/lib/sampleData.ts` - Add try-catch around `.single()`

### Phase D: Low Priority Polish
- Add TODO comments to simulated features in `AccountantPortal.tsx`, `EFiling.tsx`, `Transactions.tsx`

## Implementation Order
1. Fix `ErrorBoundary.tsx` interface declaration
2. Fix `useLoyaltyPoints.ts` interface declaration  
3. Verify build succeeds
4. Complete safeLocalStorage migration
5. Fix remaining `.single()` calls
6. Add documentation comments
