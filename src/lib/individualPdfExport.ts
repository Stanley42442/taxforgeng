import { jsPDF } from "jspdf";
import { IndividualTaxResult, IndividualTaxInputs, formatCurrency } from "./individualTaxCalculations";

interface ExportData {
  inputs: IndividualTaxInputs;
  result: IndividualTaxResult;
  // PIT-specific display values
  employmentIncome?: number;
  pensionContribution?: number;
  nhfContribution?: number;
  lifeInsurance?: number;
  healthInsurance?: number;
  rentPaid?: number;
  // Crypto display values
  cryptoIncome?: number;
  cryptoGains?: number;
  cryptoLosses?: number;
  // Investment display values
  dividendIncome?: number;
  interestIncome?: number;
  capitalGains?: number;
  // Informal display values
  estimatedTurnover?: number;
  location?: string;
}

const formatNumber = (n: number): string => n.toLocaleString('en-NG');

export const generateIndividualTaxPDF = (data: ExportData, showWatermark = false) => {
  const { inputs, result } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const primaryColor: [number, number, number] = [26, 79, 62];
  const accentColor: [number, number, number] = [212, 175, 55];
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [128, 128, 128];
  const lightBg: [number, number, number] = [248, 250, 248];
  const successColor: [number, number, number] = [34, 197, 94];

  const setColor = (color: [number, number, number]) => doc.setTextColor(...color);
  const setFillColor = (color: [number, number, number]) => doc.setFillColor(...color);

  // === HEADER ===
  setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 8, 'F');
  setFillColor(accentColor);
  doc.rect(0, 8, pageWidth, 2, 'F');

  y = 25;

  // Logo
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, 12, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('NT', margin + 6, y + 7.5, { align: 'center' });

  setColor(primaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TaxForge NG', margin + 16, y + 8);

  // Badge
  setFillColor(lightBg);
  doc.roundedRect(pageWidth - margin - 50, y, 50, 10, 2, 2, 'F');
  setColor(primaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('INDIVIDUAL TAX', pageWidth - margin - 25, y + 6.5, { align: 'center' });

  y += 20;

  // Title
  const calcTypeLabels: Record<string, string> = {
    pit: 'Personal Income Tax Report',
    crypto: 'Crypto/Digital Asset Tax Report',
    investment: 'Investment Income Tax Report',
    informal: 'Informal Sector Tax Report',
    foreign_income: 'Foreign Income Tax Report'
  };

  setColor(textColor);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(calcTypeLabels[inputs.calculationType] || 'Individual Tax Report', margin, y);
  y += 10;

  // Meta info
  setColor(mutedColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-NG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated: ${dateStr}`, margin, y);
  doc.text(`Tax Rules: ${inputs.use2026Rules ? 'Nigeria Tax Act 2026' : 'Pre-2026 Rules'}`, pageWidth - margin, y, { align: 'right' });
  y += 12;

  // === SUMMARY BOX ===
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, contentWidth, 50, 4, 4, 'F');
  setFillColor(accentColor);
  doc.roundedRect(margin + 3, y + 3, contentWidth - 6, 44, 3, 3, 'F');
  setFillColor(primaryColor);
  doc.roundedRect(margin + 4, y + 4, contentWidth - 8, 42, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL TAX PAYABLE', pageWidth / 2, y + 14, { align: 'center' });

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(result.taxPayable), pageWidth / 2, y + 32, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`Effective Tax Rate: ${result.effectiveRate.toFixed(2)}%`, pageWidth / 2, y + 44, { align: 'center' });

  y += 60;

  // === INPUT VALUES SECTION ===
  setColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Input Values', margin, y);
  y += 8;

  setFillColor(lightBg);
  const inputItems: [string, string][] = [];

  if (inputs.calculationType === 'pit') {
    if (data.employmentIncome) inputItems.push(['Annual Gross Income', `₦${formatNumber(data.employmentIncome)}`]);
    if (data.rentPaid) inputItems.push(['Rent Paid', `₦${formatNumber(data.rentPaid)}`]);
    if (data.pensionContribution) inputItems.push(['Pension Contribution', `₦${formatNumber(data.pensionContribution)}`]);
    if (data.nhfContribution) inputItems.push(['NHF Contribution', `₦${formatNumber(data.nhfContribution)}`]);
    if (data.healthInsurance) inputItems.push(['Health Insurance', `₦${formatNumber(data.healthInsurance)}`]);
    if (data.lifeInsurance) inputItems.push(['Life Insurance Premium', `₦${formatNumber(data.lifeInsurance)}`]);
  } else if (inputs.calculationType === 'crypto') {
    if (data.cryptoIncome) inputItems.push(['Crypto Income', `₦${formatNumber(data.cryptoIncome)}`]);
    if (data.cryptoGains) inputItems.push(['Crypto Gains', `₦${formatNumber(data.cryptoGains)}`]);
    if (data.cryptoLosses) inputItems.push(['Crypto Losses', `₦${formatNumber(data.cryptoLosses)}`]);
  } else if (inputs.calculationType === 'investment') {
    if (data.dividendIncome) inputItems.push(['Dividend Income', `₦${formatNumber(data.dividendIncome)}`]);
    if (data.interestIncome) inputItems.push(['Interest Income', `₦${formatNumber(data.interestIncome)}`]);
    if (data.capitalGains) inputItems.push(['Capital Gains', `₦${formatNumber(data.capitalGains)}`]);
  } else if (inputs.calculationType === 'informal') {
    if (data.estimatedTurnover) inputItems.push(['Estimated Turnover', `₦${formatNumber(data.estimatedTurnover)}`]);
    if (data.location) inputItems.push(['Location', data.location.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())]);
  }

  if (inputItems.length > 0) {
    const inputBoxHeight = inputItems.length * 10 + 10;
    doc.roundedRect(margin, y, contentWidth, inputBoxHeight, 3, 3, 'F');

    let itemY = y + 10;
    setColor(textColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    inputItems.forEach(([label, value]) => {
      doc.text(label, margin + 8, itemY);
      doc.setFont('helvetica', 'bold');
      doc.text(value, pageWidth - margin - 8, itemY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      itemY += 10;
    });

    y += inputBoxHeight + 10;
  } else {
    y += 5;
  }

  // === RELIEFS SECTION (if applicable) ===
  if (result.reliefs && result.reliefs.length > 0) {
    if (y > pageHeight - 100) {
      doc.addPage();
      y = 20;
    }

    setColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Tax Reliefs & Allowances', margin, y);
    y += 8;

    // Header row
    setFillColor(primaryColor);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Relief Type', margin + 5, y + 7);
    doc.text('Description', margin + 80, y + 7);
    doc.text('Amount', pageWidth - margin - 5, y + 7, { align: 'right' });
    y += 12;

    let totalReliefs = 0;
    result.reliefs.forEach((relief, index) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      if (index % 2 === 0) {
        setFillColor(lightBg);
        doc.rect(margin, y - 4, contentWidth, 12, 'F');
      }

      setColor(textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(relief.name, margin + 5, y + 3);
      
      doc.setFont('helvetica', 'normal');
      setColor(mutedColor);
      const descText = relief.description.length > 40 ? relief.description.substring(0, 40) + '...' : relief.description;
      doc.text(descText, margin + 80, y + 3);
      
      setColor(successColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`-₦${formatNumber(relief.amount)}`, pageWidth - margin - 5, y + 3, { align: 'right' });
      
      totalReliefs += relief.amount;
      y += 12;
    });

    // Total reliefs row
    setFillColor([240, 253, 244]);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
    setColor(successColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Reliefs', margin + 5, y + 8);
    doc.text(`-₦${formatNumber(totalReliefs)}`, pageWidth - margin - 5, y + 8, { align: 'right' });
    y += 20;
  }

  // === TAX BREAKDOWN SECTION ===
  if (y > pageHeight - 80) {
    doc.addPage();
    y = 20;
  }

  setColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Tax Calculation', margin, y);
  y += 8;

  // Header
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Component', margin + 5, y + 7);
  doc.text('Amount', pageWidth - margin - 5, y + 7, { align: 'right' });
  y += 12;

  result.breakdown.forEach((item, index) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 0) {
      setFillColor(lightBg);
      doc.rect(margin, y - 4, contentWidth, 14, 'F');
    }

    setColor(textColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 5, y + 2);

    const isNegative = item.amount < 0;
    const amountStr = isNegative 
      ? `(₦${formatNumber(Math.abs(item.amount))})` 
      : `₦${formatNumber(item.amount)}`;

    if (isNegative) {
      setColor(successColor);
    } else {
      setColor(textColor);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(amountStr, pageWidth - margin - 5, y + 2, { align: 'right' });

    if (item.description) {
      setColor(mutedColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(item.description, margin + 10, y + 9);
    }

    y += item.description ? 16 : 12;
  });

  // Final total row
  y += 4;
  setFillColor(primaryColor);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Tax Payable', margin + 5, y + 10);
  doc.text(formatCurrency(result.taxPayable), pageWidth - margin - 5, y + 10, { align: 'right' });
  y += 22;

  // === ALERTS & RECOMMENDATIONS ===
  if ((result.alerts && result.alerts.length > 0) || (result.recommendations && result.recommendations.length > 0)) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }

    setColor(primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Alerts & Recommendations', margin, y);
    y += 10;

    // Alerts
    if (result.alerts && result.alerts.length > 0) {
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

    // Recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      result.recommendations.forEach(rec => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }

        setColor(mutedColor);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${rec}`, margin + 5, y);
        y += 8;
      });
    }
  }

  // === FOOTER ===
  const footerY = pageHeight - 25;
  setFillColor(primaryColor);
  doc.rect(margin, footerY - 5, contentWidth, 0.5, 'F');

  setColor(mutedColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'DISCLAIMER: This report is for educational and planning purposes only. Tax calculations are estimates based on provided inputs.',
    pageWidth / 2, footerY + 2, { align: 'center' }
  );
  doc.text(
    'Please consult a certified tax professional for official advice. References: Nigeria Tax Act 2025, PITA.',
    pageWidth / 2, footerY + 7, { align: 'center' }
  );
  doc.text(
    `© ${new Date().getFullYear()} TaxForge NG | www.taxforgeng.com`,
    pageWidth / 2, footerY + 12, { align: 'center' }
  );

  // Watermark
  if (showWatermark) {
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

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setColor(mutedColor);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  return doc;
};

export const downloadIndividualTaxPDF = (data: ExportData, showWatermark = false) => {
  const doc = generateIndividualTaxPDF(data, showWatermark);
  const calcType = data.inputs.calculationType.replace(/_/g, '-');
  doc.save(`taxforge-ng-${calcType}-report.pdf`);
};
