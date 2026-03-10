

## Fix All 5 PDF Visual Issues

Based on the uploaded PDFs and code review, here are the exact problems and fixes:

### 1. Footer text collision (Invoice + all PDFs)
**Problem:** `addPDFFooter` places disclaimer at `footerY + 2`, copyright at `footerY + 7`, timestamp at `footerY + 12`, and page numbers at `pageHeight - 10` — all within a 25px `footerHeight`. The long `STANDARD_DISCLAIMER` string doesn't wrap, so it overflows into the copyright line.

**Fix:** Use `doc.splitTextToSize()` to wrap the disclaimer, then stack copyright and timestamp below it with proper spacing. Increase `footerHeight` from 25 to 40 to reserve more space. Update `checkPageBreak`'s bottom margin calculation accordingly.

### 2. Alert/recommendation text overflow (PIT Report)
**Problem:** In `addAlertBox`, long messages are rendered with a single `doc.text()` call at fixed height 12px — text runs off the right edge.

**Fix:** Use `doc.splitTextToSize()` inside `addAlertBox` to wrap text, then dynamically size the box height based on line count.

### 3. Unicode icon rendering ("⚠" → "!9")
**Problem:** `addAlertBox` and `addStatusBadge` use Unicode characters `\u26A0` (⚠), `\u2139` (ℹ), `\u2717` (✗) which Helvetica cannot render.

**Fix:** Replace with simple ASCII markers: warning → `"!"`, info → `"i"`, danger → `"x"`, success → keep `"\u2713"` (checkmark works in Helvetica). Draw a small colored circle behind the letter for visual weight.

### 4. Repeating table headers on page breaks (autotable)
**Problem:** `businessReportPdf.ts` and `expensesSummaryPdf.ts` use `jspdf-autotable` but don't set `showHead: 'everyPage'` (it defaults to `'everyPage'` in autotable, but the custom table rendering via `addTableHeader`/`addTableRow` in `pdfExport.ts` and `individualPdfExport.ts` does NOT repeat headers after `checkPageBreak`).

**Fix:** In the `checkPageBreak` callback (`onNewPage`) for table sections, re-render the table header. This applies to `pdfExport.ts` and `individualPdfExport.ts`.

### 5. Invoice notes section overlapping footer
**Problem:** The invoice's notes section (`y + 50` box at line 223) can extend into the footer area. No `checkPageBreak` is used.

**Fix:** Add a space check before the notes section. If insufficient room, push to next page.

### Files to modify
1. **`src/lib/exportShared.ts`** — Fix `addPDFFooter` (wrap disclaimer text), fix `addAlertBox` (wrap + dynamic height), fix icon characters, increase `footerHeight`
2. **`src/lib/pdfExport.ts`** — Add table header repeat in `onNewPage` callback
3. **`src/lib/individualPdfExport.ts`** — Add table header repeat in `onNewPage` callback, wrap recommendation text with `splitTextToSize`
4. **`src/lib/invoicePdfExport.ts`** — Add space check before notes section

