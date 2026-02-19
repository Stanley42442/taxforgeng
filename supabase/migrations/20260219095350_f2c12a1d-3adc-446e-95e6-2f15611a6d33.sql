
ALTER TABLE public.partnership_requests
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewer_note text;
