
-- Create partnership_requests table for public backlink partnership form
CREATE TABLE public.partnership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization text NOT NULL,
  website_url text NOT NULL,
  monthly_pageviews text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partnership_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can submit a partnership request
CREATE POLICY "Anyone can submit partnership requests"
  ON public.partnership_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated admins can view/update requests
CREATE POLICY "Admins can view partnership requests"
  ON public.partnership_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update partnership requests"
  ON public.partnership_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );
