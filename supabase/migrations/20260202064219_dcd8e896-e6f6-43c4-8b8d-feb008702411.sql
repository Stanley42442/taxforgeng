-- Add policy to allow restoring soft-deleted expenses
-- This enables the "Undo" functionality after deleting an expense
CREATE POLICY "Users can restore their own deleted expenses"
  ON expenses
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL)
  WITH CHECK (auth.uid() = user_id);