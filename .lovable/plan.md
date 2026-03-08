

## Phase 2: Premium Fintech Redesign — Calculator, Dashboard, Pricing

The Phase 1 CSS foundation is already in place (glass-frosted, shadow-futuristic, neumorphic, glow-* are all mapped to clean shadows). The old class names still work but render as simple borders/shadows. This phase removes visual clutter from the markup itself — replacing decorative wrappers, unnecessary animations, and "glass" class usage with clean, direct styling.

### 1. Calculator Page (`src/pages/Calculator.tsx`)

**Loading state** (lines 239-255): Replace `glass-frosted rounded-2xl p-8 shadow-futuristic` spinner with a simple centered spinner, no glass wrapper.

**Header badge** (line 428-429): Remove the `glass` badge with pulsing Sparkles icon ("NRS Compliant"). Replace with plain text or remove entirely.

**Business selector** (line 442): Replace `glass-frosted rounded-2xl p-5 shadow-futuristic` with `border border-border rounded-xl bg-card p-5`.

**Tax rule toggle** (line 506): Same — replace `glass-frosted rounded-2xl p-5 shadow-futuristic` with clean card styling. Remove `glow-success` and `neumorphic-sm` conditionals on the icon wrapper.

**Entity type tabs** (line 543): Replace `glass-frosted rounded-2xl` TabsList with standard `bg-muted rounded-lg`. Remove `bg-gradient-primary` from active state — use `bg-primary text-primary-foreground`.

**Input form wrapper** (line 562): Replace `glass-frosted rounded-3xl p-6 md:p-8 shadow-futuristic` with `border border-border rounded-xl bg-card p-6 md:p-8`.

**NeumorphicInput** (line 133): Replace `neumorphic-sm p-1` wrapper with a clean div or remove wrapper entirely — let the Input render directly.

**Calculate button** (line 710-720): Replace `variant="hero"` with `variant="default"` (solid primary).

### 2. Dashboard Page (`src/pages/Dashboard.tsx`)

**Sign-in state** (lines 395-401): Replace `glass-frosted rounded-3xl p-10` and `variant="glow"` button with `border border-border rounded-xl bg-card p-10` and standard button.

**Loading skeleton** (lines 408-463): Replace all `glass-frosted`, `glass`, `shadow-futuristic`, `skeleton-shimmer` containers with `bg-card border border-border rounded-xl` and standard `animate-pulse bg-muted rounded` skeleton bars.

**Summary section** (line 537): Replace `glass-frosted rounded-2xl shadow-futuristic border-border/40` with `border border-border rounded-xl bg-card`.

**Summary stat cards** (lines 660-699): Replace `glass p-4 rounded-xl hover-lift` with `border border-border rounded-lg bg-card p-4` — remove hover-lift transform.

**Quick action cards** (lines 817-866): Replace `glass-frosted hover:shadow-futuristic hover:border-primary/30 hover-lift` with `border border-border bg-card hover:border-primary/40 transition-colors`. Remove `glow-primary` on icon hover.

**Business & Reminder cards** (lines 874, 960): Replace `glass-frosted shadow-futuristic` with `border border-border bg-card`. Inner items: replace `glass p-3 rounded-xl` with `border border-border/50 rounded-lg p-3 bg-muted/30`.

**SharedElement/motion wrappers**: Keep framer-motion for list stagger but remove the `SharedElement` wrapper (it adds layout animation overhead with no visible benefit in the clean design).

### 3. Pricing Page (`src/pages/Pricing.tsx`)

**Contact section** (line 595): Replace `glass-frosted p-8 shadow-card hover-lift` with `border border-border bg-card p-8`. Remove `glow-sm` from icon wrapper, replace `bg-gradient-to-br from-primary/20 to-accent/20` with `bg-primary/10`.

**PricingCard** (line 694): Replace `glass-frosted shadow-lg glow-sm` (popular) with `border-2 border-primary bg-card shadow-md`. Remove `card-interactive` and keep simple `hover:shadow-md`. Remove `animate-glow-border` from "Most Popular" badge — use solid `bg-primary text-primary-foreground`.

**CTA buttons**: Replace `variant="hero"` with `variant="default"` throughout.

### 4. General Pattern Replacements (all 3 files)

| Old pattern | New pattern |
|---|---|
| `glass-frosted rounded-2xl shadow-futuristic` | `border border-border rounded-xl bg-card` |
| `glass p-4 rounded-xl hover-lift` | `border border-border rounded-lg bg-card p-4` |
| `neumorphic-sm p-1` | removed or `rounded-md` |
| `variant="hero"` | `variant="default"` |
| `variant="glow"` | `variant="default"` |
| `glow-primary`, `glow-success`, `glow-sm` | removed |
| `hover-lift` | removed |
| `shadow-futuristic` | removed (or `shadow-sm`) |
| `bg-gradient-primary` | `bg-primary` |
| `animate-glow-border` | removed |

### Files Changed
- `src/pages/Calculator.tsx` — clean card wrappers, remove glass/neumorphic, simplify inputs
- `src/pages/Dashboard.tsx` — clean stat cards, quick actions, business list, skeletons
- `src/pages/Pricing.tsx` — clean pricing cards, contact section, CTAs

### What This Achieves
- Consistent "clean fintech" look across the three most-used authenticated pages
- No more decorative glass/glow/neumorphic classes in primary user flows
- Matches the Phase 1 homepage direction: content-first, professional, trustworthy

