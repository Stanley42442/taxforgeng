

## Export Files Review & Makeover Plan

### Current State Assessment

After reviewing all export files, here's what I found:

**PDF exports (7 files):** The PDFs already use a consistent Nigerian Green (#008751) + Gold (#D4AF37) theme via `exportShared.ts`. The shared utilities (header bars, summary boxes, table rows, footers) work well. However, there are several issues:

1. **`businessReportPdf.ts`** — Doesn't use shared helpers. Manually duplicates header/footer/table logic that `exportShared.ts` already provides. The badge says "BUSINESS REPORT" in a light gray bg instead of the gold badge used everywhere else.

2. **`payslipPdfExport.ts`** — Duplicates brand color constants (`NIGERIAN_GREEN`, `GOLD`, `DARK_GREEN`) instead of importing from `exportShared.ts`. Uses its own header/footer style that's visually inconsistent (full green bar + gold stripe footer vs. the standard header pattern).

3. **Summary box inconsistency** — The shared `addSummaryBox` uses a nested green→gold→green layered box. `businessReportPdf.ts` duplicates this inline, but `payslipPdfExport.ts` uses a completely different net pay box style.

4. **Section titles** — Some files use the shared `addSectionTitle` (green text), but `payslipPdfExport.ts` uses colored left-border accent bars (gold/blue/yellow). The accent bar pattern actually looks more polished and should become the standard.

5. **CSV/Excel exports** — Functional but plain. The Excel export includes branding metadata and currency formats, which is fine. No visual issues — Excel styling is limited by the `xlsx` library anyway.

6. **Print stylesheet (`print.css`)** — Already well-structured with print-specific brand colors. No issues.

### Proposed Changes

**Phase 1: Standardize `businessReportPdf.ts` (refactor to use shared helpers)**
- Replace manual header/footer/table rendering with `addPDFHeader`, `addPDFFooter`, `addPageNumbers`, `addTableHeader`, `addTableRow`, `addSummaryGrid`
- Use gold badge ("BUSINESS REPORT") matching all other PDF types
- Use `addSectionTitle` for section headers
- Remove duplicated color variables

**Phase 2: Standardize `payslipPdfExport.ts` (align with shared brand)**
- Remove duplicated `NIGERIAN_GREEN`, `GOLD`, `DARK_GREEN` constants — import from `BRAND_COLORS`
- Replace custom header with `addPDFHeader` (accent header + logo + badge)
- Replace custom footer with `addPDFFooter`
- Keep the colored accent bar pattern for section headers (it's actually the best-looking pattern) — but extract it into a new shared helper `addAccentSectionHeader` in `exportShared.ts`

**Phase 3: Add accent section header to `exportShared.ts`**
- New function `addAccentSectionHeader(doc, title, y, type: 'green' | 'red' | 'blue' | 'warning')` — renders the left-border accent bar + colored background section header used in payslips
- Update `pdfExport.ts`, `individualPdfExport.ts`, `dashboardExport.ts`, and `expensesSummaryPdf.ts` to use this for their section breaks instead of plain text titles, giving all PDFs a more polished look

**Phase 4: Improve table styling in `exportShared.ts`**
- Add subtle left-border accent (2px green) to table header rows for more visual weight
- Slightly increase table header height from 10 to 12 for better readability

### Files to modify
1. `src/lib/exportShared.ts` — Add `addAccentSectionHeader` helper, improve table header styling
2. `src/lib/businessReportPdf.ts` — Full refactor to use shared helpers
3. `src/lib/payslipPdfExport.ts` — Replace duplicated constants, use shared header/footer
4. `src/lib/pdfExport.ts` — Use accent section headers
5. `src/lib/individualPdfExport.ts` — Use accent section headers
6. `src/lib/dashboardExport.ts` — Use accent section headers
7. `src/lib/expensesSummaryPdf.ts` — Use accent section headers

### What stays the same
- CSV exports — already clean and functional
- Excel exports — branding metadata is solid, `xlsx` library limits visual styling anyway
- Print stylesheet — already well-structured
- Invoice PDF — already looks professional and uses shared helpers correctly

