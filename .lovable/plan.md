

# PWA Final Fixes & Enhancements Plan

## Current Status

The PWA Professional Standards plan has been **95% completed**. The core fixes (auth token preservation, manifest enhancements, iOS support, update checking) are all implemented correctly.

However, I found **5 remaining unsafe storage calls** that should be fixed for complete reliability in private browsing mode.

---

## Issues to Fix

### Issue 1: Unsafe sessionStorage in Auth.tsx

**Location**: `src/pages/Auth.tsx` - Lines 235, 237, 263, 265, 619, 621, 655, 657

**Problem**: Raw `sessionStorage.setItem()` and `sessionStorage.removeItem()` calls without try-catch protection.

**Fix**: Replace with `safeSessionStorage.setItem()` and `safeSessionStorage.removeItem()` from the existing safe storage wrapper.

```typescript
// Before
sessionStorage.setItem('taxforge-session-only', 'true');
sessionStorage.removeItem('taxforge-session-only');

// After  
safeSessionStorage.setItem('taxforge-session-only', 'true');
safeSessionStorage.removeItem('taxforge-session-only');
```

### Issue 2: Unsafe sessionStorage in Transactions.tsx

**Location**: `src/pages/Transactions.tsx` - Line 88

**Problem**: Raw `sessionStorage.setItem()` call for imported transactions.

**Fix**: Wrap with try-catch or use safeSessionStorage.

```typescript
// Before
sessionStorage.setItem('imported_transactions', JSON.stringify({...}));

// After
safeSessionStorage.setJSON('imported_transactions', {...});
```

---

## Additional Enhancements

### Enhancement 1: Add Narrow Screenshot for Mobile Install

**File**: `public/manifest.json`

Add a mobile-optimized screenshot for better install UX:

```json
"screenshots": [
  {
    "src": "/og-image.png",
    "sizes": "1200x630",
    "type": "image/png",
    "form_factor": "wide",
    "label": "TaxForge NG Dashboard"
  },
  {
    "src": "/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "form_factor": "narrow",
    "label": "TaxForge NG App Icon"
  }
]
```

### Enhancement 2: Add Related Applications

**File**: `public/manifest.json`

Add prefer_related_applications flag for native app promotion (future-proofing):

```json
"prefer_related_applications": false,
"related_applications": []
```

### Enhancement 3: Network Information API Support

**File**: `src/components/OfflineBanner.tsx`

Enhance to show connection quality (slow 2G, 3G, 4G, etc.):

```typescript
// Show "Slow connection" warning when on 2G/slow-2g
const connection = (navigator as any).connection;
const isSlowConnection = connection?.effectiveType === '2g' || 
                         connection?.effectiveType === 'slow-2g';
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Replace 8 `sessionStorage` calls with `safeSessionStorage` |
| `src/pages/Transactions.tsx` | Replace 1 `sessionStorage.setItem` with safe wrapper |
| `public/manifest.json` | Add narrow screenshot, related_applications |
| `src/components/OfflineBanner.tsx` | Add slow connection warning (optional) |
| `docs/CHANGELOG.md` | Document final PWA fixes |

---

## Implementation Priority

1. **High Priority**: Fix unsafe sessionStorage calls (prevents crashes in private browsing)
2. **Medium Priority**: Add narrow screenshot (improves mobile install experience)
3. **Low Priority**: Network quality indicator (nice-to-have UX improvement)

---

## Security Notes

The Supabase linter warnings are already documented and acceptable:
- **Extension in public schema**: Managed by Supabase, cannot be moved
- **Permissive RLS policy**: Already documented in `docs/SECURITY.md` as intentional for specific tables (login_attempts, document_verifications, sector_presets, user_reviews)

---

## Expected Outcome After Implementation

- 100% safe storage coverage (no crashes in private browsing)
- Better mobile install experience with narrow screenshot
- Complete PWA professional standards compliance
- Improved offline UX with connection quality indicators

