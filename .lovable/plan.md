
# SEO/AEO Phase 26: Update FIRS References to NRS on Homepage

## Summary

Under the Nigeria Revenue Service Act 2025 (effective January 1, 2026), the Federal Inland Revenue Service (FIRS) was renamed to the **Nigeria Revenue Service (NRS)**. The homepage -- the most-visited page -- still displays "FIRS Compliant" in three prominent locations while internal pages (Tax Logic Reference, Verification Badge, Rent Relief Tooltip) already correctly use "NRS".

This creates a factual inconsistency on the highest-traffic page and undermines AEO accuracy. AI engines indexing the homepage would extract outdated agency names.

**Source:** Nigeria Revenue Service (Establishment) Act 2025, confirmed by PwC, EY, and Rephic Legal.

**SEO consideration:** Users still search "FIRS" more than "NRS", so the keywords meta tag retains both terms for discoverability.

## Changes

### File: `src/pages/Index.tsx`

**Change 1 -- SEO keywords (line 82):** Add "NRS compliant" alongside existing "FIRS compliant" for dual discoverability.

```
From:
  keywords="Nigeria tax calculator, CIT calculator Nigeria, VAT calculator Nigeria, PIT PAYE calculator, 2026 tax reforms Nigeria, FIRS compliant"

To:
  keywords="Nigeria tax calculator, CIT calculator Nigeria, VAT calculator Nigeria, PIT PAYE calculator, 2026 tax reforms Nigeria, NRS compliant, FIRS compliant"
```

**Change 2 -- Trust badge (line 201):** Update the visible badge text while keeping both names for user recognition.

```
From:
  { icon: CheckCircle2, text: "FIRS Compliant" },

To:
  { icon: CheckCircle2, text: "NRS Compliant" },
```

**Change 3 -- CTA section (line 310):** Update the call-to-action text.

```
From:
  Start calculating your taxes with FIRS-compliant 2026 rules today.

To:
  Start calculating your taxes with NRS-compliant 2026 rules today.
```

**Change 4 -- Footer description (line 334):** Update the footer brand description.

```
From:
  Free Nigerian tax calculator with FIRS-compliant 2026 rules.

To:
  Free Nigerian tax calculator with NRS-compliant 2026 rules.
```

## Files to Modify

| File | Lines | Changes |
|------|-------|---------|
| `src/pages/Index.tsx` | 82, 201, 310, 334 | Update 4 FIRS references to NRS |

## What This Addresses

- 4 outdated "FIRS" references on the highest-traffic page, contradicting the site's own internal pages that already use "NRS"
- Aligns the homepage with the Nigeria Revenue Service Act 2025 (effective 2026)
- Retains "FIRS compliant" in keywords meta tag for search discoverability during the transition period

**Total: 1 file modified, 0 new files created**
