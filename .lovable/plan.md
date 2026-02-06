
# Update Live URLs from .lovable.app to .com

## Summary

Change all occurrences of `.lovable.app` URLs to `taxforgeng.com` across the documentation page, exports, QR codes, and edge function email templates.

## Files to Update

### 1. Core Configuration (Source of Truth)

**File: `src/lib/exportShared.ts` (Line 96)**
- Change `liveUrl` from `https://taxforgeng.lovable.app` to `https://taxforgeng.com`
- This automatically updates all PDF exports and QR codes that reference `COMPANY_INFO.liveUrl`

### 2. Documentation Page

**File: `src/pages/Documentation.tsx`**
- Line 239: Change `https://taxforgeng.lovable.app` to `https://taxforgeng.com`
- Line 724: Change `https://taxforgeng.lovable.app` to `https://taxforgeng.com`

### 3. Edge Functions (Email Templates)

These have hardcoded URLs that need updating:

| File | Line | Current URL | New URL |
|------|------|-------------|---------|
| `send-payment-confirmation/index.ts` | 102 | `taxforgeng.lovable.app/dashboard` | `taxforgeng.com/dashboard` |
| `send-reminder-email/index.ts` | 79 | `taxforgeng.lovable.app` | `taxforgeng.com` |
| `send-scheduled-reports/index.ts` | 215, 225 | `taxforgeng.lovable.app/dashboard`, `/settings` | `taxforgeng.com/...` |
| `send-tier-change-email/index.ts` | 91, 135 | `taxforgeng.lovable.app/dashboard`, `/pricing` | `taxforgeng.com/...` |
| `send-report-email/index.ts` | 176 | `taxforgeng.lovable.app` | `taxforgeng.com` |
| `send-welcome-email/index.ts` | 117 | `taxforge.lovable.app/dashboard` | `taxforgeng.com/dashboard` |
| `send-winback-email/index.ts` | 150 | `taxforge.lovable.app/pricing` | `taxforgeng.com/pricing` |
| `send-trial-expiry-reminder/index.ts` | 155 | `taxforge.lovable.app/pricing` | `taxforgeng.com/pricing` |
| `send-trial-final-reminder/index.ts` | 139 | `taxforge.lovable.app/pricing` | `taxforgeng.com/pricing` |
| `check-reminders/index.ts` | 269 | `taxforge.lovable.app` | `taxforgeng.com` |

### 4. Branding Documentation Update

**File: `docs/BRANDING.md`**
- Update the example `liveUrl` value from `https://taxforgeng.lovable.app` to `https://taxforgeng.com` in both the code block (line 36) and the reference table (line 50)

## Technical Details

### QR Code Impact
The following files generate QR codes using `COMPANY_INFO.liveUrl`:
- `src/lib/documentationPdf.ts` (Line 181) - Documentation export QR
- `src/lib/taxLogicDocumentPdf.ts` (Line 224) - Tax Logic reference QR

These will automatically use the new `.com` URL after updating `exportShared.ts`.

### ICS Calendar Export
- `src/lib/taxCalendarExport.ts` (Line 49) - Uses `COMPANY_INFO.liveUrl` for calendar event descriptions

This will also automatically update.

## Summary of Changes

| Category | Files | Changes |
|----------|-------|---------|
| Core Config | 1 | Update `liveUrl` constant |
| Frontend | 1 | 2 hardcoded URLs in Documentation page |
| Edge Functions | 10 | ~15 hardcoded URLs in email templates |
| Documentation | 1 | Update BRANDING.md examples |

**Total: 13 files, ~19 URL changes**
