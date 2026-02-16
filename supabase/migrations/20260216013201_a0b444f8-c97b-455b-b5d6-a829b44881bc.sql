
-- Add window tracking columns for auto-reset rate limiting
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS rate_limit_window_start TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS requests_this_minute INTEGER DEFAULT 0;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS minute_window_start TIMESTAMPTZ DEFAULT now();

-- Update default daily rate limit to 10,000
ALTER TABLE public.partners ALTER COLUMN rate_limit_daily SET DEFAULT 10000;

-- Update existing partners based on tier
UPDATE public.partners SET rate_limit_daily = 10000 WHERE tier = 'basic' AND rate_limit_daily <= 1000;
UPDATE public.partners SET rate_limit_daily = 100000 WHERE tier = 'pro' AND rate_limit_daily <= 1000;
UPDATE public.partners SET rate_limit_daily = 1000000 WHERE tier = 'enterprise' AND rate_limit_daily <= 1000;

-- For partners with no tier set, bump to 10000 if still at 1000
UPDATE public.partners SET rate_limit_daily = 10000 WHERE rate_limit_daily <= 1000;
