import jsPDF from "jspdf";
import {
  BRAND_COLORS,
  PDF_SETTINGS,
  formatNigerianDate,
  addPDFHeader,
  addPDFFooter,
  addPageNumbers,
  addTableHeader,
  addTableRow,
  addCSVHeader,
  escapeCSVValue,
  downloadFile,
  generateFilename,
} from "./exportShared";

interface AuditEntry {
  id: string;
  businessId: string;
  businessName: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  timestamp: Date;
}

const getActionLabel = (entry: AuditEntry): string => {
  switch (entry.action) {
    case 'create': return `Created ${entry.businessName}`;
    case 'update': return `Updated ${entry.field} on ${entry.businessName}`;
    case 'delete': return `Deleted ${entry.businessName}`;
    case 'view': return `Viewed ${entry.businessName}`;
    case 'export': return `Exported report for ${entry.businessName}`;
  }
};

export const exportAuditLogPDF = (logs: AuditEntry[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_SETTINGS.margin;

  // Header
  let y = addPDFHeader(doc, { badgeText: 'AUDIT LOG' });

  // Title
  doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Audit Log Export', margin, y);
  y += 8;

  doc.setTextColor(BRAND_COLORS.muted[0], BRAND_COLORS.muted[1], BRAND_COLORS.muted[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatNigerianDate(new Date().toISOString())}`, margin, y);
  doc.text(`${logs.length} entries`, pageWidth - margin, y, { align: 'right' });
  y += 15;

  // Table header
  y = addTableHeader(doc, [
    { text: '#', x: margin + 3 },
    { text: 'Timestamp', x: margin + 15 },
    { text: 'User', x: margin + 55 },
    { text: 'Action', x: margin + 100 },
  ], y);

  // Table rows
  logs.forEach((entry, index) => {
    // Check for page break
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
      y = addTableHeader(doc, [
        { text: '#', x: margin + 3 },
        { text: 'Timestamp', x: margin + 15 },
        { text: 'User', x: margin + 55 },
        { text: 'Action', x: margin + 100 },
      ], y);
    }

    const timestamp = new Date(entry.timestamp).toLocaleString('en-NG');
    const actionLabel = getActionLabel(entry);
    
    y = addTableRow(doc, [
      { text: (index + 1).toString(), x: margin + 3 },
      { text: timestamp.substring(0, 18), x: margin + 15 },
      { text: entry.user.substring(0, 20), x: margin + 55 },
      { text: actionLabel.substring(0, 35), x: margin + 100 },
    ], y, index % 2 === 0);

    // Add change details if present
    if (entry.oldValue && entry.newValue) {
      doc.setFontSize(8);
      doc.setTextColor(BRAND_COLORS.muted[0], BRAND_COLORS.muted[1], BRAND_COLORS.muted[2]);
      doc.text(`   Changed: "${entry.oldValue}" → "${entry.newValue}"`, margin + 5, y + 3);
      y += 6;
    }
  });

  // Footer
  addPDFFooter(doc, {
    disclaimer: 'This audit log is for compliance and accountability purposes.',
  });

  // Page numbers
  addPageNumbers(doc);

  const filename = generateFilename('audit-log', 'pdf');
  doc.save(filename);
};

export const exportAuditLogCSV = (logs: AuditEntry[]) => {
  const headerLines = addCSVHeader('Audit Log Export');
  
  const headers = ['#', 'Timestamp', 'User', 'Action', 'Business', 'Field', 'Old Value', 'New Value'];
  const rows = logs.map((entry, index) => [
    escapeCSVValue(index + 1),
    escapeCSVValue(new Date(entry.timestamp).toISOString()),
    escapeCSVValue(entry.user),
    escapeCSVValue(entry.action),
    escapeCSVValue(entry.businessName),
    escapeCSVValue(entry.field || ''),
    escapeCSVValue(entry.oldValue || ''),
    escapeCSVValue(entry.newValue || ''),
  ].join(','));

  const csvContent = [
    ...headerLines,
    headers.join(','),
    ...rows,
  ].join('\n');

  const filename = generateFilename('audit-log', 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};
