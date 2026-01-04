-- Create partners table for API key management
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  api_secret_hash TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'pro', 'enterprise')),
  rate_limit_daily INTEGER NOT NULL DEFAULT 1000,
  requests_today INTEGER NOT NULL DEFAULT 0,
  requests_total BIGINT NOT NULL DEFAULT 0,
  last_request_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  webhook_url TEXT,
  allowed_origins TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Policies for partners table
CREATE POLICY "Users can view their own partners" 
ON public.partners 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partners" 
ON public.partners 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partners" 
ON public.partners 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partners" 
ON public.partners 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create partner_api_logs table for tracking API usage
CREATE TABLE public.partner_api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  request_body JSONB,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_api_logs ENABLE ROW LEVEL SECURITY;

-- Policy for logs - only partner owners can see their logs
CREATE POLICY "Users can view their partner logs" 
ON public.partner_api_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.partners 
    WHERE partners.id = partner_api_logs.partner_id 
    AND partners.user_id = auth.uid()
  )
);

-- Index for faster lookups
CREATE INDEX idx_partners_api_key ON public.partners(api_key);
CREATE INDEX idx_partner_logs_partner_id ON public.partner_api_logs(partner_id);
CREATE INDEX idx_partner_logs_created_at ON public.partner_api_logs(created_at);