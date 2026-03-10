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
  addSummaryGrid,
  addAccentSectionHeader,
  truncateText,
} from "./exportShared";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  isDeductible: boolean;
  businessId?: string;
}

interface BusinessReportData {
  businessName: string;
  entityType: string;
  turnover: number;
  totalIncome: number;
  totalExpenses: number;
  deductibleExpenses: number;
  netIncome: number;
  taxableIncome: number;
  estimatedTax: number;
  expenses: Expense[];
  categoryBreakdown: Record<string, number>;
}

const CATEGORY_LABELS: Record<string, string> = {
  income: 'Income',
  rent: 'Rent & Office',
  transport: 'Transport',
  marketing: 'Marketing',
  salary: 'Salaries',
  utilities: 'Utilities',
  supplies: 'Supplies',
  other: 'Other',
};

export const generateBusinessReportPDF = (data: BusinessReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_SETTINGS.margin;
  const contentWidth = pageWidth - margin * 2;

  // === HEADER ===
  let y = addPDFHeader(doc, { badgeText: 'BUSINESS REPORT' });

  // Title
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Expense Report', margin, y);
  y += 10;

  // Business info
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatNigerianDate(new Date().toISOString())}`, margin, y);
  y += 6;

  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`Business: ${data.businessName}`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Type: ${data.entityType === 'company' ? 'LLC (CIT)' : 'Business Name (PIT)'}`, pageWidth / 2, y);
  y += 6;
  doc.text(`Registered Turnover: ${formatCurrency(data.turnover)}`, margin, y);
  y += 15;

  // === SUMMARY GRID ===
  y = addSummaryGrid(doc, [
    { label: 'Income', value: formatCurrency(data.totalIncome), color: BRAND_COLORS.success },
    { label: 'Expenses', value: formatCurrency(data.totalExpenses), color: BRAND_COLORS.danger },
    { label: 'Net Income', value: formatCurrency(data.netIncome), color: data.netIncome >= 0 ? BRAND_COLORS.success : BRAND_COLORS.danger },
    { label: 'Est. Tax', value: formatCurrency(data.estimatedTax), color: BRAND_COLORS.gold },
  ], y);

  // === TAX CALCULATION ===
  y = addAccentSectionHeader(doc, 'TAX CALCULATION', y, 'green');

  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');

  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const taxItems = [
    ['Total Income', formatCurrency(data.totalIncome)],
    ['Deductible Expenses', `- ${formatCurrency(data.deductibleExpenses)}`],
    ['Taxable Income', formatCurrency(data.taxableIncome)],
    ['Estimated Tax Due', formatCurrency(data.estimatedTax)],
  ];

  let itemY = y + 8;
  taxItems.forEach(([label, value], index) => {
    const isLast = index === taxItems.length - 1;
    if (isLast) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND_COLORS.nigerianGreen);
    }
    doc.text(label, margin + 8, itemY);
    doc.text(value, margin + contentWidth - 8, itemY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND_COLORS.text);
    itemY += 7;
  });

  y += 45;

  // === EXPENSE BREAKDOWN (autotable) ===
  y = addAccentSectionHeader(doc, 'EXPENSE BREAKDOWN BY CATEGORY', y, 'gold');

  const categories = Object.entries(data.categoryBreakdown).sort(([, a], [, b]) => b - a);

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Amount']],
    body: categories.map(([category, amount]) => [
      CATEGORY_LABELS[category] || category,
      formatCurrency(amount),
    ]),
    theme: 'grid',
    headStyles: {
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
      1: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  // Get Y after autotable
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // === RECENT TRANSACTIONS (autotable) ===
  y = addAccentSectionHeader(doc, `RECENT TRANSACTIONS (${Math.min(data.expenses.length, 10)} of ${data.expenses.length})`, y, 'blue');

  const recentExpenses = data.expenses.slice(0, 10);

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Description', 'Type', 'Amount']],
    body: recentExpenses.map(expense => [
      new Date(expense.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
      truncateText(expense.description, 40),
      expense.type === 'income' ? 'Income' : 'Expense',
      formatCurrency(expense.amount),
    ]),
    theme: 'grid',
    headStyles: {
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
      0: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
    didParseCell: (cellData) => {
      // Color the Type column
      if (cellData.column.index === 2 && cellData.section === 'body') {
        const expense = recentExpenses[cellData.row.index];
        if (expense) {
          const color = expense.type === 'income' ? BRAND_COLORS.success : BRAND_COLORS.danger;
          cellData.cell.styles.textColor = [color[0], color[1], color[2]];
        }
      }
    },
  });

  // === FOOTER & PAGE NUMBERS ===
  addPDFFooter(doc, {
    disclaimer: 'This report is generated for informational purposes only. Please verify all figures with your records.',
  });
  addPageNumbers(doc);

  return doc;
};

export const downloadBusinessReportPDF = (data: BusinessReportData) => {
  const doc = generateBusinessReportPDF(data);
  const fileName = `taxforge-${data.businessName.toLowerCase().replace(/\s+/g, '-')}-report.pdf`;
  doc.save(fileName);
};
