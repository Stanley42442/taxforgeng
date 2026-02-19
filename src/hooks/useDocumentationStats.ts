import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface DocumentationStats {
  totalUsers: number;
  totalBusinesses: number;
  totalCalculations: number;
  totalExpenses: number;
  totalInvoices: number;
  totalReminders: number;
  totalAiQueries: number;
  totalIndividualCalcs: number;
}

export const useDocumentationStats = () => {
  return useQuery({
    queryKey: ['documentation-stats'],
    queryFn: async (): Promise<DocumentationStats> => {
      // Fetch counts from multiple tables in parallel
      const [
        usersResult,
        businessesResult,
        calculationsResult,
        expensesResult,
        invoicesResult,
        remindersResult,
        aiQueriesResult,
        individualCalcsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('tax_calculations').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('expenses').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('reminders').select('*', { count: 'exact', head: true }),
        supabase.from('ai_queries').select('*', { count: 'exact', head: true }),
        supabase.from('individual_calculations').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: usersResult.count ?? 0,
        totalBusinesses: businessesResult.count ?? 0,
        totalCalculations: calculationsResult.count ?? 0,
        totalExpenses: expensesResult.count ?? 0,
        totalInvoices: invoicesResult.count ?? 0,
        totalReminders: remindersResult.count ?? 0,
        totalAiQueries: aiQueriesResult.count ?? 0,
        totalIndividualCalcs: individualCalcsResult.count ?? 0,
      };
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    staleTime: 5 * 60 * 1000,
  });
};
