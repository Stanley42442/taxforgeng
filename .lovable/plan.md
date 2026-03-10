

## Background Atmosphere Redesign — Warm, Calm, Memorable

### Problem
The background is completely flat — `0 0% 99%` (cold near-white) in light mode, `220 14% 6%` (stark charcoal) in dark mode. All texture utilities (`bg-dots`, `bg-grid`, `bg-mesh`) are disabled (`none`/`transparent`). The result feels clinical and uninviting.

### Inspiration
- **Linear.app**: Soft radial gradient orbs that drift subtly behind content
- **Stripe Dashboard**: Warm off-white with faint blue-tinted gradients at edges
- **Mercury.com**: Calm blue-gray backgrounds with soft depth
- **Notion**: Warm cream undertones that feel "lived in"

### Approach — 3 Layers of Subtle Warmth

**Layer 1: Warmer Base Colors**
- Light mode: Shift background from cold `0 0% 99%` to warm cream `40 20% 98.5%` (faint golden warmth, like Notion)
- Dark mode: Shift from stark `220 14% 6%` to warmer `225 15% 7.5%` with slight blue depth
- Muted tones get matching warmth adjustments

**Layer 2: Ambient Gradient Orbs (Linear/Stripe-style)**
- Re-enable `bg-mesh` with 2-3 very soft radial gradients using primary green and accent gold at 3-6% opacity
- Fixed positioned, covers full viewport, behind all content
- Applied via `PageLayout` and the Index page wrapper
- Dark mode: Same orbs but at slightly higher opacity with cooler tones

**Layer 3: Subtle Dot Grid Texture**
- Re-enable `bg-dots` with a faint dot pattern (1px dots at ~3% opacity, 24px spacing)
- Gives the background a "crafted" feel without being distracting

### Files Changed

1. **`src/index.css`** (~20 lines)
   - Adjust `:root` background/muted HSL values for warmth
   - Adjust `.dark` background/muted HSL values
   - Re-enable `bg-dots` with subtle dot pattern
   - Re-enable `bg-mesh` with ambient radial gradient orbs
   - Add `.bg-ambient` utility combining mesh + dots for easy use

2. **`src/components/PageLayout.tsx`** (~3 lines)
   - Add ambient background layer div when `showBackground` is true (already a prop, currently unused)

3. **`src/pages/Index.tsx`** (~2 lines)
   - Add `bg-ambient` class to hero wrapper for the landing page gradient atmosphere

### What This Does NOT Change
- No card, border, or component styling changes
- No color palette changes (primary green, accent gold stay the same)
- No animation changes
- All glassmorphism/fintech work from phases 1-3 stays intact

