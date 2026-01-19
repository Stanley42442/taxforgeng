/**
 * Excel Export Utilities for TaxForge NG
 * Provides multi-sheet workbook creation with formulas, formatting, and branding
 */

import * as XLSX from 'xlsx';
import { COMPANY_INFO, formatTimestamp, formatDateForFilename } from './exportShared';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ExcelSheetOptions {
  headers?: string[];
  columnWidths?: number[];
  includeFormulas?: boolean;
  freezeHeader?: boolean;
}

export interface ExcelExportResult {
  success: boolean;
  filename: string;
  error?: string;
}

// ============================================
// EXCEL STYLES CONFIGURATION
// ============================================

export const EXCEL_STYLES = {
  // Nigerian Green header
  headerFill: { fgColor: { rgb: '008751' } },
  headerFont: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
  // Gold accent
  accentFill: { fgColor: { rgb: 'D4AF37' } },
  accentFont: { bold: true, color: { rgb: 'FFFFFF' } },
  // Currency format with Naira symbol
  currencyFormat: '[$₦-en-NG]#,##0.00',
  currencyFormatNoDecimals: '[$₦-en-NG]#,##0',
  // Date format
  dateFormat: 'dd-mmm-yyyy',
  // Percentage format
  percentFormat: '0.00%',
} as const;

// ============================================
// CORE WORKBOOK FUNCTIONS
// ============================================

/**
 * Create a new workbook with TaxForge branding metadata
 */
export function createBrandedWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  
  // Add workbook properties
  wb.Props = {
    Title: `${COMPANY_INFO.shortName} Export`,
    Subject: 'Tax & Financial Data',
    Author: COMPANY_INFO.name,
    Company: COMPANY_INFO.name,
    CreatedDate: new Date(),
  };
  
  return wb;
}

/**
 * Add a branded sheet to the workbook
 */
export function addBrandedSheet(
  wb: XLSX.WorkBook,
  data: unknown[][],
  sheetName: string,
  options?: ExcelSheetOptions
): void {
  const { headers, columnWidths, freezeHeader = true } = options || {};
  
  // Create branding header rows
  const brandingRows = [
    [COMPANY_INFO.shortName],
    [`Generated: ${formatTimestamp()}`],
    [''],
  ];
  
  // Add headers if provided
  const headerRow = headers ? [headers] : [];
  
  // Combine all rows
  const allData = [...brandingRows, ...headerRow, ...data];
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allData);
  
  // Set column widths
  if (columnWidths && columnWidths.length > 0) {
    ws['!cols'] = columnWidths.map(w => ({ wch: w }));
  } else {
    // Auto-calculate column widths based on content
    const maxCols = Math.max(...allData.map(row => (row as unknown[]).length));
    ws['!cols'] = Array(maxCols).fill(null).map((_, colIndex) => {
      const maxLen = allData.reduce((max, row) => {
        const cell = (row as unknown[])[colIndex];
        const len = cell ? String(cell).length : 0;
        return Math.max(max, len);
      }, 10);
      return { wch: Math.min(maxLen + 2, 50) };
    });
  }
  
  // Freeze header row (row 4 after branding)
  if (freezeHeader && headers) {
    ws['!freeze'] = { xSplit: 0, ySplit: 4 };
  }
  
  // Add to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
}

/**
 * Add a sheet with automatic data conversion from objects
 */
export function addDataSheet<T extends Record<string, unknown>>(
  wb: XLSX.WorkBook,
  data: T[],
  sheetName: string,
  columns: Array<{ key: keyof T; header: string; width?: number; format?: 'currency' | 'date' | 'percent' }>,
  options?: { includeBranding?: boolean; title?: string }
): void {
  const { includeBranding = true, title } = options || {};
  
  // Build rows
  const rows: unknown[][] = [];
  
  // Add branding if enabled
  if (includeBranding) {
    rows.push([title || COMPANY_INFO.shortName]);
    rows.push([`Generated: ${formatTimestamp()}`]);
    rows.push([]);
  }
  
  // Add headers
  rows.push(columns.map(c => c.header));
  
  // Add data rows
  data.forEach(item => {
    const row = columns.map(col => {
      const value = item[col.key];
      // Format currency values
      if (col.format === 'currency' && typeof value === 'number') {
        return value;
      }
      // Format dates
      if (col.format === 'date' && value) {
        return new Date(String(value));
      }
      return value ?? '';
    });
    rows.push(row);
  });
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);
  
  // Set column widths
  ws['!cols'] = columns.map(c => ({ wch: c.width || 15 }));
  
  // Add to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
}

