

# Security Verification and Admin Access Hardening

## Audit Results

### Fully Implemented (No Changes Needed)
- Iframe sandbox attribute with `allow-scripts allow-forms allow-same-origin`
- No `clipboard-write` permission
- API key format validation (`txf_` prefix, 20-50 chars) in both client and edge function
- `postMessage` uses specific origin from `document.referrer`, skips if unavailable (no wildcard)
- Window-based daily rate limiting with auto-reset (no cron dependency)
- Per-minute burst protection (60 req/min)
- `Retry-After` headers on 429 responses
- `requests_total` properly incremented
- Origin enforcement against `allowed_origins`
- Only theme/branding data returned to client

### Issues to Fix

#### 1. Admin partner creation has no server-side enforcement (HIGH)
The admin partner management section is hidden with `{isAdmin && (...)}` in the UI, but the underlying function just inserts into the `partners` table using the standard RLS policy (`auth.uid() = user_id`). Any authenticated Business/Corporate user could replicate this insert by calling the database client directly. There is no server-side check that the user is an admin before allowing tier `'partner'` inserts.

**Fix:** Create a backend function that validates admin role server-side before creating partner keys. The function will use the `has_role()` database function (already exists) to verify the caller is an admin.

#### 2. Rate limit display is outdated (LOW)
The "Rate Limits" section at the bottom of ApiDocs still shows "1,000 requests/day (Basic)" but the actual database default is now 10,000.

**Fix:** Update the displayed rate limit tiers to match the current defaults.

## Implementation

### Step 1: Create an edge function for admin partner key creation
Create `supabase/functions/create-partner-key/index.ts` that:
- Validates the caller's JWT
- Checks `has_role(user_id, 'admin')` using the existing database function
- Returns 403 if not admin
- Creates the partner record server-side
- Returns the new key

### Step 2: Update ApiDocs.tsx
- Replace the direct Supabase insert in `generateAdminPartnerKey` with a call to the new edge function
- Update the rate limit display text (1,000 to 10,000 for Basic, add the actual tiers)

### Step 3: Add RLS policy to prevent non-admin partner-tier inserts
Add a database check constraint or RLS policy that prevents inserting rows with `tier = 'partner'` unless the user has the admin role. This provides defense-in-depth even if someone bypasses the edge function.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/create-partner-key/index.ts` | Create | Admin-only edge function for creating partner keys |
| `src/pages/ApiDocs.tsx` | Modify | Use edge function for admin key creation; update rate limit display |
| Database migration | Create | Add RLS policy restricting `tier = 'partner'` inserts to admins |

## Technical Details

### Edge function: create-partner-key
```text
1. Validate JWT via getClaims()
2. Query has_role(user_id, 'admin') -- returns boolean
3. If not admin -> 403
4. Validate input (partner name, domains, rate limit)
5. Generate txf_ key
6. Insert into partners with tier='partner'
7. Return the new partner record
```

### RLS policy addition
```sql
-- Prevent non-admins from creating partner-tier keys
CREATE POLICY "Only admins can create partner keys"
ON public.partners
FOR INSERT
TO authenticated
WITH CHECK (
  tier != 'partner' OR public.has_role(auth.uid(), 'admin')
);
```
This replaces the existing INSERT policy so that regular users can still create their own keys (non-partner tier), but only admins can create partner-tier keys.

### Rate limit display update
- Basic: 10,000 requests/day
- Pro: 100,000 requests/day
- Enterprise/Partner: Custom limits
