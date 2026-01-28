
# TaxForge NG Extended Rebranding Plan

## Overview

This plan addresses **additional rebranding items** discovered after the initial PDF export rebranding was completed. These items span the main website pages, email templates (Edge Functions), and legal policies.

---

## Summary of Remaining Items

| Category | Files Affected | Issue |
|----------|----------------|-------|
| Legal/Privacy Policy | `src/pages/Terms.tsx` | "Data Controller: TaxForge Nigeria Limited" |
| Email Templates | 4 Edge Functions | "© TaxForge Nigeria Limited" and "The TaxForge NG Team" |
| Copyright Footers | 9 files | © 2025 should be © 2026 for consistency |
| Demo/Placeholder Data | `src/pages/EFiling.tsx` | Hardcoded TIN "12345678-0001" and RC "RC1234567" as demo data |

---

## Files to Modify

### 1. Terms & Privacy Policy Page
**File: `src/pages/Terms.tsx`**

**Current (line 308):**
```tsx
<p><strong>Data Controller:</strong> TaxForge Nigeria Limited</p>
```

**New:**
```tsx
<p><strong>Data Controller:</strong> TaxForge NG (Operated by Gillespie Benjamin Mclee)</p>
```

This change reflects individual operation for NDPA compliance without implying a registered company.

---

### 2. Email Template - Report Sharing
**File: `supabase/functions/send-report-email/index.ts`**

**Current (line 169):**
```typescript
© ${new Date().getFullYear()} TaxForge Nigeria Limited
```

**New:**
```typescript
© ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee
```

---

### 3. Email Template - Welcome Email
**File: `supabase/functions/send-welcome-email/index.ts`**

Update footer (line 141, 153):
```typescript
// Change "The TaxForge NG Team" to something more appropriate for individual:
<strong>Gillespie Benjamin Mclee</strong><br>
<span style="font-size: 14px;">Founder, TaxForge NG</span>

// Footer update:
© ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee | Educational tool only
```

---

### 4. Email Template - Trial Reminders
**Files:**
- `supabase/functions/send-trial-expiry-reminder/index.ts`
- `supabase/functions/send-trial-final-reminder/index.ts`

Update sign-off and footer in both:
```typescript
// Sign-off change from "The TaxForge NG Team":
<strong>Gillespie Benjamin Mclee</strong><br>
Founder, TaxForge NG

// Footer update:
© ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee | Educational tool only
```

---

### 5. Email Template - Win-back Email
**File: `supabase/functions/send-winback-email/index.ts`**

Same updates as above for sign-off and footer.

---

### 6. Copyright Year Updates (2025 → 2026)
These files should update copyright to 2026 for consistency:

| File | Line | Current | New |
|------|------|---------|-----|
| `src/pages/Index.tsx` | 268 | © 2025 TaxForge NG | © 2026 TaxForge NG |
| `src/pages/Pricing.tsx` | 601 | © 2025 TaxForge NG | © 2026 TaxForge NG |
| `src/contexts/LanguageContext.tsx` | 1977 | © 2025 TaxForge NG | © 2026 TaxForge NG |

**Note:** Edge Function email templates use `new Date().getFullYear()` which is correct (dynamic).

---

### 7. Demo Data Clarification
**File: `src/pages/EFiling.tsx` (lines 198-203)**

The TIN `12345678-0001` and RC `RC1234567` shown here are **demo/placeholder data** for the user's own business preview - these are NOT TaxForge's identifiers. **No change needed** as this is clearly in a "Business Information" section showing the user's selected business details.

Similarly, `src/components/EmployeeDatabase.tsx` uses `12345678-0001` as a placeholder hint - this is acceptable as it's a format example for users.

---

## Items to Keep Unchanged

These items are **correctly branded** and require no changes:

| Item | Reason |
|------|--------|
| `index.html` meta tags | Uses "TaxForge NG" - correct |
| `public/manifest.json` | Uses "TaxForge NG" - correct |
| SEO keywords "limited liability company Nigeria" | Refers to user's business type, not TaxForge |
| `LanguageContext.tsx` advisory translations | Refers to user's business structure options, not TaxForge |
| "The TaxForge NG Team" → convert to individual | Address in emails |

---

## Standard Branding to Apply

### Email Sign-off (replaces "The TaxForge NG Team"):
```html
<strong>Gillespie Benjamin Mclee</strong><br>
Founder, TaxForge NG
```

### Email Footer (all transactional emails):
```html
© {year} TaxForge NG | Operated by Gillespie Benjamin Mclee | Educational tool only
```

### Legal/Privacy Data Controller:
```
TaxForge NG (Operated by Gillespie Benjamin Mclee)
Email: privacy@taxforgeng.com
```

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/pages/Terms.tsx` | Update Data Controller from "TaxForge Nigeria Limited" |
| `supabase/functions/send-report-email/index.ts` | Update footer from "TaxForge Nigeria Limited" |
| `supabase/functions/send-welcome-email/index.ts` | Update sign-off and footer |
| `supabase/functions/send-trial-expiry-reminder/index.ts` | Update sign-off and footer |
| `supabase/functions/send-trial-final-reminder/index.ts` | Update sign-off and footer |
| `supabase/functions/send-winback-email/index.ts` | Update sign-off and footer |
| `src/pages/Index.tsx` | Update © 2025 → © 2026 |
| `src/pages/Pricing.tsx` | Update © 2025 → © 2026 |
| `src/contexts/LanguageContext.tsx` | Update © 2025 → © 2026 (all 5 language variants) |

---

## Technical Notes

1. **Edge Functions**: After updating email templates, they will be auto-deployed. All email recipients will see the updated branding immediately.

2. **Privacy Compliance**: The Data Controller field in Terms.tsx must identify who controls user data. "Operated by Gillespie Benjamin Mclee" satisfies NDPA requirements for individual operators.

3. **Copyright Year**: Using 2026 matches the current date and the PDF exports. All customer-facing copyright notices will be consistent.

4. **Email Warmth**: Changing from "The TaxForge NG Team" to personal sign-off ("Gillespie Benjamin Mclee, Founder") can actually increase trust and connection with users - many successful SaaS products use founder-signed emails.

---

## Verification Checklist

After implementation, verify:
- [ ] Terms page shows individual operator
- [ ] Welcome email shows personal sign-off
- [ ] Trial reminder emails updated
- [ ] Report sharing emails updated
- [ ] Win-back emails updated
- [ ] Homepage footer shows © 2026
- [ ] Pricing page shows © 2026
- [ ] All language variants updated
