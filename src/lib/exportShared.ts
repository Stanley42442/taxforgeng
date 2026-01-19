/**
 * Shared Export Utilities for TaxForge NG
 * Provides consistent branding, formatting, and components for all PDF, CSV, and other exports
 */

import { jsPDF } from 'jspdf';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type RGB = readonly [number, number, number];

export interface PDFExportOptions {
  showWatermark?: boolean;
  includeFooter?: boolean;
  pageSize?: 'a4' | 'letter';
}

export interface CSVExportOptions {
  includeBranding?: boolean;
  dateRange?: string;
  columns?: Array<{ key: string; header: string }>;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  error?: string;
}

export interface TableColumn {
  text: string;
  x: number;
  width?: number;
  align?: 'left' | 'right' | 'center';
}

export interface TableRowData {
  text: string;
  x: number;
  color?: RGB;
  align?: 'left' | 'right' | 'center';
  bold?: boolean;
}

// ============================================
// BRAND CONFIGURATION
// ============================================

/**
 * TaxForge NG Brand Colors
 * Nigerian Green + Gold professional theme
 */
export const BRAND_COLORS = {
  // Primary Colors
  nigerianGreen: [0, 135, 81] as const,      // #008751 - Official Nigerian flag green
  darkGreen: [26, 79, 62] as const,           // Deep forest green for headers
  gold: [212, 175, 55] as const,              // #D4AF37 - Gold accent

  // Background Colors
  lightGreen: [240, 253, 244] as const,       // Light green backgrounds
  lightBg: [248, 250, 248] as const,          // Subtle table row backgrounds
  white: [255, 255, 255] as const,

  // Text Colors
  text: [51, 51, 51] as const,                // Primary text
  muted: [107, 114, 128] as const,            // Secondary/muted text

  // Status Colors
  success: [34, 197, 94] as const,            // Green for positive/success
  danger: [239, 68, 68] as const,             // Red for negative/danger
  warning: [245, 158, 11] as const,           // Orange for warnings
  info: [59, 130, 246] as const,              // Blue for info

  // Alert Background Colors
  successBg: [240, 253, 244] as const,
  dangerBg: [254, 242, 242] as const,
  warningBg: [255, 251, 235] as const,
  infoBg: [239, 246, 255] as const,
} as const;

/**
 * Company Information
 */
export const COMPANY_INFO = {
  name: 'TaxForge Nigeria Limited',
  shortName: 'TaxForge NG',
  logoText: 'TF',
  address: '123 Tax Avenue, Victoria Island, Lagos, Nigeria',
  tin: '12345678-0001',
  rcNumber: 'RC 1234567',
  email: 'support@taxforgeng.com',
  billingEmail: 'billing@taxforgeng.com',
  website: 'www.taxforgeng.com',
  liveUrl: 'https://taxforgeng.lovable.app',
} as const;

/**
 * PDF Page Settings
 */
export const PDF_SETTINGS = {
  margin: 20,
  headerHeight: 18,
  footerHeight: 25,
  lineHeight: 6,
  tableRowHeight: 10,
  logoSize: 15,
} as const;

// ============================================
// CURRENCY FORMATTING (Critical for Naira Symbol)
// ============================================

/**
 * Format amount as Nigerian Naira with proper symbol
 * Uses Unicode \u20A6 for reliable rendering in PDFs
 */
export function formatNaira(
  amount: number,
  options?: {
    showDecimals?: boolean;
    showSign?: boolean;
    useParenthesesForNegative?: boolean;
  }
): string {
  const {
    showDecimals = false,
    showSign = false,
    useParenthesesForNegative = true
  } = options || {};

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = absAmount.toLocaleString('en-NG', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  // Use Unicode for Naira symbol (more reliable than literal ₦ in PDFs)
  const nairaSymbol = '\u20A6';

  if (isNegative && useParenthesesForNegative) {
    return `(${nairaSymbol}${formatted})`;
  }

  const sign = isNegative ? '-' : (showSign ? '+' : '');
  return `${sign}${nairaSymbol}${formatted}`;
}

/**
 * Format a number with commas (no currency symbol)
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-NG');
}

/**
 * Convert kobo to Naira and format
 * Database stores amounts in kobo (100 kobo = 1 Naira)
 */
export function formatKoboAsNaira(kobo: number, showDecimals = true): string {
  if (!kobo || isNaN(kobo)) return formatNaira(0, { showDecimals });
  return formatNaira(kobo / 100, { showDecimals });
}

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format date in Nigerian style (DD Month YYYY)
 */
export function formatNigerianDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format date for filenames (YYYY-MM-DD)
 */
export function formatDateForFilename(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format timestamp for exports (DD MMM YYYY, HH:MM)
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format short date (DD MMM)
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric'
  });
}

