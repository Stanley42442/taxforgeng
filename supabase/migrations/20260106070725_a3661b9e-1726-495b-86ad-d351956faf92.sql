-- Allow users to delete their own auth events for privacy
CREATE POLICY "Users can delete their own auth events"
ON public.auth_events
FOR DELETE
USING (auth.uid() = user_id);