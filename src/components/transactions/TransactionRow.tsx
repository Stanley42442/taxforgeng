import React from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Trash2, RotateCcw, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TransactionRowData {
  id: string;
  date: Date;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'cleared' | 'pending' | 'active' | 'inactive';
  businessName?: string;
  isDeductible?: boolean;
  isDeleted?: boolean;
}

interface TransactionRowProps {
  transaction: TransactionRowData;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  showBusiness?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isMobile?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onDelete,
  onRestore,
  showBusiness = false,
  isExpanded = false,
  onToggleExpand,
  isMobile = false,
}) => {
  const { id, date, category, description, amount, type, status, businessName, isDeductible, isDeleted } = transaction;

  const statusConfig = {
    cleared: { label: 'Cleared', variant: 'success' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    active: { label: 'Active', variant: 'success' as const },
    inactive: { label: 'Inactive', variant: 'secondary' as const },
  };

  const statusInfo = statusConfig[status];

  // Mobile card layout
  if (isMobile) {
    return (
      <div
        className={cn(
          'p-4 border border-border rounded-lg bg-card transition-all',
          isDeleted && 'opacity-60 bg-muted/50'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs shrink-0">
                {category}
              </Badge>
              <Badge variant={statusInfo.variant} className="text-xs shrink-0">
                {statusInfo.label}
              </Badge>
            </div>
            <p className="font-medium text-foreground truncate">{description || 'No description'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(date, 'MMM d, yyyy')}
              {showBusiness && businessName && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {businessName}
                </span>
              )}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p
              className={cn(
                'font-semibold text-lg',
                type === 'income' ? 'text-success' : 'text-destructive'
              )}
            >
              {type === 'income' ? '+' : '-'}₦{amount.toLocaleString()}
            </p>
            {isDeductible && (
              <span className="text-xs text-muted-foreground">Tax deductible</span>
            )}
          </div>
        </div>
        {(onDelete || onRestore) && (
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
            {isDeleted && onRestore && (
              <Button variant="outline" size="sm" onClick={() => onRestore(id)}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Restore
              </Button>
            )}
            {!isDeleted && onDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop table row
  return (
    <TableRow className={cn(isDeleted && 'opacity-60 bg-muted/50')}>
      <TableCell className="font-medium">
        {format(date, 'MMM d, yyyy')}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{category}</Badge>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {description || <span className="text-muted-foreground italic">No description</span>}
      </TableCell>
      <TableCell
        className={cn(
          'font-semibold',
          type === 'income' ? 'text-success' : 'text-destructive'
        )}
      >
        {type === 'income' ? '+' : '-'}₦{amount.toLocaleString()}
      </TableCell>
      <TableCell>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </TableCell>
      {showBusiness && (
        <TableCell>
          {businessName ? (
            <span className="flex items-center gap-1 text-sm">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              {businessName}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center gap-1">
          {isDeleted && onRestore && (
            <Button variant="ghost" size="icon" onClick={() => onRestore(id)} className="h-8 w-8">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {!isDeleted && onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(id)} className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {onToggleExpand && (
            <Button variant="ghost" size="icon" onClick={onToggleExpand} className="h-8 w-8">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TransactionRow;
