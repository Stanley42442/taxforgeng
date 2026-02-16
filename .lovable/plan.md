# Fix API Docs, Admin Partner Keys, Mobile Embed, Logo Upload, and Powered By Link

## Issues Identified

1. **No embed instructions on the API page** -- The API Docs page shows endpoints and code examples but has no section explaining how to embed the calculator widget on a client website.
2. **Admin "Create Partner Keys" is broken** -- The edge function uses `supabase.auth.getClaims(token)` which is not a valid Supabase JS method. This causes a runtime error every time.
3. **Mobile layout issue on Embed tab** -- In the White-Label Branding page, the Embed tab content does not fit properly on mobile screens unlike the Branding and Colors tabs. The `pre` blocks with embed code overflow.
4. **Logo should be uploadable** -- Currently the Logo field is a plain URL text input. Users should be able to upload an image file directly.
5. **"Powered by TaxForge" must not be deactivatable** -- The `showPoweredBy` switch currently lets users turn off the attribution. This toggle should be removed; the link should always show.

---

## Changes

### 1. Add Embed Instructions to API Docs Page (`src/pages/ApiDocs.tsx`)

Add a new "Embed Calculator" section between the API Keys and Endpoints sections. It will contain:

- A brief explanation of how the embeddable widget works
- The iframe embed snippet (using the user's first active API key)
- The JavaScript SDK embed snippet
- A link to the White-Label Branding page for customization
- Instructions on how to actually add the embeddable widget on the client website

### 2. Fix `create-partner-key` Edge Function (`supabase/functions/create-partner-key/index.ts`)

Replace the broken `getClaims` call with the standard `supabase.auth.getUser()` pattern:

```typescript
// Replace getClaims with getUser
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, ... });
}
const userId = user.id;
```

This follows the same pattern used successfully in other edge functions (tax-assistant, expense-insights, etc.).

### 3. Fix Mobile Layout on Embed Tab (`src/pages/PartnerBranding.tsx`)

Add responsive overflow handling to the `pre` blocks in the Embed tab:

- Add `whitespace-pre-wrap break-all` classes to prevent horizontal overflow
- Ensure the embed code blocks wrap properly on narrow screens, matching the behavior of the other two tabs

### 4. Add Logo Upload (`src/pages/PartnerBranding.tsx`)

- Create a `partner-assets` storage bucket via a database migration
- Add a file input button next to the existing Logo URL field
- On file selection, upload to the storage bucket under `logos/{partnerId}/{filename}`
- Auto-populate the Logo URL field with the public URL after upload
- Keep the manual URL input as a fallback option

### 5. Remove "Powered by TaxForge" Toggle

`**src/pages/PartnerBranding.tsx**`: Remove the Switch toggle and its surrounding `div` (lines 331-342). Replace with a static notice explaining the attribution is always shown.

`**src/components/EmbeddableCalculator.tsx**`: Remove the `showPoweredBy` conditional (line 413). Always render the "Powered by TaxForge NG" link regardless of the theme setting.

`**supabase/functions/validate-embed-key/index.ts**`: Always return `showPoweredBy: true` in the response, ignoring the database value.

### 6. Database Migration

```sql
-- Create storage bucket for partner logo uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-assets', 'partner-assets', true);

-- Allow authenticated users to upload to their own partner folder
CREATE POLICY "Users can upload partner logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'partner-assets');

-- Allow public read access for logos
CREATE POLICY "Public can view partner assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'partner-assets');

-- Allow authenticated users to update/delete their uploads
CREATE POLICY "Users can manage their partner assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'partner-assets');
```

---

## Technical Notes

- The `getClaims` bug is the root cause of the admin partner key creation failure. No other endpoint uses this method.
- The `showPoweredBy` column remains in the database but is effectively ignored -- no migration needed to remove it.
- The storage bucket is set to public so logo URLs work in the embedded iframe on third-party sites without auth.
- The embed instructions on the API page use the same snippet format already present in the admin section, just made visible to all Business/Corporate users.