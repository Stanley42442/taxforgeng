
# Update Live URLs from .lovable.app to .com

## ✅ COMPLETED

All URLs have been updated from `.lovable.app` to `taxforgeng.com`.

## Files Updated

### 1. Core Configuration (Source of Truth)
- ✅ `src/lib/exportShared.ts` - Updated `liveUrl` to `https://taxforgeng.com`

### 2. Documentation Page
- ✅ `src/pages/Documentation.tsx` (Line 239) - Visit Live Site button
- ✅ `src/pages/Documentation.tsx` (Line 724) - Visit TaxForge NG link

### 3. Edge Functions (Email Templates)
- ✅ `send-payment-confirmation/index.ts` - Dashboard link
- ✅ `send-reminder-email/index.ts` - Go to Dashboard link
- ✅ `send-scheduled-reports/index.ts` - Dashboard and Settings links
- ✅ `send-tier-change-email/index.ts` - Dashboard and Pricing links
- ✅ `send-report-email/index.ts` - Visit TaxForge NG link
- ✅ `send-welcome-email/index.ts` - Dashboard link
- ✅ `send-winback-email/index.ts` - Pricing link
- ✅ `send-trial-expiry-reminder/index.ts` - Pricing link
- ✅ `send-trial-final-reminder/index.ts` - Pricing link
- ✅ `check-reminders/index.ts` - App URL constant

### 4. Branding Documentation
- ✅ `docs/BRANDING.md` - Updated example `liveUrl` value in code blocks and reference table

## Automatic Updates (via COMPANY_INFO.liveUrl)
The following files automatically use the new `.com` URL:
- `src/lib/documentationPdf.ts` - Documentation export QR code
- `src/lib/taxLogicDocumentPdf.ts` - Tax Logic reference QR code
- `src/lib/taxCalendarExport.ts` - ICS calendar export

**Total: 13 files, 18 URL changes completed**
