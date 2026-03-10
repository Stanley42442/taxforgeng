

## Fix Opaque Cards + Smoother Lava Lamp Blobs

### Problem 1: Opaque Cards
The light mode `.glass` and `.glass-frosted` classes use `background: hsl(var(--card))` — fully opaque white with no `backdrop-filter`. Only dark mode gets translucency. Cards need semi-transparent backgrounds with backdrop blur in both themes so you can see the lava lamp through them.

The `Card` component (card.tsx) default variant uses `bg-card` which is also fully opaque.

### Problem 2: Jerky Blob Movement
Current `lava-float` has 9 keyframe stops with aggressive scale distortions (scaleY up to 1.3). `lava-drift` uses `margin-left` (not GPU-accelerated). Multiple separate animations fighting over transform create jitter.

### Changes

**1. `src/index.css` — Light mode glass translucency**
- `.glass`: `background: hsl(var(--card) / 0.7)` + `backdrop-filter: blur(12px)`
- `.glass-frosted`: `background: hsl(var(--card) / 0.65)` + `backdrop-filter: blur(16px)`
- `.glass-subtle`: `background: hsl(var(--card) / 0.5)` + `backdrop-filter: blur(8px)`
- `.neumorphic`: `background: hsl(var(--card) / 0.75)` + `backdrop-filter: blur(10px)`

**2. `src/index.css` — Smoother lava animations**
- Combine `lava-float` + `lava-drift` into single `lava-move` keyframe using `translate()` (GPU-accelerated), eliminating `margin-left`
- Reduce to 5 keyframe stops with gentle scale (max scaleY 1.08)
- Use `cubic-bezier(0.45, 0.05, 0.55, 0.95)` for liquid easing
- Remove `lava-depth` (z-index animation causes visual popping)
- Simplify `lava-morph` to 4 stops with subtler radius shifts

**3. `src/components/ui/card.tsx` — Card default variant translucency**
- Change default variant from `bg-card` to `bg-card/70 backdrop-blur-xl` so the base Card component is also see-through

**4. `src/components/LavaLampBackground.tsx`**
- Remove per-blob `filter: blur()` since we'll add a uniform blur
- Simplify blob config to use the new combined animation variables

### Files (3)
1. `src/index.css` — glass translucency + animation rewrite
2. `src/components/ui/card.tsx` — translucent default variant
3. `src/components/LavaLampBackground.tsx` — simplified blob config

