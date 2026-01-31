
# PDF Export Quality Fixes - Phase 2: Text Wrapping

## Problem Summary

From the screenshots, content is overflowing table cells and page boundaries because text is being truncated instead of wrapped. Users need **complete information** in their financial documents.

---

## Technical Approach: Multi-Line Table Rows

Instead of truncating text, we'll implement proper **text wrapping** that:
1. Automatically calculates how many lines each cell needs
2. Dynamically adjusts row height based on the tallest cell
3. Keeps all columns aligned regardless of line count
4. Handles page breaks when wrapped content would overflow

---

## Solution Details

### 1. Create Enhanced Table Row Function

A new `addWrappedTableRow()` function in `exportShared.ts` that:

```text
+-------------------+--------------------------------+-----------------+
| Relief Type       | Description                    | Amount          |
+-------------------+--------------------------------+-----------------+
| Rent Relief       | 20% of annual rent paid        | (NGN 100,000.00)|
|                   | (max NGN 500,000)              |                 |
+-------------------+--------------------------------+-----------------+
| Consolidated      | Higher of NGN 200,000 or       | (NGN 640,000.00)|
| Relief Allowance  | 1% of gross + 20% of gross     |                 |
+-------------------+--------------------------------+-----------------+
```

Key features:
- Uses `doc.splitTextToSize()` to split text into lines that fit column width
- Calculates maximum lines needed across all columns
- Renders each line at correct vertical position within the row
- Draws background and borders based on dynamic height

### 2. Define Column Widths for Tables

Create explicit column width definitions instead of using absolute X positions:

```text
| Column        | Width | Purpose                       |
|---------------|-------|-------------------------------|
| Relief Type   | 50px  | Short labels, rarely wraps    |
| Description   | 80px  | Longest content, needs wrap   |
| Amount        | 40px  | Currency values, right-align  |
```

### 3. Fix Naira Symbols in Source Data

Replace embedded `₦` symbols in `individualTaxCalculations.ts` with `NGN `:

| Before | After |
|--------|-------|
| `'max ₦500,000'` | `'max NGN 500,000'` |
| `'₦200k or 1%'` | `'NGN 200,000 or 1%'` |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/exportShared.ts` | Add `addWrappedTableRow()` function with multi-line support |
| `src/lib/individualPdfExport.ts` | Use new wrapped table row function in reliefs section |
| `src/lib/individualTaxCalculations.ts` | Replace `₦` with `NGN ` in description strings |
| Other PDF exports | Apply wrapped table rows where content overflows |

---

## Technical Implementation

### New `addWrappedTableRow()` Function

The function will:

1. **Accept column definitions with explicit widths**:
   - Each column has: text, x position, width, alignment, color

2. **Calculate wrapped lines for each cell**:
   - Use `doc.splitTextToSize(text, columnWidth)` for each cell

3. **Determine dynamic row height**:
   - Find the column with the most lines
   - Row height = base height + (extra lines * line spacing)

4. **Render multi-line content**:
   - Draw background based on dynamic height
   - Render each line at correct Y offset within the cell
   - Right-aligned columns: each line aligns to right edge

5. **Add row separator**:
   - Draw bottom border after content

### Page Break Handling

Before rendering a wrapped row, check if it fits on the current page:
- Calculate total row height first
- If it would overflow, trigger a new page
- Continue rendering on the new page

---

## Expected Results

### Before (Current - Truncated/Overflow):
```text
| Relief Type | Description                        | Amount     |
| Rent Relief | 20% of annual rent paid (max :5... | :100,000   |
```

### After (Fixed - Wrapped):
```text
| Relief Type | Description                  | Amount           |
| Rent Relief | 20% of annual rent paid      | (NGN 100,000.00) |
|             | (max NGN 500,000)            |                  |
```

All content is visible, properly formatted, and no text overflows its boundaries.

---

## Summary of Changes

1. **New utility function**: `addWrappedTableRow()` with multi-line text support
2. **Source data cleanup**: Replace `₦` symbols with `NGN ` in calculations
3. **Table layout updates**: Use explicit column widths instead of absolute positions
4. **Dynamic row heights**: Rows expand to fit content automatically
5. **Page break awareness**: Long content triggers proper page breaks