/**
 * Add a summary sheet with key-value pairs
 */
export function addSummarySheet(
  wb: XLSX.WorkBook,
  title: string,
  summaryItems: Array<{ label: string; value: string | number }>,
  options?: { sheetName?: string }
): void {
  const rows: unknown[][] = [
    [COMPANY_INFO.shortName],
    [title],
    [`Generated: ${formatTimestamp()}`],
    [],
    ['SUMMARY'],
    [],
  ];
  
  summaryItems.forEach(item => {
    rows.push([item.label, item.value]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 25 }];
  
  XLSX.utils.book_append_sheet(wb, ws, (options?.sheetName || 'Summary').substring(0, 31));
}

// ============================================
// FORMULA UTILITIES
// ============================================

/**
 * Add a SUM formula to a cell
 */
export function addSumFormula(
  ws: XLSX.WorkSheet,
  column: string,
  startRow: number,
  endRow: number,
  resultRow: number
): void {
  const cellAddress = `${column}${resultRow}`;
  ws[cellAddress] = {
    t: 'n',
    f: `SUM(${column}${startRow}:${column}${endRow})`,
  };
}

/**
 * Add an AVERAGE formula to a cell
 */
export function addAverageFormula(
  ws: XLSX.WorkSheet,
  column: string,
  startRow: number,
  endRow: number,
  resultRow: number
): void {
  const cellAddress = `${column}${resultRow}`;
  ws[cellAddress] = {
    t: 'n',
    f: `AVERAGE(${column}${startRow}:${column}${endRow})`,
  };
}

/**
 * Add a simple formula to a cell
 */
export function addFormula(
  ws: XLSX.WorkSheet,
  cellAddress: string,
  formula: string
): void {
  ws[cellAddress] = {
    t: 'n',
    f: formula,
  };
}

// ============================================
// DOWNLOAD UTILITIES
// ============================================

/**
 * Download workbook as Excel file
 */
export function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename, { bookType: 'xlsx' });
}

/**
 * Generate standard Excel filename with TaxForge prefix
 */
export function generateExcelFilename(type: string, suffix?: string): string {
  const date = formatDateForFilename();
  const safeSuffix = suffix ? `-${suffix.toLowerCase().replace(/\s+/g, '-')}` : '';
  return `taxforge-${type}${safeSuffix}-${date}.xlsx`;
}

/**
 * Convert workbook to blob for email attachment
 */
export function workbookToBlob(wb: XLSX.WorkBook): Blob {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Convert workbook to base64 for email attachment
 */
export function workbookToBase64(wb: XLSX.WorkBook): string {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  return wbout;
}

// ============================================
// SPECIALIZED EXPORT FUNCTIONS
// ============================================

/**
 * Create a multi-sheet dashboard export
 */
export function createDashboardExcel(
  businesses: Array<{
    name: string;
    entityType: string;
    turnover: number;
    sector?: string;
  }>,
  financialSummary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    deductibleExpenses: number;
  },
  transactions?: Array<{
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
  }>
): XLSX.WorkBook {
  const wb = createBrandedWorkbook();
  
  // Sheet 1: Summary
  addSummarySheet(wb, 'Dashboard Summary', [
    { label: 'Total Businesses', value: businesses.length },
    { label: 'Total Income', value: `₦${financialSummary.totalIncome.toLocaleString()}` },
    { label: 'Total Expenses', value: `₦${financialSummary.totalExpenses.toLocaleString()}` },
    { label: 'Net Income', value: `₦${financialSummary.netIncome.toLocaleString()}` },
    { label: 'Deductible Expenses', value: `₦${financialSummary.deductibleExpenses.toLocaleString()}` },
  ]);
  
  // Sheet 2: Businesses
  if (businesses.length > 0) {
    addDataSheet(wb, businesses, 'Businesses', [
      { key: 'name', header: 'Business Name', width: 30 },
      { key: 'entityType', header: 'Type', width: 15 },
      { key: 'sector', header: 'Sector', width: 20 },
      { key: 'turnover', header: 'Turnover (₦)', width: 18, format: 'currency' },
    ]);
  }
  
  // Sheet 3: Transactions
  if (transactions && transactions.length > 0) {
    addDataSheet(wb, transactions, 'Transactions', [
      { key: 'date', header: 'Date', width: 12, format: 'date' },
      { key: 'description', header: 'Description', width: 35 },
      { key: 'category', header: 'Category', width: 15 },
      { key: 'type', header: 'Type', width: 10 },
      { key: 'amount', header: 'Amount (₦)', width: 15, format: 'currency' },
    ]);
  }
  
  return wb;
}

