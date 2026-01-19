import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useSubscription, SavedBusiness } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Mail,
  Printer,
  QrCode,
  Lock,
  ChevronDown,
  Package,
} from "lucide-react";
import { SendReportDialog } from "./SendReportDialog";
import { BulkExportDialog } from "./BulkExportDialog";

interface ExportActionsMenuProps {
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
  reportTitle?: string;
  reportType?: 'tax-calculation' | 'business-report' | 'expenses' | 'invoice' | 'general';
  pdfBlob?: Blob | null;
  attachmentData?: string; // Base64 encoded PDF for email
  attachmentName?: string;
  // For bulk export
  businesses?: SavedBusiness[];
}

export function ExportActionsMenu({
  onExportPDF,
  onExportCSV,
  onExportExcel,
  onPrint,
  reportTitle = "Report",
  reportType = "general",
  pdfBlob,
  attachmentData,
  attachmentName,
  businesses,
}: ExportActionsMenuProps) {
  const navigate = useNavigate();
  const { 
    canExport, 
    canExportExcel, 
    canEmailReports, 
    canBulkExport,
    canAddQRVerification,
    tier 
  } = useSubscription();
  
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  const handleLockedAction = (feature: string) => {
    toast.error(`${feature} requires an upgrade`, {
      action: { label: "Upgrade", onClick: () => navigate('/pricing') }
    });
  };

  const handlePDF = () => {
    if (!canExport()) {
      handleLockedAction("PDF Export");
      return;
    }
    onExportPDF?.();
  };

  const handleCSV = () => {
    if (!canExport()) {
      handleLockedAction("CSV Export");
      return;
    }
    onExportCSV?.();
  };

  const handleExcel = () => {
    if (!canExportExcel()) {
      handleLockedAction("Excel Export");
      return;
    }
    onExportExcel?.();
  };

  const handleEmail = () => {
    if (!canEmailReports()) {
      handleLockedAction("Email Reports");
      return;
    }
    if (!attachmentData) {
      toast.error("Please export as PDF first to enable email");
      return;
    }
    setShowEmailDialog(true);
  };

  const handleBulkExport = () => {
    if (!canBulkExport()) {
      handleLockedAction("Bulk Export");
      return;
    }
    setShowBulkDialog(true);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* PDF Export */}
          {onExportPDF && (
            <DropdownMenuItem onClick={handlePDF}>
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
              {!canExport() && <Lock className="h-3 w-3 ml-auto" />}
            </DropdownMenuItem>
          )}
          
          {/* CSV Export */}
          {onExportCSV && (
            <DropdownMenuItem onClick={handleCSV}>
              <FileText className="h-4 w-4 mr-2" />
              Download CSV
              {!canExport() && <Lock className="h-3 w-3 ml-auto" />}
            </DropdownMenuItem>
          )}
          
          {/* Excel Export */}
          {onExportExcel && (
            <DropdownMenuItem onClick={handleExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Download Excel
              {!canExportExcel() && <Lock className="h-3 w-3 ml-auto" />}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {/* Email Report */}
          <DropdownMenuItem onClick={handleEmail} disabled={!attachmentData}>
            <Mail className="h-4 w-4 mr-2" />
            Email Report
            {!canEmailReports() && <Lock className="h-3 w-3 ml-auto" />}
          </DropdownMenuItem>
          
          {/* Print */}
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </DropdownMenuItem>
          
          {/* Bulk Export */}
          {businesses && businesses.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBulkExport}>
                <Package className="h-4 w-4 mr-2" />
                Bulk Export (ZIP)
                {!canBulkExport() && <Lock className="h-3 w-3 ml-auto" />}
              </DropdownMenuItem>
            </>
          )}
          
          {/* QR Verification Link */}
          {canAddQRVerification() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info("QR verification is added to PDF exports automatically")}>
                <QrCode className="h-4 w-4 mr-2" />
                QR Verification
                <span className="ml-auto text-xs text-muted-foreground">Auto</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Email Dialog */}
      {attachmentData && attachmentName && (
        <SendReportDialog
          isOpen={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
          reportTitle={reportTitle}
          reportType={reportType}
          attachmentData={attachmentData}
          attachmentName={attachmentName}
        />
      )}

      {/* Bulk Export Dialog */}
      {businesses && (
        <BulkExportDialog
          isOpen={showBulkDialog}
          onClose={() => setShowBulkDialog(false)}
          businesses={businesses}
        />
      )}
    </>
  );
}
