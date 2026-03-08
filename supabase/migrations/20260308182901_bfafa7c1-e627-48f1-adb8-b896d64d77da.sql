-- Insert missing profile for stuck user
INSERT INTO public.profiles (id, email, subscription_tier)
VALUES ('c34c22a5-0edb-4b0e-9bbc-9502a1f8d59b', 'benjamingillespie001@gmail.com', 'free')
ON CONFLICT (id) DO NOTHING;

-- Harden the handle_new_user trigger to use ON CONFLICT DO NOTHING
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, subscription_tier)
  VALUES (NEW.id, NEW.email, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;