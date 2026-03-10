

## Make Blobs Look Like Real Lava Lamp Blobs

The key missing ingredient is the **SVG metaball filter** — an SVG `feGaussianBlur` + `feColorMatrix` combo that makes blobs visually merge when they overlap, exactly like real lava lamp wax. This is the industry-standard technique for CSS lava lamp effects. Without it, our blobs just stack on top of each other.

Additionally, the current animations are too jerky — too many keyframe stops with aggressive scale distortions. Real lava lamp blobs move slowly and smoothly with gentle, organic motion.

### Changes

**1. `src/components/LavaLampBackground.tsx`**
- Add an inline SVG filter definition (`feGaussianBlur` stdDeviation ~18, `feColorMatrix` with high alpha contrast `values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"`)
- Apply `filter: url(#lava-goo)` to the wrapper `div` so all child blobs merge when they overlap
- Remove per-blob `filter: blur()` since the SVG filter handles blurring
- Simplify blob config: fewer properties, gentler sizes, all blobs same color/opacity (the SVG filter handles visual blending)

**2. `src/index.css`**
- **`lava-float`**: Simplify to 3 keyframe stops (0%, 50%, 100%) with smooth `ease-in-out` — just `translateY(0)` → `translateY(-75vh)` → back. No aggressive scaleX/scaleY distortion
- **`lava-drift`**: Replace `margin-left` with `translateX` (GPU-accelerated, smoother). Gentler sway (5-8%)
- **Combine float + drift** into a single `lava-move` keyframe using `translate()` shorthand to avoid animation conflicts between two transforms
- **`lava-morph`**: Reduce to subtler border-radius shifts — real wax blobs are fairly round, not wildly deformed
- Remove `lava-depth` (the SVG filter handles visual depth via merging)
- Add `cubic-bezier(0.45, 0.05, 0.55, 0.95)` easing for that slow-at-extremes, smooth-in-middle feel

### Result
Blobs will smoothly rise and fall across the full page, gently wobble side to side, and **merge together when they touch** — producing the signature lava lamp look. The SVG filter creates that smooth, organic "goo" effect that's impossible with CSS alone.

### Files
1. `src/components/LavaLampBackground.tsx`
2. `src/index.css`

