

# SEO/AEO Phase 20: Sector Guide Data -- Remaining Pioneer Status References Without EDI Context

## Summary

The sector guide data in `src/lib/taxMyths.ts` contains 7 references to "Pioneer Status" as a current incentive without mentioning its replacement by the Economic Development Incentive (EDI) under NTA 2025. These appear in the tech, fintech, and healthcare sector guides -- user-facing educational content indexed by search engines.

## Errors Found

### Error 1: Tech Sector -- benefits array (line 691)
- Current: `'Pioneer Status eligibility for software development'`
- Fix: `'EDI tax credit eligibility for software development (replaces Pioneer Status)'`

### Error 2: Tech Sector -- taxIncentives array (line 705)
- Current: `{ name: 'Pioneer Status', value: '0% CIT', duration: 'Up to 5 years' }`
- Fix: `{ name: 'EDI Tax Credit', value: '5% annual credit on qualifying capex', duration: '5 years' }`

### Error 3: Fintech Sector -- benefits array (line 1038)
- Current: `'Potential Pioneer Status for innovative services'`
- Fix: `'EDI tax credit for innovative services (replaces Pioneer Status)'`

### Error 4: Fintech Sector -- content string (line 1075)
- Current: `'- Tax holidays via Pioneer Status'`
- Fix: `'- EDI tax credits (replaces Pioneer Status)'`

### Error 5: Healthcare Sector -- benefits array (line 1095)
- Current: `'Pioneer Status for local drug manufacturing'`
- Fix: `'EDI tax credit for local drug manufacturing (replaces Pioneer Status)'`

### Error 6: Healthcare Sector -- taxIncentives array (line 1109)
- Current: `{ name: 'Drug Manufacturing', value: 'Pioneer Status available', duration: 'Up to 5 years' }`
- Fix: `{ name: 'Drug Manufacturing', value: 'EDI tax credit available', duration: '5 years' }`

### Error 7: Healthcare Sector -- content string (line 1128)
- Current: `'- Pioneer Status (0% CIT for 3-5 years)'`
- Fix: `'- EDI tax credit (5% annual credit for 5 years, replaces Pioneer Status)'`

## File to Modify

| File | Changes |
|------|---------|
| `src/lib/taxMyths.ts` | Update 7 Pioneer Status references across tech, fintech, and healthcare sector guides |

## Technical Details

All changes are in `src/lib/taxMyths.ts`:

**Line 691:** `'Pioneer Status eligibility for software development'` to `'EDI tax credit eligibility for software development (replaces Pioneer Status)'`

**Line 705:** `{ name: 'Pioneer Status', value: '0% CIT', duration: 'Up to 5 years' }` to `{ name: 'EDI Tax Credit', value: '5% annual credit on qualifying capex', duration: '5 years' }`

**Line 1038:** `'Potential Pioneer Status for innovative services'` to `'EDI tax credit for innovative services (replaces Pioneer Status)'`

**Line 1075:** `'- Tax holidays via Pioneer Status'` to `'- EDI tax credits (replaces Pioneer Status)'`

**Line 1095:** `'Pioneer Status for local drug manufacturing'` to `'EDI tax credit for local drug manufacturing (replaces Pioneer Status)'`

**Line 1109:** `{ name: 'Drug Manufacturing', value: 'Pioneer Status available', duration: 'Up to 5 years' }` to `{ name: 'Drug Manufacturing', value: 'EDI tax credit available', duration: '5 years' }`

**Line 1128:** `'- Pioneer Status (0% CIT for 3-5 years)'` to `'- EDI tax credit (5% annual credit for 5 years, replaces Pioneer Status)'`

## What This Addresses

- 3 sector benefit arrays presenting Pioneer Status as current law
- 2 taxIncentives arrays with outdated Pioneer Status values
- 2 long-form content strings describing Pioneer Status tax holidays without EDI

**Total: 1 file modified, 7 individual text corrections, 0 new files created**

