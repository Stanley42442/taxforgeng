import { jsPDF } from "jspdf";
import { formatCurrency } from "./taxCalculations";
import {
  BRAND_COLORS,
  PDF_SETTINGS,
  formatNaira,
  formatNigerianDate,
  addPDFHeader,
  addPDFFooter,
  addPageNumbers,
  addSummaryBox,
  addTableHeader,
  addTableRow,
  addAccentSectionHeader,
  toCSV,
  addCSVHeader,
  downloadFile,
  generateFilename,
} from "./exportShared";

export interface DashboardExportData {
  dateRange: string;
  dateRangeStart: Date;
  dateRangeEnd: Date;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  deductibleExpenses: number;
  businessCount: number;
  totalTurnover: number;
  transactionCount: number;
  reminderCount: number;
  urgentCount: number;
  businesses: Array<{
    name: string;
    entityType: string;
    turnover: number;
    sector?: string;
  }>;
}

export const exportDashboardToPDF = (data: DashboardExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_SETTINGS.margin;
  const contentWidth = pageWidth - margin * 2;

  // === HEADER ===
  let y = addPDFHeader(doc, { badgeText: 'DASHBOARD REPORT' });

  // Report title
  doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary Report', margin, y);
  y += 10;

  // Date info
  doc.setTextColor(BRAND_COLORS.muted[0], BRAND_COLORS.muted[1], BRAND_COLORS.muted[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${data.dateRange}`, margin, y);
  doc.text(`Generated: ${formatNigerianDate(new Date().toISOString())}`, pageWidth - margin, y, { align: 'right' });

  y += 15;

  // === SUMMARY BOX ===
  y = addSummaryBox(doc, {
    title: 'NET INCOME',
    mainValue: formatCurrency(data.netIncome),
    subtitle: `Income: ${formatCurrency(data.totalIncome)} | Expenses: ${formatCurrency(data.totalExpenses)}`,
    y,
  });

  // === KEY METRICS GRID ===
  const colWidth = (contentWidth - 10) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 10;

  // Income details
  doc.setFillColor(BRAND_COLORS.lightBg[0], BRAND_COLORS.lightBg[1], BRAND_COLORS.lightBg[2]);
  doc.roundedRect(col1X, y, colWidth, 45, 3, 3, 'F');
  
  doc.setTextColor(BRAND_COLORS.nigerianGreen[0], BRAND_COLORS.nigerianGreen[1], BRAND_COLORS.nigerianGreen[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Income & Expenses', col1X + 8, y + 12);
  
  doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const incomeItems = [
    ['Total Income', formatCurrency(data.totalIncome)],
    ['Total Expenses', formatCurrency(data.totalExpenses)],
    ['Deductible Expenses', formatCurrency(data.deductibleExpenses)],
  ];
  
  let itemY = y + 22;
  incomeItems.forEach(([label, value]) => {
    doc.text(label, col1X + 8, itemY);
    doc.text(value, col1X + colWidth - 8, itemY, { align: 'right' });
    itemY += 8;
  });

  // Business summary
  doc.setFillColor(BRAND_COLORS.lightBg[0], BRAND_COLORS.lightBg[1], BRAND_COLORS.lightBg[2]);
  doc.roundedRect(col2X, y, colWidth, 45, 3, 3, 'F');
  
  doc.setTextColor(BRAND_COLORS.nigerianGreen[0], BRAND_COLORS.nigerianGreen[1], BRAND_COLORS.nigerianGreen[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Overview', col2X + 8, y + 12);
  
  doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const businessItems = [
    ['Businesses', data.businessCount.toString()],
    ['Total Turnover', formatCurrency(data.totalTurnover)],
    ['Transactions', data.transactionCount.toString()],
  ];
  
  itemY = y + 22;
  businessItems.forEach(([label, value]) => {
    doc.text(label, col2X + 8, itemY);
    doc.text(value, col2X + colWidth - 8, itemY, { align: 'right' });
    itemY += 8;
  });

  y += 55;

  // Reminders summary
  if (data.reminderCount > 0 || data.urgentCount > 0) {
    if (data.urgentCount > 0) {
      doc.setFillColor(254, 242, 242);
    } else {
      doc.setFillColor(BRAND_COLORS.lightBg[0], BRAND_COLORS.lightBg[1], BRAND_COLORS.lightBg[2]);
    }
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
    
    const textColor = data.urgentCount > 0 ? BRAND_COLORS.danger : BRAND_COLORS.nigerianGreen;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Reminders', margin + 8, y + 13);
    
    doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.reminderCount} total reminders${data.urgentCount > 0 ? ` \u2022 ${data.urgentCount} urgent` : ''}`, pageWidth - margin - 8, y + 13, { align: 'right' });
    
    y += 28;
  }

  // === BUSINESSES LIST ===
  if (data.businesses.length > 0) {
    y = addAccentSectionHeader(doc, 'REGISTERED BUSINESSES', y, 'green');

    // Table header
    y = addTableHeader(doc, [
      { text: 'Business Name', x: margin + 5 },
      { text: 'Type', x: margin + 90 },
      { text: 'Sector', x: margin + 120 },
      { text: 'Turnover', x: pageWidth - margin - 5, align: 'right' as const },
    ], y);

    data.businesses.forEach((biz, index) => {
      y = addTableRow(doc, [
        { text: biz.name.substring(0, 30), x: margin + 5 },
        { text: biz.entityType === 'company' ? 'LLC' : 'Business', x: margin + 90 },
        { text: biz.sector || 'N/A', x: margin + 120 },
        { text: formatCurrency(biz.turnover), x: pageWidth - margin - 5, align: 'right' as const },
      ], y, index % 2 === 0);
    });
  }

  // === FOOTER ===
  addPDFFooter(doc, {
    disclaimer: 'This report is generated for informational purposes only. Please verify all figures with your records.',
  });

  // Page numbers
  addPageNumbers(doc);

  const filename = generateFilename('dashboard', 'pdf');
  doc.save(filename);
};

