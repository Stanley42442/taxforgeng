

# SEO/AEO Phase 21: Remove Abolished Medium Company CIT Tier from Schema, AI Files, and Docs

## Summary

The Nigeria Tax Act 2025 **abolished the medium-sized company classification entirely** (confirmed by Baker Tilly: "Elimination of Medium-Sized Company Classification"). Under 2026 rules, companies are either **small (0% CIT)** or **standard/large (30% CIT)**. The old 20% medium tier was part of the pre-2026 CITA regime.

The calculator code and Tax Logic Reference page already correctly implement only two tiers. However, three files still present a three-tier CIT system as 2026 law -- including the homepage structured data (FAQPage schema), the AI-facing llms-full.txt, and the internal business plan.

**Source:** Baker Tilly Nigeria (Aug 2025), "Elimination of Medium-Sized Company Classification -- The medium-sized company category has been removed entirely. Taxpayers are now either small (exempt) or standard (fully liable)." Also confirmed by AO2 Law citing NTA 2025 Section 56.

## Errors Found

### Error 1: index.html -- FAQPage Schema Answer (line 145)

The structured data FAQ answer for "What is the company income tax rate in Nigeria?" states: "Medium companies (₦50M-₦200M turnover) pay 20%." This is indexed by Google and AI engines as a factual claim about 2026 law.

- **Fix:** Remove medium company reference. State: "Companies not qualifying as small pay 30% CIT."

### Error 2: index.html -- DefinedTerm "CIT Medium Company" (line 213)

A DefinedTerm in the DefinedTermSet schema markup declares a medium company tier at 20%.

- **Fix:** Remove this DefinedTerm entirely.

### Error 3: index.html -- Noscript Fallback CIT Table (line 242)

The noscript section lists "Medium Company (turnover ₦50M - ₦200M): 20% CIT" for non-JS users and crawlers.

- **Fix:** Remove the medium company row. Show only small (0%) and large/standard (30%).

### Error 4: public/llms-full.txt -- CIT Rates Table (line 56)

The AI-facing file lists "Medium (turnover ₦50M-₦200M): 20%" as a 2026 rate.

- **Fix:** Remove the medium row. Add note about professional services exclusion.

### Error 5: docs/BUSINESS_PLAN.md -- CIT Table (line 475)

Internal documentation lists the same incorrect medium tier.

- **Fix:** Remove medium company row. Update to two-tier system.

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Fix FAQPage answer (line 145), remove DefinedTerm (line 213), fix noscript table (line 242) |
| `public/llms-full.txt` | Remove medium company row from CIT table (line 56) |
| `docs/BUSINESS_PLAN.md` | Remove medium company row from CIT table (line 475) |

## Technical Details

### index.html (line 145)
```
From: "CIT rates for 2026: Small companies (turnover ≤₦50M and assets ≤₦250M) pay 0%. Medium companies (₦50M-₦200M turnover) pay 20%. Large companies (above ₦200M) pay 30%. A 4% Development Levy also applies to medium and large companies."
To:   "CIT rates for 2026: Small companies (turnover ≤₦50M and assets ≤₦250M, excluding professional services) pay 0% CIT, 0% CGT, and 0% Development Levy. All other companies pay 30% CIT plus 4% Development Levy. The medium company tier (20%) has been abolished under NTA 2025."
```

### index.html (line 213) -- Remove this line:
```
{"@type": "DefinedTerm", "name": "CIT Medium Company", "description": "Turnover NGN 50M to NGN 200M: 20% CIT"},
```

### index.html (lines 241-243) -- Noscript CIT table
```
From:
  <dt>Small Company (turnover ≤ ₦50M, assets ≤ ₦250M)</dt><dd>0% CIT</dd>
  <dt>Medium Company (turnover ₦50M – ₦200M)</dt><dd>20% CIT</dd>
  <dt>Large Company (turnover > ₦200M)</dt><dd>30% CIT</dd>
To:
  <dt>Small Company (turnover ≤ ₦50M, assets ≤ ₦250M, excl. professional services)</dt><dd>0% CIT</dd>
  <dt>All Other Companies</dt><dd>30% CIT + 4% Development Levy</dd>
```

### public/llms-full.txt (lines 55-57)
```
From:
  | Small (turnover ≤₦50M AND assets ≤₦250M) | 0% |
  | Medium (turnover ₦50M-₦200M) | 20% |
  | Large (turnover >₦200M) | 30% |
To:
  | Small (turnover ≤₦50M AND assets ≤₦250M, excl. professional services) | 0% |
  | All other companies | 30% |
```

### docs/BUSINESS_PLAN.md (lines 474-476)
```
From:
  | Small Company | ≤ ₦50M AND Assets ≤ ₦250M | 0% |
  | Medium Company | > ₦50M to ₦200M | 20% |
  | Large Company | > ₦200M | 30% |
To:
  | Small Company | ≤ ₦50M AND Assets ≤ ₦250M (excl. professional services) | 0% |
  | All Other Companies | Above small thresholds | 30% |
```

## What This Addresses

- 1 FAQPage schema answer presenting an abolished CIT tier as 2026 law (highest SEO/AEO impact)
- 1 DefinedTerm schema entry for a non-existent tax classification
- 1 noscript fallback table with incorrect CIT tiers
- 1 AI-facing file (llms-full.txt) providing wrong data to LLM crawlers
- 1 internal doc with outdated CIT tiers
- Also adds professional services exclusion note (per NTA 2025 Section 202) where missing

**Total: 3 files modified, 0 new files created**

