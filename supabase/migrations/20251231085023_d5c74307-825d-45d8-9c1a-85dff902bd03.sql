-- Add a column to track when we last sent an email notification for a reminder
ALTER TABLE public.reminders 
ADD COLUMN last_notified_at TIMESTAMP WITH TIME ZONE;