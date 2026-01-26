import jsPDF from 'jspdf';
import logger from './logger';
import QRCode from 'qrcode';
import type { DocumentationStats } from '@/hooks/useDocumentationStats';
import {
  BRAND_COLORS,
  COMPANY_INFO,
  PDF_SETTINGS,
  formatNigerianDate,
} from './exportShared';

// Generate QR code as base64 data URL
const generateQRCodeDataUrl = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url, {
      width: 150,
      margin: 1,
      color: {
        dark: '#008751', // Nigerian green
        light: '#ffffff',
      },
    });
  } catch (error) {
    logger.error('Failed to generate QR code:', error);
    return '';
  }
};

export const generateDocumentationPDF = async (stats: DocumentationStats): Promise<jsPDF> => {
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
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.text(
      `${COMPANY_INFO.shortName} - Project Documentation | Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated: ${formatNigerianDate(new Date().toISOString())}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  };

  const addSectionTitle = (title: string) => {
    addNewPageIfNeeded(20);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.nigerianGreen);
    doc.text(title, margin, yPosition);
    yPosition += 3;
    doc.setDrawColor(...BRAND_COLORS.nigerianGreen);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, margin + 60, yPosition);
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

  // Cover Page
  addHeader();
  yPosition = 60;
  
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.nigerianGreen);
  doc.text(COMPANY_INFO.shortName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.text);
  doc.text('Nigerian Tax Calculator For Smart Businesses', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text('Project Documentation & Investment Overview', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 25;

  // Live Statistics Box
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, 'F');
  doc.setDrawColor(...BRAND_COLORS.gold);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, 'S');
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.text);
  doc.text('Live Platform Statistics', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  const statsData = [
    { label: 'Users', value: stats.totalUsers.toLocaleString() },
    { label: 'Businesses', value: stats.totalBusinesses.toLocaleString() },
    { label: 'Calculations', value: (stats.totalCalculations + stats.totalIndividualCalcs).toLocaleString() },
    { label: 'AI Queries', value: stats.totalAiQueries.toLocaleString() },
  ];

  const statWidth = contentWidth / 4;
  statsData.forEach((stat, index) => {
    const xPos = margin + statWidth * index + statWidth / 2;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.nigerianGreen);
    doc.text(stat.value, xPos, yPosition, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.text(stat.label, xPos, yPosition + 6, { align: 'center' });
  });
  yPosition += 35;

  doc.setFontSize(10);
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text('Live URL: ' + COMPANY_INFO.liveUrl, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Add QR Code for mobile access
  const qrCodeDataUrl = await generateQRCodeDataUrl(COMPANY_INFO.liveUrl);
  if (qrCodeDataUrl) {
    const qrSize = 35;
    const qrX = (pageWidth - qrSize) / 2;
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, yPosition, qrSize, qrSize);
    yPosition += qrSize + 5;
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.text('Scan to visit live website', pageWidth / 2, yPosition, { align: 'center' });
  }

  // Executive Summary Page
  doc.addPage();
  addHeader();
  yPosition = margin + 10;

  addSectionTitle('Executive Summary');
  addParagraph(
    `${COMPANY_INFO.shortName} is a comprehensive Nigerian tax calculation and compliance platform designed to simplify tax management ` +
    'for individuals and businesses. The platform addresses the complexity of Nigerian tax law, including the 2026 tax reform ' +
    'changes, providing accessible tools for accurate calculations, compliance tracking, and business financial management.'
  );
  yPosition += 5;

  addSubsectionTitle('Problem Statement');
  addBulletPoint('Complex Nigerian tax calculations spanning CIT, VAT, WHT, PIT, and CGT');
  addBulletPoint('2026 tax reform changes creating confusion for businesses');
  addBulletPoint('Lack of accessible, affordable tax tools for small businesses');
  addBulletPoint('Manual compliance tracking leading to missed deadlines and penalties');
  yPosition += 5;

  addSubsectionTitle('Solution');
  addParagraph(
    `${COMPANY_INFO.shortName} provides an all-in-one platform combining tax calculations, business management, compliance tracking, ` +
    'and AI-powered advisory services. With a progressive subscription model from free to enterprise tiers, the platform ' +
    'serves everyone from individual employees to large corporations.'
  );

  // Core Product Features
  addSectionTitle('Core Product Features');

  addSubsectionTitle('Tax Calculators');
  addBulletPoint('Personal Income Tax (PIT) with 2026 rules (Nigeria Tax Act 2025)');
  addBulletPoint('Company Income Tax (CIT) with small company exemptions (0% for turnover < \u20A650M)');
  addBulletPoint('VAT calculations with sector-specific rules (exempt, zero-rated, standard)');
  addBulletPoint('Withholding Tax (WHT) credit tracking and reconciliation');
  addBulletPoint('Capital Gains Tax (CGT) with investor exemptions');
  addBulletPoint('Foreign income calculator with Double Tax Treaty credits');
  addBulletPoint('Crypto and investment income tax calculations');
  yPosition += 3;

  addSubsectionTitle('Business Management');
  addBulletPoint('Multi-business portfolio management (1 to unlimited based on tier)');
  addBulletPoint('CAC verification integration for company validation');
  addBulletPoint('Professional invoice creation and tracking');
  addBulletPoint('Expense tracking with AI-powered OCR receipt scanning');
  addBulletPoint('Profit and Loss statement generation');
  addBulletPoint('Payroll and PAYE calculator with employee management');
  yPosition += 3;

  addSubsectionTitle('Compliance & Planning');
  addBulletPoint('Nigerian tax calendar with all filing deadlines');
  addBulletPoint('Automated reminders via email, push notifications, and WhatsApp');
  addBulletPoint('E-filing preparation and document generation');
  addBulletPoint('Compliance status tracking with visual dashboards');
  addBulletPoint('Scenario modeling for tax optimization');
  addBulletPoint('Multi-year financial projections');
  yPosition += 3;

  addSubsectionTitle('AI & Advisory');
  addBulletPoint('Guided business structure wizard (recommends Business Name vs Limited Company)');
  addBulletPoint('AI Tax Assistant for answering complex tax queries');
  addBulletPoint('Sector-specific guidance for 15+ industries');
  addBulletPoint('Personalized tax-saving recommendations');

  // Subscription Model
  doc.addPage();
  addHeader();
  yPosition = margin + 10;

  addSectionTitle('Subscription & Monetization Model');
  addParagraph(
    `${COMPANY_INFO.shortName} operates on a 6-tier subscription model designed to serve users from individual employees ` +
    'to large enterprises. Annual billing offers approximately 17% savings.'
  );
  yPosition += 5;

  // Pricing Table
  const tiers = [
    { name: 'Free (Individual)', price: '\u20A60', target: 'Employees', features: 'Personal tax calc, crypto taxes, foreign income' },
    { name: 'Starter', price: '\u20A6500/mo', target: 'Side hustlers', features: '1 business, exports, email reminders' },
    { name: 'Basic', price: '\u20A62,000/mo', target: 'Freelancers', features: '2 businesses, invoices, OCR, 75 AI queries' },
    { name: 'Professional', price: '\u20A64,999/mo', target: 'Small business', features: '5 businesses, payroll, digital VAT' },
    { name: 'Business', price: '\u20A68,999/mo', target: 'Growing business', features: '10 businesses, CAC verification, 2 seats' },
    { name: 'Corporate', price: 'Custom', target: 'Enterprises', features: 'Unlimited, API, audit log, white-label' },
  ];

  const colWidths = [35, 25, 30, contentWidth - 90];
  const tableStartY = yPosition;

  // Table Header
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.rect(margin, yPosition, contentWidth, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.white);
  doc.text('Tier', margin + 2, yPosition + 5.5);
  doc.text('Price', margin + colWidths[0] + 2, yPosition + 5.5);
  doc.text('Target', margin + colWidths[0] + colWidths[1] + 2, yPosition + 5.5);
  doc.text('Key Features', margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 5.5);
  yPosition += 8;

  // Table Rows
  tiers.forEach((tier, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(...BRAND_COLORS.lightBg);
    } else {
      doc.setFillColor(...BRAND_COLORS.white);
    }
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND_COLORS.text);
    doc.text(tier.name, margin + 2, yPosition + 5.5);
    doc.setTextColor(...BRAND_COLORS.nigerianGreen);
    doc.text(tier.price, margin + colWidths[0] + 2, yPosition + 5.5);
    doc.setTextColor(...BRAND_COLORS.muted);
    doc.text(tier.target, margin + colWidths[0] + colWidths[1] + 2, yPosition + 5.5);
    doc.text(tier.features, margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 5.5);
    yPosition += 8;
  });

  // Table Border
  doc.setDrawColor(...BRAND_COLORS.muted);
  doc.setLineWidth(0.3);
  doc.rect(margin, tableStartY, contentWidth, yPosition - tableStartY);
  yPosition += 10;

  addSubsectionTitle('Revenue Features');
  addBulletPoint('Annual billing discount (approximately 17% savings)');
  addBulletPoint('Free trial with full premium access');
  addBulletPoint('Seamless tier upgrade/downgrade with data preservation');
  addBulletPoint('Subscription history and email notifications');
  addBulletPoint('Upgrade celebration animations for positive UX');

  // Technical Architecture
  addSectionTitle('Technical Architecture');

  addSubsectionTitle('Frontend Stack');
  addBulletPoint('React 18 with TypeScript for type-safe development');
  addBulletPoint('Vite for fast builds and hot module replacement');
  addBulletPoint('Tailwind CSS with custom glass-morphism design system');
  addBulletPoint('shadcn/ui component library for consistent UI');
  addBulletPoint('Framer Motion for smooth animations');
  addBulletPoint('Progressive Web App (PWA) with offline support');
  yPosition += 3;

  addSubsectionTitle('Backend Infrastructure');
  addBulletPoint('PostgreSQL database with Row Level Security (RLS)');
  addBulletPoint('17 Edge Functions for serverless business logic');
  addBulletPoint('Real-time subscriptions for live updates');
  addBulletPoint('Secure secrets management for API keys');
  yPosition += 3;

  addSubsectionTitle('Database Schema (25+ Tables)');
  addParagraph(
    'Key tables include: profiles, businesses, expenses, invoices, tax_calculations, reminders, ' +
    'compliance_items, subscription_history, tier_data_snapshots, auth_events, known_devices, ' +
    'audit_logs, ai_queries, partners, and more.'
  );
  yPosition += 3;

  addSubsectionTitle('Edge Functions (17 Serverless Functions)');
  const functions = [
    'tax-assistant - AI-powered tax query responses',
    'categorize-expense - Automatic expense categorization',
    'expense-insights - Spending pattern analysis',
    'send-welcome-email - New user onboarding',
    'send-reminder-email - Tax deadline notifications',
    'send-tier-change-email - Subscription change alerts',
    'send-security-alert - Suspicious activity notifications',
    'send-whatsapp-notification - WhatsApp integration',
    'check-reminders - Scheduled reminder processing',
    'check-trial-expiry - Trial management',
    'send-scheduled-reports - Automated report delivery',
    'partner-api - Corporate API endpoints',
  ];
  functions.forEach(fn => addBulletPoint(fn));

  // Security Features
  doc.addPage();
  addHeader();
  yPosition = margin + 10;

  addSectionTitle('Security Features');
  addBulletPoint('Device fingerprinting and session tracking');
  addBulletPoint('IP whitelist for corporate accounts');
  addBulletPoint('Time-based access restrictions');
  addBulletPoint('Two-factor authentication support');
  addBulletPoint('Backup code generation with email alerts');
  addBulletPoint('Login attempt blocking after failures');
  addBulletPoint('Security analytics dashboard');
  addBulletPoint('Comprehensive event audit logging');
  addBulletPoint('Row Level Security on all database tables');
  yPosition += 5;

  // Key Pages
  addSectionTitle('Platform Pages (44+)');

  addSubsectionTitle('Public Pages');
  addBulletPoint('Landing page with feature carousel and success stories');
  addBulletPoint('Pricing comparison table');
  addBulletPoint('Tax calendar with Nigerian deadlines');
  addBulletPoint('Learn center with educational content');
  addBulletPoint('Terms of service and roadmap');
  yPosition += 3;

  addSubsectionTitle('Authenticated Pages');
  addBulletPoint('Dashboard with financial summary and charts');
  addBulletPoint('Business and individual tax calculators');
  addBulletPoint('Saved businesses management');
  addBulletPoint('Invoices, expenses, and payroll modules');
  addBulletPoint('Tax reminders and notifications');
  addBulletPoint('Scenario modeling and e-filing preparation');
  addBulletPoint('Settings, security dashboard, and achievements');
  yPosition += 3;

  addSubsectionTitle('Admin Pages');
  addBulletPoint('Admin analytics and AI query analytics');
  addBulletPoint('Audit log viewer');
  addBulletPoint('Accountant portal');

  // Roadmap
  addSectionTitle('Roadmap & Future Features');
  addBulletPoint('Enhanced API access for third-party integrations');
  addBulletPoint('Native mobile applications (iOS and Android)');
  addBulletPoint('Accounting software integrations (QuickBooks, Xero)');
  addBulletPoint('Advanced team collaboration features');
  addBulletPoint('Multi-currency support for international businesses');
  addBulletPoint('Expanded sector-specific tax modules');
  addBulletPoint('White-label solutions for accounting firms');

  // Contact
  yPosition += 10;
  addNewPageIfNeeded(40);
  doc.setFillColor(...BRAND_COLORS.lightBg);
  doc.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
  doc.setDrawColor(...BRAND_COLORS.gold);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'S');
  yPosition += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.text);
  doc.text('Contact & More Information', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text(`${COMPANY_INFO.website} | ${COMPANY_INFO.email}`, pageWidth / 2, yPosition, { align: 'center' });

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  return doc;
};

export const downloadDocumentationPDF = async (stats: DocumentationStats): Promise<void> => {
  const doc = await generateDocumentationPDF(stats);
  doc.save('taxforge-ng-documentation.pdf');
};
