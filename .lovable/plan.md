

## Fix: Session Logout Causes

After investigating the auth flow, auth logs, and network requests, I found **two code-level causes** that force logouts:

### Cause 1: `beforeunload` Wipes Auth Token in Preview

In `useAuth.tsx` (lines 322-328), a `beforeunload` handler removes the auth token from localStorage when `taxforge-session-only` is set. In the Lovable preview iframe, Vite HMR (hot module replacement) and preview refreshes trigger `beforeunload`, which deletes the token. On the next load, the session is gone.

**Fix**: Replace `beforeunload` with `pagehide` + `persisted` check. The `pagehide` event with `persisted === false` only fires on actual tab/window closes, not on in-page navigation or iframe reloads. Additionally, move the token cleanup to happen on the *next* page load instead, by checking sessionStorage on init rather than deleting on unload. This is more reliable across browsers and iframe contexts.

### Cause 2: Stale `session_invalidated_at` Timestamp

The `manage-sessions` edge function's `check_validity` operation compares `session_invalidated_at` on the profile against the token's `iat`. If a user ever clicked "Revoke all sessions" (even weeks ago), the `session_invalidated_at` timestamp persists forever. Any new login with a token issued *before* that timestamp (e.g., restored from localStorage) gets flagged as invalid.

While `useSessionSecurity` is only used on the security settings page (not globally), this is still a latent bug. When the user visits their security dashboard, the validity check fires immediately and can sign them out.

**Fix**: In the `register` operation of the edge function, clear `session_invalidated_at` after successfully registering a new session. This ensures freshly logged-in sessions aren't invalidated by old timestamps.

### Changes

**`src/hooks/useAuth.tsx`** — Replace `beforeunload` token-wipe with a safer init-time check:
- On mount, check if `taxforge-session-only` was set in a *previous* sessionStorage (it won't survive browser close). If sessionStorage is empty but localStorage has the auth token, it means the browser was closed and reopened — clear the token then.
- Remove the `beforeunload` listener entirely.

**`supabase/functions/manage-sessions/index.ts`** — In the `register` operation, after inserting/updating the session record, also clear `session_invalidated_at` on the profile so the new session won't be invalidated by stale timestamps.

### Files
- `src/hooks/useAuth.tsx` (1 file)
- `supabase/functions/manage-sessions/index.ts` (1 file)

