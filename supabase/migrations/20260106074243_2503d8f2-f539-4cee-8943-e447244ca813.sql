-- Create login_attempts table for rate limiting
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false
);

-- Create index for efficient lookups
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email, attempted_at DESC);
CREATE INDEX idx_login_attempts_ip ON public.login_attempts(ip_address, attempted_at DESC);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow inserts without authentication (for tracking failed attempts before login)
CREATE POLICY "Allow inserts from anyone" 
ON public.login_attempts 
FOR INSERT 
WITH CHECK (true);

-- Only allow reads for authenticated users on their own attempts (by email)
CREATE POLICY "Users can view their own login attempts" 
ON public.login_attempts 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create password_history table
CREATE TABLE public.password_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_password_history_user ON public.password_history(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own password history
CREATE POLICY "Users can insert their own password history" 
ON public.password_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only view their own password history
CREATE POLICY "Users can view their own password history" 
ON public.password_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to check if account is locked
CREATE OR REPLACE FUNCTION public.check_account_locked(check_email TEXT)
RETURNS TABLE(is_locked BOOLEAN, unlock_at TIMESTAMP WITH TIME ZONE, failed_count INTEGER) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lockout_minutes INTEGER := 15;
  max_attempts INTEGER := 5;
  recent_failures INTEGER;
  last_attempt TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Count failed attempts in the last lockout period
  SELECT COUNT(*), MAX(attempted_at) INTO recent_failures, last_attempt
  FROM public.login_attempts
  WHERE login_attempts.email = check_email
    AND success = false
    AND attempted_at > now() - (lockout_minutes || ' minutes')::interval;

  IF recent_failures >= max_attempts THEN
    RETURN QUERY SELECT 
      true::BOOLEAN,
      (last_attempt + (lockout_minutes || ' minutes')::interval),
      recent_failures;
  ELSE
    RETURN QUERY SELECT 
      false::BOOLEAN,
      NULL::TIMESTAMP WITH TIME ZONE,
      recent_failures;
  END IF;
END;
$$;

-- Create function to clear old login attempts (cleanup)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE attempted_at < now() - INTERVAL '24 hours';
END;
$$;