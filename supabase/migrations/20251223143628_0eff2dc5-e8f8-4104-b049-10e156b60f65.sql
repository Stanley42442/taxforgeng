-- Add missing columns to waitlist
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS feature_interest TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update feedback table to allow null message
ALTER TABLE public.feedback ALTER COLUMN message DROP NOT NULL;