

## Assessment: Your Export Stack vs. the Research

Your project is already in great shape. Here's the honest breakdown:

### What you already have (and it's solid)
- **PDF** — jsPDF with a custom table engine (`addTableHeader`, `addTableRow`, `addWrappedTableRow`) plus full brand theming. This is more customized than what `jspdf-autotable` would give you.
- **Excel** — SheetJS (`xlsx`) with multi-sheet workbooks, currency formats, formulas. Gold standard, already in place.
- **CSV** — Custom `toCSV()` + `escapeCSVValue()` in `exportShared.ts`. Works fine for your data sizes.
- **JSON/TXT** — Native browser via `downloadFile()`. No library needed.
- **ZIP** — JSZip for bulk payslip downloads. Already integrated.

### What could actually improve things

**1. Add `jspdf-autotable` for data-heavy tables only**
Your custom table rendering is great for branded reports, but for pages with large dynamic datasets (expense lists, transaction history, audit logs), `autotable` handles pagination, column auto-sizing, and overflow automatically — things your manual code has to handle with `checkPageBreak`. This would reduce code in `businessReportPdf.ts` and `expensesSummaryPdf.ts` while still allowing your branded header/footer/summary boxes.

**2. Skip PapaParse — not needed**
Your CSV data is structured objects, not messy user-uploaded CSVs. Your custom `toCSV()` handles escaping correctly. PapaParse's value is in *parsing* complex CSVs, not generating them. Adding it would be unnecessary bloat.

**3. Add a universal "Export Menu" component**
You have export functions scattered across pages. A reusable `<ExportMenu formats={['pdf','csv','xlsx']} onExport={...} />` component would standardize the UX — consistent dropdown, loading states, error toasts, and format icons across every page.

### Proposed changes

| Change | Effort | Impact |
|--------|--------|--------|
| Install `jspdf-autotable` and use it for long data tables in expense/audit/transaction PDFs | Medium | Cleaner code, better auto-pagination |
| Create `<ExportMenu>` reusable component with format picker, loading state, toast feedback | Medium | Consistent UX across all export points |
| Add TXT export option to the export system (plaintext summary) | Low | Completeness — some users prefer it |

### Files to create/modify
1. **New:** `src/components/ExportMenu.tsx` — Reusable export dropdown with format icons
2. **Modify:** `src/lib/exportShared.ts` — Add `exportToTXT()` helper
3. **Modify:** `src/lib/expensesSummaryPdf.ts` — Optionally adopt `autotable` for the monthly breakdown table
4. **Modify:** `src/lib/businessReportPdf.ts` — Optionally adopt `autotable` for transaction tables
5. **Modify:** Pages that have export buttons — use the new `<ExportMenu>` component

### What stays the same
- Your branded PDF headers, footers, summary boxes, accent section headers — all stay
- Excel export — already excellent
- CSV generation — custom `toCSV()` is sufficient
- ZIP bulk downloads — already working

