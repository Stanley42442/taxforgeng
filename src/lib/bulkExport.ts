/**
 * Bulk Export Utilities for TaxForge NG
 * Provides ZIP file generation for multiple report exports
 */

import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { formatDateForFilename, COMPANY_INFO } from './exportShared';
import logger from './logger';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface BulkExportOptions {
  businesses?: Array<{ id: string; name: string }>;
  dateRange?: { start: Date; end: Date };
  includeTypes: {
    taxCalculations?: boolean;
    expenses?: boolean;
    invoices?: boolean;
    businessReports?: boolean;
  };
  format: 'pdf' | 'excel' | 'both';
}

export interface BulkExportProgress {
  current: number;
  total: number;
  currentItem: string;
  percentage: number;
}

export interface BulkExportResult {
  success: boolean;
  filename: string;
  fileCount: number;
  totalSize: number;
  error?: string;
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Calculate total items for progress tracking
 */
export function calculateTotalItems(options: BulkExportOptions): number {
  let total = 0;
  const businessCount = options.businesses?.length || 1;
  const formatMultiplier = options.format === 'both' ? 2 : 1;
  
  if (options.includeTypes.taxCalculations) {
    total += businessCount * formatMultiplier;
  }
  if (options.includeTypes.expenses) {
    total += businessCount * formatMultiplier;
  }
  if (options.includeTypes.invoices) {
    total += businessCount * formatMultiplier;
  }
  if (options.includeTypes.businessReports) {
    total += businessCount * formatMultiplier;
  }
  
  return Math.max(total, 1);
}

/**
 * Generate a bulk export ZIP file
 * This is a framework function - actual report generation is handled by respective modules
 */
export async function generateBulkExportZip(
  options: BulkExportOptions,
  reportGenerators: {
    generateTaxPDF?: (businessId: string) => Promise<Blob>;
    generateExpensesPDF?: (businessId: string) => Promise<Blob>;
    generateInvoicesPDF?: (businessId: string) => Promise<Blob>;
    generateBusinessReportPDF?: (businessId: string) => Promise<Blob>;
    generateTaxExcel?: (businessId: string) => Promise<Blob>;
    generateExpensesExcel?: (businessId: string) => Promise<Blob>;
    generateInvoicesExcel?: (businessId: string) => Promise<Blob>;
    generateBusinessReportExcel?: (businessId: string) => Promise<Blob>;
  },
  onProgress?: (progress: BulkExportProgress) => void
): Promise<Blob> {
  const zip = new JSZip();
  
  // Create folders
  const taxFolder = zip.folder('Tax Calculations');
  const expenseFolder = zip.folder('Expenses');
  const invoiceFolder = zip.folder('Invoices');
  const reportsFolder = zip.folder('Business Reports');
  
  const total = calculateTotalItems(options);
  let processed = 0;
  
  const businesses = options.businesses || [{ id: 'default', name: 'All Data' }];
  const includePDF = options.format === 'pdf' || options.format === 'both';
  const includeExcel = options.format === 'excel' || options.format === 'both';
  
  for (const business of businesses) {
    const safeBusinessName = business.name.replace(/[^a-zA-Z0-9]/g, '-');
    
    // Tax Calculations
    if (options.includeTypes.taxCalculations) {
      if (includePDF && reportGenerators.generateTaxPDF) {
        onProgress?.({
          current: processed,
          total,
          currentItem: `Tax Report: ${business.name} (PDF)`,
          percentage: (processed / total) * 100,
        });
        try {
          const pdf = await reportGenerators.generateTaxPDF(business.id);
          taxFolder?.file(`${safeBusinessName}-tax-report.pdf`, pdf);
        } catch (e) {
          logger.error(`Failed to generate tax PDF for ${business.name}:`, e);
        }
        processed++;
      }
      
      if (includeExcel && reportGenerators.generateTaxExcel) {
        onProgress?.({
          current: processed,
          total,
          currentItem: `Tax Report: ${business.name} (Excel)`,
          percentage: (processed / total) * 100,
        });
        try {
          const excel = await reportGenerators.generateTaxExcel(business.id);
          taxFolder?.file(`${safeBusinessName}-tax-report.xlsx`, excel);
        } catch (e) {
          logger.error(`Failed to generate tax Excel for ${business.name}:`, e);
        }
        processed++;
      }
    }
    
    // Expenses
    if (options.includeTypes.expenses) {
      if (includePDF && reportGenerators.generateExpensesPDF) {
        onProgress?.({
          current: processed,
          total,
          currentItem: `Expenses: ${business.name} (PDF)`,
          percentage: (processed / total) * 100,
        });
        try {
          const pdf = await reportGenerators.generateExpensesPDF(business.id);
          expenseFolder?.file(`${safeBusinessName}-expenses.pdf`, pdf);
        } catch (e) {
          logger.error(`Failed to generate expenses PDF for ${business.name}:`, e);
        }
        processed++;
      }
      
      if (includeExcel && reportGenerators.generateExpensesExcel) {
        onProgress?.({
          current: processed,
          total,
          currentItem: `Expenses: ${business.name} (Excel)`,
          percentage: (processed / total) * 100,
        });
        try {
          const excel = await reportGenerators.generateExpensesExcel(business.id);
          expenseFolder?.file(`${safeBusinessName}-expenses.xlsx`, excel);
        } catch (e) {
          logger.error(`Failed to generate expenses Excel for ${business.name}:`, e);
        }
        processed++;
      }
    }
    
    // Invoices
    if (options.includeTypes.invoices) {
      if (includePDF && reportGenerators.generateInvoicesPDF) {
        onProgress?.({
          current: processed,
          total,
          currentItem: `Invoices: ${business.name} (PDF)`,
          percentage: (processed / total) * 100,
        });
        try {
          const pdf = await reportGenerators.generateInvoicesPDF(business.id);
          invoiceFolder?.file(`${safeBusinessName}-invoices.pdf`, pdf);
        } catch (e) {
          logger.error(`Failed to generate invoices PDF for ${business.name}:`, e);
        }
        processed++;
      }
      
      if (includeExcel && reportGenerators.generateInvoicesExcel) {
        onProgress?.({
          current: processed,
          total,
          currentItem: `Invoices: ${business.name} (Excel)`,
          percentage: (processed / total) * 100,
        });
        try {
          const excel = await reportGenerators.generateInvoicesExcel(business.id);
          invoiceFolder?.file(`${safeBusinessName}-invoices.xlsx`, excel);
        } catch (e) {
          logger.error(`Failed to generate invoices Excel for ${business.name}:`, e);
        }
        processed++;
      }
    }
    
    // Business Reports
    if (options.includeTypes.businessReports) {
      if (includePDF && reportGenerators.generateBusinessReportPDF) {
        onProgress?.({
          current: processed,
          total,
          currentItem: `Business Report: ${business.name} (PDF)`,
          percentage: (processed / total) * 100,
        });
        try {
          const pdf = await reportGenerators.generateBusinessReportPDF(business.id);
          reportsFolder?.file(`${safeBusinessName}-business-report.pdf`, pdf);
        } catch (e) {
          logger.error(`Failed to generate business report PDF for ${business.name}:`, e);
        }
        processed++;
      }
      
      if (includeExcel && reportGenerators.generateBusinessReportExcel) {
        onProgress?.({
          current: processed,
          total,
          currentItem: `Business Report: ${business.name} (Excel)`,
          percentage: (processed / total) * 100,
        });
        try {
          const excel = await reportGenerators.generateBusinessReportExcel(business.id);
          reportsFolder?.file(`${safeBusinessName}-business-report.xlsx`, excel);
        } catch (e) {
          logger.error(`Failed to generate business report Excel for ${business.name}:`, e);
        }
        processed++;
      }
    }
  }
  
  // Add summary file
  const summaryContent = generateSummaryText(options, processed);
  zip.file('EXPORT_SUMMARY.txt', summaryContent);
  
  // Add README
  zip.file('README.txt', generateReadmeText());
  
  onProgress?.({
    current: total,
    total,
    currentItem: 'Finalizing ZIP...',
    percentage: 100,
  });
  
  return await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * Generate summary text for the ZIP
 */
function generateSummaryText(options: BulkExportOptions, fileCount: number): string {
  const lines = [
    `${COMPANY_INFO.shortName} - Bulk Export Summary`,
    '='.repeat(50),
    '',
    `Generated: ${new Date().toLocaleString('en-NG')}`,
    `Total Files: ${fileCount}`,
    '',
    'Included Report Types:',
  ];
  
  if (options.includeTypes.taxCalculations) lines.push('  ✓ Tax Calculations');
  if (options.includeTypes.expenses) lines.push('  ✓ Expenses');
  if (options.includeTypes.invoices) lines.push('  ✓ Invoices');
  if (options.includeTypes.businessReports) lines.push('  ✓ Business Reports');
  
  lines.push('');
  lines.push(`Format: ${options.format === 'both' ? 'PDF + Excel' : options.format.toUpperCase()}`);
  
  if (options.businesses && options.businesses.length > 0) {
    lines.push('');
    lines.push('Businesses Included:');
    options.businesses.forEach(b => lines.push(`  - ${b.name}`));
  }
  
  if (options.dateRange) {
    lines.push('');
    lines.push(`Date Range: ${options.dateRange.start.toLocaleDateString()} - ${options.dateRange.end.toLocaleDateString()}`);
  }
  
  lines.push('');
  lines.push('='.repeat(50));
  lines.push(`${COMPANY_INFO.name}`);
  lines.push(COMPANY_INFO.website);
  
  return lines.join('\n');
}

/**
 * Generate README text for the ZIP
 */
function generateReadmeText(): string {
  return `${COMPANY_INFO.shortName} - Bulk Export
${'='.repeat(40)}

This archive contains financial reports generated by ${COMPANY_INFO.name}.

FOLDER STRUCTURE:
- Tax Calculations/  - Tax computation reports
- Expenses/          - Expense summaries and details
- Invoices/          - Invoice records
- Business Reports/  - Comprehensive business reports

FILE FORMATS:
- PDF files (.pdf)   - Print-ready documents
- Excel files (.xlsx) - Spreadsheets with formulas

IMPORTANT NOTES:
- All amounts are in Nigerian Naira (₦)
- VAT rate used: 7.5% (Standard rate)
- Tax calculations are estimates only
- Please consult a certified tax professional for official advice

SUPPORT:
Email: ${COMPANY_INFO.email}
Website: ${COMPANY_INFO.website}

© ${new Date().getFullYear()} ${COMPANY_INFO.name}
`;
}

/**
 * Download a ZIP blob
 */
export function downloadZip(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `taxforge-bulk-export-${formatDateForFilename()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get estimated file size label
 */
export function getEstimatedSize(options: BulkExportOptions): string {
  const itemCount = calculateTotalItems(options);
  // Rough estimates: PDF ~100KB, Excel ~50KB per report
  const avgSizeKB = options.format === 'both' ? 150 : (options.format === 'pdf' ? 100 : 50);
  const totalKB = itemCount * avgSizeKB;
  
  if (totalKB > 1024) {
    return `~${(totalKB / 1024).toFixed(1)} MB`;
  }
  return `~${totalKB} KB`;
}
