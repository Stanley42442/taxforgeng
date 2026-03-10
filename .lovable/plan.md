

## Make Lava Blobs Travel Full Page Vertically

### Problem
Current `lava-float` only moves blobs by percentages of their own size (e.g., `-55%` of a 100px blob = 55px). Blobs need to travel the full viewport height — rising from bottom to top, then falling back down.

### Changes

**1. `src/index.css`** — Replace `lava-float` with viewport-based travel
- Use `translateY` with `vh` units instead of `%` so blobs travel the full page
- Blobs rise from starting position up to near the top (~-80vh), then fall back
- Keep the scaleX/scaleY stretch-and-squish during rise/fall
- Asymmetric timing: slower rise (blobs heating up), faster fall (cooling/sinking)

```css
@keyframes lava-float {
  0%   { transform: translateY(0vh) scaleX(1) scaleY(1); }
  10%  { transform: translateY(-10vh) scaleX(0.95) scaleY(1.1); }
  25%  { transform: translateY(-35vh) scaleX(0.88) scaleY(1.25); }
  40%  { transform: translateY(-65vh) scaleX(0.85) scaleY(1.3); }
  50%  { transform: translateY(-80vh) scaleX(0.92) scaleY(1.15); }
  60%  { transform: translateY(-70vh) scaleX(1.05) scaleY(0.9); }
  75%  { transform: translateY(-40vh) scaleX(1.12) scaleY(0.85); }
  90%  { transform: translateY(-10vh) scaleX(1.05) scaleY(0.95); }
  100% { transform: translateY(0vh) scaleX(1) scaleY(1); }
}
```

**2. `src/components/LavaLampBackground.tsx`** — Reposition blobs to start at/near bottom
- Set all blobs' `top` to `bottom`-relative values (85-105%) so they start off-screen or near the bottom edge
- This way the full rise animation carries them to the top of the viewport and back

### Files
1. `src/index.css` (~8 lines in `lava-float` keyframe)
2. `src/components/LavaLampBackground.tsx` (~9 lines adjusting `y` values)

