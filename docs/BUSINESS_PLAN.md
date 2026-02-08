# TaxForge NG - Business Plan

**Version:** 1.0  
**Date:** February 2026  
**Status:** Pre-Launch / Early Development

---

## Disclaimer

This document contains factual information about the TaxForge NG platform. All statistics are either:
1. **Verified from the platform database** (clearly marked)
2. **Cited from official government sources** (with attribution)
3. **Clearly labeled as estimates** (where applicable)

No exaggerated or unverified claims are made in this document.

---

## 1. Executive Summary

### Company Overview

| Attribute | Value |
|-----------|-------|
| **Product Name** | TaxForge NG |
| **Operator** | Gillespie Benjamin Mclee (OptiSolve Labs) |
| **Location** | Port Harcourt, Rivers State, Nigeria |
| **Status** | Individual educational project (pre-registration) |
| **Website** | taxforgeng.com |

### Mission Statement

To provide accessible, accurate, and affordable tax calculation tools for Nigerian businesses and individuals navigating the Nigeria Tax Act 2025 reforms.

### The Opportunity

The Nigeria Tax Act 2025, effective January 1, 2026, introduces significant changes to the Nigerian tax system. These reforms create confusion among the 41.5 million MSMEs in Nigeria (SMEDAN/NBS 2017). TaxForge NG addresses this gap by providing free, accurate calculation tools updated for the 2026 tax rules.

### Current Stage

The platform is in **early development/testing phase**. Traction metrics reflect initial testing and early adopters, not scaled commercial usage.

---

## 2. Problem Statement

### The Nigerian Tax Landscape

Nigeria's tax system has undergone its most significant reform in decades with the Nigeria Tax Act 2025. Key changes include:

| Pre-2026 Rule | 2026 Rule | Impact |
|---------------|-----------|--------|
| 7% tax from ₦1 | Tax-free threshold ₦800,000 | Low earners now exempt |
| Maximum 24% above ₦3.2M | Maximum 25% above ₦50M | Expanded brackets |
| CRA-based reliefs | ₦800K relief + Rent Relief | Simplified system |
| 30% CIT for all companies | 0% for small companies | MSME relief |

### Market Pain Points

1. **Complexity**: New tax rules are not widely understood
2. **Cost**: Professional tax consultations cost ₦50,000+ per session
3. **Accessibility**: No major Nigerian tax calculator is updated for 2026
4. **Language**: Most tools only support English

### Target Market Size (Verified)

According to the **SMEDAN/NBS National Survey 2017** (most recent comprehensive survey):

| Category | Count | Percentage |
|----------|-------|------------|
| Micro Enterprises | 41,469,947 | 99.82% |
| Small Enterprises | 71,288 | 0.17% |
| Medium Enterprises | 1,793 | 0.004% |
| **Total MSMEs** | **41,543,028** | 100% |

*Source: Small and Medium Enterprises Development Agency of Nigeria (SMEDAN) and National Bureau of Statistics (NBS) National Survey of Micro Small & Medium Enterprises (MSMEs) 2017*

---

## 3. Solution: TaxForge NG

### Platform Overview

TaxForge NG is a web-based tax calculation platform with the following characteristics:

- **Free Tier**: Instant calculations without signup
- **Progressive Web App**: Works offline on mobile devices
- **Multi-Language**: English and Hausa support
- **FIRS-Compliant**: Calculations cross-referenced with Big 4 publications

### Free Public Resources

Five SEO landing pages provide free value without registration:

| Page | URL | Purpose |
|------|-----|---------|
| Free Tax Calculator | `/free-tax-calculator` | Instant PIT calculation |
| Small Company Exemption | `/small-company-exemption` | CIT eligibility check |
| Rent Relief 2026 | `/rent-relief-2026` | New rent relief calculator |
| PIT/PAYE Calculator | `/pit-paye-calculator` | Employment tax calculation |
| Tax Reforms 2026 | `/tax-reforms-2026` | Comprehensive reform guide |

### Calculation Accuracy

