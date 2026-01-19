import { jsPDF } from "jspdf";
import { formatCurrency } from "./taxCalculations";
import {
  BRAND_COLORS,
  COMPANY_INFO,
  PDF_SETTINGS,
  formatNaira,
  formatNigerianDate,
  addAccentHeader,
  addLogo,
  addSummaryGrid,
  addSectionTitle,
  addTableHeader,
  addTableRow,
  addPDFFooter,
  checkPageBreak,
  truncateText,
  type RGB,
  type TableColumn,
  type TableRowData,
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
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_SETTINGS.margin;
  const contentWidth = pageWidth - margin * 2;
  let y: number = margin;

  // Colors using shared brand colors
  const primaryColor: [number, number, number] = [BRAND_COLORS.darkGreen[0], BRAND_COLORS.darkGreen[1], BRAND_COLORS.darkGreen[2]];
  const accentColor: [number, number, number] = [BRAND_COLORS.gold[0], BRAND_COLORS.gold[1], BRAND_COLORS.gold[2]];
  const textColor: [number, number, number] = [BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]];
  const mutedColor: [number, number, number] = [BRAND_COLORS.muted[0], BRAND_COLORS.muted[1], BRAND_COLORS.muted[2]];
  const lightBg: [number, number, number] = [BRAND_COLORS.lightBg[0], BRAND_COLORS.lightBg[1], BRAND_COLORS.lightBg[2]];
  const successColor: [number, number, number] = [BRAND_COLORS.success[0], BRAND_COLORS.success[1], BRAND_COLORS.success[2]];
  const dangerColor: [number, number, number] = [BRAND_COLORS.danger[0], BRAND_COLORS.danger[1], BRAND_COLORS.danger[2]];

  // Helper functions
  const setColor = (color: [number, number, number]) => doc.setTextColor(...color);
  const setFillColor = (color: [number, number, number]) => doc.setFillColor(...color);

  // === HEADER ===
  setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 8, 'F');
  setFillColor(accentColor);
  doc.rect(0, 8, pageWidth, 2, 'F');

  y = 25;

  // Logo
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, 12, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('TF', margin + 6, y + 7.5, { align: 'center' });

  setColor(primaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TaxForge NG', margin + 16, y + 8);

  // Report type badge
  setFillColor(lightBg);
  doc.roundedRect(pageWidth - margin - 50, y, 50, 10, 2, 2, 'F');
  setColor(primaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('BUSINESS REPORT', pageWidth - margin - 25, y + 6.5, { align: 'center' });

  y += 20;

  // Title
  setColor(textColor);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Expense Report', margin, y);
  y += 10;

  // Business info
  setColor(mutedColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-NG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated: ${dateStr}`, margin, y);
  y += 6;
  
  setColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Business: ${data.businessName}`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Type: ${data.entityType === 'company' ? 'LLC (CIT)' : 'Business Name (PIT)'}`, pageWidth / 2, y);
  y += 6;
  doc.text(`Registered Turnover: ${formatCurrency(data.turnover)}`, margin, y);
  
  y += 15;

  // === SUMMARY BOX ===
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, contentWidth, 50, 4, 4, 'F');
  setFillColor(accentColor);
  doc.roundedRect(margin + 3, y + 3, contentWidth - 6, 44, 3, 3, 'F');
  setFillColor(primaryColor);
  doc.roundedRect(margin + 4, y + 4, contentWidth - 8, 42, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('FINANCIAL SUMMARY', pageWidth / 2, y + 12, { align: 'center' });

  // Summary grid
  const colWidth = (contentWidth - 16) / 4;
  const summaryItems = [
    { label: 'Income', value: data.totalIncome, color: successColor },
    { label: 'Expenses', value: data.totalExpenses, color: dangerColor },
    { label: 'Net Income', value: data.netIncome, color: data.netIncome >= 0 ? successColor : dangerColor },
    { label: 'Est. Tax', value: data.estimatedTax, color: accentColor },
  ];

  let colX = margin + 8;
  summaryItems.forEach((item) => {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text(item.label, colX + colWidth / 2, y + 25, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.value), colX + colWidth / 2, y + 38, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    
    colX += colWidth;
  });

  y += 60;

  // === TAX CALCULATION ===
  setColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Calculation', margin, y);
  y += 8;

  setFillColor(lightBg);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');

  setColor(textColor);
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
      setColor(primaryColor);
    }
    doc.text(label, margin + 8, itemY);
    doc.text(value, margin + contentWidth - 8, itemY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    setColor(textColor);
    itemY += 7;
  });

  y += 45;

  // === EXPENSE BREAKDOWN ===
  setColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Breakdown by Category', margin, y);
  y += 8;

  // Table header
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Category', margin + 5, y + 7);
  doc.text('Amount', pageWidth - margin - 5, y + 7, { align: 'right' });
  y += 12;

  setColor(textColor);
  doc.setFont('helvetica', 'normal');

  const categories = Object.entries(data.categoryBreakdown).sort(([, a], [, b]) => b - a);
  categories.forEach(([category, amount], index) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 0) {
      setFillColor(lightBg);
      doc.rect(margin, y - 4, contentWidth, 10, 'F');
    }

    setColor(textColor);
    doc.setFontSize(9);
    doc.text(CATEGORY_LABELS[category] || category, margin + 5, y + 2);
    doc.text(formatCurrency(amount), pageWidth - margin - 5, y + 2, { align: 'right' });
    y += 10;
  });

  y += 10;

  // === RECENT TRANSACTIONS ===
  if (y > pageHeight - 80) {
    doc.addPage();
    y = 20;
  }

  setColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Recent Transactions (${Math.min(data.expenses.length, 10)} of ${data.expenses.length})`, margin, y);
  y += 8;

  // Table header
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', margin + 5, y + 7);
  doc.text('Description', margin + 30, y + 7);
  doc.text('Type', pageWidth - margin - 40, y + 7);
  doc.text('Amount', pageWidth - margin - 5, y + 7, { align: 'right' });
  y += 12;

  doc.setFont('helvetica', 'normal');
  const recentExpenses = data.expenses.slice(0, 10);
  
  recentExpenses.forEach((expense, index) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 0) {
      setFillColor(lightBg);
      doc.rect(margin, y - 4, contentWidth, 10, 'F');
    }

    setColor(textColor);
    doc.setFontSize(8);
    const date = new Date(expense.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
    doc.text(date, margin + 5, y + 2);
    
    const desc = truncateText(expense.description, 40);
    doc.text(desc, margin + 30, y + 2);
    
    if (expense.type === 'income') {
      setColor(successColor);
    } else {
      setColor(dangerColor);
    }
    doc.text(expense.type === 'income' ? 'Income' : 'Expense', pageWidth - margin - 40, y + 2);
    
    doc.text(formatCurrency(expense.amount), pageWidth - margin - 5, y + 2, { align: 'right' });
    y += 10;
  });

  // === FOOTER ===
  const footerY = pageHeight - 20;
  setFillColor(primaryColor);
  doc.rect(margin, footerY - 5, contentWidth, 0.5, 'F');

  setColor(mutedColor);
  doc.setFontSize(7);
  doc.text(
    'DISCLAIMER: This report is for educational and planning purposes only. Tax calculations are estimates.',
    pageWidth / 2, footerY + 2, { align: 'center' }
  );
  doc.text(
    `© ${new Date().getFullYear()} TaxForge NG | Generated on ${dateStr}`,
    pageWidth / 2, footerY + 7, { align: 'center' }
  );

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setColor(mutedColor);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  return doc;
};

export const downloadBusinessReportPDF = (data: BusinessReportData) => {
  const doc = generateBusinessReportPDF(data);
  const fileName = `taxforge-${data.businessName.toLowerCase().replace(/\s+/g, '-')}-report.pdf`;
  doc.save(fileName);
};