// ============================================
// PDF HEADER COMPONENTS
// ============================================

/**
 * Add Nigerian flag-inspired header bar to PDF
 */
export function addNigerianHeader(doc: jsPDF): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Nigerian flag-inspired header
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.rect(0, 0, pageWidth, 12, 'F');
  
  // White stripe
  doc.setFillColor(...BRAND_COLORS.white);
  doc.rect(0, 12, pageWidth, 4, 'F');
  
  // Green stripe
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.rect(0, 16, pageWidth, 2, 'F');
  
  return 30; // Return Y position after header
}

/**
 * Add simple accent header bar to PDF
 */
export function addAccentHeader(doc: jsPDF): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(...BRAND_COLORS.darkGreen);
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(0, 8, pageWidth, 2, 'F');
  
  return 25;
}

/**
 * Add TaxForge logo and company name
 */
export function addLogo(doc: jsPDF, y: number, options?: { showBadge?: boolean; badgeText?: string }): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const { showBadge = false, badgeText = '' } = options || {};
  
  // Logo box
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin, y, PDF_SETTINGS.logoSize, PDF_SETTINGS.logoSize, 2, 2, 'F');
  
  // Logo text
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_INFO.logoText, margin + PDF_SETTINGS.logoSize / 2, y + 10, { align: 'center' });
  
  // Company name
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_INFO.shortName, margin + PDF_SETTINGS.logoSize + 5, y + 10);
  
  // Badge (if provided)
  if (showBadge && badgeText) {
    const badgeWidth = Math.max(50, doc.getTextWidth(badgeText) + 16);
    doc.setFillColor(...BRAND_COLORS.gold);
    doc.roundedRect(pageWidth - margin - badgeWidth, y, badgeWidth, 15, 2, 2, 'F');
    doc.setTextColor(...BRAND_COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(badgeText, pageWidth - margin - badgeWidth / 2, y + 10, { align: 'center' });
  }
  
  return y + 25;
}

/**
 * Add complete PDF header with Nigerian stripes, logo, and optional badge
 */
export function addPDFHeader(
  doc: jsPDF,
  options?: {
    badgeText?: string;
    useNigerianStripes?: boolean;
    title?: string;
  }
): number {
  const { badgeText, useNigerianStripes = false, title } = options || {};
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add header bar
  let y = useNigerianStripes ? addNigerianHeader(doc) : addAccentHeader(doc);
  
  // Add logo
  y = addLogo(doc, y, { showBadge: !!badgeText, badgeText });
  
  // Add title if provided
  if (title) {
    doc.setTextColor(...BRAND_COLORS.text);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    y += 12;
  }
  
  return y;
}

// ============================================
// PDF FOOTER COMPONENTS
// ============================================

/**
 * Add consistent footer to PDF
 */
export function addPDFFooter(
  doc: jsPDF,
  options?: {
    disclaimer?: string;
    pageNumber?: number;
    totalPages?: number;
    showTimestamp?: boolean;
  }
): void {
  const { disclaimer, pageNumber, totalPages, showTimestamp = true } = options || {};
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_SETTINGS.margin;
  const contentWidth = pageWidth - margin * 2;
  const footerY = pageHeight - PDF_SETTINGS.footerHeight;
  
  // Separator line
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.rect(margin, footerY - 5, contentWidth, 0.5, 'F');
  
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  // Disclaimer
  if (disclaimer) {
    doc.text(disclaimer, pageWidth / 2, footerY + 2, { align: 'center' });
  }
  
  // Copyright and website
  const copyrightText = `\u00A9 ${new Date().getFullYear()} ${COMPANY_INFO.shortName} | ${COMPANY_INFO.website}`;
  doc.text(copyrightText, pageWidth / 2, footerY + 7, { align: 'center' });
  
  // Timestamp
  if (showTimestamp) {
    doc.text(`Generated: ${formatTimestamp()}`, margin, footerY + 12);
  }
  
  // Page numbers
  if (pageNumber !== undefined && totalPages !== undefined) {
    doc.setFontSize(8);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }
}

/**
 * Add page numbers to all pages of a PDF
 */
export function addPageNumbers(doc: jsPDF, disclaimer?: string): void {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPDFFooter(doc, { 
      pageNumber: i, 
      totalPages, 
      disclaimer,
      showTimestamp: i === 1 
    });
  }
}

// ============================================
// PDF TABLE COMPONENTS
// ============================================

/**
 * Add a styled table header
 */
export function addTableHeader(
  doc: jsPDF,
  columns: TableColumn[],
  y: number
): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
  
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  columns.forEach(col => {
    const textOptions = col.align && col.align !== 'left' ? { align: col.align as 'right' | 'center' } : undefined;
    doc.text(col.text, col.x, y + 7, textOptions);
  });
  
  return y + 12;
}

