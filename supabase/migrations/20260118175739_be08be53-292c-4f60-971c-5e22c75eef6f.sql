-- Create function to increment promo code usage count
CREATE OR REPLACE FUNCTION public.increment_promo_usage(promo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE promo_codes
  SET current_uses = COALESCE(current_uses, 0) + 1
  WHERE id = promo_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_promo_usage(uuid) TO authenticated;

-- Fix overly permissive INSERT policies by adding proper WITH CHECK clauses
-- Drop and recreate the policies with proper security

-- Payment transactions - ensure user can only insert their own
DROP POLICY IF EXISTS "Users can insert their own transactions" ON payment_transactions;
CREATE POLICY "Users can insert their own transactions" 
  ON payment_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Loyalty redemptions - ensure user can only insert their own
DROP POLICY IF EXISTS "Users can create their own loyalty redemptions" ON loyalty_redemptions;
CREATE POLICY "Users can create their own loyalty redemptions" 
  ON loyalty_redemptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Promo code redemptions - ensure user can only insert their own
DROP POLICY IF EXISTS "Users can create their own redemptions" ON promo_code_redemptions;
CREATE POLICY "Users can create their own redemptions" 
  ON promo_code_redemptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);