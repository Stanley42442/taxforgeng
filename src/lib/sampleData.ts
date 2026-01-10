import { supabase } from "@/integrations/supabase/client";

const SAMPLE_EXPENSES = [
  // Income entries - spread across 3 months
  { description: 'Client Payment - ABC Corp', amount: 2500000, category: 'income', type: 'income', isDeductible: false, daysAgo: 2 },
  { description: 'Consulting Fee - TechStart Ltd', amount: 1200000, category: 'income', type: 'income', isDeductible: false, daysAgo: 8 },
  { description: 'Product Sales - Q4 Revenue', amount: 3800000, category: 'income', type: 'income', isDeductible: false, daysAgo: 15 },
  { description: 'Service Contract Payment', amount: 950000, category: 'income', type: 'income', isDeductible: false, daysAgo: 35 },
  { description: 'Retainer Fee - Monthly', amount: 450000, category: 'income', type: 'income', isDeductible: false, daysAgo: 45 },
  { description: 'Commission Income', amount: 680000, category: 'income', type: 'income', isDeductible: false, daysAgo: 65 },
  { description: 'Freelance Project Payment', amount: 520000, category: 'income', type: 'income', isDeductible: false, daysAgo: 75 },
  
  // Expense entries - spread across 3 months
  { description: 'Office Rent - December', amount: 350000, category: 'rent', type: 'expense', isDeductible: true, daysAgo: 1 },
  { description: 'Staff Salaries', amount: 1200000, category: 'salary', type: 'expense', isDeductible: true, daysAgo: 3 },
  { description: 'Internet & Phone Bills', amount: 45000, category: 'utilities', type: 'expense', isDeductible: true, daysAgo: 5 },
  { description: 'Office Supplies', amount: 28000, category: 'supplies', type: 'expense', isDeductible: true, daysAgo: 7 },
  { description: 'Transport - Client Meetings', amount: 65000, category: 'transport', type: 'expense', isDeductible: true, daysAgo: 10 },
  { description: 'Facebook Ads Campaign', amount: 150000, category: 'marketing', type: 'expense', isDeductible: true, daysAgo: 12 },
  { description: 'NEPA/Electricity Bill', amount: 35000, category: 'utilities', type: 'expense', isDeductible: true, daysAgo: 18 },
  { description: 'Office Rent - November', amount: 350000, category: 'rent', type: 'expense', isDeductible: true, daysAgo: 32 },
  { description: 'Staff Salaries - November', amount: 1200000, category: 'salary', type: 'expense', isDeductible: true, daysAgo: 35 },
  { description: 'Google Ads Spend', amount: 120000, category: 'marketing', type: 'expense', isDeductible: true, daysAgo: 40 },
  { description: 'Fuel & Generator', amount: 55000, category: 'transport', type: 'expense', isDeductible: true, daysAgo: 48 },
  { description: 'Office Rent - October', amount: 350000, category: 'rent', type: 'expense', isDeductible: true, daysAgo: 62 },
  { description: 'Staff Salaries - October', amount: 1100000, category: 'salary', type: 'expense', isDeductible: true, daysAgo: 65 },
  { description: 'Software Subscriptions', amount: 85000, category: 'other', type: 'expense', isDeductible: true, daysAgo: 70 },
  { description: 'Marketing Materials', amount: 95000, category: 'marketing', type: 'expense', isDeductible: true, daysAgo: 78 },
];

const SAMPLE_BUSINESS = {
  name: 'Demo Business Ltd',
  entityType: 'company',
  turnover: 25000000,
  cacVerified: false,
};

export const seedSampleData = async (userId: string): Promise<{ businessId: string | null; success: boolean }> => {
  try {
    // Check if user already has expenses
    const { data: existingExpenses } = await supabase
      .from('expenses')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingExpenses && existingExpenses.length > 0) {
      // User already has expenses, don't seed
      return { businessId: null, success: true };
    }

    // Also check if user already has businesses
    const { data: existingBusinesses } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingBusinesses && existingBusinesses.length > 0) {
      // User has businesses but no expenses - return existing business ID
      return { businessId: existingBusinesses[0].id, success: true };
    }

    // Create sample business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        user_id: userId,
        name: SAMPLE_BUSINESS.name,
        entity_type: SAMPLE_BUSINESS.entityType,
        turnover: SAMPLE_BUSINESS.turnover,
        cac_verified: SAMPLE_BUSINESS.cacVerified,
      })
      .select()
      .single();

    if (businessError) {
      console.error('Error creating sample business:', businessError);
      return { businessId: null, success: false };
    }

    // Create sample expenses linked to the business
    const today = new Date();
    const expenseInserts = SAMPLE_EXPENSES.map(expense => {
      const date = new Date(today);
      date.setDate(date.getDate() - expense.daysAgo);
      
      return {
        user_id: userId,
        business_id: business.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        type: expense.type,
        is_deductible: expense.isDeductible,
        date: date.toISOString().split('T')[0],
      };
    });

    const { error: expenseError } = await supabase
      .from('expenses')
      .insert(expenseInserts);

    if (expenseError) {
      console.error('Error creating sample expenses:', expenseError);
      return { businessId: business.id, success: false };
    }

    return { businessId: business.id, success: true };
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return { businessId: null, success: false };
  }
};

export const checkHasSampleData = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('expenses')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  
  return !!(data && data.length > 0);
};
