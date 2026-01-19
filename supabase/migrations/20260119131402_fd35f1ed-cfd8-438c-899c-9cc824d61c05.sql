-- Add session invalidation tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS session_invalidated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE;

-- Create active sessions tracking table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token_hash TEXT NOT NULL,
  device_fingerprint TEXT,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_reason TEXT,
  CONSTRAINT unique_session_token UNIQUE (session_token_hash)
);

-- RLS for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
ON user_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON user_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
ON user_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token_hash);

-- Create payment verification tokens table for 2FA
CREATE TABLE IF NOT EXISTS payment_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_hash TEXT NOT NULL,
  token_type TEXT NOT NULL,
  operation_data JSONB,
  delivery_method TEXT NOT NULL DEFAULT 'email',
  delivery_target TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_token_type CHECK (token_type IN (
    'subscription_change', 
    'add_payment_method', 
    'remove_payment_method',
    'set_default_payment_method'
  )),
  CONSTRAINT valid_delivery_method CHECK (delivery_method IN ('email', 'sms'))
);

-- RLS for payment_verification_tokens
ALTER TABLE payment_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens"
ON payment_verification_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
ON payment_verification_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
ON payment_verification_tokens FOR UPDATE
USING (auth.uid() = user_id);

-- Indexes for payment_verification_tokens
CREATE INDEX IF NOT EXISTS idx_payment_tokens_user ON payment_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_expires ON payment_verification_tokens(expires_at);

-- Create user payment methods table
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  authorization_code TEXT NOT NULL,
  card_type TEXT NOT NULL,
  last_four TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  bank TEXT,
  country_code TEXT DEFAULT 'NG',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_auth UNIQUE (user_id, authorization_code)
);

-- RLS for user_payment_methods
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
ON user_payment_methods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment methods"
ON user_payment_methods FOR ALL
USING (auth.uid() = user_id);

-- Indexes for user_payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON user_payment_methods(user_id, is_default) WHERE is_default = true;

-- Create payment reconciliation logs table (admin only)
CREATE TABLE IF NOT EXISTS payment_reconciliation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  run_by UUID,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_paystack_transactions INTEGER NOT NULL,
  total_db_transactions INTEGER NOT NULL,
  matched_count INTEGER NOT NULL,
  discrepancy_count INTEGER NOT NULL,
  fixed_count INTEGER DEFAULT 0,
  discrepancies JSONB,
  fixes_applied JSONB,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS for payment_reconciliation_logs
ALTER TABLE payment_reconciliation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reconciliation logs"
ON payment_reconciliation_logs FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  tier TEXT,
  billing_cycle TEXT,
  session_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS for analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics"
ON analytics_events FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can insert analytics"
ON analytics_events FOR INSERT
WITH CHECK (true);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_tier ON analytics_events(tier);

-- Function to invalidate all sessions for a user
CREATE OR REPLACE FUNCTION invalidate_user_sessions(
  target_user_id UUID,
  reason TEXT DEFAULT 'security_action'
)
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Update profiles to mark session invalidation time
  UPDATE profiles 
  SET session_invalidated_at = now() 
  WHERE id = target_user_id;
  
  -- Revoke all active sessions
  UPDATE user_sessions
  SET revoked_at = now(), revoked_reason = reason
  WHERE user_id = target_user_id AND revoked_at IS NULL;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Log security event
  INSERT INTO security_events (event_type, severity, user_id, details)
  VALUES ('sessions_invalidated', 'high', target_user_id, jsonb_build_object(
    'reason', reason,
    'sessions_revoked', affected_count
  ));
  
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired tokens and sessions
CREATE OR REPLACE FUNCTION cleanup_expired_payment_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM payment_verification_tokens 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < NOW() - INTERVAL '7 days'
     OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;