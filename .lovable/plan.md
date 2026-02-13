

# SEO/AEO Phase 13: SectorPresets.tsx Duplicate Data with Wrong CIT Rate (25% instead of 30%)

## Summary

The `SectorPresets.tsx` component maintains its own duplicate sector configuration data separate from the verified `sectorConfig.ts`. Nine sectors in this duplicate dataset use `citRate: 25` instead of the correct **30%** per NTA 2025. Additionally, `taxCalculations.ts` has a stale comparison checking `citRate !== 25` (should be `!== 30`) that suppresses the "Sector-specific CIT rate" alert for sectors using the standard rate.

## Errors Found

### Error 1: SectorPresets.tsx — 9 Sectors with citRate: 25

The following sectors all use `citRate: 25` instead of `30`:

| Sector | Line |
|--------|------|
| Manufacturing | 116 |
| Export Business | 167 |
| Fintech | 184 |
| Healthcare | 203 |
| Real Estate | 221 |
| Logistics | 239 |
| Renewables | 256 |
| Hospitality | 297 |
| Construction | 334 |

The correct `sectorConfig.ts` (used by `EnhancedSectorPresets`) already has `citRate: 30` with comments citing the 2026 rules.

### Error 2: taxCalculations.ts — Alert Threshold Compares Against 25

Line 296 reads:
```
sectorRules?.citRate !== undefined && sectorRules.citRate !== 25
```

This should compare against `30` (the standard rate) so that the "Sector-specific CIT rate" alert only fires for genuinely non-standard rates (e.g., 0% for agriculture, small companies).

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/SectorPresets.tsx` | Change `citRate: 25` to `citRate: 30` in 9 sector entries (lines 116, 167, 184, 203, 221, 239, 256, 297, 334) |
| `src/lib/taxCalculations.ts` | Change `sectorRules.citRate !== 25` to `sectorRules.citRate !== 30` (line 296) |

## Technical Details

### SectorPresets.tsx (9 lines)

Each occurrence:
- From: `citRate: 25,`
- To: `citRate: 30,`

### taxCalculations.ts (line 296)

- From: `} else if (sectorRules?.citRate !== undefined && sectorRules.citRate !== 25) {`
- To: `} else if (sectorRules?.citRate !== undefined && sectorRules.citRate !== 30) {`

## Impact

- Users selecting sectors via the legacy `SectorPresets` popover currently get CIT calculated at 25% instead of 30%, producing figures that are **16.7% too low**
- The alert threshold bug means sectors with the correct 30% rate (from `sectorConfig.ts`) incorrectly trigger a "Sector-specific CIT rate: 30%" info alert as if 30% were non-standard

**Total: 2 files modified, 0 new files created**

