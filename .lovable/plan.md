

## Make All Remaining See-Through Cards Solid

### Problem
Several pages still have inline `bg-card/50 backdrop-blur-sm` on cards/divs, making them semi-transparent. The main offenders:

### Files to fix

**1. `src/pages/Documentation.tsx`** — 12 instances of `bg-card/50 backdrop-blur-sm` on Card components → replace with just removing those classes (Card default is already `bg-card`).

**2. `src/pages/Expenses.tsx`** — 6 instances of `bg-card/50` on inner divs → replace with `bg-card`.

**3. `src/components/InstallPWAPrompt.tsx`** — `bg-card/95 backdrop-blur-xl` → `bg-card`.

**4. `src/components/ui/sonner.tsx`** — toast uses `bg-background/95 backdrop-blur-xl` → `bg-background` (keep the rest).

These are the content cards that appear see-through. Overlay/modal backdrops (`bg-background/80 backdrop-blur-sm` on loaders, celebrations, etc.) are intentionally translucent and will be left as-is.

### Changes

| File | What | Count |
|------|------|-------|
| `Documentation.tsx` | Remove `bg-card/50 backdrop-blur-sm` from Card className props | 12 |
| `Expenses.tsx` | `bg-card/50` → `bg-card` on divs | 6 |
| `InstallPWAPrompt.tsx` | `bg-card/95 backdrop-blur-xl` → `bg-card` | 1 |
| `sonner.tsx` | `bg-background/95 backdrop-blur-xl` → `bg-background` in toast class | 1 |

Total: 4 files, ~20 replacements. All cards become fully solid.

