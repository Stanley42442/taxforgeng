-- Add new columns for enhanced device information
ALTER TABLE public.known_devices
ADD COLUMN IF NOT EXISTS device_type text DEFAULT 'desktop',
ADD COLUMN IF NOT EXISTS device_model text,
ADD COLUMN IF NOT EXISTS browser_version text,
ADD COLUMN IF NOT EXISTS os_version text,
ADD COLUMN IF NOT EXISTS screen_resolution text,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS language text;