

# SEO/AEO Phase 19: Tax Logic PDF, Tax Myths, and Remaining Pioneer Status Without EDI Context

## Summary

Three files still contain Pioneer Status references without EDI context. These are in user-facing downloadable PDFs and educational content that could mislead users about current law.

## Errors Found

### Error 1: taxLogicDocumentPdf.ts -- Healthcare Row Says "Pioneer status eligible" (line 583)

The downloadable Tax Logic Reference PDF contains a sector comparison table where the Healthcare row lists "Pioneer status eligible" as the special incentive. This PDF is shared with accountants and professionals.

- Current: `'Pioneer status eligible'`
- Fix: `'EDI tax credit eligible'`

### Error 2: taxMyths.ts -- "startup-grace-period" Myth References Pioneer Status Without EDI (line 75)

The explanation for the startup grace period myth says "While certain incentives exist (like Pioneer Status requiring application)" without noting that Pioneer Status is replaced by EDI under 2026 rules.

- Current: `'...like Pioneer Status requiring application...'`
- Fix: `'...like the Economic Development Incentive (EDI, formerly Pioneer Status)...'`

Also, the `relatedTopics` array on line 79 lists `'Pioneer Status'` without EDI.

- Current: `['startup compliance', 'first-year taxes', 'Pioneer Status']`
- Fix: `['startup compliance', 'first-year taxes', 'Pioneer Status', 'EDI']`

### Error 3: taxLogicDocumentPdf.ts -- Agriculture Row Says "5-year CIT holiday" (line 581)

While agriculture does have a CIT exemption period, presenting it as "5-year CIT holiday" in a 2026-context document without noting that this is for primary production only could mislead agro-processing businesses into assuming they qualify.

- Current: `'5-year CIT holiday'`
- Fix: `'CIT holiday (primary production)'`

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/taxLogicDocumentPdf.ts` | Update Healthcare incentive (line 583) and Agriculture incentive (line 581) |
| `src/lib/taxMyths.ts` | Update startup myth explanation (line 75) and relatedTopics (line 79) |

## Technical Details

### taxLogicDocumentPdf.ts (lines 581-583)

```
From:
  ['Agriculture', '0%', 'Zero-rated', '5-year CIT holiday'],
  ['Manufacturing', '30%', 'Standard', '10% investment credit'],
  ['Healthcare', '30%', 'Exempt', 'Pioneer status eligible'],

To:
  ['Agriculture', '0%', 'Zero-rated', 'CIT holiday (primary production)'],
  ['Manufacturing', '30%', 'Standard', '10% investment credit'],
  ['Healthcare', '30%', 'Exempt', 'EDI tax credit eligible'],
```

### taxMyths.ts (line 75)

```
From: 'This is one of the most dangerous tax myths. While certain incentives exist (like Pioneer Status requiring application), there\'s no blanket exemption for new businesses.'
To:   'This is one of the most dangerous tax myths. While certain incentives exist (like the Economic Development Incentive (EDI, formerly Pioneer Status)), there\'s no blanket exemption for new businesses.'
```

### taxMyths.ts (line 79)

```
From: relatedTopics: ['startup compliance', 'first-year taxes', 'Pioneer Status'],
To:   relatedTopics: ['startup compliance', 'first-year taxes', 'Pioneer Status', 'EDI'],
```

## What This Addresses

- 1 downloadable PDF table presenting Pioneer Status as current Healthcare incentive
- 1 agriculture incentive label that could mislead agro-processing businesses
- 1 educational myth explanation referencing Pioneer Status without EDI context
- 1 related topics array missing EDI keyword

**Total: 2 files modified, 0 new files created**