All calculations are verified against:
- Nigeria Tax Act 2025 (official text)
- PwC Nigeria Tax Guide
- KPMG Tax Card
- EY Tax Insights
- Deloitte Tax Updates

A verification badge confirms accuracy on all calculation results.

---

## 4. Product Features

### Subscription Tiers (Verified from Codebase)

#### Free Tier (₦0)
- Personal Tax Calculator (PIT)
- Crypto & Investment Tax Calculator
- Foreign Income / DTT Credits
- 5 AI Tax Assistant queries per month

#### Starter Tier (₦500/month or ₦5,000/year)
- All Free features
- Business Tax Calculator (CIT, VAT, WHT)
- PDF and CSV Export
- Tax Deadline Reminders
- 1 Saved Business Profile
- 20 AI queries per month
- Basic Expense Tracking

#### Basic Tier (₦2,000/month or ₦20,000/year)
- All Starter features
- Invoice Generation
- Profit & Loss Statement
- Sector-Specific Tax Presets
- OCR Receipt Scanner
- 2 Saved Businesses
- 75 AI queries per month

#### Professional Tier (₦4,999/month or ₦49,990/year)
- All Basic features
- Payroll Calculator (10 employees)
- Digital VAT Calculator
- Compliance Tracker
- Basic Scenario Modeling
- 5 Saved Businesses
- 100 AI queries per month
- Priority Support

#### Business Tier (₦8,999/month or ₦89,990/year)
- All Professional features
- CAC Verification (Automated)
- Tax Filing Preparation
- Multi-Year Projection
- Advanced Scenario Modeling
- 10 Saved Businesses
- 2 User Seats
- Unlimited AI queries

### Annual Billing Discount

All tiers offer approximately 17% savings with annual billing:

```
┌─────────────────┬──────────┬──────────┬──────────┐
│ Tier            │ Monthly  │ Annually │ Savings  │
├─────────────────┼──────────┼──────────┼──────────┤
│ Starter         │ ₦500     │ ₦5,000   │ ₦1,000   │
│ Basic           │ ₦2,000   │ ₦20,000  │ ₦4,000   │
│ Professional    │ ₦4,999   │ ₦49,990  │ ₦9,998   │
│ Business        │ ₦8,999   │ ₦89,990  │ ₦17,998  │
└─────────────────┴──────────┴──────────┴──────────┘
```

---

## 5. Technology Architecture

### Tech Stack (Verified from Codebase)

| Layer | Technology |
|-------|------------|
| Frontend | React 18.3.1, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Framer Motion |
| State Management | React Context, TanStack Query |
| Backend | Lovable Cloud (PostgreSQL, Auth, Edge Functions) |
| PWA | VitePWA, IndexedDB, Service Worker |
| Payments | Paystack |
| PDF Generation | jsPDF |
| OCR | Tesseract.js |

### Backend Functions (32 Edge Functions)

| Category | Count | Examples |
|----------|-------|----------|
| Payment Processing | 6 | paystack-initialize, paystack-verify, payment-2fa |
| Email Notifications | 14 | send-welcome-email, send-reminder-email, send-security-alert |
| AI/Insights | 3 | tax-assistant, categorize-expense, expense-insights |
| Security | 4 | detect-suspicious-activity, security-audit, manage-sessions |
| Utilities | 5 | check-reminders, cleanup-logs, get-ip-location |

### Security Architecture

- **Row Level Security (RLS)**: All user tables protected
- **2FA for Payments**: OTP verification for sensitive operations
- **Device Fingerprinting**: Known device tracking
- **Session Management**: Global token invalidation capability
- **Data Integrity**: SHA-256 checksums for offline data
- **Compliance**: NDPA 2023 (Nigeria Data Protection Act)

### Offline Capabilities

The platform functions as a Progressive Web App (PWA):
- Installable on mobile devices
- Works without internet connection
- Automatic sync when connection restored
- Data compressed using lz-string (~70% reduction)

---

## 6. Current Traction

### Platform Statistics (Verified from Database)

*Data as of document creation date*

