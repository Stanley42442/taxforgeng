import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ExpenseListItem, Expense } from './ExpenseListItem';

interface VirtualExpenseListProps {
  expenses: Expense[];
  expandedCardId: string | null;
  onExpand: (id: string | null) => void;
  onDelete: (id: string) => void;
  getBusinessName: (businessId?: string) => string | undefined;
  maxHeight?: number;
}

export const VirtualExpenseList = ({
  expenses,
  expandedCardId,
  onExpand,
  onDelete,
  getBusinessName,
  maxHeight = 600,
}: VirtualExpenseListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: expenses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index: number) => {
      // Expanded cards are taller (~160px), collapsed are ~120px
      return expandedCardId === expenses[index]?.id ? 160 : 120;
    }, [expandedCardId, expenses]),
    overscan: 5,
  });

  return (
    <div 
      ref={parentRef} 
      className="overflow-auto"
      style={{ height: `${Math.min(expenses.length * 120, maxHeight)}px` }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const expense = expenses[virtualRow.index];
          return (
            <div
              key={expense.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: '12px',
              }}
            >
              <ExpenseListItem
                expense={expense}
                isExpanded={expandedCardId === expense.id}
                businessName={getBusinessName(expense.businessId)}
                onExpand={onExpand}
                onDelete={onDelete}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Threshold for when to use virtual scrolling
export const VIRTUALIZATION_THRESHOLD = 200;

// Combined component that switches between virtual and regular rendering
interface ExpenseListProps extends VirtualExpenseListProps {}

export const ExpenseList = ({
  expenses,
  expandedCardId,
  onExpand,
  onDelete,
  getBusinessName,
  maxHeight,
}: ExpenseListProps) => {
  // Use virtual scrolling only for large lists
  if (expenses.length > VIRTUALIZATION_THRESHOLD) {
    return (
      <VirtualExpenseList
        expenses={expenses}
        expandedCardId={expandedCardId}
        onExpand={onExpand}
        onDelete={onDelete}
        getBusinessName={getBusinessName}
        maxHeight={maxHeight}
      />
    );
  }

  // Regular rendering for small lists (keeps animations smooth)
  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseListItem
          key={expense.id}
          expense={expense}
          isExpanded={expandedCardId === expense.id}
          businessName={getBusinessName(expense.businessId)}
          onExpand={onExpand}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ExpenseList;