/**
 * Add a table row with alternating background
 */
export function addTableRow(
  doc: jsPDF,
  data: TableRowData[],
  y: number,
  isAlternate: boolean = false,
  rowHeight: number = 10
): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  
  if (isAlternate) {
    doc.setFillColor(...BRAND_COLORS.lightBg);
    doc.rect(margin, y - 4, contentWidth, rowHeight, 'F');
  }
  
  doc.setFontSize(9);
  
  data.forEach(item => {
    doc.setTextColor(...(item.color || BRAND_COLORS.text));
    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
    
    const textOptions = item.align && item.align !== 'left' ? { align: item.align as 'right' | 'center' } : undefined;
    doc.text(item.text, item.x, y + 2, textOptions);
  });
  
  doc.setFont('helvetica', 'normal');
  return y + rowHeight;
}

// ============================================
// PDF SUMMARY/HIGHLIGHT COMPONENTS
// ============================================

/**
 * Add a prominent summary box with gold border
 */
export function addSummaryBox(
  doc: jsPDF,
  options: {
    title: string;
    mainValue: string;
    subtitle?: string;
    y: number;
  }
): number {
  const { title, mainValue, subtitle, y } = options;
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  
  // Outer box
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin, y, contentWidth, 50, 4, 4, 'F');
  
  // Gold accent border
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.roundedRect(margin + 3, y + 3, contentWidth - 6, 44, 3, 3, 'F');
  
  // Inner box
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin + 4, y + 4, contentWidth - 8, 42, 2, 2, 'F');
  
  // Title
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(title, pageWidth / 2, y + 14, { align: 'center' });
  
  // Main value
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(mainValue, pageWidth / 2, y + 32, { align: 'center' });
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(subtitle, pageWidth / 2, y + 44, { align: 'center' });
  }
  
  return y + 60;
}

/**
 * Add a 4-column summary grid
 */
export function addSummaryGrid(
  doc: jsPDF,
  items: Array<{ label: string; value: string; color?: RGB }>,
  y: number
): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  const colWidth = (contentWidth - 16) / items.length;
  
  // Background box
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin, y, contentWidth, 50, 4, 4, 'F');
  
  // Gold border
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.roundedRect(margin + 3, y + 3, contentWidth - 6, 44, 3, 3, 'F');
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin + 4, y + 4, contentWidth - 8, 42, 2, 2, 'F');
  
  // Title
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FINANCIAL SUMMARY', pageWidth / 2, y + 12, { align: 'center' });
  
  // Grid items
  let colX = margin + 8;
  items.forEach((item) => {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text(item.label, colX + colWidth / 2, y + 25, { align: 'center' });
    
    doc.setTextColor(...BRAND_COLORS.white);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, colX + colWidth / 2, y + 38, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    
    colX += colWidth;
  });
  
  return y + 60;
}

/**
 * Add a status badge
 */
export function addStatusBadge(
  doc: jsPDF,
  text: string,
  type: 'success' | 'warning' | 'info' | 'danger',
  x: number,
  y: number
): void {
  const colors: Record<string, [number, number, number]> = {
    success: [34, 197, 94],
    warning: [245, 158, 11],
    info: [59, 130, 246],
    danger: [239, 68, 68],
  };
  
  const icons: Record<string, string> = {
    success: '\u2713', // ✓
    warning: '\u26A0', // ⚠
    info: '\u2139',    // ℹ
    danger: '\u2717',  // ✗
  };
  
  const badgeWidth = doc.getTextWidth(text) + 20;
  doc.setFillColor(...colors[type]);
  doc.roundedRect(x, y, badgeWidth, 12, 2, 2, 'F');
  
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${icons[type]} ${text}`, x + badgeWidth / 2, y + 8, { align: 'center' });
}

/**
 * Add an alert box with icon
 */
export function addAlertBox(
  doc: jsPDF,
  message: string,
  type: 'info' | 'warning' | 'success' | 'danger',
  y: number
): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  
  const bgColors: Record<string, [number, number, number]> = {
    info: [239, 246, 255],
    warning: [255, 251, 235],
    success: [240, 253, 244],
    danger: [254, 242, 242],
  };
  
  const textColors: Record<string, [number, number, number]> = {
    info: [59, 130, 246],
    warning: [245, 158, 11],
    success: [34, 197, 94],
    danger: [239, 68, 68],
  };
  
  const icons: Record<string, string> = {
    info: '\u2139',    // ℹ
    warning: '\u26A0', // ⚠
    success: '\u2713', // ✓
    danger: '\u2717',  // ✗
  };
  
  doc.setFillColor(...bgColors[type]);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
  
  doc.setTextColor(...textColors[type]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${icons[type]} ${message}`, margin + 5, y + 8);
  
  return y + 16;
}