| Metric | Value | Assessment |
|--------|-------|------------|
| Registered Users | 4 | Early stage |
| Businesses Created | 4 | Early stage |
| Tax Calculations | 40 | Active testing |
| Expenses Tracked | 75 | Feature usage |
| Individual Calculations | 2 | Growing |
| AI Queries | 4 | Feature adoption |
| Invoices Generated | 1 | Early adoption |

### Honest Assessment

The platform is currently in **early development and testing phase**. The metrics above reflect:
- Initial development testing
- Early adopter experimentation
- Feature validation

These are **not** indicators of commercial traction or market validation at scale.

---

## 7. Revenue Model

### Primary Revenue: SaaS Subscriptions

Revenue is generated through monthly and annual subscription plans ranging from ₦500 to ₦8,999 per month.

### Secondary Revenue Streams (Implemented)

1. **Promo Code System**: Discount codes for marketing campaigns
2. **Loyalty Points Program**: Points earned for platform activity, redeemable for discounts
3. **Referral Program**: Incentives for user referrals

### Future Revenue Opportunities (Not Yet Implemented)

- Corporate/Enterprise custom plans
- White-label API for partners
- Accountant portal subscriptions
- Premium support packages

---

## 8. Go-to-Market Strategy

### SEO-First Approach

The platform prioritizes organic search acquisition through:

1. **Landing Pages**: 5 high-intent pages targeting 2026 tax reform searches
2. **Structured Data**: JSON-LD schema for WebApplication, Article, and FAQPage
3. **Sitemap Priority**: Tax reform pages set to 1.0 priority
4. **AI Discoverability**: llms.txt and llms-full.txt files for AI crawlers

### Content Marketing

| Resource | Location | Purpose |
|----------|----------|---------|
| Interactive Documentation | `/documentation` | Live platform stats |
| Tax Logic Reference | `/tax-logic` | Rule explanations |
| llms-full.txt | `/llms-full.txt` | AI context |

### Target Keywords

- "Nigeria tax calculator 2026"
- "PIT calculator Nigeria"
- "Small company exemption Nigeria"
- "Rent relief tax Nigeria"
- "PAYE calculator Nigeria 2026"

---

## 9. Competitive Positioning

### Feature Comparison

| Feature | TaxForge NG | Typical Competitors |
|---------|-------------|---------------------|
| 2026 Tax Rules | ✓ Full support | Limited or none |
| Free Calculator | ✓ No signup required | Signup required |
| Offline Support | ✓ PWA enabled | Online only |
| Multi-language | ✓ English + Hausa | English only |
| Calculation Verification | ✓ Big 4 cross-referenced | Unverified |
| PDF with QR Verification | ✓ Professional tier | Rare |

### Unique Value Propositions

1. **First-mover on 2026 rules**: Platform built specifically for Nigeria Tax Act 2025
2. **Free tier with no friction**: Instant calculations without account creation
3. **Verified accuracy**: Cross-referenced with PwC, KPMG, EY, Deloitte publications
4. **Offline capability**: Critical for Nigerian connectivity challenges

---

## 10. Legal & Compliance

### Current Status

| Attribute | Value |
|-----------|-------|
| Legal Entity | Individual project (not incorporated) |
| Operator | Gillespie Benjamin Mclee |
| Trading Name | OptiSolve Labs |
| Location | Port Harcourt, Rivers State, Nigeria |

### Disclaimers

All platform outputs include the following disclaimer:

> "TaxForge NG is an educational and planning tool operated by Gillespie Benjamin Mclee as an individual project. All calculations are estimates for planning purposes only and do not constitute official tax advice, tax filing services, or legal services."

### Data Protection

The platform is designed for compliance with the **Nigeria Data Protection Act 2023 (NDPA)**:

- Privacy policy identifying data controller
- Lawful basis for processing documented
- 72-hour breach notification commitment
- User rights (access, rectification, erasure) supported

### Future Registration

A path to LLC registration is documented, to be executed when platform reaches commercial viability.

---

## 11. Risk Analysis

### Identified Risks

