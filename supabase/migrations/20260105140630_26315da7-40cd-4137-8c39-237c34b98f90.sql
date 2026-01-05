-- Add trial tracking fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS has_selected_initial_tier boolean NOT NULL DEFAULT false;

-- Create function to check and expire trials daily
CREATE OR REPLACE FUNCTION public.check_expired_trials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET subscription_tier = 'free',
      trial_expires_at = NULL,
      trial_started_at = NULL
  WHERE trial_expires_at IS NOT NULL 
    AND trial_expires_at < now()
    AND subscription_tier = 'business';
END;
$$;