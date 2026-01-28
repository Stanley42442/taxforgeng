-- ============================================
-- Phase 6: Complete PWA Enhancements
-- ============================================

-- 1. Web Vitals performance metrics table
CREATE TABLE IF NOT EXISTS public.web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_rating TEXT CHECK (metric_rating IN ('good', 'needs-improvement', 'poor')),
  metric_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  connection_type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

-- Anyone can insert vitals (performance data needs to be captured)
CREATE POLICY "Anyone can insert web vitals" ON public.web_vitals
  FOR INSERT WITH CHECK (true);

-- Only admins can read vitals
CREATE POLICY "Admins can view web vitals" ON public.web_vitals
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for analytics queries
CREATE INDEX idx_web_vitals_created_at ON public.web_vitals(created_at DESC);
CREATE INDEX idx_web_vitals_metric_name ON public.web_vitals(metric_name);
CREATE INDEX idx_web_vitals_rating ON public.web_vitals(metric_rating);

-- 2. Rate Limiting Triggers

-- Rate limit function for error_logs (max 10 per minute per user_agent)
CREATE OR REPLACE FUNCTION public.check_error_log_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.error_logs
  WHERE user_agent = NEW.user_agent
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded for error logging';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_error_log_rate_limit
  BEFORE INSERT ON public.error_logs
  FOR EACH ROW EXECUTE FUNCTION public.check_error_log_rate_limit();

-- Rate limit function for web_vitals (max 50 per minute per user_agent)
CREATE OR REPLACE FUNCTION public.check_web_vitals_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.web_vitals
  WHERE user_agent = NEW.user_agent
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_count >= 50 THEN
    RAISE EXCEPTION 'Rate limit exceeded for web vitals';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_web_vitals_rate_limit
  BEFORE INSERT ON public.web_vitals
  FOR EACH ROW EXECUTE FUNCTION public.check_web_vitals_rate_limit();

-- 3. Cleanup function for retention policy
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Delete error logs older than 30 days
  DELETE FROM public.error_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete web vitals older than 90 days
  DELETE FROM public.web_vitals
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  RAISE NOTICE 'Cleaned up old logs at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;