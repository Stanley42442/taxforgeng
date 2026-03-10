

## Make Lava Lamp More Realistic

The current blobs move too uniformly — same easing, small movement range, and the `lava-rise` only shifts by 12%. Real lava lamp blobs rise from bottom to top, stretch vertically as they rise, squish as they settle, and move with more organic amplitude.

### Changes

**1. `src/index.css`** — Rework keyframes for realism:
- **`lava-rise`**: Much larger vertical travel (40-60% of viewport), slow rise then sink back down, asymmetric timing
- **`lava-drift`**: Wider horizontal sway (8-10%) with wobble
- **`lava-morph`**: More extreme shape changes — tall/stretched at rise peak, wide/flat at bottom (like real oil blobs stretching and squishing)
- **`lava-scale`**: New keyframe — blobs grow slightly as they rise (heat expansion) and shrink as they sink
- Combine `lava-rise` and `lava-scale` via a single `transform` keyframe (`lava-float`) to avoid animation conflicts

**2. `src/components/LavaLampBackground.tsx`** — Adjust blob config:
- Start most blobs near the bottom (y: 60-90%) so they "rise" upward like real lava
- Increase opacity slightly (foreground blobs to 0.18-0.22) so they're more visible and lava-like
- Add 2 more blobs (9 total) for a fuller, richer effect
- Vary sizes more dramatically (tiny 50px droplets + large 250px masses)
- Add `scaleY` stretch to the rise animation for that classic elongated-blob-rising look

### Visual Result
Blobs will appear to slowly bubble up from the bottom, stretch as they rise, flatten and drift as they reach the top, then slowly sink — exactly like watching a real lava lamp. The mix of sharp foreground droplets and soft background masses maintains the depth effect.

### Files
1. `src/index.css` (~20 lines changed in keyframes section)
2. `src/components/LavaLampBackground.tsx` (~30 lines adjusted)

