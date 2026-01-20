import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';
import { useCallback } from 'react';

export interface LeaveType {
  id: string;
  user_id: string;
  name: string;
  code: string;
  default_days_per_year: number;
  is_paid: boolean;
  color: string;
  requires_approval: boolean;
  can_carry_over: boolean;
  max_carry_over_days: number;
  is_active: boolean;
  created_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  entitled_days: number;
  used_days: number;
  carried_over_days: number;
  adjustment_days: number;
  notes?: string;
  leave_type?: LeaveType;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  is_half_day: boolean;
  half_day_period?: 'morning' | 'afternoon';
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  leave_type?: LeaveType;
  employee?: { first_name: string; last_name: string };
}

export interface PublicHoliday {
  id: string;
  user_id: string;
  name: string;
  date: string;
  year: number;
  is_recurring: boolean;
  created_at: string;
}

const DEFAULT_LEAVE_TYPES = [
  { name: 'Annual Leave', code: 'AL', default_days_per_year: 21, color: '#3b82f6', is_paid: true },
  { name: 'Sick Leave', code: 'SL', default_days_per_year: 12, color: '#ef4444', is_paid: true },
  { name: 'Maternity Leave', code: 'ML', default_days_per_year: 90, color: '#ec4899', is_paid: true },
  { name: 'Paternity Leave', code: 'PL', default_days_per_year: 14, color: '#8b5cf6', is_paid: true },
  { name: 'Compassionate Leave', code: 'CL', default_days_per_year: 5, color: '#6b7280', is_paid: true },
  { name: 'Unpaid Leave', code: 'UL', default_days_per_year: 30, color: '#f59e0b', is_paid: false },
];

export function useLeaveManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch leave types
  const { data: leaveTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['leave-types', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as LeaveType[];
    },
    enabled: !!user,
  });

  // Fetch public holidays
  const { data: holidays, isLoading: holidaysLoading } = useQuery({
    queryKey: ['public-holidays', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('public_holidays')
        .select('*')
        .eq('user_id', user.id)
        .order('date');
      
      if (error) throw error;
      return data as PublicHoliday[];
    },
    enabled: !!user,
  });

  // Calculate working days between two dates
  const calculateWorkingDays = useCallback((
    startDate: Date,
    endDate: Date,
    isHalfDay: boolean = false
  ): number => {
    if (startDate > endDate) return 0;
    
    const holidayDates = holidays?.map(h => new Date(h.date)) || [];
    
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    let count = allDays.filter(day => {
      const isWeekendDay = isWeekend(day);
      const isHoliday = holidayDates.some(h => isSameDay(h, day));
      return !isWeekendDay && !isHoliday;
    }).length;
    
    return isHalfDay ? 0.5 : count;
  }, [holidays]);

  // Initialize default leave types
  const initializeLeaveTypes = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: existing } = await supabase
        .from('leave_types')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (existing && existing.length > 0) {
        return; // Already initialized
      }
      
      const types = DEFAULT_LEAVE_TYPES.map(t => ({
        ...t,
        user_id: user.id,
        requires_approval: true,
        can_carry_over: t.code === 'AL',
        max_carry_over_days: t.code === 'AL' ? 5 : 0,
        is_active: true,
      }));
      
      const { error } = await supabase.from('leave_types').insert(types);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave types initialized');
    },
  });

  // Get employee leave balances
  const getEmployeeBalances = async (employeeId: string, year: number): Promise<LeaveBalance[]> => {
    const { data, error } = await supabase
      .from('employee_leave_balances')
      .select(`
        *,
        leave_types(*)
      `)
      .eq('employee_id', employeeId)
      .eq('year', year);
    
    if (error) throw error;
    
    return data?.map(b => ({
      ...b,
      leave_type: b.leave_types as unknown as LeaveType,
    })) || [];
  };

  // Submit leave request
  const submitLeaveRequest = useMutation({
    mutationFn: async (request: {
      employee_id: string;
      leave_type_id: string;
      start_date: string;
      end_date: string;
      is_half_day?: boolean;
      half_day_period?: 'morning' | 'afternoon';
      reason?: string;
    }) => {
      const leaveType = leaveTypes?.find(t => t.id === request.leave_type_id);
      
      const totalDays = calculateWorkingDays(
        new Date(request.start_date),
        new Date(request.end_date),
        request.is_half_day || false
      );
      
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          ...request,
          total_days: totalDays,
          status: leaveType?.requires_approval ? 'pending' : 'approved',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // If auto-approved, update balance
      if (!leaveType?.requires_approval) {
        await updateLeaveBalance(request.employee_id, request.leave_type_id, totalDays);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request submitted');
    },
    onError: (error) => {
      toast.error('Failed to submit request: ' + error.message);
    },
  });

  // Update leave balance
  const updateLeaveBalance = async (
    employeeId: string,
    leaveTypeId: string,
    daysUsed: number
  ) => {
    const year = new Date().getFullYear();
    
    const { data: existing } = await supabase
      .from('employee_leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_type_id', leaveTypeId)
      .eq('year', year)
      .single();
    
    if (existing) {
      await supabase
        .from('employee_leave_balances')
        .update({ used_days: existing.used_days + daysUsed })
        .eq('id', existing.id);
    }
  };

  // Approve/reject leave request
  const updateLeaveRequestStatus = useMutation({
    mutationFn: async ({
      requestId,
      status,
      rejectionReason,
    }: {
      requestId: string;
      status: 'approved' | 'rejected';
      rejectionReason?: string;
    }) => {
      // Get request details
      const { data: request } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (!request) throw new Error('Request not found');
      
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          rejection_reason: rejectionReason,
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      // If approved, update balance
      if (status === 'approved') {
        await updateLeaveBalance(
          request.employee_id,
          request.leave_type_id,
          request.total_days
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request updated');
    },
  });

  // Add public holiday
  const addHoliday = useMutation({
    mutationFn: async (holiday: Omit<PublicHoliday, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('public_holidays')
        .insert({
          ...holiday,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-holidays'] });
      toast.success('Holiday added');
    },
  });

  return {
    leaveTypes: leaveTypes || [],
    holidays: holidays || [],
    isLoading: typesLoading || holidaysLoading,
    calculateWorkingDays,
    initializeLeaveTypes,
    getEmployeeBalances,
    submitLeaveRequest,
    updateLeaveRequestStatus,
    addHoliday,
  };
}
