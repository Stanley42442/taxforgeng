# TaxForge NG - Technical Architecture

This document provides a technical reference for developers working on TaxForge NG.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18.3.1, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Framer Motion |
| State | React Context, TanStack Query |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions) |
| PWA | VitePWA, IndexedDB, Service Worker |
| Payments | Paystack |

---

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui primitives
│   └── ...             # Feature components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and calculations
├── pages/              # Route components
├── styles/             # Device-specific CSS
├── __tests__/          # Test files
└── integrations/
    └── supabase/       # Auto-generated types and client

supabase/
├── config.toml         # Supabase configuration
├── functions/          # Edge Functions (Deno)
└── migrations/         # Database migrations

docs/                   # Documentation
public/                 # Static assets
```

---

## Key Patterns

### Safe Storage Access

Always use the wrapper for localStorage operations:

```typescript
import { safeLocalStorage } from '@/lib/safeStorage';

// Instead of localStorage.getItem('key')
const value = safeLocalStorage.getItem('key');

// For JSON data with defaults
const data = safeLocalStorage.getJSON('key', { default: 'value' });
```

**Why**: Direct localStorage access throws in private browsing mode, Safari strict mode, and when quota exceeded.

### Error Handling

Always use typed error handling:

```typescript
import { getErrorMessage } from '@/lib/errorUtils';
import logger from '@/lib/logger';

try {
  await riskyOperation();
} catch (error: unknown) {
  const message = getErrorMessage(error);
  logger.error('Operation failed:', message);
  toast.error(message);
}
```

### Lazy Route Error Boundaries

Wrap lazy routes with error boundary:

```typescript
import { LazyRouteErrorBoundary } from '@/components/LazyRouteErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));

<Route 
  path="/dashboard" 
  element={
    <LazyRouteErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Dashboard />
      </Suspense>
    </LazyRouteErrorBoundary>
  } 
/>
```

### Database Queries

Use `.maybeSingle()` for optional data:

```typescript
// ❌ Throws if no record
const { data } = await supabase.from('profiles').select().eq('id', id).single();

// ✅ Returns null if no record
const { data } = await supabase.from('profiles').select().eq('id', id).maybeSingle();
```

---

## Database Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (extends auth.users) |
| `businesses` | Saved business entities |
| `expenses` | Business expense records |
| `personal_expenses` | Personal tax relief expenses |
| `tax_calculations` | Saved calculation results |
| `invoices` | Generated invoices |
| `invoice_items` | Line items for invoices |
| `reminders` | Tax deadline reminders |
| `compliance_items` | Compliance tracking |

### Security Tables

| Table | Purpose |
|-------|---------|
| `known_devices` | Device fingerprinting |
| `auth_events` | Login/security event log |
| `login_attempts` | Rate limiting data |
| `ip_whitelist` | Per-user IP restrictions |
| `time_restrictions` | Login time windows |
| `backup_codes` | 2FA recovery codes |

### Subscription Tables

| Table | Purpose |
|-------|---------|
| `paystack_subscriptions` | Active subscriptions |
| `subscription_history` | Plan change history |
| `promo_codes` | Discount codes |
| `loyalty_points_transactions` | Points ledger |
| `loyalty_redemptions` | Redeemed rewards |

---

## Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `paystack-initialize` | HTTP POST | Start payment |
| `paystack-verify` | HTTP POST | Verify payment |
| `paystack-webhook` | Webhook | Handle events |
| `paystack-cancel-subscription` | HTTP POST | Cancel subscription |
| `payment-2fa` | HTTP POST | Generate/verify OTP |
| `send-security-alert` | HTTP POST | Email security alerts |
| `send-welcome-email` | HTTP POST | New user welcome |
| `send-reminder-email` | HTTP POST | Deadline reminders |
| `check-reminders` | Cron | Daily reminder check |
| `tax-assistant` | HTTP POST | AI tax Q&A |
| `categorize-expense` | HTTP POST | AI expense categorization |

---

## PWA Architecture

### Service Worker
- Caches static assets and API responses
- Configured via VitePWA plugin

### Offline Storage (IndexedDB)

```
taxforge-offline (DB)
├── businesses
├── expenses
├── personalExpenses
├── calculations
├── syncQueue        # Pending mutations
├── conflicts        # Sync conflicts
├── quarantine       # Corrupted data
├── integrityLogs    # Verification history
└── metadata         # Config and state
```

### Data Flow

1. **Online**: Supabase → React Query Cache → UI
2. **Offline**: IndexedDB → UI (read-only)
3. **Mutation**: UI → Sync Queue → (online) → Supabase
4. **Sync**: Sync Queue → Server → Conflict Resolution

### Compression

All IndexedDB data compressed with lz-string:
- ~70% average reduction
- Sub-millisecond compress/decompress
- Transparent to application code

---

## Testing Strategy

### Unit Tests (`src/__tests__/`)
- Tax calculation logic
- Utility functions
- Hook behavior

### Integration Tests
- PWA functionality
- Subscription flows
- Offline sync

### E2E Tests (`src/__tests__/e2e/`)
End-to-end tests for critical user journeys:

| Test File | Coverage |
|-----------|----------|
| `auth.e2e.test.ts` | Signup, login, logout, sessions |
| `calculator.e2e.test.ts` | CIT, VAT, WHT calculations |
| `payment.e2e.test.ts` | Tier selection, payments, subscriptions |
| `expenses.e2e.test.ts` | CRUD, categorization, filtering |
| `taxbot.e2e.test.ts` | AI chat, rate limiting, feedback |

### Security Tests
- RLS policy verification
- Input validation
- Authentication flows

### Running Tests

```bash
# All tests
bun run test

# Specific file
bun run test src/__tests__/lib/taxCalculations.test.ts

# E2E tests only
bun run test src/__tests__/e2e/

# Watch mode
bun run test --watch
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |
| `VITE_BUILD_TIME` | Cache busting timestamp |

Edge function secrets (configured in Supabase):
- `PAYSTACK_SECRET_KEY`
- `RESEND_API_KEY`
- `OPENROUTER_API_KEY`

---

## Performance Considerations

### Code Splitting
- Routes lazy-loaded via React.lazy
- Heavy components (charts, PDF export) lazy-loaded

### Query Optimization
- TanStack Query for caching and deduplication
- Parallel data loading with Promise.all
- Pagination for large datasets

### Bundle Size
- Tree-shaking enabled
- Lucide icons individually imported
- Date-fns functions individually imported

---

## Deployment

### Preview (Test)
- Automatic deployment on code push
- Test database environment
- Accessible via preview URL

### Production (Live)
- Manual publish from Lovable
- Production database
- Accessible via custom domain

### Publishing Checklist
1. Test all new features in preview
2. Verify database migrations applied
3. Check for console errors
4. Confirm mobile responsiveness
5. Click "Publish" in Lovable
