

# Fix: Restore Rich Static Schema to index.html

## The Problem

Grok (and other non-JS crawlers) only see the static `index.html`. In the last edit, we removed the basic static JSON-LD schema to avoid conflicts with the dynamic one. But non-JS crawlers now see **zero schema markup**. The dynamic schemas injected by SEOHead only appear after JavaScript executes.

**Who executes JS:** Googlebot, Bingbot (partially)
**Who does NOT:** Grok's fetcher, social media crawlers, most AI bots, link previews

## The Fix

Add the comprehensive `SoftwareApplication` + `Organization` schema directly into `index.html` as static JSON-LD. This is the same rich schema that `SEOHead` injects dynamically on the homepage, but now it's visible to ALL crawlers regardless of JS execution.

This does NOT conflict with the dynamic version -- having the same schema in static HTML and injected via JS is harmless (the dynamic version replaces it via the `data-seo-schema` attribute).

## Changes

### 1. Add rich static JSON-LD to index.html

Insert two schema blocks before `</head>`:

**SoftwareApplication schema** with:
- Full feature list (12 features)
- 3 pricing tiers (Free, Starter, Business)
- Area served, language, screenshots
- Provider organization details

**Organization schema** with:
- Name, URL, logo
- Service types and knowledge areas
- Founding date and area served

### 2. No other changes needed

Grok's other complaints (no meta description, no canonical, no viewport) are factually incorrect -- those tags are already present in `index.html` lines 5, 45, and 48.

## Technical Details

### File to Modify

| File | Change |
|------|--------|
| `index.html` | Add 2 static JSON-LD script blocks (~60 lines) before closing `</head>` tag |

**Total: 1 file modified**

### Why This Works

The static schema serves as a fallback for non-JS crawlers. When JS executes, SEOHead's dynamic schema takes over (it removes any existing `[data-seo-schema]` script and replaces it). The static blocks use a different attribute, so both can coexist without conflict.

### What About Prerendering?

Server-side rendering or build-time prerendering would make ALL dynamic meta tags visible to non-JS crawlers. However, this requires significant architecture changes (e.g., adding `vite-plugin-prerender` or migrating to a framework like Next.js/Remix), which is beyond the scope of SEO tweaks. The static fallbacks in `index.html` are the practical solution for a client-side SPA.

