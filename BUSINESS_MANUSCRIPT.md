# TaxForge NG — Business Manuscript

## Comprehensive Product Documentation

**Version:** 1.0  
**Last Updated:** January 2026  
**Classification:** Internal / Business Use

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Target Market & User Personas](#3-target-market--user-personas)
4. [Core Features & Functionality](#4-core-features--functionality)
5. [Technical Architecture](#5-technical-architecture)
6. [Tax Calculation Logic](#6-tax-calculation-logic)
7. [Subscription Tiers & Monetization](#7-subscription-tiers--monetization)
8. [User Journey & Workflows](#8-user-journey--workflows)
9. [Data Security & Compliance](#9-data-security--compliance)
10. [Integration Capabilities](#10-integration-capabilities)
11. [Roadmap & Future Development](#11-roadmap--future-development)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

### 1.1 Mission Statement

TaxForge NG is a comprehensive Nigerian tax management platform designed to democratize tax compliance for small and medium-sized businesses, freelancers, and individual professionals. Our mission is to transform complex Nigerian tax obligations into simple, actionable insights that empower business owners to make informed financial decisions.

### 1.2 Value Proposition

- **Accuracy**: FIRS-compliant calculations supporting both pre-2026 and Nigeria Tax Act 2025 (2026+) rules
- **Accessibility**: Free tier provides unlimited tax calculations to all users
- **Simplicity**: Complex tax law translated into plain language recommendations
- **Automation**: Deadline reminders, expense tracking, and filing preparation tools
- **Intelligence**: Personalized advisory based on business structure and financial profile

### 1.3 Key Differentiators

| Feature | TaxForge NG | Competitors |
|---------|-------------|-------------|
| 2026 Tax Reform Support | ✓ Full | Limited/None |
| Business Structure Advisory | ✓ Interactive | Static content |
| Free Unlimited Calculations | ✓ Yes | Usually limited |
| Local Currency (NGN) | ✓ Native | Often USD-based |
| Small Company Detection | ✓ Automatic | Manual |
| FIRS Form Generation | ✓ Pre-filled | Generic templates |

---

## 2. Product Overview

### 2.1 Platform Description

TaxForge NG is a web-based Software-as-a-Service (SaaS) application built on modern cloud infrastructure. The platform serves as a comprehensive tax management solution encompassing:

1. **Tax Calculator** — Multi-tax computation engine (CIT, PIT, VAT, CGT, WHT)
2. **Business Advisory** — Interactive questionnaire recommending optimal business structure
3. **Expense Tracker** — Income and expense ledger with deductible categorization
4. **Reminder System** — Automated tax deadline notifications (email + push)
5. **Filing Preparation** — Pre-filled FIRS forms for TaxProMax submission
6. **Learning Center** — Educational resources on Nigerian tax law
7. **Scenario Modeling** — What-if analysis for tax optimization
8. **Business Management** — CAC verification and multi-entity support

### 2.2 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui components |
| State Management | React Context, TanStack Query |
| Backend | Supabase (Lovable Cloud) |
| Database | PostgreSQL with Row-Level Security |
| Authentication | Supabase Auth (Email/Password) |
| Edge Functions | Deno (Supabase Edge Functions) |
| AI Integration | Lovable AI (Gemini/GPT models) |
| PDF Generation | jsPDF |
| Charts | Recharts |

### 2.3 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│                 (React SPA - Vite)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Lovable Cloud / Supabase                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Auth      │  │  Database   │  │  Edge Functions     │ │
│  │  Service    │  │ PostgreSQL  │  │  (Deno Runtime)     │ │
│  │             │  │    + RLS    │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Edge Functions                          │   │
│  │  • tax-assistant (AI chatbot)                       │   │
│  │  • check-reminders (cron job)                       │   │
│  │  • send-reminder-email (Resend integration)         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Target Market & User Personas

### 3.1 Primary Market Segments

| Segment | Description | Size (Est.) |
|---------|-------------|-------------|
| Freelancers | Remote workers, consultants, gig economy participants | 2M+ |
| Sole Proprietors | Registered Business Names (BN) | 5M+ |
| SMEs | Limited Liability Companies (LTD) < ₦50M turnover | 1M+ |
| Mid-Market | Companies ₦50M - ₦500M turnover | 100K+ |
| Enterprises | Large corporations requiring multi-entity management | 10K+ |

### 3.2 User Personas

#### Persona 1: Adaeze — The Freelance Developer

- **Demographics**: Female, 28, Lagos-based, single
- **Income**: ₦8-12M annually from international clients
- **Pain Points**: 
  - Confusion about foreign income taxation
  - No clear guidance on WHT credits
  - Missed filing deadlines
- **Goals**: 
  - Minimize tax legally
  - Understand crypto gains implications
  - Stay compliant with minimal effort
- **TaxForge Usage**: Calculator, Expense Tracker, Reminders

#### Persona 2: Chukwudi — The Small Business Owner

- **Demographics**: Male, 42, Abuja, married with 3 children
- **Business**: Retail electronics store (Business Name)
- **Turnover**: ₦15-25M annually
- **Pain Points**:
  - Should he incorporate as a company?
  - VAT registration threshold confusion
  - Manual record-keeping
- **Goals**:
  - Choose optimal business structure
  - Track deductible expenses
  - Prepare for potential audit
- **TaxForge Usage**: Advisory, Calculator, Expense Tracker, Learn

#### Persona 3: Fatima — The CFO

- **Demographics**: Female, 38, Port Harcourt
- **Company**: Manufacturing firm with 5 subsidiary entities
- **Turnover**: ₦200M+ combined
- **Pain Points**:
  - Managing multiple TINs
  - Coordinating filing deadlines across entities
  - Staff onboarding for tax processes
- **Goals**:
  - Centralized multi-entity dashboard
  - Automated reminders for each entity
  - Bulk CAC verification
- **TaxForge Usage**: Full Corporate tier features

### 3.3 Jobs to Be Done (JTBD)

| When... | I want to... | So I can... |
|---------|--------------|-------------|
| Starting a business | Know whether to register as BN or LTD | Minimize tax and maximize protection |
| End of fiscal year | Calculate my total tax liability | Budget for payment and avoid surprises |
| Monthly | Track income and expenses | Know my real-time tax position |
| Before filing deadline | Generate pre-filled forms | File quickly and accurately |
| Earning foreign income | Understand my tax obligations | Stay compliant and avoid penalties |
| Planning expansion | Model different scenarios | Make data-driven decisions |

---

## 4. Core Features & Functionality

### 4.1 Tax Calculator

The heart of TaxForge NG is the comprehensive tax calculator supporting multiple Nigerian tax types.

#### 4.1.1 Supported Tax Types

| Tax Type | Description | Rate(s) |
|----------|-------------|---------|
| **CIT** | Company Income Tax | 25% (2026+), 30% (Pre-2026), 0% (Small) |
| **PIT** | Personal Income Tax | Progressive bands 0-25% |
| **VAT** | Value Added Tax | 7.5% flat |
| **CGT** | Capital Gains Tax | 10% flat |
| **WHT** | Withholding Tax | 5-10% (credited) |
| **Dev. Levy** | Development Levy | 4% (2026+), 2% (Pre-2026) |

#### 4.1.2 Calculator Inputs

```typescript
interface TaxInputs {
  entityType: 'business_name' | 'company';
  turnover: number;           // Annual revenue
  expenses: number;           // Deductible business costs
  rentPaid: number;           // For rent relief (2026+)
  vatableSales: number;       // Sales subject to VAT
  vatablePurchases: number;   // Purchases with recoverable VAT
  rentalIncome: number;       // Passive rental income
  consultancyIncome: number;  // Professional services
  dividendIncome: number;     // Franked dividends (exempt)
  capitalGains: number;       // Asset disposal gains
  foreignIncome: number;      // Overseas earnings
  fixedAssets: number;        // For small company test
  use2026Rules: boolean;      // Toggle tax regime
}
```

#### 4.1.3 Calculator Outputs

```typescript
interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  incomeTax: number;
  developmentLevy: number;
  vatPayable: number;
  whtCredits: number;
  totalTaxPayable: number;
  effectiveRate: number;
  breakdown: TaxBreakdownItem[];
  alerts: TaxAlert[];
  entityType: string;
  isSmallCompany: boolean;
}
```

#### 4.1.4 Smart Alerts

The calculator generates contextual alerts based on user inputs:

| Condition | Alert Type | Message |
|-----------|------------|---------|
| Turnover > ₦25M | Warning | VAT registration is mandatory |
| Small company eligible | Success | Qualifies for 0% CIT rate |
| Franked dividends | Info | Tax-exempt under Nigerian law |
| High foreign income | Info | Consider forex timing |

### 4.2 Business Structure Advisory

An interactive 7-question assessment that recommends the optimal business structure.

#### 4.2.1 Advisory Questions

1. **Ownership Structure**
   - Will you have business partners or investors?
   
2. **Expected Turnover**
   - Below ₦25M / ₦25M-₦100M / Above ₦100M
   
3. **Asset Protection**
   - Do you need to protect personal assets?
   
4. **Property Ownership**
   - Do you own a home or significant personal assets?
   
5. **Service Type**
   - Professional services (consulting, legal, medical)?
   
6. **Business Assets**
   - Significant business equipment/inventory?
   
7. **Investment Plans**
   - Planning to seek external investment?

#### 4.2.2 Recommendation Engine

The algorithm scores both entity types based on answers:

```typescript
interface Recommendation {
  entityType: 'business_name' | 'company';
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
  taxAuthority: string;  // 'State IRS' or 'FIRS'
  estimatedCosts: {
    registration: string;
    annual: string;
  };
  suitabilityScore: number;  // 0-100%
}
```

### 4.3 Expense Tracking

A comprehensive income and expense ledger with tax-aware categorization.

#### 4.3.1 Transaction Categories

| Category | Type | Deductible |
|----------|------|------------|
| Income | Revenue | N/A |
| Rent & Office | Expense | ✓ |
| Transport & Travel | Expense | ✓ |
| Marketing & Ads | Expense | ✓ |
| Salaries & Wages | Expense | ✓ |
| Utilities | Expense | ✓ |
| Supplies & Equipment | Expense | ✓ |
| Other Expenses | Expense | ✗ |

#### 4.3.2 Features

- **Filtering**: By date range, type (income/expense), category, business
- **Real-time Summaries**: 
  - Total Income
  - Total Expenses
  - Deductible Expenses
  - Estimated Tax Liability
- **Calculator Integration**: One-click transfer to tax calculator
- **CSV Import**: Bulk upload via mock import (production: real file parsing)
- **Visual Analytics**: Pie charts and bar graphs for expense breakdown

### 4.4 Reminder System

Automated notifications for tax filing deadlines.

#### 4.4.1 Default Reminder Types

| Type | Description | Due Date |
|------|-------------|----------|
| VAT | Monthly VAT Filing | 21st of each month |
| CIT | Annual CIT Return | June 30th |
| PIT | PIT Remittance | 10th of each month |
| PAYE | PAYE Remittance | 10th of each month |
| Custom | User-defined | Any date/time |

#### 4.4.2 Notification Channels

1. **Push Notifications** — Browser-based, requires user permission
2. **Email Notifications** — Via Resend API integration
3. **In-App Alerts** — Dashboard badges and urgent indicators

#### 4.4.3 Reminder Logic

```sql
-- Check reminders cron job (runs every hour)
SELECT * FROM reminders
WHERE due_date <= NOW() + INTERVAL '24 hours'
  AND notify_email = true
  AND is_completed = false
  AND (last_notified_at IS NULL OR last_notified_at < NOW() - INTERVAL '24 hours');
```

### 4.5 Tax Filing Preparation

Pre-filled FIRS forms for TaxProMax submission.

#### 4.5.1 Supported Forms

| Form | Description | Tier Required |
|------|-------------|---------------|
| CIT Return | Companies Income Tax | Business+ |
| VAT Return | Value Added Tax | Business+ |
| PIT Return | Personal Income Tax | Business+ |

#### 4.5.2 Filing Workflow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Select     │───▶│   Generate   │───▶│   Download   │───▶│   Upload to  │
│   Business   │    │   Form       │    │   PDF        │    │   TaxProMax  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### 4.6 Learning Center (Tax Academy)

Educational resources organized by complexity and subscription tier.

#### 4.6.1 Content Types

| Type | Description | Example |
|------|-------------|---------|
| Articles | Long-form educational content | "Nigeria Tax Act 2025: Complete Guide" |
| Videos | Short explainer videos | "2026 Tax Reforms Explained" (2 min) |
| FAQs | Quick answers | "When are CIT returns due?" |
| Tips | Personalized recommendations | Based on user's saved businesses |

#### 4.6.2 Content Hierarchy

```
Free Tier:
├── 2026 Tax Reforms
├── Entity Comparison (BN vs LTD)
└── VAT Registration Guide

Business+ Tier:
├── Freelancer Tax Guide
├── PAYE & Payroll for SMEs
└── Foreign Income Taxation

Corporate Tier:
└── Audit Preparation Guide
```

### 4.7 Scenario Modeling

What-if analysis for tax optimization (Business+ tier).

#### 4.7.1 Adjustable Variables

| Variable | Type | Range |
|----------|------|-------|
| Turnover Change | Percentage | -50% to +100% |
| Expense Change | Percentage | -50% to +100% |
| Bonus Income | Absolute | Any amount |
| Additional Rent | Absolute | Any amount |
| Foreign Income | Absolute | Any amount |
| Crypto Gains | Absolute | Any amount |

#### 4.7.2 Output Comparison

- Side-by-side current vs. scenario tax
- Absolute difference (+ or -)
- Effective rate comparison
- Contextual insights (e.g., "Consider VAT registration")

### 4.8 Business Management

Multi-entity support with CAC verification.

#### 4.8.1 Saved Business Data

```typescript
interface SavedBusiness {
  id: string;
  name: string;
  entityType: 'business_name' | 'company';
  turnover: number;
  rcBnNumber?: string;        // RC1234567 or BN111111
  verificationStatus: 'not_verified' | 'verified' | 'manual';
  cacDetails?: CACVerificationDetails;
  createdAt: Date;
}
```

#### 4.8.2 CAC Verification

| Tier | Verification Type |
|------|-------------------|
| Free | No access |
| Basic | Manual (link to CAC portal) |
| Business | Automated (mock API) |
| Corporate | Bulk verification |

### 4.9 AI Tax Assistant (TaxBot)

Conversational AI for tax-related questions.

#### 4.9.1 Capabilities

- Nigerian tax law explanations
- Deadline guidance
- Filing procedure help
- General tax advice

#### 4.9.2 Limitations

- No actual legal/financial advice
- Cannot access user's personal data
- Responses are educational only

---

## 5. Technical Architecture

### 5.1 Database Schema

#### 5.1.1 Core Tables

```sql
-- User Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  turnover NUMERIC DEFAULT 0,
  cac_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES businesses,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'income' or 'expense'
  is_deductible BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES businesses,
  reminder_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  notify_email BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax Calculations (History)
CREATE TABLE tax_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES businesses,
  inputs JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES businesses,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5.1.2 Row-Level Security

All tables implement RLS policies ensuring users can only access their own data:

```sql
-- Example: expenses table
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);
```

### 5.2 Edge Functions

#### 5.2.1 tax-assistant

AI-powered chatbot for tax questions.

```typescript
// supabase/functions/tax-assistant/index.ts
// Uses OpenRouter API to call AI models
// System prompt focused on Nigerian tax law
// No markdown formatting in responses
```

#### 5.2.2 check-reminders

Cron job to trigger reminder notifications.

```typescript
// Runs hourly via scheduled invocation
// Queries reminders due within 24 hours
// Triggers email notifications via send-reminder-email
```

#### 5.2.3 send-reminder-email

Email delivery via Resend API.

```typescript
// Uses Resend API for email delivery
// HTML-formatted email templates
// Branded TaxForge NG styling
```

### 5.3 Authentication Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Sign Up    │───▶│  Auto-confirm│───▶│   Profile    │
│   (Email)    │    │   Email      │    │   Created    │
└──────────────┘    └──────────────┘    └──────────────┘
       │
       ▼
┌──────────────┐
│   Sign In    │
│   (Email)    │
└──────────────┘
       │
       ▼
┌──────────────┐    ┌──────────────┐
│   Session    │───▶│   Protected  │
│   Created    │    │   Routes     │
└──────────────┘    └──────────────┘
```

---

## 6. Tax Calculation Logic

### 6.1 Personal Income Tax (PIT) — 2026 Rules

The 2026 PIT bands reflect the Nigeria Tax Act 2025 reforms:

| Income Band | Cumulative | Rate |
|-------------|------------|------|
| First ₦800,000 | ₦800,000 | 0% |
| Next ₦2,200,000 | ₦3,000,000 | 15% |
| Next ₦7,000,000 | ₦10,000,000 | 19% |
| Next ₦40,000,000 | ₦50,000,000 | 21% |
| Above ₦50,000,000 | — | 25% |

**Example Calculation** (₦15,000,000 taxable income):

```
₦800,000 × 0%   = ₦0
₦2,200,000 × 15% = ₦330,000
₦7,000,000 × 19% = ₦1,330,000
₦5,000,000 × 21% = ₦1,050,000
───────────────────────────
Total PIT        = ₦2,710,000
Effective Rate   = 18.07%
```

### 6.2 Personal Income Tax (PIT) — Pre-2026 Rules

| Income Band | Rate |
|-------------|------|
| First ₦300,000 | 7% |
| Next ₦300,000 | 11% |
| Next ₦500,000 | 15% |
| Next ₦500,000 | 19% |
| Next ₦1,600,000 | 21% |
| Above ₦3,200,000 | 24% |

### 6.3 Company Income Tax (CIT)

#### 6.3.1 2026 Rules

| Company Type | CIT Rate | Dev. Levy |
|--------------|----------|-----------|
| Small (≤₦50M turnover AND ≤₦250M assets) | 0% | 0% |
| Medium/Large | 25% | 4% |

#### 6.3.2 Pre-2026 Rules

| Metric | Rate |
|--------|------|
| CIT | 30% |
| Education Levy | 2% |

### 6.4 Small Company Test

```typescript
function isSmallCompany(turnover: number, fixedAssets: number): boolean {
  return turnover <= 50_000_000 && fixedAssets <= 250_000_000;
}
```

### 6.5 Value Added Tax (VAT)

```typescript
function calculateVAT(sales: number, purchases: number) {
  const VAT_RATE = 0.075;
  const outputVAT = sales * VAT_RATE;
  const inputVAT = purchases * VAT_RATE;
  return Math.max(0, outputVAT - inputVAT);
}
```

**Registration Threshold**: ₦25,000,000 annual turnover

### 6.6 Capital Gains Tax (CGT)

Flat 10% on gains from asset disposal.

```typescript
function calculateCGT(gains: number): number {
  return gains * 0.10;
}
```

### 6.7 Withholding Tax (WHT) Credits

| Income Source | WHT Rate | Notes |
|---------------|----------|-------|
| Rental Income | 10% | Deducted at source |
| Consultancy (Companies) | 10% | Deducted by payer |
| Consultancy (Individuals) | 5% | Deducted by payer |

WHT credits are subtracted from final tax liability.

### 6.8 Rent Relief (2026 Rules — Business Names Only)

```typescript
function calculateRentRelief(rentPaid: number): number {
  return Math.min(rentPaid * 0.20, 500_000);
}
```

---

## 7. Subscription Tiers & Monetization

### 7.1 Tier Overview

| Feature | Free | Basic | Business | Corporate |
|---------|------|-------|----------|-----------|
| **Price (Monthly)** | ₦0 | ₦2,000 | ₦9,900 | Custom |
| **Price (Annual)** | ₦0 | ₦20,000 | ₦99,000 | Custom |
| Tax Calculations | Unlimited | Unlimited | Unlimited | Unlimited |
| Basic Advisory | ✓ | ✓ | ✓ | ✓ |
| Pre-2026 & 2026 Rules | ✓ | ✓ | ✓ | ✓ |
| Saved Businesses | 0 | 2 | 10 | Unlimited |
| Data Storage | ✗ | ✓ | ✓ | ✓ |
| PDF/CSV Export | ✗ | ✓ | ✓ | ✓ |
| Email Reminders | ✗ | ✓ | ✓ | ✓ |
| Watermarks | ✓ | ✓ | ✗ | ✗ |
| CAC Verification (Auto) | ✗ | ✗ | ✓ | ✓ |
| Scenario Modeling | ✗ | ✗ | ✓ | ✓ |
| Tax Filing Prep | ✗ | ✗ | ✓ | ✓ |
| User Seats | 1 | 1 | 2 | Unlimited |
| Bulk CAC Verification | ✗ | ✗ | ✗ | ✓ |
| Custom Reports | ✗ | ✗ | ✗ | ✓ |
| Priority Support | ✗ | ✗ | ✓ | ✓ |
| Dedicated Support | ✗ | ✗ | ✗ | ✓ |
| API Access | ✗ | ✗ | ✗ | Coming |

### 7.2 Revenue Model

| Stream | Description | Status |
|--------|-------------|--------|
| Subscriptions | Monthly/Annual SaaS fees | Active |
| Enterprise Licensing | Custom corporate contracts | Active |
| API Access | Per-call pricing | Planned |
| Partnerships | Accountant/Tax consultant referrals | Planned |
| Data Services | Anonymized aggregate insights | Considered |

### 7.3 Payment Integration

- **Provider**: Paystack
- **Methods**: Card, Bank Transfer, USSD
- **Currency**: Nigerian Naira (₦)
- **Billing Cycles**: Monthly, Annual (17% discount)

---

## 8. User Journey & Workflows

### 8.1 New User Onboarding

```
┌──────────────────────────────────────────────────────────────────┐
│                         Landing Page                              │
│                    (Index.tsx - Hero Section)                    │
└────────────────────────────┬─────────────────────────────────────┘
                             │
           ┌─────────────────┴─────────────────┐
           ▼                                   ▼
┌──────────────────┐                 ┌──────────────────┐
│   Advisory Flow  │                 │   Calculator     │
│   (7 Questions)  │                 │   Direct Access  │
└────────┬─────────┘                 └────────┬─────────┘
         │                                    │
         ▼                                    │
┌──────────────────┐                          │
│  Recommendation  │                          │
│  (BN vs LTD)     │                          │
└────────┬─────────┘                          │
         │                                    │
         └─────────────────┬──────────────────┘
                           ▼
               ┌──────────────────┐
               │   Calculator     │
               │   (Tax Results)  │
               └────────┬─────────┘
                        │
           ┌────────────┴────────────┐
           │                         │
           ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│   Sign Up (Free) │      │   Continue as    │
│   to Save Data   │      │   Guest          │
└────────┬─────────┘      └──────────────────┘
         │
         ▼
┌──────────────────┐
│   Disclaimer     │
│   Modal          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Welcome        │
│   Splash         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Dashboard      │
│   (Home)         │
└──────────────────┘
```

### 8.2 Tax Calculation Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                         Calculator Page                           │
└────────────────────────────────────────────────────────────────────
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     ┌──────────────┐                ┌──────────────┐
     │ Business Name │                │   Company    │
     │  (PIT Tax)    │                │  (CIT Tax)   │
     └──────┬───────┘                └──────┬───────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
               ┌──────────────────┐
               │ Toggle: Pre-2026 │
               │ vs 2026 Rules    │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │  Enter Inputs    │
               │  (Turnover, etc) │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │  Calculate Tax   │
               │  (Submit)        │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │  Results Page    │
               │  (Breakdown)     │
               └────────┬─────────┘
                        │
     ┌──────────────────┼──────────────────┐
     ▼                  ▼                  ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│ Download │    │    Save      │    │  Recalculate │
│   PDF    │    │   Business   │    │              │
└──────────┘    └──────────────┘    └──────────────┘
```

### 8.3 Expense Tracking Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                         Expenses Page                             │
└────────────────────────────────────────────────────────────────────
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Add Entry   │      │  Import CSV  │      │  View Charts │
│  (Manual)    │      │  (Bulk)      │      │              │
└──────┬───────┘      └──────┬───────┘      └──────────────┘
       │                     │
       ▼                     ▼
┌──────────────────────────────────────┐
│           Transaction List           │
│  (Filterable by date, type, etc.)   │
└──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────┐
│         Real-time Summaries          │
│  Income | Expenses | Deductible | Tax│
└──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────┐
│      "Use in Calculator" Button      │
│   (Transfers totals to Calculator)   │
└──────────────────────────────────────┘
```

---

## 9. Data Security & Compliance

### 9.1 Security Measures

| Measure | Implementation |
|---------|----------------|
| Authentication | Supabase Auth with email/password |
| Authorization | Row-Level Security (RLS) on all tables |
| Encryption | TLS 1.3 in transit, AES-256 at rest |
| Session Management | JWT tokens, automatic refresh |
| API Security | Anon key for client, service role for edge functions |

### 9.2 Data Privacy

- **Data Minimization**: Only essential data collected
- **User Control**: Users can delete their data anytime
- **No Selling**: User data never sold to third parties
- **Anonymization**: Aggregate analytics only

### 9.3 Compliance Considerations

| Regulation | Status | Notes |
|------------|--------|-------|
| NDPR (Nigeria Data Protection Regulation) | Compliant | Data stored in Supabase |
| GDPR (EU) | Aware | Applicable for EU users |
| FIRS Requirements | Aligned | Forms match official templates |

### 9.4 Disclaimer

**Important**: TaxForge NG provides educational tax calculations only. It is not a substitute for professional tax advice. Users should consult licensed tax practitioners for formal tax matters.

---

## 10. Integration Capabilities

### 10.1 Current Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| Supabase Auth | User authentication | Active |
| Supabase Database | Data persistence | Active |
| Supabase Edge Functions | Serverless logic | Active |
| Resend | Email notifications | Active |
| Lovable AI | AI-powered chatbot | Active |

### 10.2 Planned Integrations

| Integration | Purpose | Timeline |
|-------------|---------|----------|
| Paystack | Payment processing | Q1 2026 |
| CAC API | Real verification | Q2 2026 |
| FIRS TaxProMax | Direct filing | Q3 2026 |
| Accounting Software | Expense sync | Q4 2026 |
| WhatsApp | Notification channel | Q2 2026 |

### 10.3 API Documentation (Planned)

For Corporate tier users, a RESTful API is planned:

```
# Endpoints (Draft)

POST /api/v1/calculate
  - Calculate tax for given inputs

GET /api/v1/businesses
  - List user's saved businesses

POST /api/v1/expenses
  - Create expense entry

GET /api/v1/reminders
  - List upcoming reminders
```

---

## 11. Roadmap & Future Development

### 11.1 Completed (Q4 2025)

- [x] Tax Calculator (CIT, PIT, VAT, CGT)
- [x] Business Advisory Tool
- [x] Expense Tracking
- [x] Reminder System
- [x] PDF Export
- [x] Scenario Modeling
- [x] Tax Academy / Learning Center
- [x] AI Tax Assistant
- [x] CAC Verification (Mock)

### 11.2 In Progress (Q1 2026)

- [ ] Paystack Integration
- [ ] WhatsApp Notifications
- [ ] Mobile-Optimized PWA
- [ ] Enhanced CSV Import

### 11.3 Planned (2026)

| Quarter | Features |
|---------|----------|
| Q1 | Paystack payments, WhatsApp alerts, PWA |
| Q2 | Real CAC API, E-filing partnerships |
| Q3 | Direct FIRS filing, Accountant portal |
| Q4 | API launch, Multi-currency support |

### 11.4 Future Vision (2027+)

- **Mobile App**: Native iOS/Android applications
- **AI Tax Advisor**: Personalized recommendations based on user data
- **Payroll Module**: Full PAYE/pension management
- **Audit Defense**: Document preparation for FIRS audits
- **West Africa Expansion**: Ghana, Kenya tax rules

---

## 12. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **BN** | Business Name (registered sole proprietorship) |
| **CAC** | Corporate Affairs Commission (Nigeria) |
| **CGT** | Capital Gains Tax |
| **CIT** | Company Income Tax |
| **FIRS** | Federal Inland Revenue Service |
| **LTD** | Limited Liability Company |
| **PAYE** | Pay As You Earn (employee tax) |
| **PIT** | Personal Income Tax |
| **RC** | Registered Company number |
| **RLS** | Row-Level Security |
| **TIN** | Tax Identification Number |
| **VAT** | Value Added Tax |
| **WHT** | Withholding Tax |

### Appendix B: Tax Deadlines

| Tax Type | Filing Deadline | Payment Deadline |
|----------|-----------------|------------------|
| VAT | 21st of following month | 21st of following month |
| PAYE | 10th of following month | 10th of following month |
| CIT | 6 months after year-end | With filing |
| PIT | March 31st | March 31st |

### Appendix C: Penalty Structure

| Violation | Penalty |
|-----------|---------|
| Late CIT Filing | 10% of tax due |
| Late VAT Filing | 5% + ₦5,000/month |
| Late PAYE Remittance | 10% of tax due |
| Non-Registration (VAT) | ₦50,000 first month + ₦25,000/month |

### Appendix D: Contact Information

- **Website**: taxforge.ng (planned)
- **Email**: support@taxforge.ng
- **Status**: For educational purposes only

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | TaxForge NG | Initial comprehensive manuscript |

---

*This document is confidential and intended for internal business use. Distribution to external parties requires authorization.*

**© 2025-2026 TaxForge NG. All Rights Reserved.**
