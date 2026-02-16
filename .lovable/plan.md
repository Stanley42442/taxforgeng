

# Security Hardening and Mobile Verification Plan

## Security Issues Found

### 1. Client-Side API Key Generation is Insecure
**File**: `src/pages/ApiDocs.tsx` (lines 93-135)

Non-admin users generate API keys entirely client-side using `crypto.randomUUID()` and insert directly via Supabase client. This means:
- The API key is generated in the browser (predictable environment)
- The `api_secret_hash` is just a random UUID, not an actual hash
- There is no server-side validation of the user's subscription tier

**Fix**: Move non-admin key generation to a new edge function (`generate-api-key`) that validates the user's subscription tier server-side before creating the key. This mirrors the pattern already used for admin key creation.

### 2. Missing Input Sanitization on Brand Name and Logo URL
**File**: `src/pages/PartnerBranding.tsx`

- `brandName` is saved directly without length limits or character restrictions
- `logoUrl` accepts any string without URL validation
- `borderRadius` has HTML min/max but no server-side bounds check
- `allowedDomains` field has no validation for valid domain format

**Fix**: Add client-side validation with length limits (brand name: 100 chars, logo URL: 500 chars), URL format validation for logo, and domain format validation. Add corresponding server-side checks in the `saveTheme` function.

### 3. Missing Input Sanitization on API Docs Forms
**File**: `src/pages/ApiDocs.tsx`

- `newKeyName` has no length limit (lines 397-401)
- `newKeyDomains` has no domain format validation
- `adminPartnerName` has no length limit
- `adminRateLimit` allows any numeric input (no bounds check on client)

**Fix**: Add `maxLength` attributes and validation before submission. Validate domain formats with a regex pattern.

### 4. Embed Calculator Route Shows Nav/Header
**File**: `src/pages/EmbedCalculator.tsx`

The embed route (`/embed/calculator`) renders inside the app shell with the TaxForge header and navigation visible. When embedded in an iframe on a third-party site, the full app chrome should not appear.

**Fix**: The embed route should bypass `PageLayout` and render without the app shell. Check if `App.tsx` wraps it in a layout -- it currently renders at the route level without `PageLayout`, but the app shell (NavMenu, footer) still renders around it. Add a check in the app shell to hide chrome when on the embed route.

### 5. Logo Upload Missing File Type Validation on Server Side
**File**: `src/pages/PartnerBranding.tsx` (lines 316-345)

The file input has `accept` attribute for client-side filtering, but the upload goes directly to storage without MIME type verification. A user could bypass the `accept` attribute and upload non-image files.

**Fix**: Add MIME type validation before uploading (check `file.type` starts with `image/`). The file extension extraction is also naive (`file.name.split('.').pop()`) -- validate it against an allowlist.

### 6. XSS Risk in Embed Code Display
**File**: `src/pages/ApiDocs.tsx`, `src/pages/PartnerBranding.tsx`

The API key is interpolated directly into embed code snippets that are displayed in `pre` tags. While `pre` tags don't execute scripts, the `copyToClipboard` function copies the raw string. If an API key were somehow manipulated to contain script tags, the copied snippet could be malicious when pasted into a third-party site.

**Risk Level**: LOW (API keys are generated server-side with `txf_` prefix and UUID format), but defense-in-depth says we should HTML-encode the output.

**Fix**: Ensure API key values are sanitized before interpolation into code snippets.

### 7. Storage Policies are Correct
The storage policies for `partner-assets` are properly scoped:
- INSERT: scoped to `logos/{auth.uid()}/` path
- DELETE: scoped to `logos/{auth.uid()}/` path
- SELECT: public (required for iframe access)

No changes needed.

### 8. Partners RLS Policies are Correct
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id AND (tier != 'partner' OR has_role(admin))`
- UPDATE/DELETE: `auth.uid() = user_id`

No changes needed.

## Mobile Issues Found

### 9. API Docs Page -- Mobile Layout OK
The API Docs page renders correctly on mobile (390px). Code blocks already have `whitespace-pre-wrap break-all`. No issues observed.

### 10. Embed Calculator Shows App Shell in iframe
When visiting `/embed/calculator`, the full app navigation bar and TaxForge header appear. This must be hidden for embedded usage.

**Fix**: In `App.tsx` or the nav component, detect the `/embed/` path prefix and hide the navigation shell.

---

## Implementation Steps

### Step 1: Create `generate-api-key` edge function
Move API key generation to server-side for non-admin users:
- Validate JWT authentication
- Verify subscription tier (business/corporate) via database
- Generate key server-side
- Insert with correct tier-based rate limits
- Return the created key

### Step 2: Add input validation to `ApiDocs.tsx`
- Add `maxLength={100}` to key name input
- Add `maxLength={500}` to domains input
- Validate domain format before submission
- Replace client-side key generation with edge function call

### Step 3: Add input validation to `PartnerBranding.tsx`
- Add `maxLength={100}` to brand name input
- Add `maxLength={500}` to logo URL input
- Validate logo URL format (must be valid URL starting with `https://`)
- Validate MIME type before logo upload (`image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`)
- Validate file extension against allowlist
- Add `maxLength={500}` to allowed domains input

### Step 4: Hide app shell on embed routes
- In the navigation/layout component, detect when the current path starts with `/embed/` and hide the nav bar, header, and footer
- This ensures the embedded calculator renders cleanly in iframes

### Step 5: Sanitize API key interpolation
- Create a helper function to escape special characters in API keys before interpolating into code snippets

### Step 6: Deploy and verify
- Deploy the new `generate-api-key` edge function
- Test mobile views for API Docs, Partner Branding (all 3 tabs), and Embed Calculator
- Verify the embed route renders without app chrome

---

## Technical Details

### New Edge Function: `supabase/functions/generate-api-key/index.ts`
```text
POST /generate-api-key
Auth: Bearer JWT (required)
Body: { name: string, domains?: string[] }
Response: { data: PartnerRecord }

Validation:
- name: required, string, max 100 chars, trimmed
- domains: optional array, each item must be valid URL or domain
- Rate limit based on subscription tier lookup
```

### Files Modified
1. `supabase/functions/generate-api-key/index.ts` -- NEW
2. `src/pages/ApiDocs.tsx` -- input validation, server-side key generation
3. `src/pages/PartnerBranding.tsx` -- input validation, MIME checks
4. `src/components/NavMenu.tsx` (or equivalent layout) -- hide on embed routes
5. `src/pages/EmbedCalculator.tsx` -- minor cleanup if needed

### No Database Changes Required
All existing RLS policies and storage policies are correctly configured.

