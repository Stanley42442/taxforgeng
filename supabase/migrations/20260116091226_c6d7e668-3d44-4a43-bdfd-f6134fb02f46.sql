-- Create personal_expenses table for tracking tax-relevant personal expenses
CREATE TABLE public.personal_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Expense details
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  
  -- Payment schedule
  payment_interval TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Tax year tracking
  tax_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_personal_expenses_user_year ON public.personal_expenses(user_id, tax_year);
CREATE INDEX idx_personal_expenses_category ON public.personal_expenses(category);

-- Enable Row Level Security
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own personal expenses" 
ON public.personal_expenses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personal expenses" 
ON public.personal_expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal expenses" 
ON public.personal_expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal expenses" 
ON public.personal_expenses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_personal_expenses_updated_at
BEFORE UPDATE ON public.personal_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();