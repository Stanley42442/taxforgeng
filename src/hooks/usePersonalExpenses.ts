import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateAnnualAmount, PERSONAL_EXPENSE_CATEGORIES } from '@/lib/personalExpenseCategories';
import { toast } from 'sonner';
import logger from '@/lib/logger';
import { getErrorMessage } from '@/lib/errorUtils';

export interface PersonalExpense {
  id: string;
  user_id: string;
  category: string;
  description: string | null;
  amount: number;
  payment_interval: string;
  start_date: string;
  end_date: string | null;
  tax_year: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnualTotals {
  rent: number;
  pension_contribution: number;
  nhf_contribution: number;
  health_insurance: number;
  life_insurance: number;
  child_education: number;
  dependent_care: number;
  disability_support: number;
  gratuity_received: number;
  other: number;
}

export interface PersonalExpenseInput {
  category: string;
  description?: string;
  amount: number;
  payment_interval: string;
  start_date: string;
  end_date?: string | null;
  tax_year: number;
  is_active?: boolean;
  notes?: string;
}

export function usePersonalExpenses(taxYear?: number) {
  const { user } = useAuth();
  const currentYear = taxYear || new Date().getFullYear();
  
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('tax_year', currentYear)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setExpenses(data || []);
      setError(null);
    } catch (err) {
      const message = getErrorMessage(err);
      logger.error('Error fetching personal expenses:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, currentYear]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (expense: PersonalExpenseInput): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to add expenses');
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from('personal_expenses')
        .insert({
          user_id: user.id,
          ...expense
        });

      if (insertError) throw insertError;
      
      toast.success('Expense added successfully');
      await fetchExpenses();
      return true;
    } catch (err) {
      logger.error('Error adding personal expense:', err);
      toast.error('Failed to add expense');
      return false;
    }
  };

  const updateExpense = async (id: string, updates: Partial<PersonalExpenseInput>): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update expenses');
      return false;
    }

    try {
      const { error: updateError } = await supabase
        .from('personal_expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      toast.success('Expense updated successfully');
      await fetchExpenses();
      return true;
    } catch (err) {
      logger.error('Error updating personal expense:', err);
      toast.error('Failed to update expense');
      return false;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete expenses');
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('personal_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      toast.success('Expense deleted successfully');
      await fetchExpenses();
      return true;
    } catch (err) {
      logger.error('Error deleting personal expense:', err);
      toast.error('Failed to delete expense');
      return false;
    }
  };

  // Calculate annual totals for each category
  const annualTotals: AnnualTotals = expenses.reduce((totals, expense) => {
    const annualAmount = calculateAnnualAmount(
      Number(expense.amount),
      expense.payment_interval,
      expense.start_date ? new Date(expense.start_date) : undefined,
      expense.end_date ? new Date(expense.end_date) : undefined,
      currentYear
    );
    
    const category = expense.category as keyof AnnualTotals;
    if (category in totals) {
      totals[category] += annualAmount;
    }
    
    return totals;
  }, {
    rent: 0,
    pension_contribution: 0,
    nhf_contribution: 0,
    health_insurance: 0,
    life_insurance: 0,
    child_education: 0,
    dependent_care: 0,
    disability_support: 0,
    gratuity_received: 0,
    other: 0
  } as AnnualTotals);

  // Count unique children (child_education entries)
  const numberOfChildren = expenses.filter(e => e.category === 'child_education').length;
  
  // Count unique dependents (dependent_care entries)
  const numberOfDependents = expenses.filter(e => e.category === 'dependent_care').length;
  
  // Check if user has disability support expenses
  const hasDisability = expenses.some(e => e.category === 'disability_support');

  // Get total deductible amount
  const totalDeductible = Object.values(annualTotals).reduce((sum, val) => sum + val, 0);

  return {
    expenses,
    loading,
    error,
    annualTotals,
    numberOfChildren,
    numberOfDependents,
    hasDisability,
    totalDeductible,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses
  };
}
