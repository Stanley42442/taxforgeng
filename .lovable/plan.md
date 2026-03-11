

## Update Loading Screen to Match Premium Fintech Aesthetic

Replace the plain loading screen with a branded splash that uses the new TaxForge logo, the site's lava lamp background, and refined typography matching the fintech design system.

### Changes — `src/components/AuthLoadingScreen.tsx`

1. **Use the actual logo image** (`/icon-192.png`) instead of the green box with "T"
2. **Add the LavaLampBackground** behind the splash for visual consistency with the rest of the site
3. **Use Space Grotesk heading** with the gold accent tagline, matching the site's typography
4. **Replace the basic spinner** with a smooth dual-ring spinner using primary/accent colors
5. **Add a subtle progress bar** at the bottom that pulses, giving a premium feel
6. **Warm cream background** (`bg-background`) with the lava blobs floating behind — same atmosphere as the homepage

### Design Details
- Logo: 64x64 `icon-192.png` with a subtle shadow
- Title: "TaxForge" in `text-2xl font-bold`, subtitle "Nigeria Tax Calculator" in `text-muted-foreground`
- Spinner: Dual concentric rings (primary outer, accent inner) with counter-rotation
- Bottom: Thin animated gradient bar (primary → accent) sliding left to right
- Exit animation: Scale down + fade out (existing logic preserved)

### Files
- **Modify:** `src/components/AuthLoadingScreen.tsx`

