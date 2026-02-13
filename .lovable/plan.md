

# SEO/AEO Phase 22: Remove Abolished Medium Company Tier from Projection Tool and Partner API

## Summary

The MultiYearProjection component -- a user-facing financial planning tool -- still classifies companies into a "medium" tier under 2026 rules. This tier was abolished by the Nigeria Tax Act 2025. The partner API edge function also mislabels the pre-2026 medium company rate as "smallCompanyRate."

## Errors Found

### Error 1: MultiYearProjection.tsx -- 2026 Branch Still Uses "Medium" Tier (lines 76-79)

Under 2026 rules, when turnover is between 50M and 100M, the component labels the company as "medium." This classification no longer exists. Any company above the small thresholds is simply "large" (standard rate 30%).

The UI renders "M" badges (line 330) with warning colors for this non-existent tier, misleading users into thinking there's a transitional rate.

- **Current (line 76-79):** Companies with turnover 50M-100M classified as `'medium'`
- **Fix:** Under 2026 rules, any company above small threshold is `'large'` (standard). Remove the medium branch entirely for the 2026 path.

### Error 2: MultiYearProjection.tsx -- Type Definition Includes "Medium" (line 26)

The TypeScript type `'small' | 'medium' | 'large'` should be updated to `'small' | 'standard'` for 2026 rules, but since the same type is shared with pre-2026 (where medium existed), the simplest fix is to keep the type but change the 2026 logic to use `'large'` for all non-small companies.

### Error 3: partner-api/index.ts -- Pre-2026 Config Mislabels Medium Rate as "smallCompanyRate" (lines 150-153)

The pre-2026 config object uses `smallCompanyRate: 0.20` and `smallCompanyTurnoverLimit: 25000000`. Under pre-2026 CITA, the small company rate was 0% (turnover below 25M). The 20% was the medium company rate (25M-100M turnover). This data is returned via the partner API's `/rates` endpoint.

- **Current:** `smallCompanyRate: 0.20, smallCompanyTurnoverLimit: 25000000`
- **Fix:** Add proper medium company fields: `mediumCompanyRate: 0.20, mediumCompanyTurnoverLimit: 100000000` and set `smallCompanyRate: 0`

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/MultiYearProjection.tsx` | Remove medium tier from 2026 branch (lines 76-79) |
| `supabase/functions/partner-api/index.ts` | Fix pre-2026 CIT rate labels (lines 150-153) |

## Technical Details

### MultiYearProjection.tsx (lines 70-89)

```
From:
      if (entityType === 'company') {
        if (use2026Rules) {
          if (turnover < 50000000) {
            companySize = 'small';
            isExempt = true;
          } else if (turnover < 100000000) {
            companySize = 'medium';
          } else {
            companySize = 'large';
          }
        } else {
          if (turnover < 25000000) {
            companySize = 'small';
          } else if (turnover < 100000000) {
            companySize = 'medium';
          } else {
            companySize = 'large';
          }
        }
      }

To:
      if (entityType === 'company') {
        if (use2026Rules) {
          // 2026: Two-tier system only (small or standard). Medium tier abolished.
          if (turnover < 50000000) {
            companySize = 'small';
            isExempt = true;
          } else {
            companySize = 'large';
          }
        } else {
          // Pre-2026: Three-tier system (small/medium/large)
          if (turnover < 25000000) {
            companySize = 'small';
          } else if (turnover < 100000000) {
            companySize = 'medium';
          } else {
            companySize = 'large';
          }
        }
      }
```

### partner-api/index.ts (lines 150-153)

```
From:
    cit: {
      standardRate: 0.30,
      smallCompanyRate: 0.20,
      smallCompanyTurnoverLimit: 25000000
    },

To:
    cit: {
      standardRate: 0.30,
      smallCompanyRate: 0,
      smallCompanyTurnoverLimit: 25000000,
      mediumCompanyRate: 0.20,
      mediumCompanyTurnoverLimit: 100000000
    },
```

## What This Addresses

- 1 user-facing projection tool displaying a non-existent "Medium" company tier under 2026 rules
- 1 partner API endpoint returning mislabeled pre-2026 CIT rates
- UI badges showing "M" for a tier that no longer exists under current law

**Total: 2 files modified, 0 new files created**

