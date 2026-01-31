
# Professional PDF Export System Overhaul

## Identified Issues from Screenshot Analysis

Looking at the screenshot carefully, I can identify **6 distinct quality problems**:

| Issue | Description | Root Cause |
|-------|-------------|------------|
| 1. Broken Naira Symbol (₦) | Shows as "?" or box character | jsPDF's Helvetica font doesn't support Unicode `\u20A6` |
| 2. Inconsistent Decimals | Shows `2,000.0` instead of `2,000.00` | `showDecimals` defaults to `false` in `formatNaira()` |
| 3. Excessive Top Margin | Large empty space before content | Header returns Y=30 but content starts too low |
| 4. No Table Borders/Lines | Data rows blend together | Missing visual row separators |
| 5. Tight Text Spacing | Values cramped against edges | Insufficient padding in table cells |
| 6. Missing Section Dividers | Report sections unclear | No visual breaks between sections |

---

## Technical Solution

### 1. Font Embedding for Naira Symbol

**Problem**: jsPDF's built-in Helvetica font is a standard PDF font that only supports basic Latin characters. The Naira symbol (`\u20A6`) is not included.

**Solution**: Replace the Unicode Naira symbol with a reliable text prefix "NGN" across all PDF exports. This is the industry-standard approach used by Nigerian banks and FIRS.

```typescript
// BEFORE (broken)
const nairaSymbol = '\u20A6';
return `${nairaSymbol}${formatted}`;

// AFTER (reliable)
return `NGN ${formatted}`;
```

**Alternative (Future Enhancement)**: Embed a custom TTF font (like Roboto or Noto Sans) using jsPDF's `addFont()` method. This would require:
- Adding ~200KB font file to the project
- Converting TTF to base64
- Registering the font before PDF generation

### 2. Consistent Decimal Formatting

**Problem**: `formatNaira()` defaults `showDecimals` to `false`, causing values like `₦2,000.0` or `₦500`.

**Fix**: Always show 2 decimal places for financial documents:

```typescript
export function formatNaira(amount: number, options?: { showDecimals?: boolean }) {
  const { showDecimals = true } = options || {};  // Changed default to TRUE
  
  const formatted = absAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,  // Always 2 decimals
    maximumFractionDigits: 2,
  });
  
  return `NGN ${formatted}`;
}
```

### 3. Reduced Header Whitespace

**Problem**: `addNigerianHeader()` returns Y=30 after drawing 18px of stripes, leaving 12px of dead space.

**Fix**: Tighten header layout:

```typescript
export function addNigerianHeader(doc: jsPDF): number {
  // Green bar (reduced from 12px to 8px)
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  // White stripe (reduced from 4px to 2px)
  doc.rect(0, 8, pageWidth, 2, 'F');
  
  // Bottom green line (kept at 2px)
  doc.rect(0, 10, pageWidth, 2, 'F');
  
  return 18; // Return tighter Y position (was 30)
}
```

### 4. Table Visual Improvements

Add horizontal lines between rows and consistent padding:

```typescript
export function addTableRow(doc, data, y, isAlternate, rowHeight = 10): number {
  // Add subtle bottom border for every row
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y + rowHeight - 2, pageWidth - margin, y + rowHeight - 2);
  
  // Existing alternating background logic...
}
```

### 5. Text Spacing Improvements

Increase padding in table cells:

```typescript
// Current: x: margin + 5
// Fixed:   x: margin + 8 (more breathing room)

// Current: x: pageWidth - margin - 5
// Fixed:   x: pageWidth - margin - 10 (prevent edge crowding)
```

### 6. Section Dividers

Add visual breaks between major sections:

```typescript
export function addSectionDivider(doc: jsPDF, y: number): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Gold accent line
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(margin, y, pageWidth - margin * 2, 1, 'F');
  
  return y + 6;
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/exportShared.ts` | Core fixes: formatNaira(), header spacing, table styling, add section dividers |
| `src/lib/invoicePdfExport.ts` | Update to use new formatNaira(), fix spacing |
| `src/lib/pdfExport.ts` | Update to use new formatNaira(), fix spacing |
| `src/lib/payslipPdfExport.ts` | Update to use new formatNaira() from exportShared, fix local formatting |
| `src/lib/businessReportPdf.ts` | Update to use new shared utilities |
| `src/lib/individualPdfExport.ts` | Already uses exportShared - will inherit fixes |
| `src/lib/expensesSummaryPdf.ts` | Already uses exportShared - will inherit fixes |
| `src/lib/taxFormsPdf.ts` | Already uses exportShared - will inherit fixes |
| `src/lib/payrollCalculations.ts` | Update local formatNaira() to use "NGN" prefix |

---

## Expected Results

After implementation:
- **Naira values**: `NGN 500,000.00` (clear, professional, always readable)
- **Decimals**: Consistent 2 decimal places for all currency
- **Layout**: Tighter header (12px saved), better section flow
- **Tables**: Clear row separation, comfortable padding
- **Sections**: Gold accent dividers between major areas

---

## Example Before/After

**Before (current):**
```
?2,000.0
?500,000
```

**After (fixed):**
```
NGN 2,000.00
NGN 500,000.00
```

This matches Nigerian banking standards (Access Bank, GTBank, Paystack all use "NGN" prefix in formal documents).
