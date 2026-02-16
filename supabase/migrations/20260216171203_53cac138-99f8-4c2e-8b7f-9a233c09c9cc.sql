ALTER TABLE public.partners DROP CONSTRAINT partners_tier_check;
ALTER TABLE public.partners ADD CONSTRAINT partners_tier_check CHECK (tier = ANY (ARRAY['basic', 'pro', 'enterprise', 'partner']));