-- Enable realtime for auth_events table
ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_events;