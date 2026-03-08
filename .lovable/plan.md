

## Phase 2+: Site-Wide Premium Fintech Redesign

This is a large scope — 63 page files and 39 component files still use the old styling classes (`glass-frosted`, `neumorphic`, `neon-border`, `glow-primary`, `bg-dots`, `bg-mesh`, `animate-float`, etc.). Given the size, I'll break this into manageable batches that can be implemented across multiple messages.

### Batch 1: High-Traffic Core Pages (this implementation)

These are the pages users interact with most after the homepage.

**1. Auth page (`src/pages/Auth.tsx`)**
- Remove `bg-gradient-hero`, `glass-frosted`, `glow-primary`, `shadow-futuristic`
- Clean white card on neutral background, simple logo without gradient/glow
- Refined input styling with subtle focus rings

**2. Dashboard (`src/pages/Dashboard.tsx`)**
- Replace all `glass-frosted` cards with clean `bg-card border border-border shadow-sm`
- Remove `hover-lift`, `glow-sm` from stat cards
- Clean skeleton loaders (already use `skeleton-shimmer` which is fine)
- Replace `glass` with `bg-muted/50 border border-border`

**3. Calculator (`src/pages/Calculator.tsx`)**
- Replace `neumorphic-sm` input wrappers with clean bordered inputs
- Remove any glass/glow from result sections

**4. Pricing (`src/pages/Pricing.tsx`)**
- Already partially cleaned — sweep remaining `glass-frosted`, `shadow-futuristic`, `glow-primary` references

### Batch 2: Business Tools Pages
- `Invoices.tsx` — remove `glass-frosted`, `hover-lift` from cards
- `Expenses.tsx` — clean card styling
- `Payroll.tsx` — clean card styling
- `BusinessReport.tsx` — remove `glass-frosted`, `shadow-futuristic`
- `ProfitLoss.tsx`, `Compliance.tsx`, `PersonalExpenses.tsx`

### Batch 3: SEO Landing Pages (10+ pages)
- All SEO pages (`src/pages/seo/*`) share the same pattern: fixed background orbs + `bg-dots` + `bg-mesh` + `glass-frosted` cards
- Bulk replace: remove fixed background decorations, swap `glass-frosted` → `bg-card border border-border rounded-2xl`
- Remove `hover-lift` → simple `hover:shadow-md transition-shadow`

### Batch 4: Blog Pages & Components
- Blog post layouts and cards — clean styling
- SEO components (`CTASection`, `ComparisonTable`, `StatsCounter`, `QuickTaxCalculator`, `RentReliefCalculator`, `SimpleVATCalculator`, `SEODisclaimer`)

### Batch 5: Settings, Security & Admin Pages
- `Settings.tsx`, `SecurityDashboard.tsx`, `AdminAnalytics.tsx`
- Various management components (`ActiveSessionsManager`, `WhatsAppVerification`, `ReportScheduleSettings`, etc.)

### Batch 6: Remaining Components
- `PenaltyEstimator`, `TaxOptimizationTips`, `DigitalVATCalculator`, `OCRReceiptScanner`, `PremiumOnboarding`, `ReviewSubmissionForm`, and ~20 more components

### Implementation Pattern (consistent across all batches)

Every file gets the same systematic replacements:
```
glass-frosted  →  bg-card border border-border
glass          →  bg-muted/50 border border-border  
glass-subtle   →  bg-card/80 border border-border/60
glass-dark     →  bg-muted
neumorphic     →  bg-card border border-border shadow-sm
neumorphic-sm  →  bg-card border border-border
neon-border    →  bg-card border border-border
glow-primary   →  shadow-sm
glow-sm        →  shadow-sm
shadow-futuristic → shadow-sm
hover-lift     →  hover:shadow-md transition-shadow
hover-glow-primary → hover:shadow-md transition-shadow
floating-card  →  hover:shadow-lg transition-shadow
bg-gradient-primary (on icon containers) → bg-primary
animate-float / animate-float-slow → (remove entirely)
bg-dots / bg-mesh / bg-gradient-hero fixed backgrounds → (remove entirely)
```

### Plan for This Message

I'll implement **Batch 1** (Auth, Dashboard, Calculator, Pricing sweep) — these are the 4 most-visited pages after the homepage. Subsequent batches will follow in order.

