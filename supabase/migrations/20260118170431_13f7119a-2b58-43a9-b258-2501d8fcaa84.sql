-- =============================================
-- TAXFORGE NG: PAYMENT & REWARDS SYSTEM TABLES
-- =============================================

-- Table 1: payment_transactions - All payment attempts
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in kobo (₦1 = 100 kobo)
  original_amount INTEGER, -- before discounts
  discount_amount INTEGER DEFAULT 0,
  discount_code TEXT,
  discount_type TEXT, -- 'promo', 'referral', 'loyalty', 'combined'
  tier TEXT NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly' or 'annually'
  status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed', 'refunded'
  receipt_number TEXT,
  paystack_response JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table 2: paystack_subscriptions - Active subscriptions
CREATE TABLE public.paystack_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_code TEXT UNIQUE NOT NULL,
  plan_code TEXT NOT NULL,
  customer_code TEXT NOT NULL,
  authorization_code TEXT,
  email_token TEXT,
  tier TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'non-renewing', 'attention'
  next_payment_date TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  failed_payments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table 3: paystack_plans - Paystack plan codes
CREATE TABLE public.paystack_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  plan_code TEXT NOT NULL DEFAULT '',
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'NGN',
  interval TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tier, billing_cycle)
);

-- Table 4: promo_codes - Admin-managed promo codes
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value INTEGER NOT NULL,
  applicable_tiers TEXT[],
  applicable_billing_cycles TEXT[],
  min_purchase_amount INTEGER,
  max_discount_amount INTEGER,
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  first_purchase_only BOOLEAN DEFAULT false,
  new_users_only BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table 5: promo_code_redemptions - Promo code usage tracking
CREATE TABLE public.promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_reference TEXT,
  tier TEXT NOT NULL,
  original_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL,
  final_amount INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- Table 6: referral_discount_codes - Auto-generated referral discounts
CREATE TABLE public.referral_discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL, -- 'referrer' or 'invitee'
  discount_percentage INTEGER DEFAULT 20,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  used_for_transaction TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 7: loyalty_points_transactions - Points earning/spending log
CREATE TABLE public.loyalty_points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  action_reference TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 8: loyalty_redemptions - Points redeemed for discounts
CREATE TABLE public.loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  discount_percentage INTEGER NOT NULL,
  discount_code TEXT UNIQUE NOT NULL,
  transaction_reference TEXT,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 9: cancellation_feedback - Subscription cancellation feedback
CREATE TABLE public.cancellation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.paystack_subscriptions(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  reason_category TEXT,
  other_reason TEXT,
  suggestions TEXT,
  would_return TEXT,
  previous_tier TEXT,
  tenure_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 10: payment_audit_log - Audit trail for all payment actions
CREATE TABLE public.payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_reference ON public.payment_transactions(reference);
CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions(created_at);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);

CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_redemptions_user ON public.promo_code_redemptions(user_id);
CREATE INDEX idx_promo_redemptions_code ON public.promo_code_redemptions(promo_code_id);

CREATE INDEX idx_referral_codes_owner ON public.referral_discount_codes(owner_user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_discount_codes(code);

CREATE INDEX idx_loyalty_points_user ON public.loyalty_points_transactions(user_id);
CREATE INDEX idx_loyalty_points_created ON public.loyalty_points_transactions(created_at);
CREATE INDEX idx_loyalty_points_action ON public.loyalty_points_transactions(action_type, user_id, created_at);

CREATE INDEX idx_payment_audit_user ON public.payment_audit_log(user_id);
CREATE INDEX idx_payment_audit_created ON public.payment_audit_log(created_at);

-- =============================================
-- MODIFY EXISTING TABLES
-- =============================================

-- Add discount code references to referrals table
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS referrer_discount_code_id UUID REFERENCES public.referral_discount_codes(id),
ADD COLUMN IF NOT EXISTS invitee_discount_code_id UUID REFERENCES public.referral_discount_codes(id);

-- =============================================
-- SEED DATA FOR PAYSTACK PLANS
-- =============================================

INSERT INTO public.paystack_plans (tier, billing_cycle, plan_code, amount, interval) VALUES
('starter', 'monthly', '', 50000, 'monthly'),
('starter', 'annually', '', 500000, 'annually'),
('basic', 'monthly', '', 200000, 'monthly'),
('basic', 'annually', '', 2000000, 'annually'),
('professional', 'monthly', '', 499900, 'monthly'),
('professional', 'annually', '', 4999000, 'annually'),
('business', 'monthly', '', 899900, 'monthly'),
('business', 'annually', '', 8999000, 'annually');

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- payment_transactions RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.payment_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.payment_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- paystack_subscriptions RLS
ALTER TABLE public.paystack_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.paystack_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.paystack_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.paystack_subscriptions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- paystack_plans RLS (public read, admin write)
ALTER TABLE public.paystack_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans"
ON public.paystack_plans FOR SELECT
USING (true);

CREATE POLICY "Admins can manage plans"
ON public.paystack_plans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- promo_codes RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo codes"
ON public.promo_codes FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage promo codes"
ON public.promo_codes FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- promo_code_redemptions RLS
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own redemptions"
ON public.promo_code_redemptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions"
ON public.promo_code_redemptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
ON public.promo_code_redemptions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- referral_discount_codes RLS
ALTER TABLE public.referral_discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral codes"
ON public.referral_discount_codes FOR SELECT
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can use referral codes for validation"
ON public.referral_discount_codes FOR SELECT
USING (is_used = false AND expires_at > now());

CREATE POLICY "Admins can view all referral codes"
ON public.referral_discount_codes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- loyalty_points_transactions RLS
ALTER TABLE public.loyalty_points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points transactions"
ON public.loyalty_points_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own points transactions"
ON public.loyalty_points_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all points transactions"
ON public.loyalty_points_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- loyalty_redemptions RLS
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loyalty redemptions"
ON public.loyalty_redemptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loyalty redemptions"
ON public.loyalty_redemptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loyalty redemptions"
ON public.loyalty_redemptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all loyalty redemptions"
ON public.loyalty_redemptions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- cancellation_feedback RLS
ALTER TABLE public.cancellation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
ON public.cancellation_feedback FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback"
ON public.cancellation_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.cancellation_feedback FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- payment_audit_log RLS
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.payment_audit_log FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.payment_audit_log FOR INSERT
WITH CHECK (true);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_paystack_subscriptions_updated_at
BEFORE UPDATE ON public.paystack_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();