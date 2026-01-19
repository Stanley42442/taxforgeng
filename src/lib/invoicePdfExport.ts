import { jsPDF } from 'jspdf';

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
  businessTIN?: string; // Tax Identification Number
  businessEmail: string;
  
  // Dates
  invoiceDate: string;
  paymentDate: string;
  
  // Nigerian tax specifics
  vatRate: number; // 7.5%
  vatAmount: number;
  subtotal: number;
}

// Helper: Format date in Nigerian style (DD Month YYYY)
function formatNigerianDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

// Helper: Format currency in Nigerian Naira
function formatNigerianCurrency(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const generatePaymentInvoicePDF = (data: PaymentInvoiceData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors (Nigerian flag inspired with professional tones)
  const primaryColor: [number, number, number] = [0, 135, 81]; // Nigerian green
  const accentColor: [number, number, number] = [212, 175, 55]; // Gold
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [128, 128, 128];
  const lightBg: [number, number, number] = [248, 250, 248];
  const successColor: [number, number, number] = [34, 197, 94];

  // === HEADER ===
  // Nigerian-themed header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 12, 'F');
  
  // White stripe
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 12, pageWidth, 4, 'F');
  
  // Green stripe
  doc.setFillColor(...primaryColor);
  doc.rect(0, 16, pageWidth, 2, 'F');

  y = 30;

  // Logo area
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, y, 15, 15, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('TF', margin + 7.5, y + 10, { align: 'center' });

  // Company name
  doc.setTextColor(...primaryColor);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TaxForge NG', margin + 20, y + 10);

  // Invoice badge
  doc.setFillColor(...accentColor);
  doc.roundedRect(pageWidth - margin - 50, y, 50, 15, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INVOICE', pageWidth - margin - 25, y + 10, { align: 'center' });

  y += 25;

  // Invoice number and date
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice #: ${data.receiptNumber || data.reference}`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatNigerianDate(data.invoiceDate)}`, pageWidth - margin, y, { align: 'right' });

  y += 15;

  // === BILL TO / BILL FROM SECTION ===
  const colWidth = (contentWidth - 20) / 2;

  // From section
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, colWidth, 45, 3, 3, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', margin + 8, y + 12);
  
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.businessName, margin + 8, y + 22);
  doc.text(data.businessAddress, margin + 8, y + 30);
  if (data.businessTIN) {
    doc.text(`TIN: ${data.businessTIN}`, margin + 8, y + 38);
  }

  // To section
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin + colWidth + 20, y, colWidth, 45, 3, 3, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin + colWidth + 28, y + 12);
  
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.customerName, margin + colWidth + 28, y + 22);
  doc.text(data.customerEmail, margin + colWidth + 28, y + 30);

  y += 55;

  // === PAYMENT DETAILS TABLE ===
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details', margin, y);
  y += 8;

  // Table header
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 8, y + 8);
  doc.text('Period', margin + 100, y + 8);
  doc.text('Amount', pageWidth - margin - 8, y + 8, { align: 'right' });
  y += 14;

  // Subscription row
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const tierName = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
  const cycleLabel = data.billingCycle === 'annually' ? 'Annual' : 'Monthly';
  
  doc.text(`${tierName} Plan - ${cycleLabel} Subscription`, margin + 8, y + 6);
  doc.text(`${formatNigerianDate(data.periodStart)} - ${formatNigerianDate(data.periodEnd)}`, margin + 100, y + 6);
  doc.text(formatNigerianCurrency(data.subtotal), pageWidth - margin - 8, y + 6, { align: 'right' });
  y += 12;

  // Discount row (if applicable)
  if (data.discountAmount && data.discountAmount > 0) {
    doc.setFillColor(...lightBg);
    doc.rect(margin, y - 4, contentWidth, 12, 'F');
    doc.setTextColor(46, 125, 50); // Green for discount
    doc.text(`Discount Applied${data.discountCode ? ` (${data.discountCode})` : ''}`, margin + 8, y + 4);
    doc.text(`-${formatNigerianCurrency(data.discountAmount)}`, pageWidth - margin - 8, y + 4, { align: 'right' });
    y += 12;
  }

  // VAT row (Nigerian 7.5% VAT)
  doc.setTextColor(...mutedColor);
  doc.text(`VAT (${data.vatRate}%)`, margin + 8, y + 6);
  doc.text(formatNigerianCurrency(data.vatAmount), pageWidth - margin - 8, y + 6, { align: 'right' });
  y += 15;

  // Total box
  doc.setFillColor(...primaryColor);
  doc.roundedRect(pageWidth - margin - 80, y, 80, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PAID:', pageWidth - margin - 75, y + 8);
  doc.setFontSize(14);
  doc.text(formatNigerianCurrency(data.amount), pageWidth - margin - 8, y + 15, { align: 'right' });

  y += 35;

  // === PAYMENT STATUS BADGE ===
  doc.setFillColor(...successColor);
  doc.roundedRect(margin, y, 70, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAYMENT CONFIRMED', margin + 35, y + 8, { align: 'center' });
  
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Payment Date: ${formatNigerianDate(data.paymentDate)}`, margin + 80, y + 5);
  doc.text(`Reference: ${data.reference}`, margin + 80, y + 12);

  y += 25;

  // === NOTES SECTION ===
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Important Information:', margin + 8, y + 10);
  
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('• This invoice serves as confirmation of payment for your TaxForge NG subscription.', margin + 8, y + 18);
  doc.text('• Your subscription will automatically renew unless cancelled before the end of the billing period.', margin + 8, y + 25);
  doc.text('• For support, contact: support@taxforgeng.com', margin + 8, y + 32);

  // === FOOTER ===
  const footerY = pageHeight - 25;
  
  doc.setFillColor(...primaryColor);
  doc.rect(margin, footerY - 10, contentWidth, 0.5, 'F');
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(7);
  doc.text(
    'This is an electronically generated invoice and is valid without signature.',
    pageWidth / 2, footerY - 2, { align: 'center' }
  );
  doc.text(
    `© ${new Date().getFullYear()} TaxForge NG | RC: [Company RC Number] | TIN: ${data.businessTIN || 'N/A'}`,
    pageWidth / 2, footerY + 4, { align: 'center' }
  );
  doc.text(
    'www.taxforgeng.com | support@taxforgeng.com',
    pageWidth / 2, footerY + 10, { align: 'center' }
  );

  return doc;
};

// Download function
export const downloadPaymentInvoice = (data: PaymentInvoiceData): void => {
  const doc = generatePaymentInvoicePDF(data);
  const fileName = `TaxForge-Invoice-${data.receiptNumber || data.reference}.pdf`;
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
