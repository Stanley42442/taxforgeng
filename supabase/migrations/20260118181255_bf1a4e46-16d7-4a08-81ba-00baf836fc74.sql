-- ========================================
-- FINAL SECURITY HARDENING
-- Ensure all sensitive tables have proper RLS policies
-- ========================================

-- Make sure all important tables have RLS enabled
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.paystack_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.known_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.digital_vat_registrations ENABLE ROW LEVEL SECURITY;

-- Add explicit deny for unauthenticated access to sensitive tables
-- This is defense-in-depth since auth.uid() checks already block anonymous users

-- login_attempts: Need to allow frontend to insert for rate limiting but in a secure way
-- Actually, let's handle login attempts via a security definer function instead
DROP POLICY IF EXISTS "Service role can insert login attempts" ON public.login_attempts;

-- Create a security definer function to insert login attempts safely
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  attempt_email text,
  attempt_success boolean,
  attempt_ip text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_attempts (email, success, ip_address)
  VALUES (attempt_email, attempt_success, attempt_ip);
END;
$$;

-- Grant execute to authenticated and anon (needed for pre-login)
GRANT EXECUTE ON FUNCTION public.record_login_attempt(text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(text, boolean, text) TO anon;

-- Fix payment_audit_log to allow users to view their own records
DROP POLICY IF EXISTS "Users can view their own payment audit logs" ON public.payment_audit_log;
CREATE POLICY "Users can view their own payment audit logs" 
ON public.payment_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix security_events to allow users to view their own security events
DROP POLICY IF EXISTS "Users can view their own security events" ON public.security_events;
CREATE POLICY "Users can view their own security events" 
ON public.security_events 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to view their own waitlist entry
DROP POLICY IF EXISTS "Users can view their own waitlist entry" ON public.waitlist;
CREATE POLICY "Users can view their own waitlist entry" 
ON public.waitlist 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Fix promo_codes - only allow validation via edge function, not direct table access
DROP POLICY IF EXISTS "Authenticated users can view applicable promo codes" ON public.promo_codes;
-- Create a more restrictive policy - users should validate codes via edge function
CREATE POLICY "Users validate codes through edge function" 
ON public.promo_codes 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Ensure login_attempts cannot be read by anyone except via the RPC function
-- Keep existing SELECT policies for users to see their own + admins

-- Create cleanup job for rate limits table
CREATE OR REPLACE FUNCTION public.cleanup_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean old rate limits
  DELETE FROM public.api_rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 day';
  
  -- Clean old security events (keep 90 days)
  DELETE FROM public.security_events 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean old login attempts (keep 7 days)
  DELETE FROM public.login_attempts 
  WHERE attempted_at < NOW() - INTERVAL '7 days';
END;
$$;