/**
 * Add a section title with optional underline
 */
export function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  const margin = PDF_SETTINGS.margin;
  
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, y);
  
  return y + 8;
}

// ============================================
// PDF UTILITY FUNCTIONS
// ============================================

/**
 * Check if a new page is needed and add one if so
 */
export function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  requiredSpace: number = 30,
  onNewPage?: () => number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = PDF_SETTINGS.footerHeight + 10;
  
  if (currentY + requiredSpace > pageHeight - bottomMargin) {
    doc.addPage();
    return onNewPage ? onNewPage() : PDF_SETTINGS.margin;
  }
  
  return currentY;
}

/**
 * Wrap text to fit within a specified width
 */
export function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Add info box with light background
 */
export function addInfoBox(
  doc: jsPDF,
  items: Array<[string, string]>,
  y: number,
  options?: { title?: string }
): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  const boxHeight = items.length * 10 + (options?.title ? 16 : 10);
  
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, 'F');
  
  let itemY = y + 8;
  
  if (options?.title) {
    doc.setTextColor(...BRAND_COLORS.nigerianGreen);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, margin + 8, itemY);
    itemY += 8;
  }
  
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  items.forEach(([label, value]) => {
    doc.text(label, margin + 8, itemY);
    doc.setFont('helvetica', 'bold');
    doc.text(value, pageWidth - margin - 8, itemY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    itemY += 10;
  });
  
  return y + boxHeight + 8;
}

// ============================================
// CSV EXPORT UTILITIES
// ============================================

/**
 * Escape and format a value for CSV
 */
export function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // Escape quotes and wrap if contains special characters
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: Array<{ key: keyof T; header: string }>
): string {
  if (data.length === 0) return '';
  
  const cols = columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, header: String(key) }));
  
  const headers = cols.map(c => escapeCSVValue(c.header)).join(',');
  const rows = data.map(item =>
    cols.map(c => escapeCSVValue(item[c.key])).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

/**
 * Add TaxForge branding header to CSV files
 */
export function addCSVHeader(title: string, dateRange?: string): string[] {
  const rows = [
    escapeCSVValue(`${COMPANY_INFO.shortName} - ${title}`),
    escapeCSVValue(`Generated: ${formatTimestamp()}`),
  ];
  
  if (dateRange) {
    rows.push(escapeCSVValue(`Period: ${dateRange}`));
  }
  
  rows.push(''); // Empty row before data
  
  return rows;
}

/**
 * Create complete CSV with branding
 */
export function createBrandedCSV<T extends Record<string, unknown>>(
  title: string,
  data: T[],
  columns?: Array<{ key: keyof T; header: string }>,
  dateRange?: string
): string {
  const header = addCSVHeader(title, dateRange);
  const csvData = toCSV(data, columns);
  return [...header, csvData].join('\n');
}

// ============================================
// FILE DOWNLOAD UTILITIES
// ============================================

/**
 * Download a file in the browser
 */
export function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType?: string
): void {
  const blob = content instanceof Blob
    ? content
    : new Blob([content], { type: mimeType || 'text/plain' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a filename with TaxForge prefix and date
 */
export function generateFilename(
  type: string,
  extension: 'pdf' | 'csv' | 'json' | 'ics',
  suffix?: string
): string {
  const date = formatDateForFilename();
  const safeSuffix = suffix ? `-${suffix.toLowerCase().replace(/\s+/g, '-')}` : '';
  return `taxforge-${type}${safeSuffix}-${date}.${extension}`;
}

// ============================================
// EXPORT HELPER FUNCTIONS
// ============================================

/**
 * Standard disclaimer text for PDFs
 */
export const PDF_DISCLAIMERS = {
  tax: 'DISCLAIMER: This report is for educational and planning purposes only. Tax calculations are estimates. Please consult a certified tax professional for official advice.',
  invoice: 'This is an electronically generated invoice and is valid without signature.',
  general: `\u00A9 ${new Date().getFullYear()} ${COMPANY_INFO.shortName} | ${COMPANY_INFO.website}`,
} as const;

/**
 * Get status badge color based on type
 */
export function getStatusColor(status: string): RGB {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'success':
    case 'verified':
    case 'completed':
      return BRAND_COLORS.success;
    case 'pending':
    case 'processing':
      return BRAND_COLORS.warning;
    case 'failed':
    case 'error':
    case 'cancelled':
      return BRAND_COLORS.danger;
    default:
      return BRAND_COLORS.info;
  }
}
