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
 * Updated for individual operator (no registered LLC yet)
 */
export const COMPANY_INFO = {
  name: 'TaxForge NG',
  shortName: 'TaxForge NG',
  logoText: 'TF',
  operator: 'Gillespie Benjamin Mclee (OptiSolve Labs)',
  operatorShort: 'Gillespie Benjamin Mclee',
  location: 'Port Harcourt, Rivers State, Nigeria',
  email: 'support@taxforgeng.com',
  website: 'www.taxforgeng.com',
  liveUrl: 'https://taxforgeng.com',
} as const;

/**
 * Standard Disclaimer for all PDFs
 * Provides legal protection as an individual-operated educational tool
 */
export const STANDARD_DISCLAIMER = 
  'TaxForge NG is an educational and planning tool operated by Gillespie Benjamin Mclee as an individual project. ' +
  'All calculations are estimates based on user inputs and publicly available tax rules. ' +
  'Not official tax advice, filing, or legal service. Please consult a certified tax professional for official compliance. ' +
  'Operated in Port Harcourt, Rivers State, Nigeria.';

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
// CURRENCY FORMATTING (Critical for PDF rendering)
// ============================================

/**
 * Format amount as Nigerian Naira with "NGN" prefix
 * Uses "NGN" text prefix for reliable PDF rendering (jsPDF's Helvetica doesn't support ₦)
 * This matches Nigerian banking standards (Access Bank, GTBank, Paystack, NRS)
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
    showDecimals = true,  // Default to TRUE for professional financial documents
    showSign = false,
    useParenthesesForNegative = true
  } = options || {};

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Always use 2 decimal places for consistency in financial documents
  const formatted = absAmount.toLocaleString('en-NG', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  // Use "NGN" prefix for reliable PDF rendering (industry standard)
  const nairaPrefix = 'NGN ';

  if (isNegative && useParenthesesForNegative) {
    return `(${nairaPrefix}${formatted})`;
  }

  const sign = isNegative ? '-' : (showSign ? '+' : '');
  return `${sign}${nairaPrefix}${formatted}`;
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
 * Optimized for reduced whitespace
 */
export function addNigerianHeader(doc: jsPDF): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Nigerian flag-inspired header (reduced heights for tighter layout)
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.rect(0, 0, pageWidth, 8, 'F');  // Reduced from 12px to 8px
  
  // White stripe
  doc.setFillColor(...BRAND_COLORS.white);
  doc.rect(0, 8, pageWidth, 2, 'F');  // Reduced from 4px to 2px
  
  // Green accent line
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.rect(0, 10, pageWidth, 2, 'F');
  
  return 18; // Return tighter Y position (was 30)
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
  
  // Copyright and website - updated for individual operator
  const copyrightText = `\u00A9 ${new Date().getFullYear()} ${COMPANY_INFO.shortName} | Operated by ${COMPANY_INFO.operatorShort} | ${COMPANY_INFO.email} | Educational tool only`;
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
 * Add a table row with alternating background and subtle row separator
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
  
  // Alternating background
  if (isAlternate) {
    doc.setFillColor(...BRAND_COLORS.lightBg);
    doc.rect(margin, y - 4, contentWidth, rowHeight, 'F');
  }
  
  // Add subtle bottom border for visual row separation
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y + rowHeight - 4, pageWidth - margin, y + rowHeight - 4);
  
  doc.setFontSize(9);
  
  data.forEach(item => {
    doc.setTextColor(...(item.color || BRAND_COLORS.text));
    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
    
    // Improved padding: +8 from margin (was +5)
    const adjustedX = item.align === 'right' 
      ? item.x - 3  // More padding from right edge
      : item.x + 3; // More padding from left edge
    
    const textOptions = item.align && item.align !== 'left' ? { align: item.align as 'right' | 'center' } : undefined;
    doc.text(item.text, adjustedX, y + 2, textOptions);
  });
  
  doc.setFont('helvetica', 'normal');
  return y + rowHeight;
}

