-- Update any existing 'freelancer' tier users to 'professional'
-- This is a precautionary step for the tier renaming
UPDATE profiles 
SET subscription_tier = 'professional' 
WHERE subscription_tier = 'freelancer';