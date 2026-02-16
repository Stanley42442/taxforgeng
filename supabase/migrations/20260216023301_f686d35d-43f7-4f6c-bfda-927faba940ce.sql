-- Remove the SELECT policy on password_history that exposes password hashes to clients
DROP POLICY IF EXISTS "Users can view their own password history" ON public.password_history;