/**
 * Add a section divider with gold accent line
 */
export function addSectionDivider(doc: jsPDF, y: number): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Gold accent line
  doc.setFillColor(...BRAND_COLORS.gold);
  doc.rect(margin, y, pageWidth - margin * 2, 1, 'F');
  
  return y + 8;
}

// ============================================
// WRAPPED TABLE ROW (Multi-line text support)
// ============================================

export interface WrappedTableColumn {
  text: string;
  x: number;
  width: number;
  align?: 'left' | 'right' | 'center';
  color?: RGB;
  bold?: boolean;
}

/**
 * Add a table row with automatic text wrapping for long content
 * Dynamically adjusts row height based on the tallest cell
 * Uses doc.splitTextToSize() for accurate text wrapping
 */
export function addWrappedTableRow(
  doc: jsPDF,
  columns: WrappedTableColumn[],
  y: number,
  isAlternate: boolean = false,
  options?: {
    fontSize?: number;
    lineHeight?: number;
    minRowHeight?: number;
    showBorder?: boolean;
  }
): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  
  const {
    fontSize = 9,
    lineHeight = 4,
    minRowHeight = 10,
    showBorder = true
  } = options || {};
  
  doc.setFontSize(fontSize);
  
  // Step 1: Calculate wrapped lines for each column
  const wrappedColumns = columns.map(col => {
    doc.setFont('helvetica', col.bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(col.text, col.width - 4); // 4px padding
    return {
      ...col,
      lines: Array.isArray(lines) ? lines : [lines]
    };
  });
  
  // Step 2: Find the maximum number of lines (tallest cell)
  const maxLines = Math.max(...wrappedColumns.map(col => col.lines.length));
  
  // Step 3: Calculate dynamic row height
  const rowHeight = Math.max(minRowHeight, (maxLines * lineHeight) + 8);
  
  // Step 4: Draw alternating background
  if (isAlternate) {
    doc.setFillColor(...BRAND_COLORS.lightBg);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
  }
  
  // Step 5: Render each column's wrapped text
  wrappedColumns.forEach(col => {
    doc.setTextColor(...(col.color || BRAND_COLORS.text));
    doc.setFont('helvetica', col.bold ? 'bold' : 'normal');
    
    col.lines.forEach((line, lineIndex) => {
      const lineY = y + 6 + (lineIndex * lineHeight);
      
      if (col.align === 'right') {
        doc.text(line, col.x + col.width - 4, lineY, { align: 'right' });
      } else if (col.align === 'center') {
        doc.text(line, col.x + col.width / 2, lineY, { align: 'center' });
      } else {
        doc.text(line, col.x + 2, lineY);
      }
    });
  });
  
  // Step 6: Add subtle bottom border for visual row separation
  if (showBorder) {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
  }
  
  doc.setFont('helvetica', 'normal');
  return y + rowHeight;
}

/**
 * Add a wrapped table header (matches addWrappedTableRow column structure)
 */
export function addWrappedTableHeader(
  doc: jsPDF,
  columns: Array<{ text: string; x: number; width: number; align?: 'left' | 'right' | 'center' }>,
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
    if (col.align === 'right') {
      doc.text(col.text, col.x + col.width - 4, y + 7, { align: 'right' });
    } else if (col.align === 'center') {
      doc.text(col.text, col.x + col.width / 2, y + 7, { align: 'center' });
    } else {
      doc.text(col.text, col.x + 2, y + 7);
    }
  });
  
  return y + 12;
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

// ============================================
// CATEGORY COLORS FOR CHARTS
// ============================================

