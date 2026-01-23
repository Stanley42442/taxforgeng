-- Enable FULL replica identity for reliable realtime updates on profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;