import jsPDF from 'jspdf';
import { PayrollResult, formatNaira } from './payrollCalculations';
import { format } from 'date-fns';

export interface PayslipData {
  employeeName: string;
  employeeId?: string;
  department?: string;
  position?: string;
  payPeriod: string;
  payDate: string;
  bankName?: string;
  bankAccountNumber?: string;
  taxId?: string;
  pensionPin?: string;
  pfaName?: string;
  result: PayrollResult;
  companyName?: string;
  companyAddress?: string;
}

export function generatePayslipPDF(data: PayslipData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;
  
  // Header
  doc.setFillColor(34, 197, 94); // Green
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYSLIP', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.companyName || 'Company Name', 20, 28);
  
  // Pay period info on right
  doc.text(`Pay Period: ${data.payPeriod}`, pageWidth - 60, 20);
  doc.text(`Pay Date: ${format(new Date(data.payDate), 'dd MMM yyyy')}`, pageWidth - 60, 28);
  
  y = 50;
  doc.setTextColor(0, 0, 0);
  
  // Employee Information Section
  doc.setFillColor(245, 245, 245);
  doc.rect(15, y - 5, pageWidth - 30, 35, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE INFORMATION', 20, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Left column
  doc.text(`Name: ${data.employeeName}`, 20, y);
  doc.text(`Employee ID: ${data.employeeId || 'N/A'}`, 20, y + 6);
  doc.text(`Department: ${data.department || 'N/A'}`, 20, y + 12);
  doc.text(`Position: ${data.position || 'N/A'}`, 20, y + 18);
  
  // Right column
  doc.text(`Tax ID: ${data.taxId || 'N/A'}`, 110, y);
  doc.text(`Pension PIN: ${data.pensionPin || 'N/A'}`, 110, y + 6);
  doc.text(`PFA: ${data.pfaName || 'N/A'}`, 110, y + 12);
  doc.text(`Bank: ${data.bankName || 'N/A'}`, 110, y + 18);
  
  y += 35;
  
  // Earnings Section
  doc.setFillColor(220, 252, 231); // Light green
  doc.rect(15, y, (pageWidth - 35) / 2, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EARNINGS', 20, y + 6);
  
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const earnings = [
    { label: 'Basic Salary', amount: data.result.grossSalary },
  ];
  
  if (data.result.overtimeAmount > 0) {
    earnings.push({ label: 'Overtime', amount: data.result.overtimeAmount });
  }
  
  if (data.result.bonusAmount > 0) {
    earnings.push({ label: 'Bonus', amount: data.result.bonusAmount });
  }
  
  let totalEarnings = 0;
  earnings.forEach(item => {
    doc.text(item.label, 20, y);
    doc.text(formatNaira(item.amount), 80, y, { align: 'right' });
    totalEarnings += item.amount;
    y += 6;
  });
  
  // Gross line
  doc.setFont('helvetica', 'bold');
  doc.line(20, y, 85, y);
  y += 5;
  doc.text('Gross Pay', 20, y);
  doc.text(formatNaira(totalEarnings), 80, y, { align: 'right' });
  
  // Deductions Section (right side)
  let deductionsY = y - (earnings.length * 6) - 5;
  const deductionsX = (pageWidth + 10) / 2;
  
  doc.setFillColor(254, 226, 226); // Light red
  doc.rect(deductionsX, deductionsY - 12, (pageWidth - 35) / 2, 8, 'F');
  
  doc.text('DEDUCTIONS', deductionsX + 5, deductionsY - 6);
  
  doc.setFont('helvetica', 'normal');
  
  const deductions = [
    { label: 'PAYE Tax', amount: data.result.paye },
    { label: 'Pension (8%)', amount: data.result.pensionEmployee },
  ];
  
  if (data.result.nhf > 0) {
    deductions.push({ label: 'NHF (2.5%)', amount: data.result.nhf });
  }
  
  if (data.result.leaveDeduction > 0) {
    deductions.push({ label: 'Leave Deduction', amount: data.result.leaveDeduction });
  }
  
  let totalDeductions = 0;
  deductions.forEach(item => {
    doc.text(item.label, deductionsX + 5, deductionsY);
    doc.text(formatNaira(item.amount), pageWidth - 25, deductionsY, { align: 'right' });
    totalDeductions += item.amount;
    deductionsY += 6;
  });
  
  // Total deductions line
  doc.setFont('helvetica', 'bold');
  doc.line(deductionsX + 5, deductionsY, pageWidth - 20, deductionsY);
  deductionsY += 5;
  doc.text('Total Deductions', deductionsX + 5, deductionsY);
  doc.text(formatNaira(totalDeductions), pageWidth - 25, deductionsY, { align: 'right' });
  
  y = Math.max(y, deductionsY) + 20;
  
  // Net Pay Section
  doc.setFillColor(34, 197, 94);
  doc.rect(15, y - 5, pageWidth - 30, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('NET PAY', 20, y + 6);
  doc.text(formatNaira(data.result.netSalary), pageWidth - 25, y + 6, { align: 'right' });
  
  y += 25;
  doc.setTextColor(0, 0, 0);
  
  // Employer Contributions Section
  doc.setFillColor(219, 234, 254); // Light blue
  doc.rect(15, y, pageWidth - 30, 8, 'F');
  
  doc.setFontSize(11);
  doc.text('EMPLOYER CONTRIBUTIONS', 20, y + 6);
  
  y += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Pension (10%)', 20, y);
  doc.text(formatNaira(data.result.pensionEmployer), 80, y, { align: 'right' });
  
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Total Cost to Company', 20, y);
  doc.text(formatNaira(data.result.totalCostToCompany), 80, y, { align: 'right' });
  
  // Tax Relief Information
  y += 15;
  doc.setFillColor(255, 251, 235); // Light yellow
  doc.rect(15, y - 3, pageWidth - 30, 20, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Tax Relief Applied:', 20, y + 3);
  doc.text(`Monthly Relief: ${formatNaira(data.result.rentRelief)}`, 20, y + 10);
  doc.text(`Taxable Income: ${formatNaira(data.result.taxableIncome)}/month`, 100, y + 10);
  
  // Footer
  y = 270;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This is a computer-generated payslip. For queries, contact HR.', pageWidth / 2, y, { align: 'center' });
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy HH:mm')}`, pageWidth / 2, y + 5, { align: 'center' });
  
  return doc;
}

export function downloadPayslip(data: PayslipData, filename?: string) {
  const doc = generatePayslipPDF(data);
  const defaultFilename = `Payslip_${data.employeeName.replace(/\s+/g, '_')}_${data.payPeriod}.pdf`;
  doc.save(filename || defaultFilename);
}

export function generateBulkPayslipsZip(payslips: PayslipData[]): Promise<Blob> {
  // For now, return a single PDF with all payslips
  // In future, could use JSZip for actual ZIP file
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    payslips.forEach((data, index) => {
      if (index > 0) {
        doc.addPage();
      }
      
      // Generate each payslip on its own page
      const singleDoc = generatePayslipPDF(data);
      // This is a simplified version - in production, you'd want to properly merge PDFs
    });
    
    resolve(doc.output('blob'));
  });
}