export const CATEGORY_COLORS: Record<string, RGB> = {
  income: [34, 197, 94],      // Green
  rent: [245, 158, 11],       // Orange
  transport: [59, 130, 246],  // Blue
  marketing: [168, 85, 247],  // Purple
  salary: [236, 72, 153],     // Pink
  utilities: [20, 184, 166],  // Teal
  supplies: [139, 92, 246],   // Violet
  equipment: [249, 115, 22],  // Orange
  professional: [6, 182, 212], // Cyan
  insurance: [244, 63, 94],   // Rose
  taxes: [234, 179, 8],       // Yellow
  other: [107, 114, 128],     // Gray
  cit: [0, 135, 81],          // Nigerian Green
  vat: [212, 175, 55],        // Gold
  levy: [59, 130, 246],       // Blue
};

export function getCategoryColor(category: string): RGB {
  const key = category.toLowerCase().replace(/[^a-z]/g, '');
  return CATEGORY_COLORS[key] || BRAND_COLORS.muted;
}

// ============================================
// VISUAL CHART UTILITIES
// ============================================

/**
 * Add a pie chart to PDF
 */
export function addPieChart(
  doc: jsPDF,
  data: Array<{ label: string; value: number; color?: RGB }>,
  centerX: number,
  centerY: number,
  radius: number,
  options?: { showLegend?: boolean; legendX?: number; legendY?: number }
): number {
  const { showLegend = true, legendX, legendY } = options || {};
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return centerY + radius + 10;

  let startAngle = -Math.PI / 2; // Start from top

  // Draw pie slices using polygon approximation
  data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    const color = item.color || getCategoryColor(item.label);

    // Create pie slice path
    const points: Array<[number, number]> = [[centerX, centerY]];
    const steps = Math.max(20, Math.ceil(sliceAngle * 20));
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (sliceAngle * i) / steps;
      points.push([
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle),
      ]);
    }

    doc.setFillColor(...color);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);

    // Draw polygon
    const firstPoint = points[0];
    doc.moveTo(firstPoint[0], firstPoint[1]);
    points.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
    doc.lineTo(firstPoint[0], firstPoint[1]);
    doc.fillStroke();

    startAngle = endAngle;
  });

  // Draw legend
  if (showLegend) {
    const legX = legendX ?? centerX + radius + 15;
    let legY = legendY ?? centerY - (data.length * 7) / 2;
    
    doc.setFontSize(8);
    data.forEach((item) => {
      const color = item.color || getCategoryColor(item.label);
      doc.setFillColor(...color);
      doc.rect(legX, legY - 3, 6, 6, 'F');
      
      doc.setTextColor(...BRAND_COLORS.text);
      const percentage = ((item.value / total) * 100).toFixed(1);
      doc.text(`${item.label} (${percentage}%)`, legX + 9, legY + 1);
      legY += 9;
    });
  }

  return centerY + radius + 15;
}

/**
 * Add a bar chart to PDF
 */
export function addBarChart(
  doc: jsPDF,
  data: Array<{ label: string; value: number; color?: RGB }>,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: { showValues?: boolean; horizontal?: boolean; maxValue?: number }
): number {
  const { showValues = true, horizontal = false, maxValue } = options || {};
  const max = maxValue ?? Math.max(...data.map(d => d.value));
  if (max === 0) return y + height + 10;

  const barCount = data.length;
  const gap = 4;

  if (horizontal) {
    const barHeight = (height - gap * (barCount - 1)) / barCount;
    
    data.forEach((item, index) => {
      const barY = y + index * (barHeight + gap);
      const barWidth = (item.value / max) * width;
      const color = item.color || getCategoryColor(item.label);

      doc.setFillColor(...color);
      doc.roundedRect(x, barY, barWidth, barHeight, 2, 2, 'F');

      // Label
      doc.setFontSize(7);
      doc.setTextColor(...BRAND_COLORS.text);
      doc.text(truncateText(item.label, 15), x - 2, barY + barHeight / 2 + 1, { align: 'right' });

      // Value
      if (showValues && barWidth > 20) {
        doc.setTextColor(...BRAND_COLORS.white);
        doc.text(formatNaira(item.value), x + barWidth - 3, barY + barHeight / 2 + 1, { align: 'right' });
      }
    });
  } else {
    const barWidth = (width - gap * (barCount - 1)) / barCount;
    
    data.forEach((item, index) => {
      const barX = x + index * (barWidth + gap);
      const barHeight = (item.value / max) * height;
      const barY = y + height - barHeight;
      const color = item.color || getCategoryColor(item.label);

      doc.setFillColor(...color);
      doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');

      // Label (rotated or truncated)
      doc.setFontSize(6);
      doc.setTextColor(...BRAND_COLORS.muted);
      const label = truncateText(item.label, 8);
      doc.text(label, barX + barWidth / 2, y + height + 6, { align: 'center' });

      // Value on top
      if (showValues && barHeight > 10) {
        doc.setTextColor(...BRAND_COLORS.white);
        doc.setFontSize(6);
        doc.text(formatNaira(item.value), barX + barWidth / 2, barY + 6, { align: 'center' });
      }
    });
  }

  return y + height + 15;
}

