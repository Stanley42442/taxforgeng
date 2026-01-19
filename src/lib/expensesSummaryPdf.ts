import { jsPDF } from "jspdf";
import { formatCurrency } from "./taxCalculations";
import {
  BRAND_COLORS,
  PDF_SETTINGS,
  formatNigerianDate,
  addPDFHeader,
  addPDFFooter,
  addPageNumbers,
  addTableHeader,
  addTableRow,
  addSummaryBox,
  generateFilename,
} from "./exportShared";

interface MonthlyData {
  monthName: string;
  income: number;
  expenses: number;
  net: number;
}

export const exportMonthlySummaryPDF = (
  sortedMonths: Array<[string, MonthlyData]>
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_SETTINGS.margin;

  // Header
  let y = addPDFHeader(doc, { badgeText: 'EXPENSE SUMMARY' });

  // Title
  doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Expense Summary', margin, y);
  y += 8;

  doc.setTextColor(BRAND_COLORS.muted[0], BRAND_COLORS.muted[1], BRAND_COLORS.muted[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatNigerianDate(new Date().toISOString())}`, margin, y);
  y += 15;

  // Calculate totals for summary box
  const totals = sortedMonths.reduce((acc, [, data]) => ({
    income: acc.income + data.income,
    expenses: acc.expenses + data.expenses,
    net: acc.net + data.net
  }), { income: 0, expenses: 0, net: 0 });

  // Summary box
  y = addSummaryBox(doc, {
    title: 'NET INCOME',
    mainValue: formatCurrency(totals.net),
    subtitle: `Total Income: ${formatCurrency(totals.income)} | Total Expenses: ${formatCurrency(totals.expenses)}`,
    y,
  });

  y += 5;

  // Table header
  y = addTableHeader(doc, [
    { text: 'Month', x: margin + 5 },
    { text: 'Income', x: margin + 70 },
    { text: 'Expenses', x: margin + 110 },
    { text: 'Net', x: pageWidth - margin - 5, align: 'right' as const },
  ], y);

  // Table rows
  sortedMonths.forEach(([, data], index) => {
    y = addTableRow(doc, [
      { text: data.monthName, x: margin + 5 },
      { text: formatCurrency(data.income), x: margin + 70, color: BRAND_COLORS.success },
      { text: formatCurrency(data.expenses), x: margin + 110, color: BRAND_COLORS.danger },
      { 
        text: formatCurrency(data.net), 
        x: pageWidth - margin - 5, 
        align: 'right' as const,
        color: data.net >= 0 ? BRAND_COLORS.success : BRAND_COLORS.danger
      },
    ], y, index % 2 === 0);
  });

  // Totals row
  y += 3;
  doc.setFillColor(BRAND_COLORS.nigerianGreen[0], BRAND_COLORS.nigerianGreen[1], BRAND_COLORS.nigerianGreen[2]);
  doc.rect(margin, y, pageWidth - margin * 2, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', margin + 5, y + 8);
  doc.text(formatCurrency(totals.income), margin + 70, y + 8);
  doc.text(formatCurrency(totals.expenses), margin + 110, y + 8);
  doc.text(formatCurrency(totals.net), pageWidth - margin - 5, y + 8, { align: 'right' });

  // Footer
  addPDFFooter(doc, {
    disclaimer: 'This report is for informational purposes only. Please verify all figures with your records.',
  });

  // Page numbers
  addPageNumbers(doc);

  const filename = generateFilename('monthly-expense-summary', 'pdf');
  doc.save(filename);
};
