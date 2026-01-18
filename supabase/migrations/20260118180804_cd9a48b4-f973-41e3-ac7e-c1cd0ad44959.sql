-- ========================================
-- COMPREHENSIVE SECURITY HARDENING (Fixed)
-- Fixes critical vulnerabilities found in security audit
-- ========================================

-- 1. FIX CRITICAL: login_attempts table - prevent email harvesting
DROP POLICY IF EXISTS "Anyone can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Users can view their own login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Public insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Service role can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Users can view attempts for their own email" ON public.login_attempts;
DROP POLICY IF EXISTS "Admins can view all login attempts" ON public.login_attempts;

-- Create secure policies - only service role can insert, admins can view
CREATE POLICY "Service role can insert login attempts" 
ON public.login_attempts 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Authenticated users can only see attempts for their own email
CREATE POLICY "Users can view attempts for their own email" 
ON public.login_attempts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can view all for security monitoring
CREATE POLICY "Admins can view all login attempts" 
ON public.login_attempts 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 2. FIX CRITICAL: waitlist table - prevent spam and email exposure
DROP POLICY IF EXISTS "Anyone can sign up for waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Users can view all waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated users can sign up for waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Only admins can view waitlist" ON public.waitlist;

-- Require authentication for waitlist signups (prevents spam bots)
CREATE POLICY "Authenticated users can sign up for waitlist" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can view waitlist entries
CREATE POLICY "Only admins can view waitlist" 
ON public.waitlist 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 3. FIX: promo_codes - restrict public visibility of competitive pricing data
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Authenticated users can view applicable promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can manage all promo codes" ON public.promo_codes;

-- Only authenticated users actively checking out can validate codes
CREATE POLICY "Authenticated users can view applicable promo codes" 
ON public.promo_codes 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Admins can view and manage all promo codes
CREATE POLICY "Admins can manage all promo codes" 
ON public.promo_codes 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 4. FIX: paystack_plans - restrict internal plan details
DROP POLICY IF EXISTS "Anyone can view plans" ON public.paystack_plans;
DROP POLICY IF EXISTS "Authenticated users can view active plans" ON public.paystack_plans;

-- Only authenticated users can view active plans
CREATE POLICY "Authenticated users can view active plans" 
ON public.paystack_plans 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- 5. FIX: referral_discount_codes - prevent enumeration attacks
DROP POLICY IF EXISTS "Users can use referral codes for validation" ON public.referral_discount_codes;
DROP POLICY IF EXISTS "Users can view their own referral codes" ON public.referral_discount_codes;

-- Users can only see their own referral codes
CREATE POLICY "Users can view their own referral codes" 
ON public.referral_discount_codes 
FOR SELECT 
USING (auth.uid() = owner_user_id);

-- 6. FIX: payment_audit_log - restrict to service role only
DROP POLICY IF EXISTS "System can insert audit logs" ON public.payment_audit_log;
DROP POLICY IF EXISTS "Only service role can insert payment audit logs" ON public.payment_audit_log;
DROP POLICY IF EXISTS "Admins can view payment audit logs" ON public.payment_audit_log;

CREATE POLICY "Only service role can insert payment audit logs" 
ON public.payment_audit_log 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Admins can view payment audit logs
CREATE POLICY "Admins can view payment audit logs" 
ON public.payment_audit_log 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 7. FIX: notification_deliveries - add user validation
DROP POLICY IF EXISTS "Service role can insert notification deliveries" ON public.notification_deliveries;
DROP POLICY IF EXISTS "Service role can insert validated notification deliveries" ON public.notification_deliveries;

CREATE POLICY "Service role can insert validated notification deliveries" 
ON public.notification_deliveries 
FOR INSERT 
TO service_role
WITH CHECK (user_id IS NOT NULL);

-- 8. Add rate limiting table for additional protection
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.api_rate_limits (identifier, endpoint, window_start);

-- Auto-cleanup old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.api_rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 day';
END;
$$;

-- Enable RLS on rate limits table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Service role manages rate limits" ON public.api_rate_limits;

CREATE POLICY "Service role manages rate limits" 
ON public.api_rate_limits 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 9. Add security event logging table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  user_id uuid,
  ip_address text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for security monitoring
CREATE INDEX IF NOT EXISTS idx_security_events_lookup ON public.security_events (event_type, severity, created_at DESC);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Service role can log security events" ON public.security_events;
DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;

CREATE POLICY "Service role can log security events" 
ON public.security_events 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));