export const exportDashboardToCSV = (data: DashboardExportData) => {
  // Build CSV with branding header
  const headerLines = addCSVHeader('Dashboard Summary Report', data.dateRange);
  
  const rows: string[][] = [
    // Financial summary
    ['=== FINANCIAL SUMMARY ==='],
    ['Metric', 'Amount'],
    ['Total Income', data.totalIncome.toFixed(2)],
    ['Total Expenses', data.totalExpenses.toFixed(2)],
    ['Net Income', data.netIncome.toFixed(2)],
    ['Deductible Expenses', data.deductibleExpenses.toFixed(2)],
    [],
    // Business overview
    ['=== BUSINESS OVERVIEW ==='],
    ['Metric', 'Value'],
    ['Number of Businesses', data.businessCount.toString()],
    ['Total Turnover', data.totalTurnover.toFixed(2)],
    ['Total Transactions', data.transactionCount.toString()],
    ['Active Reminders', data.reminderCount.toString()],
    ['Urgent Reminders', data.urgentCount.toString()],
    [],
  ];
  
  // Businesses list
  if (data.businesses.length > 0) {
    rows.push(['=== REGISTERED BUSINESSES ===']);
    
    const businessData = data.businesses.map(biz => ({
      'Business Name': biz.name,
      'Entity Type': biz.entityType === 'company' ? 'LLC' : 'Business Name',
      'Sector': biz.sector || 'N/A',
      'Turnover': biz.turnover.toFixed(2),
    }));
    
    const businessCSV = toCSV(businessData);
    rows.push(...businessCSV.split('\n').map(line => [line]));
  }

  // Combine header and data
  const csvContent = [...headerLines, ...rows.map(row => row.join(','))].join('\n');
  
  const filename = generateFilename('dashboard', 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};
