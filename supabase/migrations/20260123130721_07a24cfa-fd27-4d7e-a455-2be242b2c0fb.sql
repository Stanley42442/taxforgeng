-- Step 1: Drop the old check constraint and add all tiers
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier = ANY (ARRAY['free'::text, 'starter'::text, 'basic'::text, 'professional'::text, 'business'::text, 'corporate'::text]));

-- Step 2: Create missing profiles for existing users
INSERT INTO public.profiles (id, email, full_name, subscription_tier)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  'free'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Step 3: Create missing user_roles entries
INSERT INTO public.user_roles (user_id, role)
SELECT 
  u.id,
  'user'::public.app_role
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id);

-- Step 4: Create the missing trigger to auto-create profiles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();