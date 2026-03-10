import { jsPDF } from "jspdf";
import { IndividualTaxResult, IndividualTaxInputs, formatCurrency } from "./individualTaxCalculations";
import {
  BRAND_COLORS,
  STANDARD_DISCLAIMER,
  PDF_SETTINGS,
  formatNaira,
  formatNigerianDate,
  addPDFHeader,
  addPDFFooter,
  addPageNumbers,
  addSummaryBox,
  addWrappedTableHeader,
  addWrappedTableRow,
  addAlertBox,
  addSectionTitle,
  addAccentSectionHeader,
  checkPageBreak,
} from "./exportShared";

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
  const margin = PDF_SETTINGS.margin;
  const contentWidth = pageWidth - margin * 2;

  // Calculation type labels
  const calcTypeLabels: Record<string, string> = {
    pit: 'Personal Income Tax Report',
    crypto: 'Crypto/Digital Asset Tax Report',
    investment: 'Investment Income Tax Report',
    informal: 'Informal Sector Tax Report',
    foreign_income: 'Foreign Income Tax Report'
  };

  // === HEADER ===
  let y = addPDFHeader(doc, { badgeText: 'INDIVIDUAL TAX' });

  // Title
  doc.setTextColor(...BRAND_COLORS.text);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(calcTypeLabels[inputs.calculationType] || 'Individual Tax Report', margin, y);
  y += 10;

  // Meta info
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = formatNigerianDate(new Date().toISOString());
  doc.text(`Generated: ${dateStr}`, margin, y);
  doc.text(`Tax Rules: ${inputs.use2026Rules ? 'Nigeria Tax Act 2026' : 'Pre-2026 Rules'}`, pageWidth - margin, y, { align: 'right' });
  y += 12;

  // === SUMMARY BOX ===
  y = addSummaryBox(doc, {
    title: 'TOTAL TAX PAYABLE',
    mainValue: formatCurrency(result.taxPayable),
    subtitle: `Effective Tax Rate: ${result.effectiveRate.toFixed(2)}%`,
    y,
  });

  // === INPUT VALUES SECTION ===
  y = addAccentSectionHeader(doc, 'INPUT VALUES', y, 'green');

  doc.setFillColor(...BRAND_COLORS.lightBg);
  const inputItems: [string, string][] = [];

  if (inputs.calculationType === 'pit') {
    if (data.employmentIncome) inputItems.push(['Annual Gross Income', formatNaira(data.employmentIncome)]);
    if (data.rentPaid) inputItems.push(['Rent Paid', formatNaira(data.rentPaid)]);
    if (data.pensionContribution) inputItems.push(['Pension Contribution', formatNaira(data.pensionContribution)]);
    if (data.nhfContribution) inputItems.push(['NHF Contribution', formatNaira(data.nhfContribution)]);
    if (data.healthInsurance) inputItems.push(['Health Insurance', formatNaira(data.healthInsurance)]);
    if (data.lifeInsurance) inputItems.push(['Life Insurance Premium', formatNaira(data.lifeInsurance)]);
  } else if (inputs.calculationType === 'crypto') {
    if (data.cryptoIncome) inputItems.push(['Crypto Income', formatNaira(data.cryptoIncome)]);
    if (data.cryptoGains) inputItems.push(['Crypto Gains', formatNaira(data.cryptoGains)]);
    if (data.cryptoLosses) inputItems.push(['Crypto Losses', formatNaira(data.cryptoLosses)]);
  } else if (inputs.calculationType === 'investment') {
    if (data.dividendIncome) inputItems.push(['Dividend Income', formatNaira(data.dividendIncome)]);
    if (data.interestIncome) inputItems.push(['Interest Income', formatNaira(data.interestIncome)]);
    if (data.capitalGains) inputItems.push(['Capital Gains', formatNaira(data.capitalGains)]);
  } else if (inputs.calculationType === 'informal') {
    if (data.estimatedTurnover) inputItems.push(['Estimated Turnover', formatNaira(data.estimatedTurnover)]);
    if (data.location) inputItems.push(['Location', data.location.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())]);
  }

  if (inputItems.length > 0) {
    const inputBoxHeight = inputItems.length * 10 + 10;
    doc.roundedRect(margin, y, contentWidth, inputBoxHeight, 3, 3, 'F');

    let itemY = y + 10;
    doc.setTextColor(...BRAND_COLORS.text);
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

  // === PROGRESSIVE TAX BANDS TABLE (for PIT) ===
  if (inputs.calculationType === 'pit' && result.breakdown.some(b => b.label.includes('Band'))) {
    y = checkPageBreak(doc, y, 80, () => margin + 20);
    y = addAccentSectionHeader(doc, 'PROGRESSIVE TAX BANDS APPLIED', y, 'gold');
    
    const taxBands = inputs.use2026Rules ? [
      { band: 'First NGN 800,000', rate: '0%' },
      { band: 'Next NGN 2,200,000', rate: '15%' },
      { band: 'Next NGN 9,000,000', rate: '18%' },
      { band: 'Next NGN 13,000,000', rate: '21%' },
      { band: 'Next NGN 25,000,000', rate: '23%' },
      { band: 'Above NGN 50,000,000', rate: '25%' },
    ] : [
      { band: 'First NGN 300,000', rate: '7%' },
      { band: 'Next NGN 300,000', rate: '11%' },
      { band: 'Next NGN 500,000', rate: '15%' },
      { band: 'Next NGN 500,000', rate: '19%' },
      { band: 'Next NGN 1,600,000', rate: '21%' },
      { band: 'Above NGN 3,200,000', rate: '24%' },
    ];

    // Define column structure with explicit widths
    const bandCol = { x: margin, width: 70 };
    const rateCol = { x: margin + 70, width: 30 };
    const amountCol = { x: margin + 100, width: contentWidth - 100 };

    y = addWrappedTableHeader(doc, [
      { text: 'Income Band', x: bandCol.x, width: bandCol.width },
      { text: 'Rate', x: rateCol.x, width: rateCol.width, align: 'center' },
      { text: 'Tax Amount', x: amountCol.x, width: amountCol.width, align: 'right' },
    ], y);

    taxBands.forEach((band, index) => {
      const bandItem = result.breakdown.find(b => b.label.includes(band.rate.replace('%', '')));
      const taxAmount = bandItem ? formatCurrency(bandItem.amount) : formatNaira(0);
      
      y = addWrappedTableRow(doc, [
        { text: band.band, x: bandCol.x, width: bandCol.width },
        { text: band.rate, x: rateCol.x, width: rateCol.width, align: 'center' },
        { text: taxAmount, x: amountCol.x, width: amountCol.width, align: 'right' },
      ], y, index % 2 === 0);
    });

    y += 10;
  }

  // === RELIEFS SECTION ===
  if (result.reliefs && result.reliefs.length > 0) {
    y = checkPageBreak(doc, y, 100, () => margin + 20);
    y = addAccentSectionHeader(doc, 'TAX RELIEFS & ALLOWANCES', y, 'green');

    // Define column structure with explicit widths for proper text wrapping
    const reliefTypeCol = { x: margin, width: 50 };
    const descriptionCol = { x: margin + 50, width: 75 };  // Wider for descriptions
    const amountCol = { x: margin + 125, width: contentWidth - 125 };

    // Header row
    y = addWrappedTableHeader(doc, [
      { text: 'Relief Type', x: reliefTypeCol.x, width: reliefTypeCol.width },
      { text: 'Description', x: descriptionCol.x, width: descriptionCol.width },
      { text: 'Amount', x: amountCol.x, width: amountCol.width, align: 'right' },
    ], y);

    let totalReliefs = 0;
    result.reliefs.forEach((relief, index) => {
      y = checkPageBreak(doc, y, 25, () => margin + 20);  // Increased for wrapped rows
      
      // Use full description - wrapping will handle overflow
      y = addWrappedTableRow(doc, [
        { text: relief.name, x: reliefTypeCol.x, width: reliefTypeCol.width, bold: true },
        { text: relief.description, x: descriptionCol.x, width: descriptionCol.width, color: BRAND_COLORS.muted },
        { text: `(${formatNaira(relief.amount)})`, x: amountCol.x, width: amountCol.width, align: 'right', color: BRAND_COLORS.success },
      ], y, index % 2 === 0);
      
      totalReliefs += relief.amount;
    });

    // Total reliefs row
    doc.setFillColor(...BRAND_COLORS.lightGreen);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
    doc.setTextColor(...BRAND_COLORS.success);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Reliefs', margin + 5, y + 8);
    doc.text(`(${formatNaira(totalReliefs)})`, pageWidth - margin - 5, y + 8, { align: 'right' });
    y += 20;
  }

  // === TAX BREAKDOWN SECTION ===
  y = checkPageBreak(doc, y, 80, () => margin + 20);
  y = addAccentSectionHeader(doc, 'DETAILED TAX CALCULATION', y, 'green');

  // Define column structure with explicit widths
  const componentCol = { x: margin, width: contentWidth - 55 };
  const breakdownAmountCol = { x: margin + contentWidth - 55, width: 55 };

  // Header
  y = addWrappedTableHeader(doc, [
    { text: 'Component', x: componentCol.x, width: componentCol.width },
    { text: 'Amount', x: breakdownAmountCol.x, width: breakdownAmountCol.width, align: 'right' },
  ], y);

  // Define column structure for repeat headers
  const breakdownHeaderCols = [
    { text: 'Component', x: componentCol.x, width: componentCol.width },
    { text: 'Amount', x: breakdownAmountCol.x, width: breakdownAmountCol.width, align: 'right' as const },
  ];

  result.breakdown.forEach((item, index) => {
    y = checkPageBreak(doc, y, 25, () => {
      let newY = margin + 20;
      newY = addAccentSectionHeader(doc, 'DETAILED TAX CALCULATION (cont.)', newY, 'green');
      newY = addWrappedTableHeader(doc, breakdownHeaderCols, newY);
      return newY;
    });
    const isNegative = item.amount < 0;
    const amountStr = isNegative 
      ? `(${formatNaira(Math.abs(item.amount))})` 
      : formatNaira(item.amount);

    // Combine label and description for full context
    const fullText = item.description ? `${item.label}\n${item.description}` : item.label;

    y = addWrappedTableRow(doc, [
      { text: fullText, x: componentCol.x, width: componentCol.width },
      { text: amountStr, x: breakdownAmountCol.x, width: breakdownAmountCol.width, align: 'right', color: isNegative ? BRAND_COLORS.success : BRAND_COLORS.text },
    ], y, index % 2 === 0);
  });

  // Final total row
  y += 4;
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setTextColor(...BRAND_COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Tax Payable', margin + 5, y + 10);
  doc.text(formatCurrency(result.taxPayable), pageWidth - margin - 5, y + 10, { align: 'right' });
  y += 22;

  // === ALERTS & RECOMMENDATIONS ===
  if ((result.alerts && result.alerts.length > 0) || (result.recommendations && result.recommendations.length > 0)) {
    y = checkPageBreak(doc, y, 60, () => margin + 20);
    y = addAccentSectionHeader(doc, 'ALERTS & RECOMMENDATIONS', y, 'warning');

    // Alerts
    if (result.alerts && result.alerts.length > 0) {
      result.alerts.forEach(alert => {
        y = checkPageBreak(doc, y, 20, () => margin + 20);
        y = addAlertBox(doc, alert.message, alert.type as 'info' | 'warning' | 'success', y);
      });
    }

    // Recommendations — wrapped to prevent overflow
    if (result.recommendations && result.recommendations.length > 0) {
      result.recommendations.forEach(rec => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const wrappedRec = doc.splitTextToSize(`\u2022 ${rec}`, contentWidth - 10);
        y = checkPageBreak(doc, y, wrappedRec.length * 4 + 4, () => margin + 20);
        doc.setTextColor(...BRAND_COLORS.muted);
        wrappedRec.forEach((line: string) => {
          doc.text(line, margin + 5, y);
          y += 4;
        });
        y += 2;
      });
    }
  }

  // === FOOTER ===
  addPDFFooter(doc, {
    disclaimer: STANDARD_DISCLAIMER,
  });

  // Watermark
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

export const downloadIndividualTaxPDF = (data: ExportData, showWatermark = false) => {
  const doc = generateIndividualTaxPDF(data, showWatermark);
  const calcType = data.inputs.calculationType.replace(/_/g, '-');
  doc.save(`taxforge-ng-${calcType}-report.pdf`);
};
