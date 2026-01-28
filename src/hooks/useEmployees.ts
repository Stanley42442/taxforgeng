import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  user_id: string;
  business_id?: string;
  employee_id_number?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  hire_date?: string;
  termination_date?: string;
  department?: string;
  position?: string;
  employment_type: string;
  current_gross_salary: number;
  bank_name?: string;
  bank_account_number?: string;
  tax_id?: string;
  pension_pin?: string;
  pfa_name?: string;
  nhf_number?: string;
  include_nhf: boolean;
  annual_rent?: number;
  status: 'active' | 'inactive' | 'terminated';
  notes?: string;
  self_service_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalaryHistoryEntry {
  id: string;
  employee_id: string;
  effective_date: string;
  previous_salary?: number;
  new_salary: number;
  change_reason?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
}

export interface CreateEmployeeInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  employment_type?: string;
  current_gross_salary: number;
  bank_name?: string;
  bank_account_number?: string;
  tax_id?: string;
  pension_pin?: string;
  pfa_name?: string;
  nhf_number?: string;
  include_nhf?: boolean;
  annual_rent?: number;
  hire_date?: string;
  business_id?: string;
}

export function useEmployees(businessId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: employees, isLoading, refetch } = useQuery({
    queryKey: ['employees', user?.id, businessId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null) // Filter soft-deleted records
        .order('last_name');
      
      if (businessId) {
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!user,
  });

  const activeEmployees = employees?.filter(e => e.status === 'active') || [];

  const addEmployee = useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('employees')
        .insert({
          user_id: user.id,
          ...input,
          status: 'active',
          employment_type: input.employment_type || 'full-time',
          include_nhf: input.include_nhf ?? true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add employee: ' + error.message);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ 
      id, 
      updates, 
      salaryChangeReason 
    }: { 
      id: string; 
      updates: Partial<Employee>; 
      salaryChangeReason?: string 
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // If salary is changing, record in history
      if (updates.current_gross_salary !== undefined) {
        const existingEmployee = employees?.find(e => e.id === id);
        if (existingEmployee && existingEmployee.current_gross_salary !== updates.current_gross_salary) {
          await supabase.from('employee_salary_history').insert({
            employee_id: id,
            effective_date: new Date().toISOString().split('T')[0],
            previous_salary: existingEmployee.current_gross_salary,
            new_salary: updates.current_gross_salary,
            change_reason: salaryChangeReason || 'Manual adjustment',
          });
        }
      }
      
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update employee: ' + error.message);
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete employee: ' + error.message);
    },
  });

  const terminateEmployee = useMutation({
    mutationFn: async ({ id, terminationDate }: { id: string; terminationDate: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update({ 
          status: 'terminated', 
          termination_date: terminationDate 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee terminated');
    },
  });

  const getSalaryHistory = async (employeeId: string): Promise<SalaryHistoryEntry[]> => {
    const { data, error } = await supabase
      .from('employee_salary_history')
      .select('*')
      .eq('employee_id', employeeId)
      .order('effective_date', { ascending: false });
    
    if (error) throw error;
    return data as SalaryHistoryEntry[];
  };

  return {
    employees: employees || [],
    activeEmployees,
    isLoading,
    refetch,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    terminateEmployee,
    getSalaryHistory,
  };
}
