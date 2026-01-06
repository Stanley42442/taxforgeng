-- Add is_blocked column to known_devices table for device blocking functionality
ALTER TABLE public.known_devices ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

-- Add last_country column to track user's typical login location
ALTER TABLE public.known_devices ADD COLUMN IF NOT EXISTS last_country text;
ALTER TABLE public.known_devices ADD COLUMN IF NOT EXISTS last_city text;

-- Add location data columns to auth_events if not exists
ALTER TABLE public.auth_events ADD COLUMN IF NOT EXISTS location jsonb;