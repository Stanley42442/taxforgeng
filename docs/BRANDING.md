# TaxForge NG Branding Documentation

> **Last Updated:** January 2026  
> **Status:** Individual Operator (Pre-Registration)  
> **Audit Status:** ✅ Complete - Zero legacy branding issues

---

## Executive Summary

TaxForge NG is currently operated as an individual educational project by **Gillespie Benjamin Mclee** (OptiSolve Labs). This document serves as the single source of truth for:

1. Current branding configuration across all files
2. Standard branding elements (footers, disclaimers, sign-offs)
3. Complete file inventory for future rebranding
4. Step-by-step guide for business registration transition

---

## 1. Current Branding Configuration

### Core Constants

All branding originates from `src/lib/exportShared.ts`:

```typescript
export const COMPANY_INFO = {
  name: 'TaxForge NG',
  shortName: 'TaxForge NG',
  logoText: 'TF',
  operator: 'Gillespie Benjamin Mclee (OptiSolve Labs)',
  operatorShort: 'Gillespie Benjamin Mclee',
  location: 'Port Harcourt, Rivers State, Nigeria',
  email: 'support@taxforgeng.com',
  website: 'www.taxforgeng.com',
  liveUrl: 'https://taxforgeng.com',
} as const;
```

### Configuration Reference Table

| Element | Current Value | File Location |
|---------|---------------|---------------|
| Company Name | TaxForge NG | `src/lib/exportShared.ts:88` |
| Operator (Full) | Gillespie Benjamin Mclee (OptiSolve Labs) | `src/lib/exportShared.ts:91` |
| Operator (Short) | Gillespie Benjamin Mclee | `src/lib/exportShared.ts:92` |
| Location | Port Harcourt, Rivers State, Nigeria | `src/lib/exportShared.ts:93` |
| Support Email | support@taxforgeng.com | `src/lib/exportShared.ts:94` |
| Website | www.taxforgeng.com | `src/lib/exportShared.ts:95` |
| Live URL | https://taxforgeng.com | `src/lib/exportShared.ts:96` |

---

## 2. Standard Branding Elements

### Copyright Footer (All Emails & Exports)

```html
© {year} TaxForge NG | Operated by Gillespie Benjamin Mclee | Educational tool only
```

### Standard Disclaimer (PDFs)

```text
TaxForge NG is an educational and planning tool operated by Gillespie Benjamin Mclee 
as an individual project. All calculations are estimates based on user inputs and 
publicly available tax rules. Not official tax advice, filing, or legal service. 
Please consult a certified tax professional for official compliance. Operated in 
Port Harcourt, Rivers State, Nigeria.
```

### Email Sign-off (Transactional Emails)

```html
<p style="margin-top: 24px;">
  Best regards,<br>
  <strong>Gillespie Benjamin Mclee</strong><br>
  <span style="font-size: 14px; color: #6b7280;">Founder, TaxForge NG</span>
</p>
```

### Security Email Notification

```html
<p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
  This is an automated security notification from TaxForge NG, operated by 
  Gillespie Benjamin Mclee as an individual educational project.
</p>
```

---

## 3. Complete File Inventory

### Core Configuration Files (Update First)

| File | Branding Elements | Priority |
|------|-------------------|----------|
| `src/lib/exportShared.ts` | COMPANY_INFO constant, STANDARD_DISCLAIMER | 🔴 Critical |
| `src/hooks/usePaymentInvoice.ts` | businessOperator, businessEmail | 🔴 Critical |
| `src/pages/Terms.tsx` | Data Controller, DPO email | 🔴 Critical |

### Frontend Pages (13 files)

| File | Branding Elements |
|------|-------------------|
| `src/pages/Index.tsx` | Copyright footer |
| `src/pages/Pricing.tsx` | Copyright footer, contact email |
| `src/pages/Terms.tsx` | Data Controller, DPO email, privacy policy |
| `src/pages/CancelSubscription.tsx` | Support email |
| `src/components/NavMenu.tsx` | Brand name in navigation |
| `src/components/EmbeddableCalculator.tsx` | "Powered by TaxForge NG" link |
| `src/components/FeedbackForm.tsx` | Brand references |
| `src/components/ErrorBoundary.tsx` | Support email for error reports |
| `src/contexts/LanguageContext.tsx` | 5 language variants of copyright |

