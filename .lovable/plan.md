

# Add Chat Conversation Export (PDF and Text)

## Overview

Add the ability to export chat conversations as PDF or plain text files directly from the TaxBot interface.

## New Features

- Export current conversation as formatted PDF with TaxForge branding
- Export current conversation as plain text file
- Export menu accessible from the chat header
- Disable export when conversation is empty

## File Changes

### 1. `src/lib/chatExport.ts` (NEW)

New utility file for chat export functions:

```typescript
// Functions to implement:
// - exportChatToPDF(conversation, options)
// - exportChatToText(conversation)
// - Format messages with timestamps and role labels
// - Apply TaxForge branding for PDF
```

PDF Structure:
```text
+------------------------------------------+
| [TF] TaxForge NG           [Conversation]|
+------------------------------------------+
| Conversation Title                       |
| Date: Jan 29, 2026                       |
+------------------------------------------+
| You:                                     |
| What is the current VAT rate in Nigeria? |
|                                          |
| TaxBot:                                  |
| The current VAT rate in Nigeria is 7.5%, |
| effective since February 2020...         |
+------------------------------------------+
| [Footer with disclaimer]                 |
+------------------------------------------+
```

Text Format:
```text
TaxForge NG - Chat Conversation Export
Title: What is the current VAT rate...
Date: 29 Jan 2026, 14:30

---

You:
What is the current VAT rate in Nigeria?

TaxBot:
The current VAT rate in Nigeria is 7.5%...

---

Exported from TaxForge NG (www.taxforgeng.com)
```

### 2. `src/components/TaxAssistant.tsx` (MODIFY)

Add export functionality to the chat header:
- Import new export functions
- Add `DropdownMenu` for export options
- Add `Download` icon to header
- Disable export when no messages exist

New UI element in header:
```text
+------------------------------------------+
| [☰] TaxBot        [⬇️] [+New] [X]       |
+------------------------------------------+
              └─ Dropdown Menu:
                  - Export as PDF
                  - Export as Text
```

Changes:
- Add `DropdownMenu` component import
- Add `Download` icon import from lucide-react
- Add export dropdown between title and New Chat button
- Call export functions with current conversation
- Show success toast after export

## Technical Approach

1. **PDF Export**: Use existing `exportShared.ts` utilities for consistent branding:
   - `addPDFHeader()` for branded header
   - `addPDFFooter()` with disclaimer
   - `generateFilename()` for consistent naming
   - `downloadFile()` for triggering download

2. **Text Export**: Simple formatted text with:
   - Header with title and date
   - Messages separated by dividers
   - Footer with attribution

3. **User Experience**:
   - Export dropdown appears only when there are messages
   - Loading state while generating PDF
   - Toast notification on success

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/chatExport.ts` | CREATE | Export utilities for PDF and text |
| `src/components/TaxAssistant.tsx` | MODIFY | Add export dropdown menu |

## Expected Results

After implementation:
- Users can download any conversation as a branded PDF
- Users can download any conversation as plain text
- Exports are properly formatted and branded
- Empty conversations cannot be exported

