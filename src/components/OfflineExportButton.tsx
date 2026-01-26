import React from 'react';
import logger from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileJson, Package } from 'lucide-react';
import { 
  exportBusinessesToCSV, 
  exportExpensesToCSV, 
  exportPersonalExpensesToCSV, 
  exportCalculationsToJSON,
  exportAllCachedData,
} from '@/lib/offlineExport';
import { toast } from 'sonner';

interface OfflineExportButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
}

export const OfflineExportButton: React.FC<OfflineExportButtonProps> = ({ 
  variant = 'outline' 
}) => {
  const handleExport = async (type: string) => {
    try {
      switch (type) {
        case 'businesses':
          await exportBusinessesToCSV();
          toast.success('Businesses exported to CSV');
          break;
        case 'expenses':
          await exportExpensesToCSV();
          toast.success('Expenses exported to CSV');
          break;
        case 'personal':
          await exportPersonalExpensesToCSV();
          toast.success('Personal expenses exported to CSV');
          break;
        case 'calculations':
          await exportCalculationsToJSON();
          toast.success('Calculations exported to JSON');
          break;
        case 'all':
          await exportAllCachedData();
          toast.success('All data exported');
          break;
      }
    } catch (error) {
      toast.error('Export failed');
      logger.error('Export error:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('businesses')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Businesses (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('expenses')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Expenses (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('personal')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Personal Expenses (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('calculations')}>
          <FileJson className="h-4 w-4 mr-2" />
          Calculations (JSON)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('all')}>
          <Package className="h-4 w-4 mr-2" />
          Export All Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
