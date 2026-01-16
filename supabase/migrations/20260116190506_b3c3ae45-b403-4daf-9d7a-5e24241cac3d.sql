-- Create subscription_history table to track all tier changes
CREATE TABLE public.subscription_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  previous_tier TEXT,
  new_tier TEXT NOT NULL,
  change_type TEXT NOT NULL DEFAULT 'upgrade', -- 'upgrade', 'downgrade', 'trial_start', 'trial_end'
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscription history"
  ON public.subscription_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription history"
  ON public.subscription_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_subscription_history_user_id ON public.subscription_history(user_id);
CREATE INDEX idx_subscription_history_created_at ON public.subscription_history(created_at DESC);

-- Create a table to preserve user data snapshots when downgrading
CREATE TABLE public.tier_data_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot_tier TEXT NOT NULL, -- The tier data belongs to
  data_type TEXT NOT NULL, -- 'businesses', 'invoices', 'expenses', etc.
  data_count INTEGER NOT NULL DEFAULT 0,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.tier_data_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for snapshots
CREATE POLICY "Users can view their own data snapshots"
  ON public.tier_data_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data snapshots"
  ON public.tier_data_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data snapshots"
  ON public.tier_data_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_tier_data_snapshots_user_id ON public.tier_data_snapshots(user_id);