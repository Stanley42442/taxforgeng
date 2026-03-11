

## Scale HTML Loader for Larger Screens

Add responsive CSS media queries to make the static HTML loader elements proportionally larger on tablet (768px+) and desktop (1024px+).

### Changes — `index.html`

Add media queries in the existing `<style>` block (line 294-298) to scale up:

| Element | Mobile (current) | Tablet (768px+) | Desktop (1024px+) |
|---------|-----------------|-----------------|-------------------|
| Logo | 64px | 96px | 120px |
| Title | 1.5rem | 2rem | 2.5rem |
| Subtitle | 0.875rem | 1rem | 1.125rem |
| Spinner | 40px | 56px | 72px |
| Loader text | 0.75rem | 0.875rem | 1rem |
| Gap | 20px | 28px | 32px |

The media queries go inside the existing style block after the keyframes, targeting the inline-styled elements via descendant selectors.

