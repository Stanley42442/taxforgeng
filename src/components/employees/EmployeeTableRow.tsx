import React, { memo, useCallback } from 'react';
import { Edit, Trash2, DollarSign, History, FileText, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/taxCalculations';
import type { Employee } from '@/hooks/useEmployees';

interface EmployeeTableRowProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onUpdateSalary: (employee: Employee) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}

export const EmployeeTableRow = memo(function EmployeeTableRow({
  employee,
  onEdit,
  onUpdateSalary,
  onDelete,
  style,
}: EmployeeTableRowProps) {
  const handleEdit = useCallback(() => {
    onEdit(employee);
  }, [employee, onEdit]);

  const handleUpdateSalary = useCallback(() => {
    onUpdateSalary(employee);
  }, [employee, onUpdateSalary]);

  const handleDelete = useCallback(() => {
    onDelete(employee.id);
  }, [employee.id, onDelete]);

  return (
    <TableRow style={style}>
      <TableCell>
        <div>
          <p className="font-medium">{employee.first_name} {employee.last_name}</p>
          <p className="text-sm text-muted-foreground">{employee.email}</p>
        </div>
      </TableCell>
      <TableCell>{employee.position || "-"}</TableCell>
      <TableCell>{employee.department || "-"}</TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(employee.current_gross_salary)}
      </TableCell>
      <TableCell>
        <Badge variant={employee.status === "active" ? "default" : "secondary"}>
          {employee.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUpdateSalary}>
              <DollarSign className="h-4 w-4 mr-2" />
              Update Salary
            </DropdownMenuItem>
            <DropdownMenuItem>
              <History className="h-4 w-4 mr-2" />
              Salary History
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              View Payslips
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if relevant employee data changed
  return (
    prevProps.employee.id === nextProps.employee.id &&
    prevProps.employee.first_name === nextProps.employee.first_name &&
    prevProps.employee.last_name === nextProps.employee.last_name &&
    prevProps.employee.email === nextProps.employee.email &&
    prevProps.employee.position === nextProps.employee.position &&
    prevProps.employee.department === nextProps.employee.department &&
    prevProps.employee.current_gross_salary === nextProps.employee.current_gross_salary &&
    prevProps.employee.status === nextProps.employee.status
  );
});

export default EmployeeTableRow;
