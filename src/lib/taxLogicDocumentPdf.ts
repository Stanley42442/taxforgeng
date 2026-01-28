/**
 * Tax Logic Reference Document PDF Generator
 * Comprehensive documentation of all tax calculation rules implemented in TaxForge NG
 */

import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import {
  BRAND_COLORS,
  COMPANY_INFO,
  STANDARD_DISCLAIMER,
  PDF_SETTINGS,
  formatNigerianDate,
} from './exportShared';
import logger from './logger';

// Generate QR code as base64 data URL
const generateQRCodeDataUrl = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url, {
      width: 100,
      margin: 1,
      color: {
        dark: '#008751',
        light: '#ffffff',
      },
    });
  } catch (error) {
    logger.error('Failed to generate QR code:', error);
    return '';
  }
};

export const generateTaxLogicDocumentPDF = async (): Promise<jsPDF> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_SETTINGS.margin;
  const contentWidth = pageWidth - margin * 2;
  let yPosition: number = margin;

  const addNewPageIfNeeded = (requiredSpace: number = 30) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
      addHeader();
    }
  };

  const addHeader = () => {
    doc.setFillColor(...BRAND_COLORS.nigerianGreen);
    doc.rect(0, 0, pageWidth, 8, 'F');
    doc.setFillColor(...BRAND_COLORS.gold);
    doc.rect(0, 8, pageWidth, 2, 'F');
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.text(
      `${COMPANY_INFO.shortName} - Operated by ${COMPANY_INFO.operatorShort} | Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `${COMPANY_INFO.email} | Educational tool only | Generated: ${formatNigerianDate(new Date().toISOString())}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  };

  const addSectionTitle = (title: string) => {
    addNewPageIfNeeded(25);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.nigerianGreen);
    doc.text(title, margin, yPosition);
    yPosition += 3;
    doc.setDrawColor(...BRAND_COLORS.nigerianGreen);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, margin + 80, yPosition);
    yPosition += 10;
  };

  const addSubsectionTitle = (title: string) => {
    addNewPageIfNeeded(15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.text);
    doc.text(title, margin, yPosition);
    yPosition += 7;
  };

  const addParagraph = (text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND_COLORS.muted);
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      addNewPageIfNeeded(6);
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 3;
  };

  const addBulletPoint = (text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND_COLORS.muted);
    addNewPageIfNeeded(6);
    doc.text('\u2022', margin + 2, yPosition);
    const lines = doc.splitTextToSize(text, contentWidth - 10);
    lines.forEach((line: string, index: number) => {
      if (index > 0) addNewPageIfNeeded(6);
      doc.text(line, margin + 8, yPosition);
      yPosition += 5;
    });
  };

  const addTable = (headers: string[], rows: string[][], colWidths: number[], headerBg: readonly [number, number, number] = BRAND_COLORS.nigerianGreen) => {
    addNewPageIfNeeded(20 + rows.length * 8);
    
    const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);
    let xPos = margin;

    // Header row
    doc.setFillColor(...headerBg);
    doc.rect(margin, yPosition, tableWidth, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.white);

    headers.forEach((header, i) => {
      doc.text(header, xPos + 2, yPosition + 5.5);
      xPos += colWidths[i];
    });
    yPosition += 8;

    // Data rows
    rows.forEach((row, rowIndex) => {
      addNewPageIfNeeded(10);
      
      if (rowIndex % 2 === 0) {
        doc.setFillColor(...BRAND_COLORS.lightBg);
      } else {
        doc.setFillColor(...BRAND_COLORS.white);
      }
      doc.rect(margin, yPosition, tableWidth, 8, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BRAND_COLORS.text);
      
      xPos = margin;
      row.forEach((cell, i) => {
        const truncated = cell.length > Math.floor(colWidths[i] / 2) ? cell.substring(0, Math.floor(colWidths[i] / 2) - 2) + '...' : cell;
        doc.text(truncated, xPos + 2, yPosition + 5.5);
        xPos += colWidths[i];
      });
      yPosition += 8;
    });

    // Table border
    doc.setDrawColor(...BRAND_COLORS.muted);
    doc.setLineWidth(0.3);
    const tableHeight = 8 + rows.length * 8;
    doc.rect(margin, yPosition - tableHeight, tableWidth, tableHeight);
    yPosition += 5;
  };

  // ========== COVER PAGE ==========
  addHeader();
  yPosition = 60;

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.text(COMPANY_INFO.shortName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.text);
  doc.text('Tax Logic Reference Document', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text('Comprehensive Documentation of Tax Calculation Rules', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  doc.text('Based on Nigeria Tax Act 2025 (Effective 2026)', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Version info box
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin, yPosition, contentWidth, 40, 3, 3, 'F');
  doc.setDrawColor(...BRAND_COLORS.gold);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition, contentWidth, 40, 3, 3, 'S');
  yPosition += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.text);
  doc.text('Document Version: 2.0', margin + 10, yPosition);
  doc.text(`Generated: ${formatNigerianDate(new Date().toISOString())}`, pageWidth / 2, yPosition);
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text('Tax Year: 2026 (with pre-2026 legacy rules included)', margin + 10, yPosition);
  doc.text('Jurisdiction: Federal Republic of Nigeria', pageWidth / 2, yPosition);
  yPosition += 8;
  doc.text('Regulatory Basis: Nigeria Tax Act 2025', margin + 10, yPosition);
  yPosition += 25;

  // QR Code
  const qrCodeDataUrl = await generateQRCodeDataUrl(COMPANY_INFO.liveUrl);
  if (qrCodeDataUrl) {
    const qrSize = 30;
    const qrX = (pageWidth - qrSize) / 2;
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, yPosition, qrSize, qrSize);
    yPosition += qrSize + 5;
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.text('Scan to access live calculator', pageWidth / 2, yPosition, { align: 'center' });
  }

  // ========== TABLE OF CONTENTS ==========
  doc.addPage();
  addHeader();
  yPosition = margin + 15;

  addSectionTitle('Table of Contents');

  const tocItems = [
    '1. Personal Income Tax (PIT)',
    '2. Reliefs and Deductions',
    '3. Company Income Tax (CIT)',
    '4. Value Added Tax (VAT)',
    '5. Withholding Tax (WHT)',
    '6. Capital Gains Tax (CGT)',
    '7. Crypto/Digital Asset Tax',
    '8. Payroll (PAYE) Calculations',
    '9. Informal/Presumptive Tax',
    '10. Sector-Specific Tax Rules',
    '11. Planned Refinements',
  ];

  tocItems.forEach((item) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND_COLORS.text);
    doc.text(item, margin + 5, yPosition);
    yPosition += 8;
  });

  // ========== SECTION 1: PERSONAL INCOME TAX ==========
  doc.addPage();
  addHeader();
  yPosition = margin + 15;

  addSectionTitle('1. Personal Income Tax (PIT)');

  addParagraph(
    'Personal Income Tax in Nigeria follows a progressive tax system where higher income attracts higher tax rates. ' +
    'The Nigeria Tax Act 2025 (effective from 2026) introduced significant changes including a tax-free threshold of \u20A6800,000.'
  );

  addSubsectionTitle('2026 Tax Bands (Nigeria Tax Act 2025)');
  addTable(
    ['Band', 'Income Threshold', 'Tax Rate'],
    [
      ['1', 'First \u20A6800,000', '0% (Exempt)'],
      ['2', '\u20A6800,001 - \u20A63,000,000', '15%'],
      ['3', '\u20A63,000,001 - \u20A612,000,000', '18%'],
      ['4', '\u20A612,000,001 - \u20A625,000,000', '21%'],
      ['5', '\u20A625,000,001 - \u20A650,000,000', '23%'],
      ['6', 'Above \u20A650,000,000', '25%'],
    ],
    [30, 70, 70]
  );

  addSubsectionTitle('Pre-2026 Tax Bands (Legacy Rules)');
  addTable(
    ['Band', 'Income Threshold', 'Tax Rate'],
    [
      ['1', 'First \u20A6300,000', '7%'],
      ['2', '\u20A6300,001 - \u20A6600,000', '11%'],
      ['3', '\u20A6600,001 - \u20A61,100,000', '15%'],
      ['4', '\u20A61,100,001 - \u20A61,600,000', '19%'],
      ['5', '\u20A61,600,001 - \u20A63,200,000', '21%'],
      ['6', 'Above \u20A63,200,000', '24%'],
    ],
    [30, 70, 70]
  );

  addParagraph(
    'Key Difference: The 2026 rules introduce an \u20A6800,000 tax-free threshold and cap the maximum rate at 25% (vs 24% pre-2026). ' +
    'The new bands are also significantly wider, reducing the tax burden for middle-income earners.'
  );

  // ========== SECTION 2: RELIEFS AND DEDUCTIONS ==========
  doc.addPage();
  addHeader();
  yPosition = margin + 15;

  addSectionTitle('2. Reliefs and Deductions');

  addSubsectionTitle('2026 Rules (CRA ABOLISHED)');
  addParagraph(
    'The Nigeria Tax Act 2025 abolished the Consolidated Relief Allowance (CRA) and replaced it with specific itemized deductions. ' +
    'This is a fundamental change from the previous blanket relief system.'
  );

  addTable(
    ['Deduction Type', 'Calculation', 'Maximum Cap'],
    [
      ['Rent Relief', '20% of actual rent paid', '\u20A6500,000 per annum'],
      ['Pension Contribution', 'Actual contribution', '8% of gross income'],
      ['NHF (National Housing Fund)', 'Actual contribution', '2.5% of basic salary'],
      ['NHIS (Health Insurance)', 'Actual premium paid', 'No cap'],
      ['Life Insurance Premium', 'Actual premium paid', 'No cap'],
      ['Gratuity Contribution', 'As per scheme rules', 'Per scheme limits'],
    ],
    [50, 60, 60]
  );

  addSubsectionTitle('Pre-2026 Rules (CRA System)');
  addTable(
    ['Deduction Type', 'Calculation'],
    [
      ['Consolidated Relief Allowance (CRA)', 'Higher of \u20A6200,000 or 1% of gross + 20% of gross income'],
      ['Pension Contribution', 'Up to 8% of gross income'],
      ['NHF', '2.5% of basic salary'],
      ['Life Insurance Premium', 'Actual premiums paid'],
    ],
    [60, 110]
  );

  addParagraph(
    'Important: Under 2026 rules, taxpayers must provide documentation for actual expenses to claim deductions. ' +
    'The automatic CRA calculation is no longer applicable.'
  );

  // ========== SECTION 3: COMPANY INCOME TAX ==========
  doc.addPage();
  addHeader();
  yPosition = margin + 15;

  addSectionTitle('3. Company Income Tax (CIT)');

  addSubsectionTitle('Small Company Definition (2026)');
  addParagraph(
    'A company qualifies as a "small company" and is exempt from CIT if it meets BOTH of the following criteria:'
  );
  addBulletPoint('Annual Turnover: \u2264 \u20A650,000,000 (Fifty Million Naira)');
  addBulletPoint('Fixed Assets: \u2264 \u20A6250,000,000 (Two Hundred Fifty Million Naira)');
  yPosition += 5;

  addSubsectionTitle('2026 CIT Rates');
  addTable(
    ['Company Type', 'CIT Rate', 'Development Levy'],
    [
      ['Small Company', '0%', '0%'],
      ['Large Company', '30%', '4%'],
    ],
    [60, 55, 55]
  );

  addSubsectionTitle('Pre-2026 CIT Rates');
  addTable(
    ['Company Type', 'CIT Rate', 'Education Levy'],
    [
      ['All Companies', '30%', '2%'],
    ],
    [60, 55, 55]
  );

  addParagraph(
    'The 2026 rules introduce the Development Levy (4%) replacing the Education Levy (2%) for large companies, ' +
    'while providing complete exemption for qualifying small companies.'
  );

  // ========== SECTION 4: VAT ==========
  addSectionTitle('4. Value Added Tax (VAT)');

  addSubsectionTitle('Standard VAT Parameters');
  addTable(
    ['Parameter', 'Value'],
    [
      ['Standard VAT Rate', '7.5%'],
      ['VAT Registration Threshold', '\u20A625,000,000 annual turnover'],
      ['Filing Frequency', 'Monthly (by 21st of following month)'],
    ],
    [80, 90]
  );

  addSubsectionTitle('Input VAT Recovery (2026 vs Pre-2026)');
  addTable(
    ['Period', 'Input VAT Recovery Rules'],
    [
      ['2026 onwards', 'Full recovery on services AND capital assets'],
      ['Pre-2026', 'Only goods purchases (services excluded)'],
    ],
    [50, 120]
  );

  addSubsectionTitle('Sector-Specific VAT Status');
  addTable(
    ['Sector', 'VAT Status', 'Notes'],
    [
      ['Agriculture', 'Zero-rated', 'Can reclaim input VAT'],
      ['Healthcare', 'Exempt', 'No VAT charged or claimed'],
      ['Education', 'Exempt', 'No VAT charged or claimed'],
      ['Exports', 'Zero-rated', 'Can reclaim input VAT'],
      ['Financial Services', 'Exempt', 'Most services exempt'],
    ],
    [45, 40, 85]
  );

  // ========== SECTION 5: WHT ==========
  doc.addPage();
  addHeader();
  yPosition = margin + 15;

  addSectionTitle('5. Withholding Tax (WHT)');

  addParagraph(
    'Withholding Tax is deducted at source on certain payments. The rates vary by income type and can be credited against final tax liability.'
  );

  addTable(
    ['Income Type', 'WHT Rate', 'Final or Credit'],
    [
      ['Rental Income', '10%', 'Credit against PIT/CIT'],
      ['Consultancy/Professional Fees', '10%', 'Credit against PIT/CIT'],
      ['Construction Contracts', '5%', 'Credit against CIT'],
      ['Dividends', '10%', 'Final (franked exempt)'],
      ['Interest', '10%', 'Final for most cases'],
      ['Directors Fees', '10%', 'Credit against PIT'],
    ],
    [60, 40, 70]
  );

  // ========== SECTION 6: CGT ==========
  addSectionTitle('6. Capital Gains Tax (CGT)');

  addSubsectionTitle('2026 CGT Rules - Individuals');
  addParagraph(
    'The 2026 rules introduce a small investor exemption and apply progressive PIT rates to capital gains for individuals:'
  );
  addBulletPoint('Small Investor Exemption: Gains \u2264 \u20A610,000,000 are exempt if total proceeds < \u20A6150,000,000');
  addBulletPoint('Above exemption: Progressive PIT rates (0-25%) apply to gains');
  yPosition += 3;

  addSubsectionTitle('2026 CGT Rules - Companies');
  addTable(
    ['Company Type', 'CGT Rate'],
    [
      ['Small Company (meets threshold)', '0%'],
      ['Large Company', '30%'],
    ],
    [85, 85]
  );

  addSubsectionTitle('Pre-2026 CGT Rules');
  addParagraph(
    'Prior to 2026, a flat 10% CGT rate applied to all entities regardless of size or gain amount.'
  );

  // ========== SECTION 7: CRYPTO TAX ==========
  doc.addPage();
  addHeader();
  yPosition = margin + 15;

  addSectionTitle('7. Crypto/Digital Asset Tax');

  addParagraph(
    'The Nigeria Tax Act 2025 provides specific guidance on cryptocurrency and digital asset taxation, treating them as property for tax purposes.'
  );

  addSubsectionTitle('Capital Gains on Crypto (2026)');
  addTable(
    ['Gain Threshold', 'Tax Rate'],
    [
      ['Gains \u2264 \u20A610,000,000', '0% (Exempt)'],
      ['\u20A610,000,001 - \u20A650,000,000', '10%'],
      ['\u20A650,000,001 - \u20A6150,000,000', '15%'],
      ['Above \u20A6150,000,000', '25%'],
    ],
    [85, 85]
  );

  addSubsectionTitle('Crypto Income Tax');
  addParagraph(
    'Income earned from cryptocurrency activities (mining, staking, airdrops, etc.) is treated as regular income and taxed using progressive PIT rates.'
  );

  addSubsectionTitle('Loss Carry-Forward');
  addBulletPoint('Crypto capital losses can be carried forward for 4 years');
  addBulletPoint('Losses can only offset crypto capital gains (not other income)');
  addBulletPoint('Detailed transaction records required for loss claims');

  // ========== SECTION 8: PAYROLL ==========
  addSectionTitle('8. Payroll (PAYE) Calculations');

  addSubsectionTitle('Monthly Calculation Flow');
  addParagraph('The PAYE calculation follows this sequence:');

  const payrollSteps = [
    '1. Calculate annual gross salary (monthly gross × 12)',
    '2. Apply Rent Relief (2026) or CRA (pre-2026)',
    '3. Deduct employee pension contribution (8% of gross)',
    '4. Deduct NHF (2.5% of basic salary, if applicable)',
    '5. Deduct NHIS contributions (if applicable)',
    '6. Calculate taxable income (gross - all deductions)',
    '7. Apply progressive PIT bands to annual taxable income',
    '8. Divide annual PAYE by 12 for monthly deduction',
  ];
  payrollSteps.forEach(step => addBulletPoint(step));
  yPosition += 5;

  addSubsectionTitle('Employer Contributions');
  addTable(
    ['Contribution Type', 'Rate', 'Notes'],
    [
      ['Employer Pension', '10% of gross', 'Paid to PFA'],
      ['Total Pension (Combined)', '18%', '8% employee + 10% employer'],
      ['ITF (Industrial Training Fund)', '1% of payroll', 'For companies with 5+ staff'],
      ['NSITF (Employee Compensation)', '1% of payroll', 'Mandatory social insurance'],
    ],
    [55, 40, 75]
  );

  // ========== SECTION 9: INFORMAL TAX ==========
  doc.addPage();
  addHeader();
  yPosition = margin + 15;

  addSectionTitle('9. Informal/Presumptive Tax');

  addParagraph(
    'The presumptive tax system provides simplified taxation for informal sector businesses based on estimated turnover and location.'
  );

  addTable(
    ['Location', 'Minimum Tax', 'Maximum Tax'],
    [
      ['Lagos', '\u20A620,000', '\u20A650,000'],
      ['Abuja (FCT)', '\u20A615,000', '\u20A640,000'],
      ['Port Harcourt', '\u20A612,000', '\u20A635,000'],
      ['Kano', '\u20A68,000', '\u20A625,000'],
      ['Other Urban Areas', '\u20A65,000', '\u20A620,000'],
      ['Rural Areas', '\u20A65,000', '\u20A610,000'],
    ],
    [60, 55, 55]
  );

  addParagraph(
    'Note: Businesses with turnover exceeding \u20A625,000,000 should register for VAT and use the standard tax system.'
  );

  // ========== SECTION 10: SECTOR RULES ==========
  addSectionTitle('10. Sector-Specific Tax Rules');

  addParagraph(
    'TaxForge NG implements sector-specific tax rules for 15+ industries with special incentives and rates:'
  );

  addTable(
    ['Sector', 'CIT Rate', 'VAT Status', 'Special Incentives'],
    [
      ['Technology/NSA', '0%', 'Standard', 'EDTI 5%, R&D 120% deduction'],
      ['Agriculture', '0%', 'Zero-rated', '5-year CIT holiday'],
      ['Manufacturing', '30%', 'Standard', '10% investment credit'],
      ['Healthcare', '30%', 'Exempt', 'Pioneer status eligible'],
      ['Oil & Gas', '30% + HT', 'Standard', '15-30% Hydrocarbon Tax'],
      ['Free Zone', '0%', 'Zero-rated', 'No WHT on dividends'],
      ['Renewables', '30%', 'Zero-rated', '5% EDTI, green hire 50%'],
      ['Real Estate', '30%', 'Standard', 'CGT exemptions available'],
    ],
    [40, 25, 35, 70]
  );

  // ========== SECTION 11: PLANNED REFINEMENTS ==========
  doc.addPage();
  addHeader();
  yPosition = margin + 15;

  addSectionTitle('11. Planned Refinements');

  addParagraph(
    'This section documents areas identified for future improvement in TaxForge NG\'s tax calculation logic:'
  );

  const refinements = [
    {
      title: 'NHIS Contribution Caps',
      current: 'No cap implemented',
      planned: 'Research and implement official NHIS cap if any exists in regulations',
    },
    {
      title: 'Gratuity Scheme Integration',
      current: 'Not fully implemented as a separate deduction field',
      planned: 'Add dedicated gratuity contribution input with scheme-specific rules',
    },
    {
      title: 'Dual Tax Treaty Rates',
      current: 'Basic implementation for common treaties',
      planned: 'Expand to cover all 15+ Nigerian tax treaties with country-specific rates',
    },
    {
      title: 'State Tax Variations',
      current: 'Federal rates only',
      planned: 'Add state-specific variations where applicable (e.g., Lagos State)',
    },
    {
      title: 'PFA Integration',
      current: 'Manual pension input',
      planned: 'Direct Pension Fund Administrator data integration for verification',
    },
    {
      title: 'Real-Time FIRS Updates',
      current: 'Manually updated rates',
      planned: 'API integration for automatic rate updates from FIRS',
    },
    {
      title: 'Advanced Loss Carry-Forward',
      current: '4-year carry-forward for crypto losses only',
      planned: 'Extend to all capital losses and business losses with proper tracking',
    },
    {
      title: 'Tax Credit Verification',
      current: 'Self-reported WHT credits',
      planned: 'Integration with FIRS for automatic WHT credit verification',
    },
    {
      title: 'Multi-Currency Support',
      current: 'Naira only',
      planned: 'Support for USD, GBP, EUR with automatic conversion using CBN rates',
    },
    {
      title: 'Tax Treaty Benefits Calculator',
      current: 'Basic treaty awareness',
      planned: 'Full treaty benefit calculator with eligibility assessment',
    },
  ];

  refinements.forEach((item) => {
    addNewPageIfNeeded(25);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.nigerianGreen);
    doc.text(`\u2022 ${item.title}`, margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.text(`Current: ${item.current}`, margin + 5, yPosition);
    yPosition += 5;
    doc.setTextColor(...BRAND_COLORS.text);
    doc.text(`Planned: ${item.planned}`, margin + 5, yPosition);
    yPosition += 8;
  });

  // ========== DISCLAIMER PAGE ==========
  doc.addPage();
  addHeader();
  yPosition = margin + 15;

  addSectionTitle('Disclaimer & Legal Notice');

  doc.setFillColor(...BRAND_COLORS.warningBg);
  doc.roundedRect(margin, yPosition, contentWidth, 60, 3, 3, 'F');
  doc.setDrawColor(...BRAND_COLORS.warning);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition, contentWidth, 60, 3, 3, 'S');
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.warning);
  doc.text('IMPORTANT DISCLAIMER', margin + 5, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.text);
  const disclaimerLines = doc.splitTextToSize(
    STANDARD_DISCLAIMER,
    contentWidth - 10
  );
  disclaimerLines.forEach((line: string) => {
    doc.text(line, margin + 5, yPosition);
    yPosition += 5;
  });

  yPosition += 20;

  // Contact info
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin, yPosition, contentWidth, 45, 3, 3, 'F');
  doc.setDrawColor(...BRAND_COLORS.gold);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition, contentWidth, 45, 3, 3, 'S');
  yPosition += 12;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.text);
  doc.text('Contact & Resources', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text(`Website: ${COMPANY_INFO.website}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text(`Email: ${COMPANY_INFO.email}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text(`Operated by: ${COMPANY_INFO.operator}`, pageWidth / 2, yPosition, { align: 'center' });

  // ========== ADD FOOTERS TO ALL PAGES ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  return doc;
};

export const downloadTaxLogicDocumentPDF = async (): Promise<void> => {
  const doc = await generateTaxLogicDocumentPDF();
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`taxforge-ng-tax-logic-reference-v2.0-${dateStr}.pdf`);
};
