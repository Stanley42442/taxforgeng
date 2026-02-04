import React, { memo, useCallback } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'income' | 'rent' | 'transport' | 'marketing' | 'salary' | 'utilities' | 'supplies' | 'other';
  type: 'income' | 'expense';
  isDeductible: boolean;
  businessId?: string;
}

const getCategoryIcon = (category: Expense['category']) => {
  const icons: Record<Expense['category'], string> = {
    income: '💰',
    rent: '🏢',
    transport: '🚗',
    marketing: '📢',
    salary: '👥',
    utilities: '💡',
    supplies: '📦',
    other: '📋',
  };
  return icons[category];
};

const getCategoryColor = (category: Expense['category']) => {
  const colors: Record<Expense['category'], string> = {
    income: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    rent: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
    transport: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
    marketing: 'bg-pink-500/15 border-pink-500/30 text-pink-600 dark:text-pink-400',
    salary: 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400',
    utilities: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    supplies: 'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400',
    other: 'bg-slate-500/15 border-slate-500/30 text-slate-600 dark:text-slate-400',
  };
  return colors[category];
};

const EXPENSE_CATEGORIES = [
  { value: 'income', label: 'Income', type: 'income' as const },
  { value: 'rent', label: 'Rent & Office', type: 'expense' as const, deductible: true },
  { value: 'transport', label: 'Transport & Travel', type: 'expense' as const, deductible: true },
  { value: 'marketing', label: 'Marketing & Ads', type: 'expense' as const, deductible: true },
  { value: 'salary', label: 'Salaries & Wages', type: 'expense' as const, deductible: true },
  { value: 'utilities', label: 'Utilities', type: 'expense' as const, deductible: true },
  { value: 'supplies', label: 'Supplies & Equipment', type: 'expense' as const, deductible: true },
  { value: 'other', label: 'Other Expenses', type: 'expense' as const, deductible: false },
];

interface ExpenseListItemProps {
  expense: Expense;
  isExpanded: boolean;
  businessName?: string;
  onExpand: (id: string | null) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}

export const ExpenseListItem = memo(function ExpenseListItem({ 
  expense, 
  isExpanded, 
  businessName,
  onExpand,
  onDelete,
  style
}: ExpenseListItemProps) {
  const handleClick = useCallback(() => {
    onExpand(isExpanded ? null : expense.id);
  }, [isExpanded, expense.id, onExpand]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(expense.id);
  }, [expense.id, onDelete]);

  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div 
      style={style}
      className={`rounded-xl p-4 cursor-pointer active:opacity-80 transition-all border ${getCategoryColor(expense.category)} ${isExpanded ? 'mb-3' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xl">{getCategoryIcon(expense.category)}</span>
          <div className="min-w-0 flex-1">
            <p className={`font-medium ${isExpanded ? '' : 'truncate'}`}>
              {expense.description}
            </p>
            {isExpanded && (
              <p className="text-xs opacity-75 mt-1">
                Category: {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 opacity-60" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-60" />
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:bg-destructive/10 h-7 w-7" 
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs opacity-75">
        <span>{new Date(expense.date).toLocaleDateString()}</span>
        {businessName && <span>• {businessName}</span>}
        {expense.isDeductible && (
          <span className="px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">Deductible</span>
        )}
      </div>
      <div className={`font-bold text-base mt-1 ${expense.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
        {formatAmount(expense.amount)}
        {isExpanded && expense.amount >= 1_000 && (
          <span className="text-sm font-normal opacity-75 ml-2">
            (₦{expense.amount.toLocaleString()})
          </span>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if relevant props changed
  return (
    prevProps.expense.id === nextProps.expense.id &&
    prevProps.expense.amount === nextProps.expense.amount &&
    prevProps.expense.description === nextProps.expense.description &&
    prevProps.expense.category === nextProps.expense.category &&
    prevProps.expense.date === nextProps.expense.date &&
    prevProps.expense.isDeductible === nextProps.expense.isDeductible &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.businessName === nextProps.businessName
  );
});

export { getCategoryIcon, getCategoryColor, EXPENSE_CATEGORIES };
