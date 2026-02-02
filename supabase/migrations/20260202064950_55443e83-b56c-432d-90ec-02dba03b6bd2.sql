-- Drop the existing update policy that doesn't have proper WITH CHECK
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;

-- Recreate with proper WITH CHECK clause that allows deleted_at changes
CREATE POLICY "Users can update their own expenses"
  ON expenses
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);