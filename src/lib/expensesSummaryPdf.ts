import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./taxCalculations";
import {
  BRAND_COLORS,
  PDF_SETTINGS,
  formatNigerianDate,
  addPDFHeader,
  addPDFFooter,
  addPageNumbers,
  addSummaryBox,
  addAccentSectionHeader,
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
  const margin = PDF_SETTINGS.margin;

  // Header
  let y = addPDFHeader(doc, { badgeText: 'EXPENSE SUMMARY' });

  // Title
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Expense Summary', margin, y);
  y += 8;

  doc.setTextColor(...BRAND_COLORS.muted);
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

  // Table section header
  y = addAccentSectionHeader(doc, 'MONTHLY BREAKDOWN', y, 'green');

  // AutoTable for monthly breakdown — handles pagination automatically
  autoTable(doc, {
    startY: y,
    head: [['Month', 'Income', 'Expenses', 'Net']],
    body: sortedMonths.map(([, data]) => [
      data.monthName,
      formatCurrency(data.income),
      formatCurrency(data.expenses),
      formatCurrency(data.net),
    ]),
    foot: [['TOTAL', formatCurrency(totals.income), formatCurrency(totals.expenses), formatCurrency(totals.net)]],
    theme: 'grid',
    headStyles: {
      fillColor: [BRAND_COLORS.nigerianGreen[0], BRAND_COLORS.nigerianGreen[1], BRAND_COLORS.nigerianGreen[2]],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    footStyles: {
      fillColor: [BRAND_COLORS.nigerianGreen[0], BRAND_COLORS.nigerianGreen[1], BRAND_COLORS.nigerianGreen[2]],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]],
    },
    alternateRowStyles: {
      fillColor: [BRAND_COLORS.lightBg[0], BRAND_COLORS.lightBg[1], BRAND_COLORS.lightBg[2]],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { halign: 'right', textColor: [BRAND_COLORS.success[0], BRAND_COLORS.success[1], BRAND_COLORS.success[2]] },
      2: { halign: 'right', textColor: [BRAND_COLORS.danger[0], BRAND_COLORS.danger[1], BRAND_COLORS.danger[2]] },
      3: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      // Color net column based on value
      if (data.column.index === 3 && data.section === 'body') {
        const rowData = sortedMonths[data.row.index];
        if (rowData) {
          const net = rowData[1].net;
          const color = net >= 0 ? BRAND_COLORS.success : BRAND_COLORS.danger;
          data.cell.styles.textColor = [color[0], color[1], color[2]];
        }
      }
    },
  });

  // Footer
  addPDFFooter(doc, {
    disclaimer: 'This report is for informational purposes only. Please verify all figures with your records.',
  });

  // Page numbers
  addPageNumbers(doc);

  const filename = generateFilename('monthly-expense-summary', 'pdf');
  doc.save(filename);
};
