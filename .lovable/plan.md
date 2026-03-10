

## Bigger, More Defined, Interactive Lava Blobs

### Changes

**1. `src/components/LavaLampBackground.tsx`** — Rewrite blob config and add z-index cycling

- Increase sizes dramatically: background blobs 400-500px, mid 250-350px, foreground 150-220px
- Increase opacity across the board: foreground 0.25-0.30, mid 0.15-0.18, background 0.08-0.10
- Reduce blur on mid-ground blobs (10-15px instead of 20-25px) for more definition
- Add a `z` property per blob and a new `--z-duration` CSS variable to cycle `z-index` over time, so blobs swap depth positions
- Position blobs so they overlap and "interact" — cluster x positions closer together so paths cross
- Add a new CSS variable `--z-duration` for z-index animation timing

**2. `src/index.css`** — Add z-index cycling keyframe and adjust existing animations

- New `@keyframes lava-depth`: cycles `z-index` between values (e.g. 1 → 3 → 1) so blobs appear to pass in front of and behind each other
- Adjust `lava-drift` to use wider, overlapping horizontal paths (up to 12-15%) so blobs cross each other's trajectories
- Add `lava-depth` to the `.lava-blob` animation shorthand

### Blob Config (9 blobs)
```
Background (2):  size 450-500, blur 50-60, opacity 0.08-0.10, z-cycle slow
Mid-ground (3):  size 250-350, blur 8-15,  opacity 0.15-0.18, z-cycle medium  
Foreground (4):  size 150-220, blur 0-4,   opacity 0.22-0.30, z-cycle fast
```

X positions clustered in 3 zones (15-35%, 40-60%, 65-85%) so blobs cross paths.

### Files
1. `src/components/LavaLampBackground.tsx` (~45 lines)
2. `src/index.css` (~10 lines added/changed)

