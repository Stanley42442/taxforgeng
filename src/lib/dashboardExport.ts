import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { formatCurrency } from "./taxCalculations";

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
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const primaryColor: [number, number, number] = [26, 79, 62];
  const accentColor: [number, number, number] = [212, 175, 55];
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [128, 128, 128];
  const lightBg: [number, number, number] = [248, 250, 248];
  const successColor: [number, number, number] = [34, 197, 94];
  const destructiveColor: [number, number, number] = [239, 68, 68];

  const setColor = (color: [number, number, number]) => doc.setTextColor(...color);
  const setFillColor = (color: [number, number, number]) => doc.setFillColor(...color);

  // Header bar
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

  // Title
  setColor(primaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TaxForge NG', margin + 16, y + 8);

  // Report badge
  setFillColor(lightBg);
  doc.roundedRect(pageWidth - margin - 50, y, 50, 10, 2, 2, 'F');
  setColor(primaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('DASHBOARD REPORT', pageWidth - margin - 25, y + 6.5, { align: 'center' });

  y += 22;

  // Report title
  setColor(textColor);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary Report', margin, y);
  y += 10;

  // Date info
  setColor(mutedColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${data.dateRange}`, margin, y);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth - margin, y, { align: 'right' });

  y += 15;

  // Summary box
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, contentWidth, 50, 4, 4, 'F');
  
  setFillColor(accentColor);
  doc.roundedRect(margin + 3, y + 3, contentWidth - 6, 44, 3, 3, 'F');
  setFillColor(primaryColor);
  doc.roundedRect(margin + 4, y + 4, contentWidth - 8, 42, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('NET INCOME', pageWidth / 2, y + 14, { align: 'center' });
  
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.netIncome), pageWidth / 2, y + 32, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`Income: ${formatCurrency(data.totalIncome)} | Expenses: ${formatCurrency(data.totalExpenses)}`, pageWidth / 2, y + 44, { align: 'center' });

  y += 60;

  // Key metrics grid
  const colWidth = (contentWidth - 10) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 10;

  // Income details
  setFillColor(lightBg);
  doc.roundedRect(col1X, y, colWidth, 45, 3, 3, 'F');
  
  setColor(primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Income & Expenses', col1X + 8, y + 12);
  
  setColor(textColor);
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
  setFillColor(lightBg);
  doc.roundedRect(col2X, y, colWidth, 45, 3, 3, 'F');
  
  setColor(primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Overview', col2X + 8, y + 12);
  
  setColor(textColor);
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
    setFillColor(data.urgentCount > 0 ? [254, 242, 242] : lightBg);
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
    
    setColor(data.urgentCount > 0 ? destructiveColor : primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Reminders', margin + 8, y + 13);
    
    setColor(textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.reminderCount} total reminders${data.urgentCount > 0 ? ` • ${data.urgentCount} urgent` : ''}`, pageWidth - margin - 8, y + 13, { align: 'right' });
    
    y += 28;
  }

  // Businesses list
  if (data.businesses.length > 0) {
    setColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Registered Businesses', margin, y);
    y += 8;

    // Table header
    setFillColor(primaryColor);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Name', margin + 5, y + 7);
    doc.text('Type', margin + 90, y + 7);
    doc.text('Turnover', pageWidth - margin - 5, y + 7, { align: 'right' });
    y += 12;

    setColor(textColor);
    doc.setFont('helvetica', 'normal');
    
    data.businesses.forEach((biz, index) => {
      if (index % 2 === 0) {
        setFillColor(lightBg);
        doc.rect(margin, y - 4, contentWidth, 10, 'F');
      }
      
      setColor(textColor);
      doc.setFontSize(9);
      doc.text(biz.name.substring(0, 30), margin + 5, y + 2);
      doc.text(biz.entityType === 'company' ? 'LLC' : 'Business', margin + 90, y + 2);
      doc.text(formatCurrency(biz.turnover), pageWidth - margin - 5, y + 2, { align: 'right' });
      
      y += 10;
    });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 25;
  
  setFillColor(primaryColor);
  doc.rect(margin, footerY - 5, contentWidth, 0.5, 'F');

  setColor(mutedColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This report is generated for informational purposes only. Please verify all figures with your records.',
    pageWidth / 2, footerY + 2, { align: 'center' }
  );
  doc.text(
    `© ${new Date().getFullYear()} TaxForge NG | www.taxforgeng.com`,
    pageWidth / 2, footerY + 8, { align: 'center' }
  );

  // Page number
  setColor(mutedColor);
  doc.setFontSize(8);
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 10, { align: 'right' });

  doc.save(`taxforge-dashboard-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportDashboardToCSV = (data: DashboardExportData) => {
  const rows: string[][] = [];
  
  // Header info
  rows.push(['TaxForge NG - Dashboard Summary Report']);
  rows.push(['Generated:', format(new Date(), 'MMMM d, yyyy')]);
  rows.push(['Period:', data.dateRange]);
  rows.push([]);
  
  // Financial summary
  rows.push(['=== FINANCIAL SUMMARY ===']);
  rows.push(['Metric', 'Amount']);
  rows.push(['Total Income', data.totalIncome.toFixed(2)]);
  rows.push(['Total Expenses', data.totalExpenses.toFixed(2)]);
  rows.push(['Net Income', data.netIncome.toFixed(2)]);
  rows.push(['Deductible Expenses', data.deductibleExpenses.toFixed(2)]);
  rows.push([]);
  
  // Business overview
  rows.push(['=== BUSINESS OVERVIEW ===']);
  rows.push(['Metric', 'Value']);
  rows.push(['Number of Businesses', data.businessCount.toString()]);
  rows.push(['Total Turnover', data.totalTurnover.toFixed(2)]);
  rows.push(['Total Transactions', data.transactionCount.toString()]);
  rows.push(['Active Reminders', data.reminderCount.toString()]);
  rows.push(['Urgent Reminders', data.urgentCount.toString()]);
  rows.push([]);
  
  // Businesses list
  if (data.businesses.length > 0) {
    rows.push(['=== REGISTERED BUSINESSES ===']);
    rows.push(['Business Name', 'Entity Type', 'Sector', 'Turnover']);
    data.businesses.forEach(biz => {
      rows.push([
        biz.name,
        biz.entityType === 'company' ? 'LLC' : 'Business Name',
        biz.sector || 'N/A',
        biz.turnover.toFixed(2)
      ]);
    });
  }

  // Convert to CSV string
  const csvContent = rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(cell).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `taxforge-dashboard-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};
