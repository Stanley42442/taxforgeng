

## Fix: Too Much Free Space on Left Side

### Problem
The navigation bar uses Tailwind's `container` class which maxes out at **1400px**, but most page content uses `max-w-6xl` (**1152px**). This ~250px difference makes the content appear offset/narrow relative to the header, creating noticeable empty space on the left.

### Fix

**`src/components/PageLayout.tsx`** — Change the default `maxWidth` from `"6xl"` to `"7xl"` so page content better fills the width under the nav bar. Also update the `7xl` value in the max-width map to `max-w-[1400px]` to exactly match the nav container width.

Changes:
- Default `maxWidth` parameter: `"6xl"` → `"7xl"`
- `maxWidthClasses["7xl"]`: `"max-w-7xl"` → `"max-w-[1400px]"` (matches the nav's container max-width)

This aligns page content width with the navigation, eliminating the perceived dead space. Pages that explicitly set `maxWidth="6xl"` or smaller will keep their current width.

