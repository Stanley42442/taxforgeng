

## Phase 3: Fintech Redesign — ProfitLoss, E-Filing, Audit Log, Settings Polish

### Pages & Scope

**1. Profit & Loss (`src/pages/ProfitLoss.tsx`)** — Full redesign (188 lines, zero fintech styling)
- Summary cards: Add `glass-frosted hover-lift stagger-N` classes, icon containers with `bg-gradient-primary` or semantic color backgrounds
- Loading state: Replace plain text with skeleton shimmer
- P&L statement card: `glass-frosted shadow-futuristic animate-slide-up`
- Revenue/expense line items: `glass rounded-lg` rows with subtle hover effects
- Net profit bottom line: Prominent `glass-frosted` card with conditional `glow-sm` for positive profit
- Period/business selectors: Wrap in `glass-frosted rounded-2xl` filter bar
- Add `loading` guard from `useAuth` (same pattern as other fixed pages)

**2. E-Filing (`src/pages/EFiling.tsx`)** — Consistency pass (420 lines, partially styled)
- Step containers already use `rounded-2xl border border-border bg-card` — swap to `glass-frosted shadow-futuristic`
- Business detail grids (`bg-secondary/50`): Replace with `glass rounded-xl` panels
- Progress stepper: Add `glass-frosted rounded-2xl p-3` background, active steps get `bg-gradient-primary glow-sm`
- Payment dialog: `glass-frosted` content background
- Success states: Add `glow-sm` on the success icon container

**3. Audit Log (`src/pages/AuditLog.tsx`)** — Full redesign (271 lines, nearly zero fintech styling)
- Upgrade prompt card: `glass-frosted shadow-futuristic animate-slide-up`, feature list items become `glass rounded-lg hover-lift`
- Filter bar card: `glass-frosted` with icon containers in `bg-primary/10 rounded-lg`
- Table card: `glass-frosted` wrapper
- Table rows: Add `hover:bg-muted/50 transition-all` for subtle interactivity
- Action badges already have semantic colors — keep, just add `glass` background tint
- Empty state: Center with animated icon (`animate-float`)

**4. Settings (`src/pages/Settings.tsx`)** — Polish pass
- Settings already uses `glass-frosted hover-lift` throughout — minimal changes needed
- TabsList: Add `rounded-2xl` and active trigger `data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground` (currently only `glow-sm`)
- Section icon containers: Ensure consistent `p-2 rounded-xl bg-{color}/10` sizing
- Danger zone card: Add `glow-sm` on the destructive border for visual emphasis

### Design System Classes Used
All from existing `index.css` and responsive CSS:
- `glass-frosted`, `glass`, `glass-subtle` — card backgrounds
- `hover-lift` — card hover elevation
- `bg-gradient-primary` — primary gradient backgrounds
- `glow-sm`, `glow-primary` — subtle glows
- `shadow-futuristic`, `shadow-card` — depth
- `animate-slide-up`, `animate-float` — entry animations
- `stagger-N` — cascading card entrances
- `neumorphic` — search/filter inputs
- `skeleton-shimmer` — loading states

### Files Changed
1. `src/pages/ProfitLoss.tsx`
2. `src/pages/EFiling.tsx`
3. `src/pages/AuditLog.tsx`
4. `src/pages/Settings.tsx`