/**
 * Create a business report Excel export
 */
export function createBusinessReportExcel(
  businessName: string,
  income: Array<{ date: string; description: string; amount: number; category: string }>,
  expenses: Array<{ date: string; description: string; amount: number; category: string; isDeductible: boolean }>,
  summary: {
    totalIncome: number;
    totalExpenses: number;
    deductibleExpenses: number;
    netIncome: number;
  }
): XLSX.WorkBook {
  const wb = createBrandedWorkbook();
  
  // Sheet 1: Summary
  addSummarySheet(wb, `${businessName} - Financial Report`, [
    { label: 'Business Name', value: businessName },
    { label: 'Report Period', value: 'Full Year' },
    { label: 'Total Income', value: `₦${summary.totalIncome.toLocaleString()}` },
    { label: 'Total Expenses', value: `₦${summary.totalExpenses.toLocaleString()}` },
    { label: 'Deductible Expenses', value: `₦${summary.deductibleExpenses.toLocaleString()}` },
    { label: 'Net Income', value: `₦${summary.netIncome.toLocaleString()}` },
  ]);
  
  // Sheet 2: Income
  if (income.length > 0) {
    addDataSheet(wb, income, 'Income', [
      { key: 'date', header: 'Date', width: 12, format: 'date' },
      { key: 'description', header: 'Description', width: 35 },
      { key: 'category', header: 'Category', width: 15 },
      { key: 'amount', header: 'Amount (₦)', width: 15, format: 'currency' },
    ], { title: `${businessName} - Income` });
  }
  
  // Sheet 3: Expenses
  if (expenses.length > 0) {
    addDataSheet(wb, expenses.map(e => ({
      ...e,
      deductible: e.isDeductible ? 'Yes' : 'No',
    })), 'Expenses', [
      { key: 'date', header: 'Date', width: 12, format: 'date' },
      { key: 'description', header: 'Description', width: 35 },
      { key: 'category', header: 'Category', width: 15 },
      { key: 'amount', header: 'Amount (₦)', width: 15, format: 'currency' },
      { key: 'deductible', header: 'Deductible', width: 12 },
    ], { title: `${businessName} - Expenses` });
  }
  
  // Sheet 4: Category Breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: summary.totalExpenses > 0 
      ? `${((amount / summary.totalExpenses) * 100).toFixed(1)}%`
      : '0%',
  }));
  
  if (categoryData.length > 0) {
    addDataSheet(wb, categoryData, 'Category Breakdown', [
      { key: 'category', header: 'Category', width: 20 },
      { key: 'amount', header: 'Total (₦)', width: 18, format: 'currency' },
      { key: 'percentage', header: '% of Total', width: 12 },
    ], { title: 'Expense Category Analysis' });
  }
  
  return wb;
}

/**
 * Create an expenses-only Excel export
 */
