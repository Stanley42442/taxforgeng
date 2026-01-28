

# Additional Rebranding Fixes Required

## Summary

My comprehensive audit using 15+ search patterns and browser testing revealed **6 more edge functions** that still need rebranding updates. The main application UI and PDF exports are correctly branded, but some email templates still use outdated branding.

---

## Items Verified Working ✅

| Item | Status |
|------|--------|
| Terms Page Data Controller | "TaxForge NG (Operated by Gillespie Benjamin Mclee)" ✓ |
| Homepage Footer | "© 2026 TaxForge NG. For educational purposes." ✓ |
| PDF Exports | Using correct `COMPANY_INFO` from `exportShared.ts` ✓ |
| Welcome Email | Personal sign-off + updated footer ✓ |
| Trial Reminders | Updated ✓ |
| Win-back Email | Updated ✓ |
| Payment Confirmation | Updated ✓ |
| Report Email | Updated ✓ |

---

## Additional Updates Required

### 1. send-2fa-code (Line 74)
**File:** `supabase/functions/send-2fa-code/index.ts`

**Current:**
```html
<p>© ${new Date().getFullYear()} TaxForge NG. All rights reserved.</p>
```

**Updated:**
```html
<p>© ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee | Educational tool only</p>
```

---

### 2. send-tier-change-email (Lines 98, 142)
**File:** `supabase/functions/send-tier-change-email/index.ts`

Same footer updates as above (appears twice - upgrade and downgrade templates).

---

### 3. send-reminder-email (Multiple Issues)
**File:** `supabase/functions/send-reminder-email/index.ts`

**Issues:**
- Line 33: `from: "TaxNaija"` → `from: "TaxForge NG"`
- Line 79: URL `taxnaija.lovable.app` → `taxforgeng.lovable.app`
- Line 85: Text `TaxNaija` → `TaxForge NG`

This is legacy branding from before the rename.

---

### 4. send-scheduled-reports (Multiple Issues)
**File:** `supabase/functions/send-scheduled-reports/index.ts`

**Issues:**
- Line 145: `from: "TaxForge"` → `from: "TaxForge NG"`
- Line 215: URL `taxnaija.lovable.app` → `taxforgeng.lovable.app`
- Line 223: Text reference
- Line 225: URL `taxnaija.lovable.app` → `taxforgeng.lovable.app`

---

### 5. send-backup-code-alert (Optional Enhancement)
**File:** `supabase/functions/send-backup-code-alert/index.ts`

**Current (Line 73):**
```html
This is an automated security notification from TaxForge NG.
```

**Enhancement (optional but recommended):**
Add footer with operator info for consistency.

---

### 6. send-security-alert (Optional Enhancement)
**File:** `supabase/functions/send-security-alert/index.ts`

**Current (Line 549):**
```html
This is an automated security notification from TaxForge NG.
```

**Enhancement (optional but recommended):**
Add footer with operator info for consistency.

---

## Unchanged Items (Verified Correct)

| Item | Reason |
|------|--------|
| Demo TIN `12345678-0001` in EFiling.tsx | User's business placeholder |
| Demo RC `RC1234567` in EFiling.tsx | User's business placeholder |
| "Victoria Island" in PersonalExpenses.tsx | Example expense location |
| "Limited Liability Company" references | User's entity type options |
| "Corporate" tier | Subscription tier name |

---

## Email Test Result

The welcome email test to `benjamingillespie001@gmail.com` failed due to Resend domain verification requirements:

```
"You can only send testing emails to your own email address (optisolvelabs@gmail.com)"
```

**Action Required:** Verify a domain at resend.com/domains to send emails to external recipients.

---

## Files to Modify

| File | Change Type |
|------|-------------|
| `supabase/functions/send-2fa-code/index.ts` | Update footer |
| `supabase/functions/send-tier-change-email/index.ts` | Update footer (2 places) |
| `supabase/functions/send-reminder-email/index.ts` | Fix TaxNaija → TaxForge NG |
| `supabase/functions/send-scheduled-reports/index.ts` | Fix TaxNaija URLs and naming |
| `supabase/functions/send-backup-code-alert/index.ts` | Optional: Add operator footer |
| `supabase/functions/send-security-alert/index.ts` | Optional: Add operator footer |

---

## Technical Notes

1. **Edge Functions Will Auto-Deploy:** After updating, the edge functions will be deployed automatically.

2. **Resend Domain Setup:** To test emails externally, verify a domain at resend.com/domains and update the `from` addresses.

3. **No Breaking Changes:** All changes are cosmetic text updates with no functional impact.

4. **PDF Testing:** Browser navigation to the Calculator page was blocked by a loading issue. Once the app builds correctly, PDF generation can be tested from the Calculator or Invoice pages.

