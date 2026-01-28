import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PayrollTemplate {
  id: string;
  user_id: string;
  business_id?: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  entries?: PayrollTemplateEntry[];
}

export interface PayrollTemplateEntry {
  id: string;
  template_id: string;
  employee_id?: string;
  employee_name: string;
  gross_salary: number;
  include_nhf: boolean;
  position?: string;
  department?: string;
  sort_order: number;
  created_at: string;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  business_id?: string;
  is_default?: boolean;
  entries: {
    employee_id?: string;
    employee_name: string;
    gross_salary: number;
    include_nhf?: boolean;
    position?: string;
    department?: string;
  }[];
}

export function usePayrollTemplates(businessId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['payroll-templates', user?.id, businessId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('payroll_templates')
        .select(`
          *,
          payroll_template_entries(*)
        `)
        .eq('user_id', user.id)
        .order('name');
      
      if (businessId) {
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data?.map(template => ({
        ...template,
        entries: template.payroll_template_entries || [],
      })) as PayrollTemplate[];
    },
    enabled: !!user,
  });

  const defaultTemplate = templates?.find(t => t.is_default);

  const createTemplate = useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      if (!user) throw new Error('Not authenticated');
      
      // If this is set as default, unset other defaults
      if (input.is_default) {
        await supabase
          .from('payroll_templates')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
      
      // Create template
      const { data: template, error: templateError } = await supabase
        .from('payroll_templates')
        .insert({
          user_id: user.id,
          business_id: input.business_id,
          name: input.name,
          description: input.description,
          is_default: input.is_default || false,
        })
        .select()
        .single();
      
      if (templateError) throw templateError;
      
      // Create entries
      const entries = input.entries.map((entry, index) => ({
        template_id: template.id,
        employee_id: entry.employee_id,
        employee_name: entry.employee_name,
        gross_salary: entry.gross_salary,
        include_nhf: entry.include_nhf ?? true,
        position: entry.position,
        department: entry.department,
        sort_order: index,
      }));
      
      const { error: entriesError } = await supabase
        .from('payroll_template_entries')
        .insert(entries);
      
      if (entriesError) throw entriesError;
      
      return template as PayrollTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-templates'] });
      toast.success('Template saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save template: ' + error.message);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<PayrollTemplate, 'name' | 'description' | 'is_default'>> 
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // If setting as default, unset others
      if (updates.is_default) {
        await supabase
          .from('payroll_templates')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
      
      const { data, error } = await supabase
        .from('payroll_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-templates'] });
      toast.success('Template updated');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payroll_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-templates'] });
      toast.success('Template deleted');
    },
  });

  // Load template entries for payroll
  const loadTemplate = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    return template?.entries || [];
  };

  return {
    templates: templates || [],
    defaultTemplate,
    isLoading,
    refetch,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    loadTemplate,
  };
}