export function createExpensesExcel(
  expenses: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
    isDeductible: boolean;
  }>,
  title?: string
): XLSX.WorkBook {
  const wb = createBrandedWorkbook();
  
  // Calculate totals
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const deductibleAmount = expenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);
  
  // Sheet 1: All Expenses
  addDataSheet(wb, expenses.map(e => ({
    ...e,
    deductible: e.isDeductible ? 'Yes' : 'No',
  })), 'All Expenses', [
    { key: 'date', header: 'Date', width: 12, format: 'date' },
    { key: 'description', header: 'Description', width: 35 },
    { key: 'category', header: 'Category', width: 15 },
    { key: 'amount', header: 'Amount (₦)', width: 15, format: 'currency' },
    { key: 'deductible', header: 'Deductible', width: 12 },
  ], { title: title || 'Expense Report' });
  
  // Sheet 2: By Category
  const byCategory = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = { total: 0, deductible: 0, count: 0 };
    }
    acc[exp.category].total += exp.amount;
    acc[exp.category].count++;
    if (exp.isDeductible) {
      acc[exp.category].deductible += exp.amount;
    }
    return acc;
  }, {} as Record<string, { total: number; deductible: number; count: number }>);
  
  const categoryData = Object.entries(byCategory).map(([category, data]) => ({
    category,
    count: data.count,
    total: data.total,
    deductible: data.deductible,
    percentage: totalAmount > 0 ? `${((data.total / totalAmount) * 100).toFixed(1)}%` : '0%',
  }));
  
  addDataSheet(wb, categoryData, 'By Category', [
    { key: 'category', header: 'Category', width: 20 },
    { key: 'count', header: 'Count', width: 10 },
    { key: 'total', header: 'Total (₦)', width: 18, format: 'currency' },
    { key: 'deductible', header: 'Deductible (₦)', width: 18, format: 'currency' },
    { key: 'percentage', header: '% of Total', width: 12 },
  ], { title: 'Expenses by Category' });
  
  // Sheet 3: Summary
  addSummarySheet(wb, 'Expense Summary', [
    { label: 'Total Expenses', value: `₦${totalAmount.toLocaleString()}` },
    { label: 'Deductible Expenses', value: `₦${deductibleAmount.toLocaleString()}` },
    { label: 'Non-Deductible', value: `₦${(totalAmount - deductibleAmount).toLocaleString()}` },
    { label: 'Total Transactions', value: expenses.length },
    { label: 'Categories', value: Object.keys(byCategory).length },
  ], { sheetName: 'Summary' });
  
  return wb;
}

/**
 * Create an audit log Excel export
 */
export function createAuditLogExcel(
  logs: Array<{
    timestamp: string;
    user: string;
    action: string;
    details: string;
    ipAddress?: string;
  }>
): XLSX.WorkBook {
  const wb = createBrandedWorkbook();
  
  addDataSheet(wb, logs, 'Audit Log', [
    { key: 'timestamp', header: 'Timestamp', width: 20, format: 'date' },
    { key: 'user', header: 'User', width: 25 },
    { key: 'action', header: 'Action', width: 20 },
    { key: 'details', header: 'Details', width: 40 },
    { key: 'ipAddress', header: 'IP Address', width: 15 },
  ], { title: 'Security Audit Log' });
  
  return wb;
}

/**
 * Create a tax calculation Excel export
 */
export function createTaxCalculationExcel(
  businessName: string,
  inputs: Record<string, unknown>,
  result: {
    grossIncome: number;
    taxableIncome: number;
    incomeTax: number;
    vatPayable: number;
    totalTaxPayable: number;
    effectiveRate: number;
    breakdown: Array<{ label: string; amount: number; description?: string }>;
  }
): XLSX.WorkBook {
  const wb = createBrandedWorkbook();
  
  // Sheet 1: Summary
  addSummarySheet(wb, `${businessName} - Tax Calculation`, [
    { label: 'Business Name', value: businessName },
    { label: 'Gross Income', value: `₦${result.grossIncome.toLocaleString()}` },
    { label: 'Taxable Income', value: `₦${result.taxableIncome.toLocaleString()}` },
    { label: 'Income Tax', value: `₦${result.incomeTax.toLocaleString()}` },
    { label: 'VAT Payable', value: `₦${result.vatPayable.toLocaleString()}` },
    { label: 'Total Tax Payable', value: `₦${result.totalTaxPayable.toLocaleString()}` },
    { label: 'Effective Rate', value: `${result.effectiveRate.toFixed(2)}%` },
  ]);
  
  // Sheet 2: Breakdown
  if (result.breakdown.length > 0) {
    addDataSheet(wb, result.breakdown, 'Tax Breakdown', [
      { key: 'label', header: 'Item', width: 25 },
      { key: 'amount', header: 'Amount (₦)', width: 18, format: 'currency' },
      { key: 'description', header: 'Description', width: 35 },
    ], { title: 'Tax Breakdown Details' });
  }
  
  return wb;
}
