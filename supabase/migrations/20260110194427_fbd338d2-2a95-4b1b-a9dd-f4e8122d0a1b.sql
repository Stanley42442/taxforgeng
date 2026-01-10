-- Clean up duplicate reminders (keep only the first one per user/type combination)
DELETE FROM public.reminders
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, reminder_type) id
  FROM public.reminders
  ORDER BY user_id, reminder_type, created_at ASC
);

-- Add a unique constraint to prevent future duplicates (user_id, reminder_type, business_id)
-- Only for non-custom reminders since users can have multiple custom reminders
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_reminder_per_user_type_business 
ON public.reminders (user_id, reminder_type, COALESCE(business_id, '00000000-0000-0000-0000-000000000000'))
WHERE reminder_type != 'custom';