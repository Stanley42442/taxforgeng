

## Make All Cards Solid (Remove Translucency)

The previous change made cards semi-transparent so the lava lamp background shows through. You want them **solid** like the dashboard cards instead.

### What's causing the transparency

1. **Card component default variant** (`card.tsx` line 11): `bg-card/70 backdrop-blur-xl` — 70% opacity
2. **`.glass` class** in `index.css`: `hsl(var(--card) / 0.7)` — 70% opacity  
3. **`.glass-frosted` class**: `hsl(var(--card) / 0.65)` light / `0.45` dark — translucent
4. **`.glass-subtle` class**: `hsl(var(--card) / 0.5)` light / `0.35` dark — translucent

### Fix

**File 1: `src/components/ui/card.tsx`**
- Default variant: `bg-card/70 backdrop-blur-xl` → `bg-card`

**File 2: `src/index.css`**
- `.glass`: background → `hsl(var(--card))` (fully opaque), remove `backdrop-filter`
- `.glass-frosted`: background → `hsl(var(--card))`, remove `backdrop-filter`
- `.glass-subtle`: background → `hsl(var(--card))`, remove `backdrop-filter`
- Same in the dark mode section
- Keep the border styling and hover effects as-is

The lava lamp background will still be visible in the page gaps between cards, but cards themselves will be fully solid and readable.

### Files (2)
1. `src/components/ui/card.tsx`
2. `src/index.css`

