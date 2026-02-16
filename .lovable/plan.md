Firstly consider the fact that the website I tried the embeddable widget on was a website that wasn't hosted, I simply previewed the website using acode on my android phone and on my mobile browser

## Fix: Embeddable Calculator Not Loading in External Iframes

### Problem

The embed widget creates an iframe pointing to `taxforgeng.com/embed/calculator`, but:

1. The hosting platform sends `X-Frame-Options: SAMEORIGIN` headers by default, which blocks the iframe from rendering on any external domain.
2. The embed route goes through the full app shell with framer-motion animations, which adds unnecessary loading overhead and a brief `opacity: 0` flash.

### Solution

#### 1. Add permissive framing headers for embed routes (`public/_headers`)

Add route-specific headers to allow the `/embed/*` paths to be loaded in iframes on any domain:

```
/embed/*
  X-Frame-Options: ALLOWALL
  Content-Security-Policy: frame-ancestors *
```

This only loosens framing restrictions for the embed route -- the rest of the site stays protected.

#### 2. Skip page animations for embed routes (`src/App.tsx`)

The `AnimatedRoutes` component wraps every route in a `motion.div` that starts at `opacity: 0`. For embed routes loaded in iframes, this causes a visible flash. The fix: detect embed routes in `AnimatedRoutes` and skip the animation wrapper, rendering the route directly.

### Files Changed


| File              | Change                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| `public/_headers` | Add `/embed/*` section with permissive X-Frame-Options and frame-ancestors |
| `src/App.tsx`     | Skip framer-motion animation wrapper for `/embed/` routes                  |


### Technical Notes

- The edge function `validate-embed-key` was tested and returns a valid response -- it is not the bottleneck.
- The partner API key `txf_385a1e125a8d4ebba9518fe4e1091e8a` exists and is active with no origin restrictions, so any domain can embed it.
- The CSP `frame-ancestors` directive does **not** work in HTML `<meta>` tags, only in HTTP headers -- hence the `_headers` file approach.