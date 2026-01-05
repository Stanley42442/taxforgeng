-- Create table to track failed backup code attempts
CREATE TABLE public.backup_code_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT
);

-- Enable RLS
ALTER TABLE public.backup_code_attempts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert attempts (needed during login before full auth)
CREATE POLICY "Anyone can insert backup code attempts" 
ON public.backup_code_attempts 
FOR INSERT 
WITH CHECK (true);

-- Users can only view their own attempts
CREATE POLICY "Users can view their own attempts" 
ON public.backup_code_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can delete their own attempts (for cleanup after successful login)
CREATE POLICY "Users can delete their own attempts" 
ON public.backup_code_attempts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to clean up old attempts (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_backup_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.backup_code_attempts
  WHERE attempted_at < now() - INTERVAL '1 hour';
END;
$$;

-- Create index for faster lookups
CREATE INDEX idx_backup_code_attempts_user_id ON public.backup_code_attempts(user_id);
CREATE INDEX idx_backup_code_attempts_attempted_at ON public.backup_code_attempts(attempted_at);