-- Fix overly permissive RLS policy on backup_code_attempts
-- Current policy allows anyone to insert, should only allow authenticated users for their own records

DROP POLICY IF EXISTS "Anyone can insert backup code attempts" ON public.backup_code_attempts;

CREATE POLICY "Users can insert their own backup code attempts" 
ON public.backup_code_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also ensure the SELECT policy is properly scoped
DROP POLICY IF EXISTS "Users can view their own backup code attempts" ON public.backup_code_attempts;

CREATE POLICY "Users can view their own backup code attempts" 
ON public.backup_code_attempts 
FOR SELECT 
USING (auth.uid() = user_id);