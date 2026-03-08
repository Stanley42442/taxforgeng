

## Fix: Auth Session Loss (Logged Out After a Few Seconds)

### Root Cause Analysis

There are **two separate Supabase client instances** in the project:
- `src/integrations/supabase/client.ts` (auto-generated, uses raw `localStorage`)
- `src/lib/supabaseClient.ts` (custom, uses `safeStorage` wrapper)

Both create independent `createClient()` calls pointing to the same project and same localStorage key (`sb-uhuxqrrtsiintcwpxxwy-auth-token`). Each client runs its own auth lifecycle internally. When one client writes a session to storage, the other doesn't detect it in memory — and can overwrite it with `null` during its own initialization. This causes `auth.uid()` to be null on requests, making all RLS-protected queries fail.

The console logs confirm this: every request uses the **anon key** as the Bearer token instead of the user's JWT. The profile exists in the database (user `c34c22a5...` has `subscription_tier: basic`), but RLS blocks access because `auth.uid()` is null. SubscriptionContext then enters a retry loop trying to create a profile, generating 15+ failed requests per second.

### Fix (3 files)

**1. `src/lib/supabaseClient.ts`** — Eliminate the duplicate client. Re-export from the auto-generated client instead of creating a new one:
```typescript
export { supabase } from '@/integrations/supabase/client';
```
This ensures a single client instance across the entire app.

**2. `src/hooks/useAuth.tsx`** — Fix the auth initialization race condition. Currently `loading` starts as `false`, so components render before the session is restored. Change to:
- Start `loading` as `true`
- Call `getSession()` first to restore the session from storage
- Then `onAuthStateChange` handles subsequent changes
- Set `loading = false` only after `getSession()` resolves

This follows the proven pattern from the Supabase docs and prevents queries from firing before auth is ready.

**3. `src/contexts/SubscriptionContext.tsx`** — Stop the retry storm. Add a guard so profile creation is only attempted once, and add a `maybeSingle()` fallback instead of `.single()` to avoid 406 errors when the profile temporarily isn't visible due to auth timing.

### Why it works on published mobile but not preview
The preview iframe may have stricter storage restrictions (partitioned storage, cross-origin iframe rules) that cause the `safeStorage` wrapper to silently fail. With two competing clients, the timing differences are amplified. Mobile published site works because it has direct storage access and fewer timing issues with a single page load.

