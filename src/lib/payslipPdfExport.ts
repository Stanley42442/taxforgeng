import jsPDF from 'jspdf';
import { PayrollResult, formatNaira } from './payrollCalculations';
import { format } from 'date-fns';
import {
  BRAND_COLORS,
  PDF_SETTINGS,
  addAccentSectionHeader,
  addPDFFooter,
  addPageNumbers,
} from './exportShared';
import JSZip from 'jszip';

export interface PayslipData {
  employeeName: string;
  employeeId?: string;
  employeeIdNumber?: string;
  department?: string;
  position?: string;
  payPeriod: string;
  payDate: string;
  bankName?: string;
  bankAccountNumber?: string;
  taxId?: string;
  pensionPin?: string;
  pfaName?: string;
  nhfNumber?: string;
  result: PayrollResult;
  companyName?: string;
  companyAddress?: string;
  companyTIN?: string;
  companyLogo?: string;
  includeQRCode?: boolean;
  includeDigitalSignature?: boolean;
  verificationId?: string;
}

export interface PayslipGenerationOptions {
  showWatermark?: boolean;
  tier?: string;
}

/**
 * Generate a professionally branded payslip PDF with Nigerian styling
 */
export function generatePayslipPDF(data: PayslipData, options: PayslipGenerationOptions = {}): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 15;

  // ============================================
  // HEADER — shared accent bar + company info
  // ============================================

  // Green header bar
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Gold accent line
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(0, 38, pageWidth, 3, 'F');

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName || 'Company Name', margin, 18);

  // Company address
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (data.companyAddress) {
    doc.text(data.companyAddress, margin, 26);
  }
  if (data.companyTIN) {
    doc.text(`TIN: ${data.companyTIN}`, margin, 33);
  }

  // PAYSLIP title on right
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYSLIP', pageWidth - margin, 20, { align: 'right' });

  // Pay period info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${data.payPeriod}`, pageWidth - margin, 28, { align: 'right' });
  doc.text(`Pay Date: ${format(new Date(data.payDate), 'dd MMM yyyy')}`, pageWidth - margin, 35, { align: 'right' });

  y = 52;
  doc.setTextColor(0, 0, 0);

  // ============================================
  // EMPLOYEE INFORMATION — accent section header
  // ============================================

  y = addAccentSectionHeader(doc, 'EMPLOYEE INFORMATION', y, 'gold');

  y += 2;
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Employee details in two columns
  const leftCol = margin + 5;
  const rightCol = pageWidth / 2 + 10;
  const lineHeight = 5.5;

  // Left column
  drawLabelValue(doc, 'Employee Name:', data.employeeName, leftCol, y, 45);
  drawLabelValue(doc, 'Employee ID:', data.employeeIdNumber || data.employeeId || 'N/A', leftCol, y + lineHeight, 45);
  drawLabelValue(doc, 'Department:', data.department || 'N/A', leftCol, y + lineHeight * 2, 45);
  drawLabelValue(doc, 'Position:', data.position || 'N/A', leftCol, y + lineHeight * 3, 45);

  // Right column
  drawLabelValue(doc, 'Tax ID (TIN):', data.taxId || 'N/A', rightCol, y, 45);
  drawLabelValue(doc, 'Pension PIN:', data.pensionPin || 'N/A', rightCol, y + lineHeight, 45);
  drawLabelValue(doc, 'PFA:', data.pfaName || 'N/A', rightCol, y + lineHeight * 2, 45);
  drawLabelValue(doc, 'NHF Number:', data.nhfNumber || 'N/A', rightCol, y + lineHeight * 3, 45);

  y += lineHeight * 4 + 8;

  // Bank details
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.rect(margin, y, pageWidth - margin * 2, 12, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text('Payment Details:', margin + 5, y + 5);
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.bankName || 'Bank'} - ${maskAccountNumber(data.bankAccountNumber)}`, margin + 45, y + 5);
  doc.setFont('helvetica', 'normal');

  y += 20;

  // ============================================
  // EARNINGS AND DEDUCTIONS TABLE
  // ============================================

  const colWidth = (pageWidth - margin * 2 - 10) / 2;
  const earningsX = margin;
  const deductionsX = margin + colWidth + 10;

  // Earnings Header — accent section header style (green)
  doc.setFillColor(...BRAND_COLORS.lightGreen);
  doc.rect(earningsX, y, colWidth, 10, 'F');
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.rect(earningsX, y, 3, 10, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.darkGreen);
  doc.text('EARNINGS', earningsX + 8, y + 7);

  // Deductions Header — accent section header style (red)
  doc.setFillColor(...BRAND_COLORS.dangerBg);
  doc.rect(deductionsX, y, colWidth, 10, 'F');
  doc.setFillColor(...BRAND_COLORS.danger);
  doc.rect(deductionsX, y, 3, 10, 'F');

  doc.setTextColor(153, 27, 27);
  doc.text('DEDUCTIONS', deductionsX + 8, y + 7);

  y += 14;
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Build earnings list
  const earnings = [
    { label: 'Basic Salary', amount: data.result.grossSalary },
  ];

  if (data.result.overtimeAmount > 0) {
    earnings.push({ label: 'Overtime Pay', amount: data.result.overtimeAmount });
  }

  if (data.result.bonusAmount > 0) {
    earnings.push({ label: 'Bonus', amount: data.result.bonusAmount });
  }

  // Build deductions list
  const deductions = [
    { label: 'PAYE Tax', amount: data.result.paye },
    { label: 'Pension (Employee 8%)', amount: data.result.pensionEmployee },
  ];

  if (data.result.nhf > 0) {
    deductions.push({ label: 'NHF (2.5%)', amount: data.result.nhf });
  }

  if (data.result.leaveDeduction > 0) {
    deductions.push({ label: 'Leave Deduction', amount: data.result.leaveDeduction });
  }

  // Draw earnings
  let earningsY = y;
  let totalEarnings = 0;
  earnings.forEach(item => {
    doc.text(item.label, earningsX + 5, earningsY);
    doc.text(formatNaira(item.amount), earningsX + colWidth - 5, earningsY, { align: 'right' });
    totalEarnings += item.amount;
    earningsY += 6;
  });

  // Earnings total
  doc.setDrawColor(...BRAND_COLORS.nigerianGreen);
  doc.line(earningsX + 5, earningsY, earningsX + colWidth - 5, earningsY);
  earningsY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.darkGreen);
  doc.text('Gross Pay', earningsX + 5, earningsY);
  doc.text(formatNaira(totalEarnings), earningsX + colWidth - 5, earningsY, { align: 'right' });

  // Draw deductions
  let deductionsY = y;
  let totalDeductions = 0;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.text);

  deductions.forEach(item => {
    doc.text(item.label, deductionsX + 5, deductionsY);
    doc.text(formatNaira(item.amount), deductionsX + colWidth - 5, deductionsY, { align: 'right' });
    totalDeductions += item.amount;
    deductionsY += 6;
  });

  // Deductions total
  doc.setDrawColor(...BRAND_COLORS.danger);
  doc.line(deductionsX + 5, deductionsY, deductionsX + colWidth - 5, deductionsY);
  deductionsY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('Total Deductions', deductionsX + 5, deductionsY);
  doc.text(formatNaira(totalDeductions), deductionsX + colWidth - 5, deductionsY, { align: 'right' });

  y = Math.max(earningsY, deductionsY) + 15;

  // ============================================
  // NET PAY HIGHLIGHT BOX
  // ============================================

  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 3, 3, 'F');

  // Gold inner border
  doc.setDrawColor(...BRAND_COLORS.gold);
  doc.setLineWidth(1);
  doc.roundedRect(margin + 2, y + 2, pageWidth - margin * 2 - 4, 18, 2, 2, 'S');
  doc.setLineWidth(0.2);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NET PAY', margin + 15, y + 14);

  doc.setFontSize(18);
  doc.text(formatNaira(data.result.netSalary), pageWidth - margin - 15, y + 14, { align: 'right' });

  y += 32;

  // ============================================
  // EMPLOYER CONTRIBUTIONS SECTION
  // ============================================

  y = addAccentSectionHeader(doc, 'EMPLOYER CONTRIBUTIONS (Not deducted from salary)', y, 'blue');

  y += 2;
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  doc.text('Pension Contribution (10%)', margin + 5, y);
  doc.text(formatNaira(data.result.pensionEmployer), pageWidth / 2 - 10, y, { align: 'right' });

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Total Cost to Company', margin + 5, y);
  doc.text(formatNaira(data.result.totalCostToCompany), pageWidth / 2 - 10, y, { align: 'right' });

  y += 12;

  // ============================================
  // TAX RELIEF INFORMATION
  // ============================================

  y = addAccentSectionHeader(doc, 'TAX CALCULATION DETAILS', y, 'warning');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_COLORS.text);
  doc.text(`Monthly Relief Applied: ${formatNaira(data.result.rentRelief)}`, margin + 8, y);
  doc.text(`Taxable Income: ${formatNaira(data.result.taxableIncome)}/month`, pageWidth / 2, y);

  y += 12;

  // ============================================
  // COMPLIANCE NOTE
  // ============================================

  if (y < 220) {
    doc.setFillColor(...BRAND_COLORS.lightBg);
    doc.rect(margin, y, pageWidth - margin * 2, 25, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.text('This payslip is generated in compliance with Nigerian Tax Laws.', margin + 5, y + 8);
    doc.text('PAYE calculated using 2026 Personal Income Tax rates.', margin + 5, y + 15);
    doc.text('Pension contributions comply with Pension Reform Act 2014.', margin + 5, y + 22);
  }

  // ============================================
  // FOOTER (shared)
  // ============================================

  addPDFFooter(doc, {
    disclaimer: 'This is a computer-generated payslip. No signature required.',
  });
  addPageNumbers(doc);

  // Verification ID (if provided)
  if (data.verificationId) {
    doc.setPage(1);
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.text(`Verification ID: ${data.verificationId}`, margin, pageHeight - 4);
  }

  // Add watermark for free tier
  if (options.showWatermark) {
    addWatermark(doc, pageWidth, pageHeight);
  }

  return doc;
}

/**
 * Helper function to draw label-value pairs
 */
function drawLabelValue(doc: jsPDF, label: string, value: string, x: number, y: number, labelWidth: number) {
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.text);
  doc.text(value, x + labelWidth, y);
}

/**
 * Mask bank account number for privacy
 */
function maskAccountNumber(accountNumber?: string): string {
  if (!accountNumber || accountNumber.length < 4) return '****';
  return '****' + accountNumber.slice(-4);
}

/**
 * Add watermark for free tier
 */
function addWatermark(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(40);
  doc.setFont('helvetica', 'bold');

  doc.saveGraphicsState();
  doc.text('SAMPLE', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45,
  });
  doc.restoreGraphicsState();
}

/**
 * Download a single payslip
 */
export function downloadPayslip(data: PayslipData, options?: PayslipGenerationOptions, filename?: string) {
  const doc = generatePayslipPDF(data, options);
  const defaultFilename = `Payslip_${data.employeeName.replace(/\s+/g, '_')}_${data.payPeriod}.pdf`;
  doc.save(filename || defaultFilename);
}

/**
 * Generate multiple payslips as a ZIP file
 */
export async function generateBulkPayslipsZip(
  payslips: PayslipData[],
  options?: PayslipGenerationOptions
): Promise<Blob> {
  const zip = new JSZip();

  const folder = zip.folder('payslips');
  if (!folder) {
    throw new Error('Failed to create ZIP folder');
  }

  for (const data of payslips) {
    const doc = generatePayslipPDF(data, options);
    const pdfBlob = doc.output('blob');
    const filename = `Payslip_${data.employeeName.replace(/\s+/g, '_')}_${data.payPeriod}.pdf`;
    folder.file(filename, pdfBlob);
  }

  return zip.generateAsync({ type: 'blob' });
}

/**
 * Download bulk payslips as ZIP
 */
export async function downloadBulkPayslips(
  payslips: PayslipData[],
  options?: PayslipGenerationOptions,
  zipFilename?: string
) {
  const blob = await generateBulkPayslipsZip(payslips, options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipFilename || `Payslips_${format(new Date(), 'yyyy-MM')}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a combined PDF with all payslips (for printing)
 */
export function generateCombinedPayslipsPDF(
  payslips: PayslipData[],
  options?: PayslipGenerationOptions
): jsPDF {
  if (payslips.length === 0) {
    throw new Error('No payslips to generate');
  }

  const doc = generatePayslipPDF(payslips[0], options);

  for (let i = 1; i < payslips.length; i++) {
    doc.addPage();
    const singleDoc = generatePayslipPDF(payslips[i], options);
  }

  return doc;
}
