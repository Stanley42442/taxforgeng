import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PayrollRun {
  id: string;
  user_id: string;
  business_id?: string;
  pay_period: string;
  pay_date: string;
  status: 'draft' | 'finalized' | 'paid';
  total_employees: number;
  total_gross_salaries: number;
  total_net_salaries: number;
  total_paye: number;
  total_pension_employee: number;
  total_pension_employer: number;
  total_nhf: number;
  total_overtime: number;
  total_bonuses: number;
  total_leave_deductions: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollEntry {
  id: string;
  payroll_run_id: string;
  employee_id?: string;
  employee_name: string;
  gross_salary: number;
  basic_salary?: number;
  housing_allowance?: number;
  transport_allowance?: number;
  other_allowances?: number;
  overtime_amount: number;
  bonus_amount: number;
  leave_deduction: number;
  pension_employee: number;
  pension_employer: number;
  nhf: number;
  taxable_income: number;
  paye: number;
  net_salary: number;
  include_nhf: boolean;
  created_at: string;
}

export interface CreatePayrollRunInput {
  pay_period: string;
  pay_date: string;
  business_id?: string;
  notes?: string;
  entries: Omit<PayrollEntry, 'id' | 'payroll_run_id' | 'created_at'>[];
}

export function usePayrollHistory(businessId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: payrollRuns, isLoading, refetch } = useQuery({
    queryKey: ['payroll-runs', user?.id, businessId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('payroll_runs')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null) // Filter soft-deleted records
        .order('pay_period', { ascending: false });
      
      if (businessId) {
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PayrollRun[];
    },
    enabled: !!user,
  });

  const getPayrollEntries = async (runId: string): Promise<PayrollEntry[]> => {
    const { data, error } = await supabase
      .from('payroll_entries')
      .select('*')
      .eq('payroll_run_id', runId)
      .order('employee_name');
    
    if (error) throw error;
    return data as PayrollEntry[];
  };

  const createPayrollRun = useMutation({
    mutationFn: async (input: CreatePayrollRunInput) => {
      if (!user) throw new Error('Not authenticated');
      
      // Calculate totals
      const totals = input.entries.reduce((acc, entry) => ({
        total_gross_salaries: acc.total_gross_salaries + entry.gross_salary,
        total_net_salaries: acc.total_net_salaries + entry.net_salary,
        total_paye: acc.total_paye + entry.paye,
        total_pension_employee: acc.total_pension_employee + entry.pension_employee,
        total_pension_employer: acc.total_pension_employer + entry.pension_employer,
        total_nhf: acc.total_nhf + entry.nhf,
        total_overtime: acc.total_overtime + entry.overtime_amount,
        total_bonuses: acc.total_bonuses + entry.bonus_amount,
        total_leave_deductions: acc.total_leave_deductions + entry.leave_deduction,
      }), {
        total_gross_salaries: 0,
        total_net_salaries: 0,
        total_paye: 0,
        total_pension_employee: 0,
        total_pension_employer: 0,
        total_nhf: 0,
        total_overtime: 0,
        total_bonuses: 0,
        total_leave_deductions: 0,
      });
      
      // Create payroll run
      const { data: run, error: runError } = await supabase
        .from('payroll_runs')
        .insert({
          user_id: user.id,
          business_id: input.business_id,
          pay_period: input.pay_period,
          pay_date: input.pay_date,
          status: 'draft',
          total_employees: input.entries.length,
          notes: input.notes,
          ...totals,
        })
        .select()
        .single();
      
      if (runError) throw runError;
      
      // Create entries
      const entries = input.entries.map(entry => ({
        payroll_run_id: run.id,
        ...entry,
      }));
      
      const { error: entriesError } = await supabase
        .from('payroll_entries')
        .insert(entries);
      
      if (entriesError) throw entriesError;
      
      return run as PayrollRun;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Payroll run saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save payroll: ' + error.message);
    },
  });

  const updatePayrollStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PayrollRun['status'] }) => {
      const { data, error } = await supabase
        .from('payroll_runs')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Payroll status updated');
    },
  });

  const deletePayrollRun = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payroll_runs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Payroll run deleted');
    },
  });

  // Get payroll entries for a specific employee
  const getEmployeePayrollHistory = async (employeeId: string): Promise<(PayrollEntry & { payroll_run: PayrollRun })[]> => {
    const { data, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        payroll_runs!inner(*)
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(entry => ({
      ...entry,
      payroll_run: entry.payroll_runs as unknown as PayrollRun,
    })) || [];
  };

  return {
    payrollRuns: payrollRuns || [],
    isLoading,
    refetch,
    getPayrollEntries,
    createPayrollRun,
    updatePayrollStatus,
    deletePayrollRun,
    getEmployeePayrollHistory,
  };
}
