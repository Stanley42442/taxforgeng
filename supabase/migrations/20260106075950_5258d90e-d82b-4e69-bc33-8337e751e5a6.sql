-- Add time-based access restriction columns to profiles
ALTER TABLE public.profiles ADD COLUMN time_restrictions_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN allowed_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6]; -- 0=Sunday, 6=Saturday
ALTER TABLE public.profiles ADD COLUMN allowed_start_hour INTEGER DEFAULT 0; -- 0-23
ALTER TABLE public.profiles ADD COLUMN allowed_end_hour INTEGER DEFAULT 24; -- 0-24 (24 means end of day)
ALTER TABLE public.profiles ADD COLUMN time_restriction_timezone TEXT DEFAULT 'UTC';

-- Create function to check if current time is within allowed hours
CREATE OR REPLACE FUNCTION public.check_time_restrictions(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  time_enabled BOOLEAN;
  allowed_days_arr INTEGER[];
  start_hour INTEGER;
  end_hour INTEGER;
  user_tz TEXT;
  current_day INTEGER;
  current_hour INTEGER;
BEGIN
  -- Get user's time restriction settings
  SELECT 
    time_restrictions_enabled,
    allowed_days,
    allowed_start_hour,
    allowed_end_hour,
    time_restriction_timezone
  INTO 
    time_enabled,
    allowed_days_arr,
    start_hour,
    end_hour,
    user_tz
  FROM public.profiles
  WHERE id = check_user_id;
  
  -- If restrictions not enabled, allow login
  IF time_enabled IS NULL OR time_enabled = false THEN
    RETURN true;
  END IF;
  
  -- Get current day and hour in user's timezone
  current_day := EXTRACT(DOW FROM (now() AT TIME ZONE COALESCE(user_tz, 'UTC')));
  current_hour := EXTRACT(HOUR FROM (now() AT TIME ZONE COALESCE(user_tz, 'UTC')));
  
  -- Check if current day is allowed
  IF NOT (current_day = ANY(COALESCE(allowed_days_arr, ARRAY[0,1,2,3,4,5,6]))) THEN
    RETURN false;
  END IF;
  
  -- Check if current hour is within allowed range
  IF current_hour < COALESCE(start_hour, 0) OR current_hour >= COALESCE(end_hour, 24) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;