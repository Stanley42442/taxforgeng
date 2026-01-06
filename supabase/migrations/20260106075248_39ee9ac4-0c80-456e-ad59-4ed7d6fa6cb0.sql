-- Create IP whitelist table
CREATE TABLE public.ip_whitelist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ip_range TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, ip_range)
);

-- Enable RLS
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;

-- Users can view their own IP whitelist entries
CREATE POLICY "Users can view their own IP whitelist"
ON public.ip_whitelist
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own IP whitelist entries
CREATE POLICY "Users can create their own IP whitelist entries"
ON public.ip_whitelist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own IP whitelist entries
CREATE POLICY "Users can update their own IP whitelist entries"
ON public.ip_whitelist
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own IP whitelist entries
CREATE POLICY "Users can delete their own IP whitelist entries"
ON public.ip_whitelist
FOR DELETE
USING (auth.uid() = user_id);

-- Add ip_whitelist_enabled column to profiles
ALTER TABLE public.profiles ADD COLUMN ip_whitelist_enabled BOOLEAN NOT NULL DEFAULT false;

-- Create trigger for updated_at
CREATE TRIGGER update_ip_whitelist_updated_at
BEFORE UPDATE ON public.ip_whitelist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if IP is in user's whitelist
CREATE OR REPLACE FUNCTION public.check_ip_whitelist(check_user_id UUID, check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  whitelist_enabled BOOLEAN;
  ip_allowed BOOLEAN;
BEGIN
  -- Check if user has IP whitelist enabled
  SELECT ip_whitelist_enabled INTO whitelist_enabled
  FROM public.profiles
  WHERE id = check_user_id;
  
  -- If whitelist is not enabled, allow all IPs
  IF whitelist_enabled IS NULL OR whitelist_enabled = false THEN
    RETURN true;
  END IF;
  
  -- Check if the IP matches any whitelist entry
  SELECT EXISTS (
    SELECT 1 FROM public.ip_whitelist
    WHERE user_id = check_user_id
      AND is_active = true
      AND (
        -- Exact match
        ip_range = check_ip
        -- CIDR range match (e.g., 192.168.1.0/24)
        OR (ip_range LIKE '%/%' AND check_ip::inet <<= ip_range::inet)
        -- Wildcard match (e.g., 192.168.1.*)
        OR (ip_range LIKE '%*' AND check_ip LIKE REPLACE(ip_range, '*', '%'))
      )
  ) INTO ip_allowed;
  
  RETURN ip_allowed;
END;
$$;