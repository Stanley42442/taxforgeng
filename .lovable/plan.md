

## Lava Lamp Background — Mixed Blur for Depth Effect

### Concept
Floating green and gold blob shapes that mimic lava lamp oil bubbles. Some blobs are **sharp/clear** (foreground), others are **heavily blurred** (background depth), creating a parallax-like layered effect.

### Implementation

**1. New file: `src/components/LavaLampBackground.tsx`** (~90 lines)
- Renders 7 blob `<div>` elements, each with:
  - CSS-animated `border-radius` morphing (organic lava shapes)
  - CSS-animated color shifting between `hsl(var(--primary))` (green) and `hsl(var(--accent))` (gold)
  - Slow vertical rise/fall + horizontal drift
  - Staggered durations (15-30s) and delays for organic randomness
- **Depth via blur variation**:
  - 2-3 blobs: `blur(0)` or `blur(4px)` — sharp, clearly visible, smaller (~80-120px), higher opacity (~10-15%)
  - 2-3 blobs: `blur(20-30px)` — mid-ground, medium size (~150-200px), medium opacity (~8-10%)
  - 1-2 blobs: `blur(50-60px)` — far background, large (~250-350px), low opacity (~5-6%)
- Container: `fixed inset-0 z-0 pointer-events-none overflow-hidden`
- `prefers-reduced-motion`: disables all animations

**2. CSS keyframes in `src/index.css`** (~25 lines)
- `lava-rise`: `translateY` oscillation (e.g. 0% → -15% → 5% → 0%)
- `lava-drift`: `translateX` sway
- `lava-morph`: `border-radius` shape shifting between organic values
- `lava-color`: `background-color` transition green ↔ gold

**3. Update `src/components/PageLayout.tsx`** (~3 lines)
- Import and render `<LavaLampBackground />` when `showBackground` is true
- Remove the static `bg-dots` div

**4. Update `src/pages/Index.tsx`** (~2 lines)
- Add `<LavaLampBackground />` to the landing page

### Visual Result
Sharp small blobs float in the foreground like nearby oil droplets. Large blurred blobs sit deep behind, creating atmospheric depth. The mix of clear + blurred creates the illusion of a 3D lava lamp with objects at different distances from the viewer.

### Files
1. `src/components/LavaLampBackground.tsx` (new)
2. `src/index.css` (add keyframes)
3. `src/components/PageLayout.tsx` (swap bg-dots for lava lamp)
4. `src/pages/Index.tsx` (add lava lamp)

