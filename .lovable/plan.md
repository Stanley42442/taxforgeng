

## Replace Static White Loader with Animated Orb Splash

The static HTML loader in `index.html` (lines 274-312) currently shows logo + spinner on a plain `#f8f6f0` cream background. You want it to match the React `AuthLoadingScreen` which has the Lava Lamp orbs floating behind it.

### Approach
Since the lava lamp effect relies on CSS animations defined in `src/index.css` (which hasn't loaded yet when the static shell renders), we need to **inline a simplified version of the orb animations directly in the `index.html` static shell**.

### Changes

**File: `index.html`** (the `#initial-loader` div, lines 274-312)

1. Add 5-6 inline animated orb `<div>`s behind the loader content, using the same green (`#16a34a`) and gold (`#d4a843`) colors with varying sizes, blur, opacity, and animation delays.
2. Each orb gets a simple CSS `@keyframes` animation for floating movement (translate up/down/sideways) and color shifting — all defined inline in the existing `<style>` block.
3. The orbs sit at `z-index: 0` behind the loader content at `z-index: 1`.
4. Keep the cream background as fallback, but the orbs provide the visual atmosphere immediately.

This is purely a visual enhancement to the static HTML shell — no React or JS changes needed. When React mounts, the `AuthLoadingScreen` with the real `LavaLampBackground` component takes over seamlessly.