| Risk Category | Description | Mitigation |
|---------------|-------------|------------|
| Regulatory | FIRS rules may change | Modular tax rules engine allows rapid updates |
| Competition | Larger players may enter market | First-mover advantage, niche focus |
| Technology | Supabase dependency | Standard PostgreSQL, exportable data |
| Adoption | Low awareness of platform | SEO strategy, free tier reduces barrier |

### Limitations

1. **Not a registered company**: Individual project status limits certain B2B opportunities
2. **Early stage**: Limited traction data for validation
3. **Single operator**: Bus factor risk, limited support capacity

---

## 12. Future Roadmap

### Planned Enhancements (From ENHANCEMENTS.md)

#### Phase 1: Infrastructure
- Automated cleanup cron jobs
- Real-time error streaming
- Error grouping and deduplication
- Performance budget alerts

#### Phase 2: Features
- Enhanced AI categorization
- Bulk operations
- Advanced reporting

### Proposed Future Work

- User session recording for UX improvement
- A/B testing infrastructure
- Synthetic monitoring
- Mobile app (React Native)
- Direct e-Filing integration with FIRS

---

## 13. Financial Projections

### Important Disclaimer

The following projections are **hypothetical scenarios only**. They are not predictions or guarantees. Actual results will depend entirely on market execution, adoption rates, and numerous other factors.

### Scenario Modeling

#### Conservative Scenario (Year 1)
- 500 paying users at Starter tier average
- Monthly Revenue: ₦250,000
- Annual Revenue: ₦3,000,000

#### Moderate Scenario (Year 1)
- 2,000 paying users across mixed tiers
- Average Revenue Per User: ₦1,000/month
- Monthly Revenue: ₦2,000,000
- Annual Revenue: ₦24,000,000

#### Aggressive Scenario (Year 1)
- 5,000 paying users
- Higher tier distribution
- Monthly Revenue: ₦7,500,000
- Annual Revenue: ₦90,000,000

*These scenarios are for illustrative purposes only. No investment decisions should be based on these projections.*

---

## 14. Summary

### What TaxForge NG Is

- A tax calculation platform for Nigerian businesses and individuals
- Updated for Nigeria Tax Act 2025 (2026 rules)
- Offers free tier with no signup required
- Provides verified, accurate calculations

### Current Reality

- Early development/testing phase
- 4 registered users
- Individual project (not incorporated)
- Seeking product-market fit

### The Opportunity

- 41.5 million MSMEs need tax compliance tools
- 2026 tax reforms create immediate demand
- First-mover advantage on new rules
- Scalable SaaS model

---

## Appendices

### A. Tax Rules Quick Reference

#### Personal Income Tax (PIT) Bands - 2026

| Income Range | Rate |
|--------------|------|
| ₦0 - ₦800,000 | 0% (Tax-free threshold) |
| ₦800,001 - ₦2,800,000 | 15% |
| ₦2,800,001 - ₦5,800,000 | 18% |
| ₦5,800,001 - ₦10,800,000 | 21% |
| ₦10,800,001 - ₦50,000,000 | 23% |
| Above ₦50,000,000 | 25% |

#### Corporate Income Tax (CIT) - 2026

| Company Classification | Turnover | CIT Rate |
|----------------------|----------|----------|
| Small Company | ≤ ₦50M AND Assets ≤ ₦250M | 0% |
| Medium Company | > ₦50M to ₦200M | 20% |
| Large Company | > ₦200M | 30% |

#### Other Key Rates - 2026

| Tax Type | Rate |
|----------|------|
| VAT | 7.5% |
| Withholding Tax (Services) | 10% |
| Development Levy | 4% |
| Rent Relief | 20% of rent (max ₦500,000) |

### B. Contact Information

| Purpose | Contact |
|---------|---------|
| General Inquiries | hello@taxforgeng.com |
| Privacy Concerns | privacy@taxforgeng.com |
| Technical Support | support@taxforgeng.com |

---

*Document Version: 1.0*  
*Last Updated: February 2026*  
*All data verified at time of writing*
