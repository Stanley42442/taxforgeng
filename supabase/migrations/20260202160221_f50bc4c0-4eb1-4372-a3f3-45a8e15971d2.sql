-- Remove the old SELECT policy
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;

-- Create new SELECT policy without deleted_at restriction
CREATE POLICY "Users can view own expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);