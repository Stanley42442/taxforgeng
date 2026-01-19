-- Enable realtime for profiles table to allow real-time tier updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;