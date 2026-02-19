
## Add a Public Partner/Embed Demo Page for Backlink Partnerships

### What You're Building
A polished, publicly accessible page at `/embed-partner` (also accessible as `/demo-widget`) that serves as the partnership landing page. It gives prospective partners everything they need to embed the TaxForge calculator on their site and link back to you:

1. **Live sandbox demo** — an interactive, no-API-key version of the calculator they can play with right now
2. **Ready-to-paste embed snippets** — both JS SDK and iframe options, with comments and a copy button
3. **Integration guide** — a clear, step-by-step inline guide covering setup, customization, and troubleshooting (also exportable as PDF)
4. **Partnership CTA** — a contact/request form to get an API key, driving the backlink partnership workflow

---

### Why This Is a Separate Page (Not Behind a Login)
The current `/api-docs` page requires login and a Corporate/Business subscription. This new page is fully **public** — no login needed — so any blogger, fintech site, or accountancy firm can discover it via SEO, see the widget working, copy an embed snippet for testing, and then contact you for an official API key. That's how the backlink loop works.

---

### Pages & Files to Create/Modify

**1. New file: `src/pages/EmbedPartner.tsx`** (the main public page)

Structure:
```
Hero Section
  - Headline: "Embed Nigeria's Most Accurate Tax Calculator on Your Site"
  - Subheadline: "Free for media, fintechs & accountancy firms. We provide the tool, you earn the backlink credit."
  - Two CTAs: [Try the Demo ↓] [Request API Key →]

Live Demo Section (/demo-widget anchor)
  - Full EmbeddableCalculator rendered in sandbox mode (no API key required — uses a public demo mode)
  - Label: "Sandbox — results are real, no key required"

Embed Code Snippets Section
  - Tab toggle: JS SDK | iFrame
  - JS SDK snippet (commented):
      <!-- Step 1: Add the container div -->
      <div id="taxforge-calculator"></div>
      <!-- Step 2: Load the SDK -->
      <script src="https://taxforgeng.com/embed.js"></script>
      <!-- Step 3: Initialize with your API key -->
      <script>
        TaxForge.init({
          container: '#taxforge-calculator',
          apiKey: 'YOUR_API_KEY_HERE'
        });
      </script>
  - Copy button for each
  - Note: "Replace YOUR_API_KEY_HERE with your partner key. Request one below."

Integration Guide Section
  - Step-by-step inline guide with numbered steps:
    1. Request an API key (link to form below)
    2. Add the snippet to your site's HTML
    3. Optional: Customize colors, font and brand name
    4. Troubleshooting: common issues (domain mismatch, key inactive, etc.)
  - "Download as PDF" button (uses existing jspdf library)

Partnership Request Form Section
  - Fields: Name, Organization, Website URL, Monthly pageviews (select), Message
  - On submit: saves to a new `partnership_requests` database table
  - Auto-emails admin via existing `send-welcome-email` pattern (or a new simple edge function)

Trust / Why Partner Section
  - Stats: 10,000+ calculations/month, 2026 Nigeria Tax Act compliant, Mobile-friendly
  - Logos / trust badges

SEO
  - Uses existing SEOHead component
  - Schema: SoftwareApplication + HowTo
  - Canonical: /embed-partner
```

**2. New database table: `partnership_requests`**
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
name text NOT NULL
organization text NOT NULL
website_url text NOT NULL
monthly_pageviews text
message text
status text DEFAULT 'pending'
created_at timestamptz DEFAULT now()
```
- RLS: insert-only for anon users (public form), select/update only for authenticated admins

**3. New edge function: `send-partnership-inquiry`** (lightweight)
- Called after form submit
- Sends a simple notification email to the admin address using existing Resend setup
- Returns 200 OK so the form can show success

**4. Modify `src/App.tsx`**
- Add lazy import for `EmbedPartner`
- Add two routes: `/embed-partner` and `/demo-widget` (alias redirect to `/embed-partner`)

**5. Modify `src/components/EmbeddableCalculator.tsx`**
- Add a `sandboxMode` prop (boolean, default `false`)
- When `sandboxMode=true`, skip API key validation and render directly — this lets the demo page show the widget without requiring a real key

**6. Optionally modify `src/components/NavMenu.tsx` or footer**
- Add "Partner with Us" link in the footer or nav under a "Developers" section for discoverability

---

### The Demo Widget Flow

The public demo uses the existing `EmbeddableCalculator` React component directly on the page (not via iframe), so it works without any API key or server call. This is purely client-side calculation — same as the embed component already is. The distinction is just that the full embed page (`/embed/calculator`) requires API key validation via the edge function, but the public demo page renders the component directly in React, which needs no key at all.

---

### Integration Guide PDF Content (inline + downloadable)

The PDF will contain:
1. Prerequisites (none — just a website with HTML)
2. Step-by-step embed instructions (JS SDK method)
3. Customization options (colors, font, brand name via white-label branding)
4. Handling calculation results (postMessage API)
5. Troubleshooting table:
   | Problem | Cause | Fix |
   |---------|-------|-----|
   | Widget shows "Invalid API key" | Wrong key or key deleted | Check key in partner dashboard |
   | Widget shows "Domain not authorized" | Your domain not in allowlist | Contact admin to add domain |
   | Widget shows blank | Incorrect container selector | Ensure `#taxforge-calculator` div exists |
6. Contact info / support email

---

### Technical Details

- **No SSR needed**: The demo calculator is already a client-side React component — renders instantly, no API calls
- **Partnership form**: Saves to `partnership_requests` table with anon insert RLS. No auth required for visitors
- **PDF generation**: Uses the already-installed `jspdf` library (same as other PDF exports in the codebase)
- **Sandbox mode**: A simple boolean prop on `EmbeddableCalculator` — when true, hides the "Powered by" admin link and shows a "Sandbox" badge
- **Routes**: `/demo-widget` redirects to `/embed-partner#demo` for clean URLs in pitches to partners
- **Admin visibility**: Partnership requests will be viewable in the admin analytics area (or a simple new admin table view can be added later)
- **Edge function**: `send-partnership-inquiry` follows the same pattern as `send-reminder-email` — receives name/org/website, sends a plain-text email to the admin, returns 200
