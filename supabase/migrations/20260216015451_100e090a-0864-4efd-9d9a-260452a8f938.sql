
-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Users can create their own partners" ON public.partners;

-- Create a new INSERT policy that allows:
-- 1. Regular users to create non-partner tier keys (scoped to their own user_id)
-- 2. Only admins to create partner-tier keys
CREATE POLICY "Users can create own keys, admins can create partner keys"
ON public.partners
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (tier != 'partner' OR public.has_role(auth.uid(), 'admin'))
);
