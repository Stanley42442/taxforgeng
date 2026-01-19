/**
 * Offline Export utilities
 * Export cached data to CSV/PDF without network access
 */

import { getBusinesses, getExpenses, getPersonalExpenses, getCalculations } from './offlineStorage';
import {
  COMPANY_INFO,
  toCSV,
  addCSVHeader,
  downloadFile,
  generateFilename,
  formatTimestamp,
} from './exportShared';

export interface ExportOptions {
  format: 'csv' | 'json';
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Export businesses to CSV
 */
export const exportBusinessesToCSV = async (): Promise<void> => {
  const businesses = await getBusinesses<Record<string, unknown>>();
  
  const headerLines = addCSVHeader('Businesses Export');
  const dataCSV = toCSV(businesses, [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Business Name' },
    { key: 'entity_type', header: 'Entity Type' },
    { key: 'turnover', header: 'Turnover' },
    { key: 'sector', header: 'Sector' },
    { key: 'created_at', header: 'Created At' },
  ]);
  
  const csvContent = [...headerLines, dataCSV].join('\n');
  const filename = generateFilename('businesses', 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export expenses to CSV
 */
export const exportExpensesToCSV = async (): Promise<void> => {
  const expenses = await getExpenses<Record<string, unknown>>();
  
  const headerLines = addCSVHeader('Expenses Export');
  const dataCSV = toCSV(expenses, [
    { key: 'id', header: 'ID' },
    { key: 'category', header: 'Category' },
    { key: 'amount', header: 'Amount' },
    { key: 'description', header: 'Description' },
    { key: 'date', header: 'Date' },
    { key: 'is_deductible', header: 'Tax Deductible' },
  ]);
  
  const csvContent = [...headerLines, dataCSV].join('\n');
  const filename = generateFilename('expenses', 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export personal expenses to CSV
 */
export const exportPersonalExpensesToCSV = async (): Promise<void> => {
  const expenses = await getPersonalExpenses<Record<string, unknown>>();
  
  const headerLines = addCSVHeader('Personal Expenses Export');
  const dataCSV = toCSV(expenses, [
    { key: 'id', header: 'ID' },
    { key: 'category', header: 'Category' },
    { key: 'amount', header: 'Amount' },
    { key: 'description', header: 'Description' },
    { key: 'payment_interval', header: 'Payment Interval' },
    { key: 'start_date', header: 'Start Date' },
  ]);
  
  const csvContent = [...headerLines, dataCSV].join('\n');
  const filename = generateFilename('personal-expenses', 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export calculations to JSON (too complex for CSV)
 */
export const exportCalculationsToJSON = async (): Promise<void> => {
  const calculations = await getCalculations<Record<string, unknown>>();
  
  const exportData = {
    metadata: {
      source: COMPANY_INFO.shortName,
      exportedAt: formatTimestamp(),
      type: 'Tax Calculations',
      recordCount: calculations.length,
    },
    data: calculations,
  };
  
  const json = JSON.stringify(exportData, null, 2);
  const filename = generateFilename('calculations', 'json');
  downloadFile(json, filename, 'application/json');
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
    metadata: {
      source: COMPANY_INFO.shortName,
      version: '1.0',
      exportedAt: formatTimestamp(),
      website: COMPANY_INFO.website,
    },
    summary: {
      businessCount: businesses.length,
      expenseCount: expenses.length,
      personalExpenseCount: personalExpenses.length,
      calculationCount: calculations.length,
      totalRecords: businesses.length + expenses.length + personalExpenses.length + calculations.length,
    },
    data: {
      businesses,
      expenses,
      personalExpenses,
      calculations,
    },
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = generateFilename('full-export', 'json');
  downloadFile(json, filename, 'application/json');
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
