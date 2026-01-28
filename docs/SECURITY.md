# TaxForge NG - Security Architecture

This document describes the security measures implemented in TaxForge NG.

---

## Table of Contents

1. [Row Level Security (RLS)](#row-level-security-rls)
2. [Authentication Flow](#authentication-flow)
3. [Session Management](#session-management)
4. [Data Protection](#data-protection)
5. [Security Functions](#security-functions)
6. [Intentional Permissive Policies](#intentional-permissive-policies)
7. [Known Accepted Risks](#known-accepted-risks)

---

## Row Level Security (RLS)

All tables have RLS enabled with user-scoped policies.

### User-Owned Tables

These tables use `auth.uid() = user_id` for all operations:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `businesses` | ✅ | ✅ | ✅ | ✅ |
| `expenses` | ✅ | ✅ | ✅ | ✅ |
| `invoices` | ✅ | ✅ | ✅ | ✅ |
| `clients` | ✅ | ✅ | ✅ | ✅ |
| `employees` | ✅ | ✅ | ✅ | ✅ |
| `reminders` | ✅ | ✅ | ✅ | ✅ |
| `tax_calculations` | ✅ | ✅ | ✅ | ✅ |
| `compliance_items` | ✅ | ✅ | ✅ | ✅ |
| `email_recipients` | ✅ | ✅ | ✅ | ✅ |
| `known_devices` | ✅ | ✅ | ✅ | ✅ |
| `ip_whitelist` | ✅ | ✅ | ✅ | ✅ |
| `time_restrictions` | ✅ | ✅ | ✅ | ✅ |
| `paystack_subscriptions` | ✅ | — | ✅ | — |

### Admin Tables

These tables have additional admin policies using `has_role(auth.uid(), 'admin')`:

| Table | User Access | Admin Access |
|-------|-------------|--------------|
| `paystack_subscriptions` | Own data | All data (SELECT) |
| `promo_codes` | — | Full CRUD |
| `subscription_history` | Own data | All data |

### Public Reference Tables

Read-only for all users:

| Table | Reason |
|-------|--------|
| `sector_presets` | Tax calculation reference data |
| `user_reviews` | Public testimonials (approved only) |
| `document_verifications` | QR code verification endpoint |

---

## Authentication Flow

### Sign Up
1. User submits email + password
2. Supabase creates auth.users record
3. `handle_new_user()` trigger creates profile + subscription
4. Welcome email sent via edge function
5. User redirected to dashboard

### Sign In
1. User submits credentials
2. Login attempt logged (success/failure)
3. Device fingerprint captured
4. IP geolocation checked
5. Time restrictions verified
6. New device alerts sent if applicable
7. Session created

### Security Checks on Login
- **Device blocking**: Known blocked devices rejected
- **IP whitelisting**: Optional per-user IP restrictions
- **Time restrictions**: Optional login time windows
- **Location alerts**: New country login notifications
- **Unusual time alerts**: Late night login warnings

---

## Session Management

### Token Handling
- JWT tokens stored in localStorage
- Automatic refresh before expiration
- Session-only mode (clear on browser close) supported

### Global Invalidation
Triggers for global token invalidation:
- Password change
- Email change
- Suspicious activity detected
- Manual "sign out all devices"

### Device Tracking
Each device login records:
- Browser and version
- Operating system
- Screen resolution
- Timezone and language
- IP address and geolocation

---

## Data Protection

### Offline Storage
- All offline data compressed with lz-string (~70% reduction)
- SHA-256 checksums on all stored records
- Automatic integrity verification
- Corrupted data quarantined for review

### Encryption
- All Supabase connections use TLS
- Passwords hashed with bcrypt (Supabase managed)
- API keys stored as hashed values

### Data Retention
- Calculations: 90 days default retention
- Expenses: 365 days archive
- Audit logs: Permanent
- Configurable per-user

---

## Security Functions

### Database Functions (SECURITY DEFINER)

| Function | Purpose |
|----------|---------|
| `has_role(user_id, role)` | Check if user has specific role |
| `handle_new_user()` | Create profile on signup |
| `check_ip_whitelist(user_id, ip)` | Verify IP against whitelist |
| `check_time_restrictions(user_id)` | Verify login time allowed |
| `rate_limit_check(identifier, endpoint)` | API rate limiting |

### Edge Functions

| Function | Security Measures |
|----------|-------------------|
| `paystack-webhook` | Signature verification |
| `payment-2fa` | OTP validation |
| `security-audit` | Admin-only access |
| `send-security-alert` | Rate limited |

---

## Intentional Permissive Policies

Some tables intentionally have permissive policies:

### `login_attempts` - INSERT `WITH CHECK (true)`
**Reason**: Login attempts must be logged BEFORE authentication succeeds. There's no authenticated user at this point, so we cannot scope to `auth.uid()`.

**Mitigation**: 
- No sensitive data stored
- Used for rate limiting and brute force detection
- SELECT restricted to own attempts only

### `document_verifications` - SELECT `USING (true)`
**Reason**: QR codes on generated documents link to public verification endpoint. Anyone with a document should be able to verify authenticity.

**Mitigation**:
- Only document hash and metadata exposed
- No user data in response
- Rate limited endpoint

### `sector_presets` - SELECT `USING (true)`
**Reason**: Tax calculation reference data is not sensitive and improves performance by caching.

**Mitigation**: Read-only data, no user information.

---

## Known Accepted Risks

### pg_net Extension Location
- **Issue**: Installed in `public` schema instead of dedicated schema
- **Risk Level**: LOW
- **Impact**: None - extension used for HTTP requests in edge functions
- **Mitigation**: Moving requires Supabase admin access and could break integrations

### React 18.3.1 Vulnerabilities
- **CVEs**: CVE-2024-53986, CVE-2024-53989, CVE-2024-53990
- **Risk Level**: NOT APPLICABLE
- **Reason**: All CVEs require user-controlled content in iframe `src` or `srcdoc` attributes
- **Status**: Application does NOT render iframes with user content
- **Plan**: Upgrade to React 19 when convenient (breaking change)

---

## Security Checklist

When adding new features, verify:

- [ ] Table has RLS enabled
- [ ] Policies scope to `auth.uid() = user_id`
- [ ] Sensitive operations have 2FA requirement
- [ ] Edge functions validate authentication
- [ ] Rate limiting applied where appropriate
- [ ] Audit logging for sensitive actions
- [ ] Error messages don't leak sensitive data
