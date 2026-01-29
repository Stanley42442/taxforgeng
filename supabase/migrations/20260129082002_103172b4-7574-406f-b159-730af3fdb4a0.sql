-- Enable realtime for businesses table to sync state across all pages
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;