/**
 * Add a progress bar to PDF
 */
export function addProgressBar(
  doc: jsPDF,
  percentage: number,
  x: number,
  y: number,
  width: number,
  height: number = 8,
  color?: RGB
): void {
  const fillColor = color || BRAND_COLORS.nigerianGreen;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const fillWidth = (clampedPercentage / 100) * width;

  // Background
  doc.setFillColor(229, 231, 235); // Gray-200
  doc.roundedRect(x, y, width, height, height / 2, height / 2, 'F');

  // Fill
  if (fillWidth > 0) {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, fillWidth, height, height / 2, height / 2, 'F');
  }

  // Percentage text
  doc.setFontSize(7);
  doc.setTextColor(...BRAND_COLORS.text);
  doc.text(`${clampedPercentage.toFixed(1)}%`, x + width + 5, y + height / 2 + 2);
}

// ============================================
// WATERMARK AND SIGNATURE UTILITIES
// ============================================

/**
 * Add tier-aware watermark to PDF
 * Only adds watermark for free tier users
 */
export function addTieredWatermark(
  doc: jsPDF,
  showWatermark: boolean,
  documentType?: 'draft' | 'sample' | 'confidential' | 'official'
): void {
  if (!showWatermark) return;

  const pages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    
    // Save graphics state
    doc.saveGraphicsState();
    
    // Set watermark style
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(50);
    doc.setFont('helvetica', 'bold');

    const text = documentType === 'draft' ? 'DRAFT' :
                 documentType === 'confidential' ? 'CONFIDENTIAL' :
                 documentType === 'official' ? 'OFFICIAL' :
                 'SAMPLE - UPGRADE';

    // Center and rotate watermark
    doc.text(text, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });

    // Restore graphics state
    doc.restoreGraphicsState();
  }
}

/**
 * Digital signature options
 */
export interface DigitalSignatureOptions {
  documentId: string;
  generatedAt: Date;
  userId?: string;
  businessName?: string;
  verificationUrl?: string;
}

/**
 * Generate a simple document hash for verification
 */
export function generateDocumentHash(options: DigitalSignatureOptions): string {
  const content = JSON.stringify({
    id: options.documentId,
    ts: options.generatedAt.getTime(),
    user: options.userId || 'anonymous',
    biz: options.businessName || '',
  });
  
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(16, '0');
}

/**
 * Add digital signature block to PDF (Professional+ tiers)
 */
