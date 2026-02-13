

# SEO/AEO Phase 25: Fix Stale "Medium Company" Reference in CIT Calculator SEO Page

## Summary

The CIT Calculator SEO landing page (`src/pages/seo/CITCalculator.tsx`) contains one remaining reference to the abolished "medium" company tier. In the "Common Mistakes to Avoid" section (line 260), the text reads:

> "applies to medium and large companies on top of CIT"

Under 2026 rules, there is no "medium" tier. The Development Levy applies to **all companies not qualifying as small**. This contradicts the comparison table on the same page (which correctly shows the medium tier as ABOLISHED) and creates an inconsistency that damages AEO accuracy.

All other files in the codebase were audited -- this is the only remaining incorrect "medium company" reference in a 2026 context.

## Change

**File:** `src/pages/seo/CITCalculator.tsx` (line 260)

```
From:
  'The Development Levy (replacing TET) is 4% of assessable profits and applies to medium and large companies on top of CIT. Budget for it separately.'

To:
  'The Development Levy (replacing TET) is 4% of assessable profits and applies to all companies that do not qualify for the small company exemption. Budget for it separately.'
```

## What This Addresses

- 1 stale reference to the abolished "medium" company tier on a high-traffic SEO landing page
- Eliminates contradiction with the CIT comparison table rendered on the same page
- Aligns "Common Mistakes" FAQ content with NTA 2025 two-tier classification

**Total: 1 file modified, 0 new files created**

