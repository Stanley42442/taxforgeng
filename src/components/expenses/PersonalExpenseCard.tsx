import React, { memo, useCallback } from 'react';
import { Edit2, Trash2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getCategoryById, calculateAnnualAmount, PAYMENT_INTERVALS } from '@/lib/personalExpenseCategories';

interface PersonalExpense {
  id: string;
  category: string;
  description: string | null;
  amount: string | number;
  payment_interval: string;
  start_date: string;
  end_date: string | null;
  tax_year: number;
  notes: string | null;
}

interface PersonalExpenseCardProps {
  expense: PersonalExpense;
  selectedYear: number;
  device: string;
  isMobile: boolean;
  onEdit: (expense: PersonalExpense) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
  getResponsiveClasses: (device: string, classes: Record<string, string>) => string;
  style?: React.CSSProperties;
}

export const PersonalExpenseCard = memo(function PersonalExpenseCard({
  expense,
  selectedYear,
  device,
  isMobile,
  onEdit,
  onDelete,
  formatCurrency,
  getResponsiveClasses,
  style,
}: PersonalExpenseCardProps) {
  const category = getCategoryById(expense.category);
  const Icon = category?.icon || Info;
  const annualAmount = calculateAnnualAmount(
    Number(expense.amount),
    expense.payment_interval,
    new Date(expense.start_date),
    expense.end_date ? new Date(expense.end_date) : undefined,
    selectedYear
  );

  const handleEdit = useCallback(() => {
    onEdit(expense);
  }, [expense, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(expense.id);
  }, [expense.id, onDelete]);

  return (
    <Card 
      style={style}
      className="border border-border bg-card hover:shadow-md transition-shadow duration-200"
    >
      <CardContent className={isMobile ? 'p-3' : 'p-4'}>
        {isMobile ? (
          // Mobile layout - stacked for better visibility
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm leading-tight">
                    {category?.name || expense.category}
                  </h3>
                  <Badge variant="outline" className="text-[10px] mt-1 px-1.5 py-0">
                    {PAYMENT_INTERVALS.find(p => p.value === expense.payment_interval)?.label}
                  </Badge>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm">{formatCurrency(Number(expense.amount))}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatCurrency(annualAmount)}/yr
                </p>
              </div>
            </div>
            
            {expense.description && (
              <p className="text-xs text-muted-foreground bg-muted/30 px-2 py-1.5 rounded-md">
                {expense.description}
              </p>
            )}
            
            <div className="flex items-center justify-between pt-1 border-t border-border/30">
              <span className="text-[10px] text-muted-foreground">
                From {format(new Date(expense.start_date), 'MMM yyyy')}
              </span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 touch-feedback"
                  onClick={handleEdit}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-destructive touch-feedback"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Desktop/Tablet layout
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{category?.name || expense.category}</h3>
                  <Badge variant="outline" className="text-xs">
                    {PAYMENT_INTERVALS.find(p => p.value === expense.payment_interval)?.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {expense.description || 'No description'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(Number(expense.amount))}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(annualAmount)}/yr
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>Annual equivalent</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleEdit}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if relevant props changed
  return (
    prevProps.expense.id === nextProps.expense.id &&
    prevProps.expense.amount === nextProps.expense.amount &&
    prevProps.expense.category === nextProps.expense.category &&
    prevProps.expense.description === nextProps.expense.description &&
    prevProps.expense.payment_interval === nextProps.expense.payment_interval &&
    prevProps.expense.start_date === nextProps.expense.start_date &&
    prevProps.expense.end_date === nextProps.expense.end_date &&
    prevProps.selectedYear === nextProps.selectedYear &&
    prevProps.device === nextProps.device &&
    prevProps.isMobile === nextProps.isMobile
  );
});

export default PersonalExpenseCard;
