import { jsPDF } from "jspdf";
import { formatCurrency, TaxResult, TaxInputs } from "./taxCalculations";
import { CACVerificationDetails } from "@/contexts/SubscriptionContext";
import {
  BRAND_COLORS,
  COMPANY_INFO,
  STANDARD_DISCLAIMER,
  PDF_SETTINGS,
  formatNigerianDate,
  addPDFHeader,
  addPDFFooter,
  addPageNumbers,
  addSummaryBox,
  addTableHeader,
  addTableRow,
  addAlertBox,
  addSectionTitle,
  addAccentSectionHeader,
  checkPageBreak,
} from "./exportShared";
import type { TableColumn } from "./exportShared";
import type { VerificationData, ValidationResult } from "@/types/verification";
import { VERIFICATION_SOURCES } from "@/types/verification";

export interface BusinessPDFData {
  name?: string;
  rcBnNumber?: string;
  verificationStatus?: 'verified' | 'not_verified' | 'pending' | 'manual';
  cacDetails?: CACVerificationDetails;
}

/**
 * Add verification badge to PDF
 * Shows "Accuracy Verified ✓" with gold border and passed checks count
 */
function addVerificationBadge(
  doc: jsPDF,
  y: number,
  verification: VerificationData | undefined,
  margin: number,
  contentWidth: number
): number {
  if (!verification) return y;

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Gold border box with light green fill
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(1);
  doc.setFillColor(240, 255, 240); // Light green
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'FD');

  // Checkmark icon
  doc.setTextColor(0, 128, 0); // Green
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('\u2713', margin + 8, y + 14);

  // Title text
  doc.setTextColor(0, 100, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Accuracy Verified', margin + 20, y + 12);

  // Subtitle
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Verified against Nigeria Tax Act 2025 (as of ${verification.timestamp}). Sources: PwC, KPMG, EY, NRS.`,
    margin + 20,
    y + 20
  );

  // Checks passed badge (right side)
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `${verification.checksPassed}/${verification.checksRun} Checks`,
    pageWidth - margin - 8,
    y + 14,
    { align: 'right' }
  );

  return y + 35;
}

/**
 * Add verification details section to PDF
 * Shows list of passed/failed checks with explanations
 */
function addVerificationDetails(
  doc: jsPDF,
  y: number,
  details: ValidationResult[],
  margin: number,
  contentWidth: number
): number {
  // Section title
  doc.setTextColor(0, 100, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Verification Details', margin, y);
  y += 8;

  // Details list
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const passedChecks = details.filter(d => d.passed);
  const maxToShow = Math.min(passedChecks.length, 6); // Show max 6 checks
  
  for (let i = 0; i < maxToShow; i++) {
    const check = passedChecks[i];
    doc.setTextColor(0, 128, 0); // Green
    doc.text('\u2713', margin + 4, y);
    doc.setTextColor(60, 60, 60);
    doc.text(check.ruleName, margin + 12, y);
    y += 6;
  }

  if (passedChecks.length > maxToShow) {
    doc.setTextColor(100, 100, 100);
    doc.text(`+ ${passedChecks.length - maxToShow} more checks passed`, margin + 12, y);
    y += 6;
  }

  return y + 5;
}

export const generateProfessionalPDF = (
  result: TaxResult,
  inputs: TaxInputs,
  showWatermark: boolean = false,
  businessData?: BusinessPDFData
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_SETTINGS.margin;
  const contentWidth = pageWidth - margin * 2;

  // === HEADER ===
  let y = addPDFHeader(doc, { badgeText: 'TAX REPORT' });

  // Report title
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Calculation Report', margin, y);
  y += 10;

  // Meta info line
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = formatNigerianDate(new Date().toISOString());
  doc.text(`Generated: ${dateStr}`, margin, y);
  // Map entity type for individual-friendly display
  const entityLabel = result.entityType === 'Limited Liability Company' 
    ? 'Individual / Sole Proprietorship (for planning purposes)'
    : result.entityType;
  doc.text(`Entity: ${entityLabel}`, pageWidth / 2, y);
  doc.text(`Rules: ${inputs.use2026Rules ? '2026 (New)' : 'Pre-2026'}`, pageWidth - margin, y, { align: 'right' });
  
  y += 8;

  // Business name and CAC info if provided
  if (businessData?.name) {
    doc.setTextColor(...BRAND_COLORS.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Business: ${businessData.name}`, margin, y);
    
    if (businessData.rcBnNumber) {
      doc.setFont('helvetica', 'normal');
      const verificationBadge = businessData.verificationStatus === 'verified' ? ' \u2713 CAC Verified' : '';
      doc.text(`${businessData.rcBnNumber}${verificationBadge}`, pageWidth / 2, y);
    }
    y += 8;
  }

  // CAC Verification Details Box (if verified)
  if (businessData?.verificationStatus === 'verified' && businessData.cacDetails) {
    doc.setFillColor(...BRAND_COLORS.lightGreen);
    doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'F');
    
    doc.setTextColor(...BRAND_COLORS.success);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('\u2713 CAC VERIFIED BUSINESS', margin + 5, y + 8);
    
    doc.setTextColor(...BRAND_COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Registered Name: ${businessData.cacDetails.companyName}`, margin + 5, y + 14);
    doc.text(`Status: ${businessData.cacDetails.status}`, margin + 100, y + 14);
    doc.text(`Registration Date: ${businessData.cacDetails.registrationDate}`, margin + 5, y + 20);
    doc.text(`Directors: ${businessData.cacDetails.directors.join(', ')}`, margin + 100, y + 20);
    
    y += 30;
  }

  // === VERIFICATION BADGE (if verification data available) ===
  if (result.verification) {
    y = addVerificationBadge(doc, y, result.verification, margin, contentWidth);
    
    // Add verification details if checks were run
    if (result.verification.details && result.verification.details.length > 0) {
      y = addVerificationDetails(doc, y, result.verification.details, margin, contentWidth);
    }
  }

  y += 5;

  // === SUMMARY BOX ===
  y = addSummaryBox(doc, {
    title: 'TOTAL TAX PAYABLE',
    mainValue: formatCurrency(result.totalTaxPayable),
    subtitle: `Effective Tax Rate: ${result.effectiveRate.toFixed(2)}%`,
    y,
  });

  // === TWO COLUMN LAYOUT ===
  const colWidth = (contentWidth - 10) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 10;

  // Left column - Income Summary
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(col1X, y, colWidth, 50, 3, 3, 'F');
  
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Income Summary', col1X + 8, y + 12);
  
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const incomeItems = [
    ['Gross Income', formatCurrency(result.grossIncome)],
    ['Allowable Expenses', formatCurrency(inputs.expenses)],
    ['Taxable Income', formatCurrency(result.taxableIncome)],
  ];
  
  let itemY = y + 22;
  incomeItems.forEach(([label, value]) => {
    doc.text(label, col1X + 8, itemY);
    doc.text(value, col1X + colWidth - 8, itemY, { align: 'right' });
    itemY += 8;
  });

  // Right column - Key Metrics
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(col2X, y, colWidth, 50, 3, 3, 'F');
  
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Metrics', col2X + 8, y + 12);
  
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const metricsItems = [
    ['Income Tax', formatCurrency(result.incomeTax)],
    ['VAT Payable', formatCurrency(result.vatPayable)],
    ['Development Levy', formatCurrency(result.developmentLevy)],
  ];
  
  itemY = y + 22;
  metricsItems.forEach(([label, value]) => {
    doc.text(label, col2X + 8, itemY);
    doc.text(value, col2X + colWidth - 8, itemY, { align: 'right' });
    itemY += 8;
  });

  y += 60;

  // === TAX BREAKDOWN TABLE ===
  y = addAccentSectionHeader(doc, 'Detailed Tax Breakdown', y, 'green');

  // Table header
  y = addTableHeader(doc, [
    { text: 'Description', x: margin + 5 },
    { text: 'Rate', x: margin + 120 },
    { text: 'Amount', x: pageWidth - margin - 5, align: 'right' },
  ], y);

  // Table rows
  const tableHeaderColumns: TableColumn[] = [
    { text: 'Description', x: margin + 5 },
    { text: 'Rate', x: margin + 120 },
    { text: 'Amount', x: pageWidth - margin - 5, align: 'right' },
  ];

  result.breakdown.forEach((item, index) => {
    y = checkPageBreak(doc, y, 15, () => {
      // Re-render table header on new page
      let newY = margin + 20;
      newY = addAccentSectionHeader(doc, 'Detailed Tax Breakdown (cont.)', newY, 'green');
      newY = addTableHeader(doc, tableHeaderColumns, newY);
      return newY;
    });
    const isNegative = item.amount < 0;
    const amountStr = isNegative 
      ? `(${formatCurrency(Math.abs(item.amount))})` 
      : formatCurrency(item.amount);
    
    y = addTableRow(doc, [
      { text: item.label, x: margin + 5 },
      { text: '', x: margin + 120 },
      { text: amountStr, x: pageWidth - margin - 5, align: 'right', color: isNegative ? BRAND_COLORS.success : BRAND_COLORS.text },
    ], y, index % 2 === 0);

    // Description if available
    if (item.description) {
      doc.setTextColor(...BRAND_COLORS.muted);
      doc.setFontSize(8);
      doc.text(item.description, margin + 10, y);
      y += 6;
    }
  });

  y += 10;

  // === SECTOR TAX RULES SECTION ===
  if (result.sectorId && result.sectorRules) {
    y = checkPageBreak(doc, y, 80, () => margin + 20);

    y = addAccentSectionHeader(doc, 'Sector Tax Rules Applied', y, 'gold');
    
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const sectorName = result.sectorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    doc.text(`Sector: ${sectorName}`, margin, y);
    y += 8;

    // Sector rules box
    doc.setFillColor(...BRAND_COLORS.lightGreen);
    const rules = result.sectorRules;
    const ruleItems: string[] = [];

    if (rules.citRate !== undefined) {
      ruleItems.push(`CIT Rate: ${rules.citRate}%${rules.citRate === 0 ? ' (Tax Exempt)' : ''}`);
    }
    if (rules.vatStatus) {
      const vatLabel = rules.vatStatus === 'exempt' ? 'VAT Exempt' : 
                       rules.vatStatus === 'zero' ? 'Zero-Rated' :
                       rules.vatStatus === 'reduced' ? `Reduced VAT (${rules.vatRate || 0}%)` : 'Standard VAT';
      ruleItems.push(`VAT Status: ${vatLabel}`);
    }
    if (rules.whtRate && rules.whtRate > 0) {
      ruleItems.push(`WHT Rate: ${rules.whtRate}%`);
    }
    if (rules.edtiRate && rules.edtiRate > 0) {
      ruleItems.push(`EDTI Credit: ${rules.edtiRate}%`);
    }
    if (rules.pioneerStatus) {
      ruleItems.push('EDI Tax Credit (replaces Pioneer Status): 5% annual credit for 5 years');
    }
    if (rules.greenHireDeduction && rules.greenHireDeduction > 0) {
      ruleItems.push(`Green Hire Deduction: ${rules.greenHireDeduction}%`);
    }

    const boxHeight = Math.max(20, ruleItems.length * 8 + 10);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'F');

    doc.setTextColor(...BRAND_COLORS.darkGreen);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    let ruleY = y + 8;
    const midPoint = Math.ceil(ruleItems.length / 2);
    
    ruleItems.forEach((rule, index) => {
      if (index < midPoint) {
        doc.text(`\u2713 ${rule}`, margin + 5, ruleY);
      } else {
        doc.text(`\u2713 ${rule}`, margin + contentWidth / 2, ruleY - (midPoint * 8));
      }
      if (index < midPoint - 1 || (index >= midPoint && index < ruleItems.length - 1)) {
        ruleY += 8;
      }
    });

    y += boxHeight + 10;
  }

  // === ALERTS SECTION ===
  if (result.alerts.length > 0 && y < pageHeight - 60) {
    y = addAccentSectionHeader(doc, 'Alerts & Recommendations', y, 'warning');

    result.alerts.forEach(alert => {
      y = checkPageBreak(doc, y, 20, () => margin + 20);
      y = addAlertBox(doc, alert.message, alert.type as 'info' | 'warning' | 'success', y);
    });
  }

  // === FOOTER ===
  addPDFFooter(doc, {
    disclaimer: STANDARD_DISCLAIMER,
  });

  // === WATERMARK (Free tier) ===
  if (showWatermark) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.saveGraphicsState();
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(40);
      doc.setFont('helvetica', 'bold');
      doc.text('SAMPLE - UPGRADE', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      });
      doc.restoreGraphicsState();
    }
  }

  // Page numbers
  addPageNumbers(doc);

  return doc;
};

export const downloadPDF = (
  result: TaxResult,
  inputs: TaxInputs,
  showWatermark: boolean = false,
  businessData?: BusinessPDFData
) => {
  const doc = generateProfessionalPDF(result, inputs, showWatermark, businessData);
  doc.save('taxforge-ng-tax-report.pdf');
};
