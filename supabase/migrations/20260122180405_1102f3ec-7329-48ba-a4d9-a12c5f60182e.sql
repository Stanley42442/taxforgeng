-- Add new profile fields for enhanced signup and tiered KYC system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by_code text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_accepted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS refund_policy_accepted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state_of_residence text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_status text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tin text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_level integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_registered_business boolean;

-- Update handle_new_user function to capture terms acceptance from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    terms_accepted_at,
    privacy_accepted_at,
    refund_policy_accepted_at,
    referred_by_code,
    referral_source
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    CASE WHEN (NEW.raw_user_meta_data ->> 'terms_accepted')::boolean = true 
         THEN now() 
         ELSE NULL 
    END,
    CASE WHEN (NEW.raw_user_meta_data ->> 'privacy_accepted')::boolean = true 
         THEN now() 
         ELSE NULL 
    END,
    CASE WHEN (NEW.raw_user_meta_data ->> 'refund_policy_accepted')::boolean = true 
         THEN now() 
         ELSE NULL 
    END,
    NEW.raw_user_meta_data ->> 'referred_by_code',
    NEW.raw_user_meta_data ->> 'referral_source'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;