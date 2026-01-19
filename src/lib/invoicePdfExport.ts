import { jsPDF } from 'jspdf';
import {
  BRAND_COLORS,
  COMPANY_INFO,
  PDF_SETTINGS,
  formatNaira,
  formatNigerianDate,
  formatDateForFilename,
  addPDFHeader,
  addPDFFooter,
  generateFilename,
} from './exportShared';

export interface PaymentInvoiceData {
  // Transaction details
  reference: string;
  receiptNumber: string;
  amount: number; // In Naira
  originalAmount?: number;
  discountAmount?: number;
  discountCode?: string;
  
  // Subscription details
  tier: string;
  billingCycle: 'monthly' | 'annually';
  periodStart: string;
  periodEnd: string;
  
  // Customer details
  customerName: string;
  customerEmail: string;
  
  // Business details (TaxForge)
  businessName: string;
  businessAddress: string;
  businessTIN?: string;
  businessEmail: string;
  
  // Dates
  invoiceDate: string;
  paymentDate: string;
  
  // Nigerian tax specifics
  vatRate: number; // 7.5%
  vatAmount: number;
  subtotal: number;
  
  // Payment method (optional)
  paymentMethod?: string;
  cardLastFour?: string;
}

export const generatePaymentInvoicePDF = (data: PaymentInvoiceData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_SETTINGS.margin;
  const contentWidth = pageWidth - margin * 2;

  // === HEADER with Nigerian stripes ===
  let y = addPDFHeader(doc, { badgeText: 'PAYMENT INVOICE', useNigerianStripes: true });

  // Invoice number and date
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice #: ${data.receiptNumber || data.reference}`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatNigerianDate(data.invoiceDate)}`, pageWidth - margin, y, { align: 'right' });

  y += 15;

  // === BILL TO / BILL FROM SECTION ===
  const colWidth = (contentWidth - 20) / 2;

  // From section
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin, y, colWidth, 50, 3, 3, 'F');
  doc.setDrawColor(...BRAND_COLORS.nigerianGreen);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, colWidth, 50, 3, 3, 'S');
  
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', margin + 8, y + 12);
  
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.businessName || COMPANY_INFO.name, margin + 8, y + 22);
  doc.text(data.businessAddress || COMPANY_INFO.address, margin + 8, y + 30);
  if (data.businessTIN) {
    doc.text(`TIN: ${data.businessTIN}`, margin + 8, y + 38);
  }
  doc.text(data.businessEmail || COMPANY_INFO.email, margin + 8, y + 46);

  // To section
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin + colWidth + 20, y, colWidth, 50, 3, 3, 'F');
  doc.setDrawColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin + colWidth + 20, y, colWidth, 50, 3, 3, 'S');
  
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin + colWidth + 28, y + 12);
  
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.customerName, margin + colWidth + 28, y + 22);
  doc.text(data.customerEmail, margin + colWidth + 28, y + 30);

  y += 60;

  // === PAYMENT DETAILS TABLE ===
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details', margin, y);
  y += 8;

  // Table header
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 8, y + 8);
  doc.text('Period', margin + 100, y + 8);
  doc.text('Amount', pageWidth - margin - 8, y + 8, { align: 'right' });
  y += 14;

  // Subscription row
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const tierName = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
  const cycleLabel = data.billingCycle === 'annually' ? 'Annual' : 'Monthly';
  
  doc.text(`${tierName} Plan - ${cycleLabel} Subscription`, margin + 8, y + 6);
  doc.text(`${formatNigerianDate(data.periodStart)} - ${formatNigerianDate(data.periodEnd)}`, margin + 100, y + 6);
  doc.text(formatNaira(data.subtotal, { showDecimals: true }), pageWidth - margin - 8, y + 6, { align: 'right' });
  y += 12;

  // Discount row (if applicable)
  if (data.discountAmount && data.discountAmount > 0) {
    doc.setFillColor(...BRAND_COLORS.lightBg);
    doc.rect(margin, y - 4, contentWidth, 12, 'F');
    doc.setTextColor(...BRAND_COLORS.success);
    doc.text(`Discount Applied${data.discountCode ? ` (${data.discountCode})` : ''}`, margin + 8, y + 4);
    doc.text(`(${formatNaira(data.discountAmount, { showDecimals: true })})`, pageWidth - margin - 8, y + 4, { align: 'right' });
    y += 12;
  }

  // VAT row
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text(`VAT (${data.vatRate}%)`, margin + 8, y + 6);
  doc.text(formatNaira(data.vatAmount, { showDecimals: true }), pageWidth - margin - 8, y + 6, { align: 'right' });
  y += 15;

  // Total box
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(pageWidth - margin - 90, y, 90, 24, 3, 3, 'F');
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PAID:', pageWidth - margin - 85, y + 9);
  doc.setFontSize(14);
  doc.text(formatNaira(data.amount, { showDecimals: true }), pageWidth - margin - 8, y + 19, { align: 'right' });

  y += 35;

  // === AMOUNT DUE SECTION (NEW) ===
  doc.setFillColor(...BRAND_COLORS.lightGreen);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');
  doc.setDrawColor(...BRAND_COLORS.success);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'S');
  
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Due:', margin + 10, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_COLORS.success);
  doc.text(`${formatNaira(0, { showDecimals: true })} (PAID)`, margin + 70, y + 12);
  
  // Payment method
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.muted);
  const paymentMethodText = data.cardLastFour 
    ? `Payment Method: Card ending in ${data.cardLastFour}`
    : data.paymentMethod 
      ? `Payment Method: ${data.paymentMethod}`
      : 'Payment Method: Paystack';
  doc.text(paymentMethodText, margin + 10, y + 24);

  y += 40;

  // === PAYMENT STATUS BADGE ===
  doc.setFillColor(...BRAND_COLORS.success);
  doc.roundedRect(margin, y, 85, 14, 2, 2, 'F');
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('\u2713 PAYMENT CONFIRMED', margin + 42.5, y + 9, { align: 'center' });
  
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Payment Date: ${formatNigerianDate(data.paymentDate)}`, margin + 95, y + 5);
  doc.text(`Reference: ${data.reference}`, margin + 95, y + 12);

  y += 25;

  // === NOTES SECTION ===
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'F');
  
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Important Information:', margin + 8, y + 10);
  
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`\u2022 This invoice serves as confirmation of payment for your ${COMPANY_INFO.shortName} subscription.`, margin + 8, y + 18);
  doc.text('\u2022 Your subscription will automatically renew unless cancelled before the end of the billing period.', margin + 8, y + 26);
  doc.text(`\u2022 For support, contact: ${COMPANY_INFO.email}`, margin + 8, y + 34);

  // === FOOTER ===
  addPDFFooter(doc, {
    disclaimer: 'This is an electronically generated invoice and is valid without signature.',
    pageNumber: 1,
    totalPages: 1,
  });

  return doc;
};

// Download function
export const downloadPaymentInvoice = (data: PaymentInvoiceData): void => {
  const doc = generatePaymentInvoicePDF(data);
  const fileName = generateFilename('invoice', 'pdf', data.receiptNumber || data.reference);
  doc.save(fileName);
};

// Calculate period end date
export function calculatePeriodEnd(startDate: string, billingCycle: string): string {
  const date = new Date(startDate);
  if (billingCycle === 'annually') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString();
}