### PDF Export Files (7 files)

| File | Document Type | Uses COMPANY_INFO |
|------|---------------|-------------------|
| `src/lib/exportShared.ts` | Shared utilities | ✅ Source of truth |
| `src/lib/pdfExport.ts` | Company tax reports | ✅ |
| `src/lib/individualPdfExport.ts` | Individual tax reports | ✅ |
| `src/lib/businessReportPdf.ts` | Business summaries | ✅ |
| `src/lib/documentationPdf.ts` | Documentation exports | ✅ |
| `src/lib/taxLogicDocumentPdf.ts` | Tax logic reference | ✅ |
| `src/lib/invoicePdfExport.ts` | Payment invoices | ✅ |

### Edge Functions (14 email-sending functions)

| Function | Email Type | Footer Updated |
|----------|------------|----------------|
| `send-welcome-email` | New user welcome | ✅ |
| `send-trial-expiry-reminder` | Trial ending (2 days) | ✅ |
| `send-trial-final-reminder` | Trial ending (same day) | ✅ |
| `send-winback-email` | Re-engagement | ✅ |
| `send-tier-change-email` | Upgrade/downgrade confirmation | ✅ |
| `send-payment-confirmation` | Payment receipts | ✅ |
| `send-reminder-email` | Tax deadline reminders | ✅ |
| `send-scheduled-reports` | Scheduled financial summaries | ✅ |
| `send-report-email` | Shared reports | ✅ |
| `send-2fa-code` | 2FA verification codes | ✅ |
| `send-backup-code-alert` | Backup codes running low | ✅ |
| `send-security-alert` | Security notifications | ✅ |
| `check-reminders` | Automated reminder emails | ✅ |
| `send-whatsapp-notification` | WhatsApp messages | ✅ |

---

## 4. Future Business Registration Guide

When registering TaxForge NG as a Limited Liability Company, follow these steps:

### Step 1: Update Core Constants

**File:** `src/lib/exportShared.ts`

```typescript
export const COMPANY_INFO = {
  name: 'TaxForge NG',
  shortName: 'TaxForge NG',
  logoText: 'TF',
  operator: 'TaxForge Nigeria Limited',           // ← UPDATE
  operatorShort: 'TaxForge Nigeria Ltd',          // ← UPDATE
  tin: 'YOUR-NEW-TIN-NUMBER',                     // ← ADD
  rcNumber: 'RC-YOUR-NUMBER',                     // ← ADD
  address: 'Your registered business address',    // ← ADD
  location: 'Lagos, Nigeria',                     // ← UPDATE if needed
  email: 'support@taxforgeng.com',
  website: 'www.taxforgeng.com',
  liveUrl: 'https://taxforgeng.com',
} as const;
```

### Step 2: Update Invoice Export

**File:** `src/lib/invoicePdfExport.ts`

Add TIN and address lines to the FROM section:

```typescript
doc.text(data.businessName || COMPANY_INFO.name, margin + 8, y + 22);
doc.text(data.businessOperator || COMPANY_INFO.operator, margin + 8, y + 30);
doc.text(COMPANY_INFO.address, margin + 8, y + 38);  // ← ADD
doc.text(`TIN: ${COMPANY_INFO.tin}`, margin + 8, y + 46);  // ← ADD
doc.text(data.businessEmail || COMPANY_INFO.email, margin + 8, y + 54);
```

### Step 3: Update Payment Invoice Hook

**File:** `src/hooks/usePaymentInvoice.ts`

Add new fields to the invoice data:

```typescript
businessTIN: COMPANY_INFO.tin,       // ← ADD
businessAddress: COMPANY_INFO.address, // ← ADD
```

### Step 4: Update Terms Page

**File:** `src/pages/Terms.tsx`

Change Data Controller section:

```tsx
// FROM:
<p>TaxForge NG (Operated by Gillespie Benjamin Mclee)</p>

// TO:
<p>TaxForge Nigeria Limited</p>
<p>RC Number: {COMPANY_INFO.rcNumber}</p>
<p>TIN: {COMPANY_INFO.tin}</p>
```

### Step 5: Bulk Update Edge Functions

Search and replace across all edge functions:

