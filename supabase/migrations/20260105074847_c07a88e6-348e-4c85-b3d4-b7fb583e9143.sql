-- Create table to store known devices
CREATE TABLE public.known_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  browser TEXT,
  os TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_trusted BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, device_fingerprint)
);

-- Enable RLS
ALTER TABLE public.known_devices ENABLE ROW LEVEL SECURITY;

-- Users can view their own devices
CREATE POLICY "Users can view their own devices" 
ON public.known_devices 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own devices
CREATE POLICY "Users can insert their own devices" 
ON public.known_devices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own devices
CREATE POLICY "Users can update their own devices" 
ON public.known_devices 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own devices
CREATE POLICY "Users can delete their own devices" 
ON public.known_devices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_known_devices_user_id ON public.known_devices(user_id);
CREATE INDEX idx_known_devices_fingerprint ON public.known_devices(device_fingerprint);