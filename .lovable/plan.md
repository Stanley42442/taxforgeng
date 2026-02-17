

## Improve Admin Partner Key Management

### Problem Summary
The admin partner key creation section has three usability issues:
1. After creating a partner key, there's no way to copy just the API key alone — only a full embed snippet is shown, and only for the first partner key
2. Partner keys and their embed snippets aren't organized by client/partner name
3. While delete/deactivate buttons exist on the general key list above, it's not intuitive — admin-created partner keys should have their own management section

### Solution
Enhance the admin section to show a list of all admin-created partner keys (those prefixed with `[Partner]`), each with:
- Partner name and domain info
- Copyable standalone API key field
- Generated embed snippet specific to that partner
- Delete and deactivate/activate buttons
- Usage stats (requests today / total)

### Changes (1 file)

**src/pages/ApiDocs.tsx** — Replace the admin section (lines 532-551) with a per-partner card layout:

1. Filter partner keys to show only admin-created ones (names starting with `[Partner]`)
2. For each admin partner key, render a card containing:
   - Partner name (with `[Partner]` prefix stripped for display)
   - Status badge (Active/Inactive) and tier badge
   - **Standalone API key** in a read-only input with a Copy button
   - Embed snippet (JS SDK) with Copy button
   - Domain list
   - Usage stats row (requests today, total, creation date)
   - Action buttons: Activate/Deactivate toggle + Delete with confirmation
3. Sort cards by creation date (newest first) — already handled by the fetch query

### Visual Layout (per partner card)

```text
+-----------------------------------------------+
| Acme Financial Services          Active  PARTNER|
+-----------------------------------------------+
| API Key:                                       |
| [txf_abc123...________________] [Copy Key]     |
|                                                |
| Domains: https://acme.com, https://app.acme.com|
|                                                |
| Embed Snippet:                                 |
| +--------------------------------------------+|
| | <div id="taxforge-calculator"></div>        ||
| | <script src=".../embed.js"></script>        ||
| | <script>TaxForge.init({...})</script>       ||
| +--------------------------------------------+|
| [Copy Snippet]                                 |
|                                                |
| 42/10000 today | Total: 1,203 | Created: ...   |
| [Deactivate]                        [Delete]   |
+-----------------------------------------------+
```

### Technical Details
- No database changes needed — all data already exists in the `partners` table
- No new edge functions needed — delete and toggle already work via direct Supabase calls (lines 200-234)
- The filter `k.name.startsWith('[Partner]')` reliably identifies admin-created keys since `create-partner-key` edge function prefixes names with `[Partner]`
- Each card generates its own embed snippet using that specific key's `api_key` value
- Delete will use the existing `deleteApiKey` function with a confirmation dialog