| Find | Replace With |
|------|--------------|
| `Operated by Gillespie Benjamin Mclee` | `TaxForge Nigeria Limited` |
| `Gillespie Benjamin Mclee</strong>` | `The TaxForge Team</strong>` |
| `Founder, TaxForge NG` | `TaxForge Nigeria Limited` |

### Step 6: Update Email Sign-offs

**From (Individual):**
```html
<strong>Gillespie Benjamin Mclee</strong><br>
<span>Founder, TaxForge NG</span>
```

**To (Corporate):**
```html
<strong>The TaxForge Team</strong><br>
<span>TaxForge Nigeria Limited</span>
```

---

## 5. Email Configuration

### Current Status

| Setting | Value |
|---------|-------|
| Email Provider | Resend |
| From Address | `TaxForge NG <onboarding@resend.dev>` |
| Domain Status | Using Resend shared domain |
| External Emails | ❌ Not available (requires domain verification) |

### To Enable External Emails

1. Go to https://resend.com/domains
2. Add and verify `taxforgeng.com`
3. Update `from` addresses in all Edge Functions:

```typescript
// FROM:
from: "TaxForge NG <onboarding@resend.dev>"

// TO:
from: "TaxForge NG <noreply@taxforgeng.com>"
```

### Recommended Email Addresses After Domain Verification

| Purpose | Address |
|---------|---------|
| General Notifications | `noreply@taxforgeng.com` |
| Security Alerts | `security@taxforgeng.com` |
| Support | `support@taxforgeng.com` |
| Reports | `reports@taxforgeng.com` |

---

## 6. Verified Non-Branding Items

These items were audited and confirmed as **NOT branding issues**:

| Item | Location | Reason |
|------|----------|--------|
| `RC1234567` | EFiling.tsx, AuditLog.tsx | User's demo business data |
| `12345678-0001` | EmployeeDatabase.tsx | TIN format placeholder hint |
| `Victoria Island` | PersonalExpenses.tsx | Example expense location |
| `Limited Liability Company` | Multiple files | User's entity type option |
| `Corporate` tier | Subscription system | Tier name, not company name |

---

## 7. Audit Verification Patterns

### Legacy Patterns (All Should Return 0 Results)

```bash
# Run these searches to verify no legacy branding remains:
TaxNaija
TaxForge Nigeria Limited
Nigeria Limited
taxnaija\.lovable
The TaxForge.*Team
All rights reserved
© 2025
123 Tax Avenue
```

### Current Branding Patterns (Should Have Results)

```bash
# Run these to verify current branding is in place:
Gillespie Benjamin          # ~120 matches across 17 files
Operated by                  # ~119 matches across 19 files
Educational tool             # ~85 matches across 15 files
TaxForge NG                  # ~614 matches across 45 files
```

---

## 8. Test Email Results (January 2026)

| Email Type | Status | Resend Email ID |
|------------|--------|-----------------|
| Welcome Email | ✅ Sent | `84ce9608-523a-4785-8ce7-3bee737c2c1a` |
| Tier Change | ✅ Sent | `b711a8ba-7ccc-4020-a18a-af8c45be5744` |
| Tax Reminder | ✅ Sent | `18e3581c-7921-49e8-8bf4-5f24257faec8` |

**Test Recipient:** `optisolvelabs@gmail.com`

---

## 9. Quick Reference: Search & Replace Commands

When updating branding, use these search patterns:

### Individual → Corporate Transition

```bash
# Footer updates
FIND:    "Operated by Gillespie Benjamin Mclee"
REPLACE: "TaxForge Nigeria Limited"

# Sign-off updates
FIND:    "Gillespie Benjamin Mclee</strong>"
REPLACE: "The TaxForge Team</strong>"

# Role updates
FIND:    "Founder, TaxForge NG"
REPLACE: "TaxForge Nigeria Limited"

# Disclaimer updates
FIND:    "operated by Gillespie Benjamin Mclee as an individual project"
REPLACE: "operated by TaxForge Nigeria Limited"
```

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| Jan 2026 | Initial documentation created | System |
| Jan 2026 | Complete rebranding audit verified | System |
| Jan 2026 | All 14 edge functions updated | System |
| Jan 2026 | Test emails verified working | System |

---

*This document should be updated whenever branding changes are made to ensure consistency across the application.*
