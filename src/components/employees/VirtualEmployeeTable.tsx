import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Users } from 'lucide-react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EmployeeTableRow } from './EmployeeTableRow';
import type { Employee } from '@/hooks/useEmployees';

interface VirtualEmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onUpdateSalary: (employee: Employee) => void;
  onDelete: (id: string) => void;
  maxHeight?: number;
}

export const VirtualEmployeeTable = ({
  employees,
  onEdit,
  onUpdateSalary,
  onDelete,
  maxHeight = 500,
}: VirtualEmployeeTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: employees.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 64, []), // Estimated row height
    overscan: 10,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Department</TableHead>
          <TableHead className="text-right">Gross Salary</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <tr>
          <td colSpan={6} className="p-0">
            <div 
              ref={parentRef} 
              className="overflow-auto"
              style={{ height: `${Math.min(employees.length * 64, maxHeight)}px` }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                <table className="w-full">
                  <tbody>
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                      const employee = employees[virtualRow.index];
                      return (
                        <EmployeeTableRow
                          key={employee.id}
                          employee={employee}
                          onEdit={onEdit}
                          onUpdateSalary={onUpdateSalary}
                          onDelete={onDelete}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      </TableBody>
    </Table>
  );
};

// Threshold for when to use virtual scrolling
export const VIRTUALIZATION_THRESHOLD = 50;

// Empty state component
interface EmployeeEmptyStateProps {
  hasEmployees: boolean;
  onAddEmployee: () => void;
}

export const EmployeeEmptyState = ({ hasEmployees, onAddEmployee }: EmployeeEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center h-48 text-center">
    <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
    <h3 className="font-medium mb-1">No employees found</h3>
    <p className="text-sm text-muted-foreground mb-4">
      {!hasEmployees ? "Add your first employee to get started" : "Try adjusting your filters"}
    </p>
    {!hasEmployees && (
      <Button onClick={onAddEmployee}>
        Add First Employee
      </Button>
    )}
  </div>
);

// Combined component that switches between virtual and regular rendering
interface EmployeeTableProps extends VirtualEmployeeTableProps {
  isLoading: boolean;
  hasAnyEmployees: boolean;
  onAddEmployee: () => void;
}

export const EmployeeTable = ({
  employees,
  onEdit,
  onUpdateSalary,
  onDelete,
  isLoading,
  hasAnyEmployees,
  onAddEmployee,
  maxHeight,
}: EmployeeTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (employees.length === 0) {
    return <EmployeeEmptyState hasEmployees={hasAnyEmployees} onAddEmployee={onAddEmployee} />;
  }

  // Use virtual scrolling only for large lists
  if (employees.length > VIRTUALIZATION_THRESHOLD) {
    return (
      <VirtualEmployeeTable
        employees={employees}
        onEdit={onEdit}
        onUpdateSalary={onUpdateSalary}
        onDelete={onDelete}
        maxHeight={maxHeight}
      />
    );
  }

  // Regular rendering for small lists
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Department</TableHead>
          <TableHead className="text-right">Gross Salary</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <EmployeeTableRow
            key={employee.id}
            employee={employee}
            onEdit={onEdit}
            onUpdateSalary={onUpdateSalary}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default EmployeeTable;