export function addDigitalSignatureBlock(
  doc: jsPDF,
  options: DigitalSignatureOptions,
  y: number
): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  const hash = generateDocumentHash(options);

  // Signature box
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
  doc.setDrawColor(...BRAND_COLORS.nigerianGreen);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'S');

  // Green badge
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin + 5, y + 5, 8, 25, 2, 2, 'F');

  // Signature icon (checkmark)
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFontSize(12);
  doc.text('\u2713', margin + 9, y + 20, { align: 'center' });

  // Signature text
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITALLY SIGNED DOCUMENT', margin + 18, y + 10);

  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Document ID: ${options.documentId}`, margin + 18, y + 18);
  doc.text(`Generated: ${formatNigerianDate(options.generatedAt.toISOString())}`, margin + 18, y + 25);
  doc.text(`Hash: ${hash.substring(0, 16)}...`, margin + 18, y + 32);

  // Verification URL if provided
  if (options.verificationUrl) {
    doc.setTextColor(...BRAND_COLORS.info);
    doc.setFontSize(7);
    doc.text(`Verify: ${options.verificationUrl}`, pageWidth - margin - 5, y + 32, { align: 'right' });
  }

  return y + 42;
}

/**
 * Generate unique document ID for verification
 */
export function generateDocumentId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `TF-${timestamp}-${random}`.toUpperCase();
}

// ============================================
// PRINT OPTIMIZATION UTILITIES
// ============================================

export const PRINT_SETTINGS = {
  a4: { width: 210, height: 297 },
  letter: { width: 216, height: 279 },
  margins: { top: 20, bottom: 25, left: 20, right: 20 },
  safeZone: { top: 15, bottom: 20 },
};

/**
 * Get safe page height for content (accounting for footer)
 */
export function getPageSafeHeight(doc: jsPDF): number {
  return doc.internal.pageSize.getHeight() - PDF_SETTINGS.footerHeight - 15;
}

/**
 * Add smart page break with continuation header
 */
export function addSectionWithPageBreak(
  doc: jsPDF,
  sectionHeight: number,
  currentY: number,
  renderSection: (y: number) => number,
  onNewPage: () => number
): number {
  if (currentY + sectionHeight > getPageSafeHeight(doc)) {
    doc.addPage();
    currentY = onNewPage();
  }
  return renderSection(currentY);
}

/**
 * Add table continuation header on new pages
 */
export function addTableContinuationHeader(
  doc: jsPDF,
  tableName: string,
  y: number
): number {
  const margin = PDF_SETTINGS.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.rect(margin, y, contentWidth, 8, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.setFont('helvetica', 'italic');
  doc.text(`${tableName} (continued from previous page)`, margin + 5, y + 5);
  doc.setFont('helvetica', 'normal');
  
  return y + 12;
}

/**
 * Truncate text to fit within a maximum width
 */
export function truncateToWidth(doc: jsPDF, text: string, maxWidth: number): string {
  if (!text) return '';
  const ellipsis = '...';
  
  if (doc.getTextWidth(text) <= maxWidth) return text;
  
  let truncated = text;
  while (doc.getTextWidth(truncated + ellipsis) > maxWidth && truncated.length > 3) {
    truncated = truncated.slice(0, -1);
  }
  
  return truncated + ellipsis;
}

/**
 * Calculate dynamic row height based on content
 */
export function calculateRowHeight(
  doc: jsPDF,
  texts: string[],
  maxWidths: number[],
  baseHeight: number = 10
): number {
  let maxLines = 1;
  
  texts.forEach((text, i) => {
    if (maxWidths[i] && text) {
      const lines = doc.splitTextToSize(String(text), maxWidths[i]);
      maxLines = Math.max(maxLines, Array.isArray(lines) ? lines.length : 1);
    }
  });
  
  return baseHeight + (maxLines - 1) * 5;
}

/**
 * Format timestamp for PDF without problematic characters
 */
export function formatPDFTimestamp(date: Date = new Date()): string {
  return date.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' ' + date.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(':', '.');
}

// ============================================
// PDF TO BASE64 CONVERSION
// ============================================

/**
 * Convert jsPDF document to base64 string
 */
export function pdfToBase64(doc: jsPDF): string {
  return doc.output('datauristring').split(',')[1];
}

/**
 * Convert jsPDF document to Blob
 */
export function pdfToBlob(doc: jsPDF): Blob {
  return doc.output('blob');
}
