import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileType,
  ChevronDown,
  Loader2,
} from "lucide-react";

export type ExportFormat = 'pdf' | 'csv' | 'xlsx' | 'json' | 'txt';

interface ExportMenuProps {
  /** Which formats to show */
  formats: ExportFormat[];
  /** Called when user picks a format. Return a promise for loading state. */
  onExport: (format: ExportFormat) => void | Promise<void>;
  /** Button label */
  label?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Disable specific formats */
  disabled?: ExportFormat[];
}

const FORMAT_META: Record<ExportFormat, { label: string; icon: typeof FileText; description: string }> = {
  pdf: { label: 'PDF Report', icon: FileText, description: 'Branded document' },
  csv: { label: 'CSV File', icon: FileText, description: 'Spreadsheet-ready' },
  xlsx: { label: 'Excel File', icon: FileSpreadsheet, description: 'Multi-sheet workbook' },
  json: { label: 'JSON Data', icon: FileJson, description: 'Structured data' },
  txt: { label: 'Plain Text', icon: FileType, description: 'Simple summary' },
};

export function ExportMenu({
  formats,
  onExport,
  label = "Export",
  variant = "outline",
  size = "default",
  disabled = [],
}: ExportMenuProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (loading) return;
    setLoading(format);
    try {
      await onExport(format);
      toast.success(`${FORMAT_META[format].label} exported`);
    } catch (error) {
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  }, [onExport, loading]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={!!loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {label}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map(format => {
          const meta = FORMAT_META[format];
          const Icon = meta.icon;
          const isDisabled = disabled.includes(format);
          const isLoading = loading === format;

          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={isDisabled || isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{meta.label}</span>
                <span className="text-xs text-muted-foreground">{meta.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
