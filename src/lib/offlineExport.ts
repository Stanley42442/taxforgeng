/**
 * Offline Export utilities
 * Export cached data to CSV/PDF without network access
 */

import { getBusinesses, getExpenses, getPersonalExpenses, getCalculations } from './offlineStorage';
import { formatBytes } from './compression';

export interface ExportOptions {
  format: 'csv' | 'json';
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Convert data to CSV format
 */
const toCSV = (data: Record<string, unknown>[], columns?: string[]): string => {
  if (data.length === 0) return '';
  
  const headers = columns || Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or newline
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Download a file in the browser
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export businesses to CSV
 */
export const exportBusinessesToCSV = async (): Promise<void> => {
  const businesses = await getBusinesses<Record<string, unknown>>();
  const csv = toCSV(businesses, ['id', 'name', 'entity_type', 'turnover', 'sector', 'created_at']);
  downloadFile(csv, `businesses_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

/**
 * Export expenses to CSV
 */
export const exportExpensesToCSV = async (): Promise<void> => {
  const expenses = await getExpenses<Record<string, unknown>>();
  const csv = toCSV(expenses, ['id', 'category', 'amount', 'description', 'date', 'is_deductible']);
  downloadFile(csv, `expenses_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

/**
 * Export personal expenses to CSV
 */
export const exportPersonalExpensesToCSV = async (): Promise<void> => {
  const expenses = await getPersonalExpenses<Record<string, unknown>>();
  const csv = toCSV(expenses, ['id', 'category', 'amount', 'description', 'payment_interval', 'start_date']);
  downloadFile(csv, `personal_expenses_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

/**
 * Export calculations to JSON (too complex for CSV)
 */
export const exportCalculationsToJSON = async (): Promise<void> => {
  const calculations = await getCalculations<Record<string, unknown>>();
  const json = JSON.stringify(calculations, null, 2);
  downloadFile(json, `calculations_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
};

/**
 * Export all cached data
 */
export const exportAllCachedData = async (): Promise<void> => {
  const [businesses, expenses, personalExpenses, calculations] = await Promise.all([
    getBusinesses<Record<string, unknown>>(),
    getExpenses<Record<string, unknown>>(),
    getPersonalExpenses<Record<string, unknown>>(),
    getCalculations<Record<string, unknown>>(),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    data: {
      businesses,
      expenses,
      personalExpenses,
      calculations,
    },
    summary: {
      businessCount: businesses.length,
      expenseCount: expenses.length,
      personalExpenseCount: personalExpenses.length,
      calculationCount: calculations.length,
    },
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, `taxforge_export_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
};

/**
 * Get export summary for UI display
 */
export const getExportSummary = async (): Promise<{
  businesses: number;
  expenses: number;
  personalExpenses: number;
  calculations: number;
  totalRecords: number;
}> => {
  const [businesses, expenses, personalExpenses, calculations] = await Promise.all([
    getBusinesses<unknown[]>(),
    getExpenses<unknown[]>(),
    getPersonalExpenses<unknown[]>(),
    getCalculations<unknown[]>(),
  ]);

  return {
    businesses: businesses.length,
    expenses: expenses.length,
    personalExpenses: personalExpenses.length,
    calculations: calculations.length,
    totalRecords: businesses.length + expenses.length + personalExpenses.length + calculations.length,
  };
};
