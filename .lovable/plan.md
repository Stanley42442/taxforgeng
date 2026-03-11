

## Update Favicon and PWA Icons with New Logo

Replace all existing icons (favicon, PWA 192x192, PWA 512x512, and Apple touch icon) with the uploaded new logo featuring the green shield with gold "TF" monogram.

### Steps

1. **Copy and resize the uploaded image** into `public/` directory as:
   - `favicon-192.png` — 192x192px for favicon small size
   - `favicon-512.png` — 512x512px for favicon large size  
   - `apple-touch-icon.png` — 180x180px for iOS
   - `icon-192.png` — 192x192px for PWA manifest
   - `icon-512.png` — 512x512px for PWA manifest

2. **Update `index.html`** to reference new favicon paths (`favicon-192.png`, `favicon-512.png`)

3. **Update `public/manifest.json`** to point to the new PWA icons (already references `icon-192.png` and `icon-512.png`)

4. **Update `vite.config.ts`** PWA plugin config to include new icon assets in `includeAssets`

5. **Update OG image reference** in `index.html` (optional) to also use the new logo for social sharing consistency

The new logo is a high-quality AI-generated image with the TaxForge branding (green shield with gold TF monogram, upward arrow, and coin stacks) which matches the existing brand colors and will work well as both favicon and PWA icon.

