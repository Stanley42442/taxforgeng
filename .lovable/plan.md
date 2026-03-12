

## Fix: Content Too Narrow Across All Pages

### Problem
The `PageLayout` default was changed to `7xl` (1400px), but **38 pages explicitly set a narrower `maxWidth`** like `"4xl"` (896px) or `"6xl"` (1152px). On a wide screen, this leaves significant unused space. Additionally, the homepage (`Index.tsx`) doesn't use `PageLayout` at all — it uses its own `container` + `max-w-3xl`/`max-w-4xl` constraints per section.

### Fix

**1. Widen commonly-used page widths in `PageLayout.tsx`**

Update the width map to make content fill more of the screen:
- `"4xl"`: `max-w-4xl` (896px) → `max-w-6xl` (1152px)  
- `"6xl"`: `max-w-6xl` (1152px) → `max-w-[1400px]`

This way pages that set `maxWidth="4xl"` or `"6xl"` will be wider without needing to edit each page individually. Pages using `"2xl"` or `"xl"` (forms, narrow content) stay narrow intentionally.

**2. Widen homepage sections in `Index.tsx`**

- Hero section: `max-w-3xl` → `max-w-4xl` for the text block
- FAQ grid: `max-w-4xl` → `max-w-5xl` 
- CTA section: `max-w-3xl` → `max-w-4xl`
- These sections use `container mx-auto` (1400px) as the outer wrapper, but inner `max-w-*` classes constrain content too tightly

### Files to modify
- `src/components/PageLayout.tsx` — Widen `4xl` and `6xl` breakpoints in the map
- `src/pages/Index.tsx` — Widen hero, FAQ, and CTA inner max-widths

