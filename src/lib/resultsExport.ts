import { TaxResult, TaxInputs } from "./taxCalculations";
import {
  addCSVHeader,
  escapeCSVValue,
  downloadFile,
  generateFilename,
} from "./exportShared";

export const exportResultsToCSV = (result: TaxResult, inputs: TaxInputs) => {
  const headerLines = addCSVHeader('Tax Calculation Report');
  
  const rows = [
    ['Entity Type', escapeCSVValue(result.entityType)],
    ['Tax Rules', escapeCSVValue(inputs.use2026Rules ? '2026 (New Rules)' : 'Pre-2026 (Current)')],
    [],
    ['=== INCOME SUMMARY ==='],
    ['Gross Income', escapeCSVValue(result.grossIncome)],
    ['Taxable Income', escapeCSVValue(result.taxableIncome)],
    [],
    ['=== TAX BREAKDOWN ==='],
    ...result.breakdown.map(item => [escapeCSVValue(item.label), escapeCSVValue(item.amount)]),
    [],
    ['=== SUMMARY ==='],
    ['Total Tax Payable', escapeCSVValue(result.totalTaxPayable)],
    ['Effective Rate', escapeCSVValue(`${result.effectiveRate.toFixed(2)}%`)],
  ];

  const csvContent = [
    ...headerLines,
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const filename = generateFilename('tax-calculation', 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  
  return filename;
};
