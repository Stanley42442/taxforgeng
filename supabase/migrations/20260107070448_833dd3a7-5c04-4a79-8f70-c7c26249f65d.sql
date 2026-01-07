-- Allow admins to view all AI queries for analytics
CREATE POLICY "Admins can view all ai_queries"
ON public.ai_queries
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));