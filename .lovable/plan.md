

# SEO/AEO Phase 30: Fix R&D Deduction Error, Update VAT Penalties, Fix Remaining FIRS References, and Add Missing NTA 2025 Content

## Research Findings

Cross-referencing the signed Nigeria Tax Act 2025 (via PwC, EY, KPMG, AO2LAW, and Baker Tilly) against our site reveals three categories of issues: a factual calculation error, outdated penalty figures, and missed FIRS-to-NRS updates.

### Verified: Our CIT threshold is CORRECT

Multiple sources (PwC, Baker Tilly, SMB Law) cite NGN 100M as the small company threshold, but this is the **NTAA "small business" definition for VAT administration** (Section 147, NTAA). The actual **NTA "small company" definition for CIT** (Section 56, NTA) is NGN 50M, confirmed by:
- EY (Section 56 reference): NGN 50M
- AO2LAW (direct quote from the Act): "gross turnover of N50,000,000 or less"
- The distinction is explicitly documented by AO2LAW: NTAA "small business" (N100M) is for VAT only; NTA "small company" (N50M) is for CIT

Our N50M CIT threshold is correct. No change needed.

### Issue 1: R&D Deduction Error (FACTUAL INACCURACY)

Our site references "R&D 120% super deduction" in multiple places. The NTA 2025 **changed this**:
- **Old rule**: 120% deduction of qualifying R&D costs (or 10% of profit)
- **New rule (NTA 2025, Section 165)**: Capped at **5% of turnover** (KPMG confirms: "reduced from 10% of profit")

This is displayed to users in sector config, tax myths, and PDF exports. It is factually wrong under 2026 rules.

**Files affected:**
- `src/lib/sectorConfig.ts` (line 76)
- `src/components/SectorPresets.tsx` (line 85)
- `src/lib/taxMyths.ts` (lines 692, 706, 1049, 1076)
- `src/lib/taxLogicDocumentPdf.ts` (line 580)

**Fix:** Change all "R&D 120% deduction" references to "R&D deduction (5% of turnover)" under 2026 rules.

### Issue 2: VAT Penalties Are Outdated

PwC confirms the NTA 2025 increased non-compliance penalties:
- **Old**: N50,000 first month + N25,000/month thereafter
- **New (NTA 2025)**: **N100,000 first month + N50,000/month** thereafter

Our site shows the old figures in at least 5 places.

**Files affected:**
- `src/pages/blog/VATGuideNigeria.tsx` (lines 21, 182-185)
- `src/pages/blog/TaxCalendar2026.tsx` (lines 20, 150-151)
- `src/pages/FAQ.tsx` (line 38)
- `src/components/PenaltyEstimator.tsx` (needs verification)

**Fix:** Update all penalty amounts to the 2026 figures.

### Issue 3: VAT Guide Still Has FIRS References

The VATGuideNigeria.tsx blog post was missed in the Phase 27-28 FIRS-to-NRS updates. It contains approximately 8 "FIRS" references.

**Files affected:**
- `src/pages/blog/VATGuideNigeria.tsx` (lines 19, 56, 85, 102, 137, 156)

**Fix:** Replace all "FIRS" with "NRS" (or "NRS (formerly FIRS)" for filing references).

### Issue 4: TaxCalendar2026 Blog Has FIRS Reference

**Files affected:**
- `src/pages/blog/TaxCalendar2026.tsx` (line 21: "FIRS operates the TaxPro Max e-filing portal")

**Fix:** Update to "NRS operates the TaxPro Max e-filing portal (taxpromax.nrs.gov.ng)"

### Issue 5: FAQ Still Has FIRS Reference

**Files affected:**
- `src/pages/FAQ.tsx` (line 36: "maintained by FIRS")

**Fix:** Update to "maintained by NRS"

## Changes Summary

| File | Issue | Change |
|------|-------|--------|
| `src/lib/sectorConfig.ts` | R&D error | "R&D 120% deduction" to "R&D deduction (5% of turnover)" |
| `src/components/SectorPresets.tsx` | R&D error | Same update |
| `src/lib/taxMyths.ts` | R&D error | Update all 120% references to 5% of turnover |
| `src/lib/taxLogicDocumentPdf.ts` | R&D error | Update table entry |
| `src/pages/blog/VATGuideNigeria.tsx` | FIRS + penalties | Replace FIRS with NRS; update penalty amounts to N100k/N50k |
| `src/pages/blog/TaxCalendar2026.tsx` | FIRS + penalties | Replace FIRS with NRS; update penalty amounts |
| `src/pages/FAQ.tsx` | FIRS + penalties | Replace FIRS with NRS; update penalty amounts |
| `src/components/PenaltyEstimator.tsx` | Penalties | Update penalty calculation logic if applicable |

## What This Addresses

- Fixes a factual inaccuracy (R&D 120% is pre-2026; 5% of turnover is the 2026 rule)
- Corrects outdated penalty figures that could mislead users on compliance costs
- Catches 10+ remaining FIRS references missed in Phase 27-28
- Aligns all educational content with the signed Nigeria Tax Act 2025

**Total: 8 files modified, 0 new files created**

