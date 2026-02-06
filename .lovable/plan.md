
# Fix Remaining Old URL Instance

## Issue Identified

The screenshot shows a PDF with the old URL `https://taxforgeng.lovable.app`. After investigation:

1. **The main code is already updated correctly** - `src/lib/exportShared.ts` now has `liveUrl: 'https://taxforgeng.com'`
2. **The PDF in your screenshot was generated before the deployment** - You need to regenerate the PDF to see the new URL
3. **One remaining file still has the old URL** - A test file that needs updating

## Remaining Change

### File: `src/__tests__/e2e/payment.e2e.test.ts` (Line 74)

Update the test callback URL:

```typescript
// BEFORE
callback_url: 'https://taxforgeng.lovable.app/payment-callback',

// AFTER
callback_url: 'https://taxforgeng.com/payment-callback',
```

## Verification Steps

After the fix is deployed:

1. Go to the Documentation page (`/documentation`)
2. Click "Export PDF" to generate a new PDF
3. The new PDF should show `Live URL: https://taxforgeng.com`
4. The QR code will also link to `https://taxforgeng.com`

## Summary

| Category | Status |
|----------|--------|
| Core Config (`exportShared.ts`) | Already Fixed |
| Documentation Page | Already Fixed |
| Edge Functions (10 files) | Already Fixed |
| Branding Docs | Already Fixed |
| Test file (`payment.e2e.test.ts`) | Needs Fix |

The PDF you're viewing was generated before the deployment. Regenerating it will show the correct `.com` URL.
