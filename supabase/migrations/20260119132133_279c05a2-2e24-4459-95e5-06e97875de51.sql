-- Fix function search paths for new functions
CREATE OR REPLACE FUNCTION invalidate_user_sessions(
  target_user_id UUID,
  reason TEXT DEFAULT 'security_action'
)
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Update profiles to mark session invalidation time
  UPDATE public.profiles 
  SET session_invalidated_at = now() 
  WHERE id = target_user_id;
  
  -- Revoke all active sessions
  UPDATE public.user_sessions
  SET revoked_at = now(), revoked_reason = reason
  WHERE user_id = target_user_id AND revoked_at IS NULL;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Log security event
  INSERT INTO public.security_events (event_type, severity, user_id, details)
  VALUES ('sessions_invalidated', 'high', target_user_id, jsonb_build_object(
    'reason', reason,
    'sessions_revoked', affected_count
  ));
  
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION cleanup_expired_payment_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.payment_verification_tokens 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_sessions 
  WHERE expires_at < NOW() - INTERVAL '7 days'
     OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;