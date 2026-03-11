

## Update the Static HTML Loading Shell in index.html

### Problem
The initial loader in `index.html` (lines 277-293) is a plain white screen with a basic green spinner and "Loading TaxForge..." text. This is what users see before React mounts — it doesn't match the branded premium aesthetic.

### Solution
Update the static HTML shell to visually match the `AuthLoadingScreen` component: warm cream background, TaxForge logo, dual-ring spinner with primary/accent colors, and the "Nigeria Tax Calculator" subtitle.

### Changes — `index.html`

Replace the `#initial-loader` div (lines 277-293) with:

1. **Background**: Use the warm cream (`#f8f6f0` / the theme's background color) instead of white
2. **Logo**: Show the actual `/icon-192.png` with rounded corners and shadow
3. **Brand text**: "TaxForge" heading + "Nigeria Tax Calculator" subtitle
4. **Spinner**: Dual concentric rings matching the React component (primary green outer ring, accent gold inner ring, counter-rotating)
5. **Progress bar**: Thin gradient shimmer bar at the bottom
6. **Remove the nav header** from the static shell — the branded splash is full-screen centered, matching the React version
7. **Add CSS keyframes** for the dual-ring spin and shimmer animations

The static shell will seamlessly blend into the React `AuthLoadingScreen` when it mounts, creating a smooth perceived loading experience.

