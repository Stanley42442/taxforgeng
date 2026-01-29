/**
 * Chat Conversation Export Utilities
 * Provides PDF and text export functions for TaxBot conversations
 */

import { jsPDF } from 'jspdf';
import type { ChatMessage, ChatConversation } from '@/hooks/useChatConversations';
import {
  BRAND_COLORS,
  COMPANY_INFO,
  PDF_SETTINGS,
  STANDARD_DISCLAIMER,
  addPDFHeader,
  addPDFFooter,
  formatTimestamp,
  formatDateForFilename,
} from './exportShared';

// ============================================
// PDF EXPORT
// ============================================

interface ExportOptions {
  includeTimestamps?: boolean;
}

/**
 * Export a chat conversation to PDF with TaxForge branding
 */
export function exportChatToPDF(
  conversation: ChatConversation,
  options: ExportOptions = {}
): void {
  const { includeTimestamps = false } = options;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_SETTINGS.margin;
  const contentWidth = pageWidth - margin * 2;
  const maxY = pageHeight - PDF_SETTINGS.footerHeight - 10;

  // Add branded header with badge
  let y = addPDFHeader(doc, { badgeText: 'Conversation', useNigerianStripes: false });

  // Title section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLORS.text);
  
  // Truncate title if too long
  const title = conversation.title.length > 50 
    ? conversation.title.slice(0, 50) + '...' 
    : conversation.title;
  doc.text(title, margin, y);
  y += 8;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.muted);
  doc.text(`Date: ${formatTimestamp(new Date(conversation.created_at))}`, margin, y);
  y += 12;

  // Separator line
  doc.setFillColor(...BRAND_COLORS.nigerianGreen);
  doc.rect(margin, y - 4, contentWidth, 0.5, 'F');
  y += 8;

  // Messages
  const messages = conversation.messages;
  
  for (const message of messages) {
    // Check if we need a new page
    if (y > maxY - 30) {
      doc.addPage();
      y = margin + 10;
    }

    // Role label
    const roleLabel = message.role === 'user' ? 'You:' : 'TaxBot:';
    const roleColor = message.role === 'user' 
      ? BRAND_COLORS.nigerianGreen 
      : BRAND_COLORS.gold;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(roleColor[0], roleColor[1], roleColor[2]);
    doc.text(roleLabel, margin, y);
    
    if (includeTimestamps && message.timestamp) {
      doc.setFontSize(8);
      doc.setTextColor(BRAND_COLORS.muted[0], BRAND_COLORS.muted[1], BRAND_COLORS.muted[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(formatTimestamp(new Date(message.timestamp)), pageWidth - margin, y, { align: 'right' });
    }
    
    y += 6;

    // Message content with word wrapping
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);

    // Split content into lines that fit within content width
    const lines = doc.splitTextToSize(message.content, contentWidth);
    
    for (const line of lines) {
      if (y > maxY - 10) {
        doc.addPage();
        y = margin + 10;
      }
      doc.text(line, margin, y);
      y += 5;
    }

    y += 8; // Space between messages
  }

  // Add page numbers and footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPDFFooter(doc, {
      disclaimer: STANDARD_DISCLAIMER,
      pageNumber: i,
      totalPages,
      showTimestamp: i === totalPages,
    });
  }

  // Generate filename and download
  const filename = `taxforge-chat-${formatDateForFilename()}.pdf`;
  doc.save(filename);
}

// ============================================
// TEXT EXPORT
// ============================================

/**
 * Export a chat conversation to plain text
 */
export function exportChatToText(
  conversation: ChatConversation,
  options: ExportOptions = {}
): void {
  const { includeTimestamps = false } = options;
  const lines: string[] = [];

  // Header
  lines.push('TaxForge NG - Chat Conversation Export');
  lines.push('=' .repeat(45));
  lines.push('');
  lines.push(`Title: ${conversation.title}`);
  lines.push(`Date: ${formatTimestamp(new Date(conversation.created_at))}`);
  lines.push('');
  lines.push('-'.repeat(45));
  lines.push('');

  // Messages
  for (const message of conversation.messages) {
    const roleLabel = message.role === 'user' ? 'You' : 'TaxBot';
    
    if (includeTimestamps && message.timestamp) {
      lines.push(`${roleLabel} (${formatTimestamp(new Date(message.timestamp))}):`);
    } else {
      lines.push(`${roleLabel}:`);
    }
    
    lines.push(message.content);
    lines.push('');
  }

  // Footer
  lines.push('-'.repeat(45));
  lines.push('');
  lines.push(`Exported from ${COMPANY_INFO.name} (${COMPANY_INFO.website})`);
  lines.push(`Generated: ${formatTimestamp()}`);
  lines.push('');
  lines.push('Disclaimer:');
  lines.push(STANDARD_DISCLAIMER);

  // Create and download file
  const content = lines.join('\n');
  const filename = `taxforge-chat-${formatDateForFilename()}.txt`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
