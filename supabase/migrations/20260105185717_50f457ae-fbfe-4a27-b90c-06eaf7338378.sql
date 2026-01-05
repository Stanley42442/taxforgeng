-- Add location column to auth_events for storing geolocation data
ALTER TABLE public.auth_events ADD COLUMN IF NOT EXISTS location JSONB DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.auth_events.location IS 'Stores IP geolocation data: city, region, country, etc.';