import { jsPDF } from "jspdf";
import { formatCurrency, TaxResult, TaxInputs } from "./taxCalculations";
import { CACVerificationDetails } from "@/contexts/SubscriptionContext";

export interface BusinessPDFData {
  name?: string;
  rcBnNumber?: string;
  verificationStatus?: 'verified' | 'not_verified' | 'pending' | 'manual';
  cacDetails?: CACVerificationDetails;
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
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const primaryColor: [number, number, number] = [26, 79, 62]; // Deep forest green
  const accentColor: [number, number, number] = [212, 175, 55]; // Gold
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [128, 128, 128];
  const lightBg: [number, number, number] = [248, 250, 248];

  // Helper functions
  const setColor = (color: [number, number, number]) => doc.setTextColor(...color);
  const setFillColor = (color: [number, number, number]) => doc.setFillColor(...color);

  // === HEADER SECTION ===
  // Top accent bar
  setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  // Gold accent line
  setFillColor(accentColor);
  doc.rect(0, 8, pageWidth, 2, 'F');

  y = 25;

  // Logo area
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, 12, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('NT', margin + 6, y + 7.5, { align: 'center' });

  // Company name
  setColor(primaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TaxForge NG', margin + 16, y + 8);

  // Report badge
  setFillColor(lightBg);
  doc.roundedRect(pageWidth - margin - 40, y, 40, 10, 2, 2, 'F');
  setColor(primaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TAX REPORT', pageWidth - margin - 20, y + 6.5, { align: 'center' });

  y += 20;

  // Report title
  setColor(textColor);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Calculation Report', margin, y);
  y += 10;

  // Date and entity info line
  setColor(mutedColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-NG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated: ${dateStr}`, margin, y);
  doc.text(`Entity: ${result.entityType}`, pageWidth / 2, y);
  doc.text(`Rules: ${inputs.use2026Rules ? '2026 (New)' : 'Pre-2026'}`, pageWidth - margin, y, { align: 'right' });
  
  y += 8;

  // Business name and CAC info if provided
  if (businessData?.name) {
    setColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Business: ${businessData.name}`, margin, y);
    
    if (businessData.rcBnNumber) {
      doc.setFont('helvetica', 'normal');
      const verificationBadge = businessData.verificationStatus === 'verified' ? ' ✓ CAC Verified' : '';
      doc.text(`${businessData.rcBnNumber}${verificationBadge}`, pageWidth / 2, y);
    }
    y += 8;
  }

  // CAC Verification Details Box (if verified)
  if (businessData?.verificationStatus === 'verified' && businessData.cacDetails) {
    setFillColor([240, 253, 244]); // Light green
    doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'F');
    
    setColor([34, 197, 94]); // Green
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ CAC VERIFIED BUSINESS', margin + 5, y + 8);
    
    setColor(textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Registered Name: ${businessData.cacDetails.companyName}`, margin + 5, y + 14);
    doc.text(`Status: ${businessData.cacDetails.status}`, margin + 100, y + 14);
    doc.text(`Registration Date: ${businessData.cacDetails.registrationDate}`, margin + 5, y + 20);
    doc.text(`Directors: ${businessData.cacDetails.directors.join(', ')}`, margin + 100, y + 20);
    
    y += 30;
  }

  y += 5;

  // === SUMMARY BOX ===
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, contentWidth, 45, 4, 4, 'F');
  
  // Inner highlight
  setFillColor(accentColor);
  doc.roundedRect(margin + 3, y + 3, contentWidth - 6, 39, 3, 3, 'F');
  setFillColor(primaryColor);
  doc.roundedRect(margin + 4, y + 4, contentWidth - 8, 37, 2, 2, 'F');

  // Summary content
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL TAX PAYABLE', pageWidth / 2, y + 14, { align: 'center' });
  
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(result.totalTaxPayable), pageWidth / 2, y + 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`Effective Tax Rate: ${result.effectiveRate.toFixed(2)}%`, pageWidth / 2, y + 40, { align: 'center' });

  y += 55;

  // === TWO COLUMN LAYOUT ===
  const colWidth = (contentWidth - 10) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 10;

  // Left column - Income Summary
  setFillColor(lightBg);
  doc.roundedRect(col1X, y, colWidth, 50, 3, 3, 'F');
  
  setColor(primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Income Summary', col1X + 8, y + 12);
  
  setColor(textColor);
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
  setFillColor(lightBg);
  doc.roundedRect(col2X, y, colWidth, 50, 3, 3, 'F');
  
  setColor(primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Metrics', col2X + 8, y + 12);
  
  setColor(textColor);
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
  setColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Tax Breakdown', margin, y);
  y += 8;

  // Table header
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 5, y + 7);
  doc.text('Amount', pageWidth - margin - 5, y + 7, { align: 'right' });
  y += 12;

  // Table rows
  setColor(textColor);
  doc.setFont('helvetica', 'normal');
  
  result.breakdown.forEach((item, index) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
    
    // Alternate row background
    if (index % 2 === 0) {
      setFillColor(lightBg);
      doc.rect(margin, y - 4, contentWidth, 10, 'F');
    }
    
    setColor(textColor);
    doc.setFontSize(9);
    doc.text(item.label, margin + 5, y + 2);
    
    const amountStr = item.amount < 0 
      ? `(${formatCurrency(Math.abs(item.amount))})` 
      : formatCurrency(item.amount);
    
    if (item.amount < 0) {
      setColor([46, 125, 50]); // Green for credits
    }
    doc.text(amountStr, pageWidth - margin - 5, y + 2, { align: 'right' });
    
    y += 10;

    // Description if available
    if (item.description) {
      setColor(mutedColor);
      doc.setFontSize(8);
      doc.text(item.description, margin + 10, y);
      y += 6;
    }
  });

  y += 10;

  // === SECTOR TAX RULES SECTION ===
  if (result.sectorId && result.sectorRules) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 20;
    }

    setColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Sector Tax Rules Applied', margin, y);
    y += 4;
    
    setColor(mutedColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const sectorName = result.sectorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    doc.text(`Sector: ${sectorName}`, margin, y + 6);
    y += 12;

    // Sector rules box
    setFillColor([240, 253, 244]); // Light green background
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
    if (rules.hydrocarbonTaxMin || rules.hydrocarbonTaxMax) {
      ruleItems.push(`Hydrocarbon Tax: ${rules.hydrocarbonTaxMin}% - ${rules.hydrocarbonTaxMax}%`);
    }
    if (rules.presumptiveMin || rules.presumptiveMax) {
      ruleItems.push(`Presumptive Tax: ${rules.presumptiveMin}% - ${rules.presumptiveMax}%`);
    }
    if (rules.pioneerStatus) {
      ruleItems.push('Pioneer Status: Tax Holiday Eligible');
    }
    if (rules.greenHireDeduction && rules.greenHireDeduction > 0) {
      ruleItems.push(`Green Hire Deduction: ${rules.greenHireDeduction}%`);
    }

    const boxHeight = Math.max(20, ruleItems.length * 8 + 10);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'F');

    setColor([34, 127, 94]); // Green text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    let ruleY = y + 8;
    const midPoint = Math.ceil(ruleItems.length / 2);
    
    ruleItems.forEach((rule, index) => {
      if (index < midPoint) {
        doc.text(`✓ ${rule}`, margin + 5, ruleY);
      } else {
        doc.text(`✓ ${rule}`, margin + contentWidth / 2, ruleY - (midPoint * 8));
      }
      if (index < midPoint - 1 || (index >= midPoint && index < ruleItems.length - 1)) {
        ruleY += 8;
      }
    });

    y += boxHeight + 10;
  }

  // === ALERTS SECTION ===
  if (result.alerts.length > 0 && y < pageHeight - 60) {
    setColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Alerts & Recommendations', margin, y);
    y += 8;

    result.alerts.forEach(alert => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }

      const alertColors: Record<string, [number, number, number]> = {
        info: [59, 130, 246],
        warning: [245, 158, 11],
        success: [34, 197, 94],
      };
      
      const bgColors: Record<string, [number, number, number]> = {
        info: [239, 246, 255],
        warning: [255, 251, 235],
        success: [240, 253, 244],
      };

      setFillColor(bgColors[alert.type] || bgColors.info);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
      
      setColor(alertColors[alert.type] || alertColors.info);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      const icon = alert.type === 'warning' ? '⚠' : alert.type === 'success' ? '✓' : 'ℹ';
      doc.text(`${icon} ${alert.message}`, margin + 5, y + 8);
      y += 16;
    });
  }

  // === FOOTER ===
  const footerY = pageHeight - 25;
  
  // Footer line
  setFillColor(primaryColor);
  doc.rect(margin, footerY - 5, contentWidth, 0.5, 'F');

  // Disclaimer
  setColor(mutedColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'DISCLAIMER: This report is for educational and planning purposes only. Tax calculations are estimates based on provided inputs.',
    pageWidth / 2, footerY + 2, { align: 'center' }
  );
  doc.text(
    'Please consult a certified tax professional for official advice. References: Nigeria Tax Act 2025, CAMA 2020.',
    pageWidth / 2, footerY + 7, { align: 'center' }
  );
  doc.text(
    `© ${new Date().getFullYear()} TaxForge NG | www.taxforge.ng`,
    pageWidth / 2, footerY + 12, { align: 'center' }
  );

  // === WATERMARK (Free tier) ===
  if (showWatermark) {
    doc.saveGraphicsState();
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    
    // Add diagonal watermark text
    const text = 'SAMPLE - UPGRADE';
    doc.text(text, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    doc.restoreGraphicsState();
  }

  // Page number
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setColor(mutedColor);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

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
