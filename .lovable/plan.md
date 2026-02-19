
## Partnership Request Review System with Approval/Rejection Emails

### What Needs to Change

The `partnership_requests` table is missing a partner **email** field — without it there's no way to email them when you approve or reject. The admin panel also has no UI to see or act on requests. Two new email-sending scenarios need backend functions.

### Full Scope of Changes

#### 1. Database Migration — Add `email` and `reviewed_at` to `partnership_requests`
```sql
ALTER TABLE public.partnership_requests
  ADD COLUMN email text,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN reviewer_note text;
```
- `email`: The partner's contact email (so you can reply to them)
- `reviewed_at`: Timestamp when the admin acted
- `reviewer_note`: Optional private note the admin adds when rejecting/approving

#### 2. Update `src/pages/EmbedPartner.tsx` — Add Email Field to the Request Form
The existing form has: Name, Organization, Website URL, Monthly Pageviews, Message.
A new **Email** field will be added (required) so the partner can receive your decision.
The email will be sent to the backend along with the rest of the form data.

#### 3. New Backend Function: `send-partner-decision`
A single new edge function that handles both Approve and Reject emails to the partner. It receives:
```json
{
  "requestId": "uuid",
  "decision": "approved" | "rejected",
  "partnerEmail": "jane@example.com",
  "partnerName": "Jane",
  "organization": "Finance Hub",
  "reviewerNote": "Optional private message"
}
```

**Approved email** to the partner includes:
- Congratulations message
- The embed snippet with their actual API key (fetched server-side from `partners` table by matching org name / admin-created key)
- Integration guide link
- Backlink attribution reminder
- Link to `/embed-partner#guide`

**Rejected email** to the partner includes:
- Polite decline message  
- Reviewer note if provided
- Invitation to reapply in 3 months or try the free sandbox demo
- Link back to `/embed-partner`

The function uses the Resend API (same as existing functions, `RESEND_API_KEY` already configured).

#### 4. Add Partnership Requests Admin Panel to `src/pages/AdminAnalytics.tsx`

A new **"Partnership Requests"** section is added at the bottom of the admin analytics page. It is only visible to admins (already gated). It includes:

- A table/card list of all submitted `partnership_requests` rows
- Columns: Name, Organization, Website, Monthly Pageviews, Submitted date, Status badge
- **For pending requests**: two buttons — `Approve` (green) and `Reject` (destructive)
- **For approved/rejected**: shows timestamp and a status badge, no action buttons
- Clicking **Approve**:
  1. Updates the `status` to `'approved'` and sets `reviewed_at = now()` in the database
  2. Calls `send-partner-decision` edge function with `decision: 'approved'`
  3. Shows a toast: "Partnership approved. Email sent to [partner]."
- Clicking **Reject**:
  1. Opens a small inline input for an optional reviewer note
  2. Updates the `status` to `'rejected'` and sets `reviewed_at = now()`
  3. Calls `send-partner-decision` edge function with `decision: 'rejected'` and the note
  4. Shows a toast: "Partnership declined. Email sent to [partner]."
- Real-time updates (the admin list refreshes after each action)

#### 5. Add a Summary Stat Card in Admin Analytics
A small "Partnership Requests" count card added alongside the existing stats (pending count badge + total).

### Flow Diagram

```text
Partner fills form at /embed-partner
        ↓
Saved to partnership_requests table  ← admin notified via email (existing)
        ↓
Admin opens Admin Analytics → Partnership Requests section
        ↓
Admin clicks Approve or Reject
        ↓
DB updated (status + reviewed_at)
        ↓
send-partner-decision edge function called
        ↓
Partner receives "Approved" or "Rejected" email via Resend
```

### Technical Notes

- The `send-partner-decision` function does NOT auto-generate an API key — you said you want to review first, and key creation remains manual via the existing `/api-docs` admin panel. The approval email instead instructs the partner that their key will follow separately within 24 hours.
- If you later want to auto-generate the key on approval, the `create-partner-key` edge function is already in place and can be wired in with a single call.
- No new secrets needed — `RESEND_API_KEY` is already configured.
- The admin table fetches from `partnership_requests` using the existing admin RLS policy (`has_role('admin')`).
- All email rendering follows the same HTML-table pattern as `send-welcome-email` and `send-partnership-inquiry` for visual consistency.

### Files to Create/Modify

| File | Action |
|---|---|
| `supabase/migrations/...sql` | ADD email, reviewed_at, reviewer_note columns |
| `src/pages/EmbedPartner.tsx` | Add email field to form |
| `supabase/functions/send-partner-decision/index.ts` | CREATE new edge function |
| `src/pages/AdminAnalytics.tsx` | Add partnership requests section + approve/reject UI |
