-- Create auth_events table to track security events
CREATE TABLE public.auth_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient user queries
CREATE INDEX idx_auth_events_user_id ON public.auth_events(user_id);
CREATE INDEX idx_auth_events_created_at ON public.auth_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;

-- Users can only view their own auth events
CREATE POLICY "Users can view their own auth events"
ON public.auth_events
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own auth events
CREATE POLICY "Users can create their own auth events"
ON public.auth_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);