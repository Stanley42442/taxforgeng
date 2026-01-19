import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubscription, SavedBusiness } from '@/contexts/SubscriptionContext';
import { 
  generateBulkExportZip, 
  downloadZip, 
  getEstimatedSize,
  BulkExportOptions,
  BulkExportProgress 
} from '@/lib/bulkExport';
import { 
  Archive, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Loader2, 
  Lock,
  Check 
} from 'lucide-react';

interface BulkExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: SavedBusiness[];
}

export const BulkExportDialog: React.FC<BulkExportDialogProps> = ({
  isOpen,
  onClose,
  businesses,
}) => {
  const { canBulkExport, effectiveTier } = useSubscription();
  const { toast } = useToast();

  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'both'>('pdf');
  const [includeTypes, setIncludeTypes] = useState({
    taxCalculations: true,
    expenses: true,
    invoices: false,
    businessReports: true,
  });
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<BulkExportProgress | null>(null);

  const toggleBusiness = (id: string) => {
    setSelectedBusinessIds(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const selectAllBusinesses = () => {
    if (selectedBusinessIds.length === businesses.length) {
      setSelectedBusinessIds([]);
    } else {
      setSelectedBusinessIds(businesses.map(b => b.id));
    }
  };

  const getOptions = (): BulkExportOptions => ({
    businesses: selectedBusinessIds.length > 0
      ? businesses.filter(b => selectedBusinessIds.includes(b.id)).map(b => ({ id: b.id, name: b.name }))
      : undefined,
    includeTypes,
    format,
  });

  const handleExport = async () => {
    if (!canBulkExport()) {
      toast({
        title: 'Upgrade Required',
        description: 'Bulk export is available on Business tier and above.',
        variant: 'destructive',
      });
      return;
    }

    if (!includeTypes.taxCalculations && !includeTypes.expenses && 
        !includeTypes.invoices && !includeTypes.businessReports) {
      toast({
        title: 'Select Report Types',
        description: 'Please select at least one report type to export.',
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);
    setProgress({ current: 0, total: 1, currentItem: 'Preparing...', percentage: 0 });

    try {
      // Note: In a real implementation, you would pass actual report generators
      // This is a placeholder that demonstrates the structure
      const blob = await generateBulkExportZip(
        getOptions(),
        {
          // These would be real generator functions in production
        },
        setProgress
      );

      downloadZip(blob);

      toast({
        title: 'Export Complete!',
        description: 'Your bulk export has been downloaded.',
      });

      onClose();
    } catch (error) {
      console.error('Bulk export error:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error creating the export. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const estimatedSize = getEstimatedSize(getOptions());
  const hasSelectedTypes = Object.values(includeTypes).some(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Bulk Export
          </DialogTitle>
          <DialogDescription>
            Download multiple reports at once as a ZIP file.
          </DialogDescription>
        </DialogHeader>

        {!canBulkExport() ? (
          <div className="py-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Business+ Feature</h3>
            <p className="text-muted-foreground mb-4">
              Bulk export is available on Business and Corporate tiers.
            </p>
            <p className="text-sm text-muted-foreground">
              Current tier: <Badge variant="outline">{effectiveTier}</Badge>
            </p>
          </div>
        ) : exporting ? (
          <div className="py-8">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-center font-medium mb-2">{progress?.currentItem || 'Processing...'}</p>
            <Progress value={progress?.percentage || 0} className="mb-2" />
            <p className="text-center text-sm text-muted-foreground">
              {progress?.current || 0} / {progress?.total || 0} files
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Business Selection */}
            {businesses.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Select Businesses</Label>
                  <Button variant="ghost" size="sm" onClick={selectAllBusinesses}>
                    {selectedBusinessIds.length === businesses.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {businesses.map((business) => (
                    <div key={business.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`biz-${business.id}`}
                        checked={selectedBusinessIds.includes(business.id)}
                        onCheckedChange={() => toggleBusiness(business.id)}
                      />
                      <Label htmlFor={`biz-${business.id}`} className="cursor-pointer text-sm">
                        {business.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedBusinessIds.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Leave empty to export all businesses
                  </p>
                )}
              </div>
            )}

            {/* Report Types */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Report Types</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tax"
                    checked={includeTypes.taxCalculations}
                    onCheckedChange={(checked) => 
                      setIncludeTypes(prev => ({ ...prev, taxCalculations: checked === true }))
                    }
                  />
                  <Label htmlFor="tax" className="cursor-pointer text-sm">
                    Tax Calculations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="expenses"
                    checked={includeTypes.expenses}
                    onCheckedChange={(checked) => 
                      setIncludeTypes(prev => ({ ...prev, expenses: checked === true }))
                    }
                  />
                  <Label htmlFor="expenses" className="cursor-pointer text-sm">
                    Expenses
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="invoices"
                    checked={includeTypes.invoices}
                    onCheckedChange={(checked) => 
                      setIncludeTypes(prev => ({ ...prev, invoices: checked === true }))
                    }
                  />
                  <Label htmlFor="invoices" className="cursor-pointer text-sm">
                    Invoices
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reports"
                    checked={includeTypes.businessReports}
                    onCheckedChange={(checked) => 
                      setIncludeTypes(prev => ({ ...prev, businessReports: checked === true }))
                    }
                  />
                  <Label htmlFor="reports" className="cursor-pointer text-sm">
                    Business Reports
                  </Label>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Export Format</Label>
              <RadioGroup value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="cursor-pointer flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="cursor-pointer flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Both Formats
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Estimated Size */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Estimated download size:</span>
              <Badge variant="secondary">{estimatedSize}</Badge>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          {canBulkExport() && (
            <Button 
              onClick={handleExport} 
              disabled={exporting || !hasSelectedTypes}
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download ZIP
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkExportDialog;
