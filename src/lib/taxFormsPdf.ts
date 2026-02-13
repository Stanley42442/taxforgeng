import { jsPDF } from "jspdf";
import {
  BRAND_COLORS,
  COMPANY_INFO,
  PDF_SETTINGS,
  formatNigerianDate,
  addPDFHeader,
  addPDFFooter,
  addPageNumbers,
  generateFilename,
} from "./exportShared";

interface BusinessInfo {
  name: string;
  entityType: string;
}

export const generateTaxFormPDF = (formType: string, business: BusinessInfo | null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_SETTINGS.margin;

  // Header with form type badge
  let y = addPDFHeader(doc, { badgeText: formType.toUpperCase() });

  // Title
  doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${COMPANY_INFO.shortName} — ${formType}`, margin, y);
  y += 12;

  // Business info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Business: ${business?.name ?? 'N/A'}`, margin, y);
  y += 8;
  doc.text(
    `Entity: ${business?.entityType === 'company' ? 'Limited Company' : 'Business Name'}`,
    margin,
    y
  );
  y += 15;

  // Generated date
  doc.setTextColor(BRAND_COLORS.muted[0], BRAND_COLORS.muted[1], BRAND_COLORS.muted[2]);
  doc.setFontSize(10);
  doc.text(`Generated: ${formatNigerianDate(new Date().toISOString())}`, margin, y);
  y += 20;

  // Form reference info box
  doc.setFillColor(BRAND_COLORS.lightBg[0], BRAND_COLORS.lightBg[1], BRAND_COLORS.lightBg[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 35, 3, 3, 'F');
  doc.setDrawColor(BRAND_COLORS.gold[0], BRAND_COLORS.gold[1], BRAND_COLORS.gold[2]);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 35, 3, 3, 'S');
  
  doc.setTextColor(BRAND_COLORS.nigerianGreen[0], BRAND_COLORS.nigerianGreen[1], BRAND_COLORS.nigerianGreen[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('NRS Form Reference', margin + 10, y + 12);
  
  doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const formRefs: Record<string, string> = {
    'CIT Return': 'Form CIT1 - Companies Income Tax Return',
    'VAT Return': 'Form VAT1 - Value Added Tax Return',
    'PIT Return': 'Form A - Personal Income Tax Return',
  };
  doc.text(formRefs[formType] || 'Tax Return Form', margin + 10, y + 22);
  doc.text('Submit via NRS TaxPro Max Portal: taxpromax.nrs.gov.ng', margin + 10, y + 30);
  
  y += 50;

  // Important notice
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'F');
  doc.setDrawColor(BRAND_COLORS.warning[0], BRAND_COLORS.warning[1], BRAND_COLORS.warning[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'S');
  
  doc.setTextColor(BRAND_COLORS.warning[0], BRAND_COLORS.warning[1], BRAND_COLORS.warning[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ IMPORTANT NOTE', margin + 10, y + 10);
  
  doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const notice = 'This is a prototype mock form for testing purposes. Live TaxPro Max/NRS submission is not enabled. Please use this form as a reference when filing through official NRS channels.';
  const lines = doc.splitTextToSize(notice, pageWidth - margin * 2 - 20);
  doc.text(lines, margin + 10, y + 18);

  // Footer
  addPDFFooter(doc, {
    disclaimer: 'This document is for reference only. Official filing must be done through NRS TaxPro Max.',
  });

  // Page numbers
  addPageNumbers(doc);

  const filename = generateFilename(formType.replace(/\s+/g, '-').toLowerCase(), 'pdf');
  doc.save(filename);
  
  return filename;
};
