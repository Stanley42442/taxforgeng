import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateRequest {
  code: string;
  tier: string;
  billingCycle: 'monthly' | 'annually';
}

interface TierPricing {
  monthly: number;
  annually: number;
}

const TIER_PRICING: Record<string, TierPricing> = {
  starter: { monthly: 50000, annually: 500000 },
  basic: { monthly: 200000, annually: 2000000 },
  professional: { monthly: 499900, annually: 4999000 },
  business: { monthly: 899900, annually: 8999000 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const body: ValidateRequest = await req.json();
    const { code, tier, billingCycle } = body;

    if (!code || !tier || !billingCycle) {
      throw new Error("Missing required fields");
    }

    const upperCode = code.toUpperCase().trim();
    const baseAmount = TIER_PRICING[tier]?.[billingCycle] || 0;

    // Try to find promo code first
    const promoResult = await validatePromoCode(supabase, user.id, upperCode, tier, billingCycle, baseAmount);
    if (promoResult.found) {
      return new Response(JSON.stringify(promoResult), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Try referral code
    const referralResult = await validateReferralCode(supabase, user.id, upperCode, baseAmount);
    if (referralResult.found) {
      return new Response(JSON.stringify(referralResult), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Try loyalty code
    const loyaltyResult = await validateLoyaltyCode(supabase, user.id, upperCode, baseAmount);
    if (loyaltyResult.found) {
      return new Response(JSON.stringify(loyaltyResult), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // No valid code found
    return new Response(
      JSON.stringify({
        valid: false,
        message: "Invalid discount code",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error validating discount code:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ valid: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function validatePromoCode(
  supabase: any,
  userId: string,
  code: string,
  tier: string,
  billingCycle: string,
  baseAmount: number
) {
  const { data: promoCode, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (error || !promoCode) {
    return { found: false };
  }

  // Check validity period
  const now = new Date();
  if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
    return { 
      found: true, 
      valid: false, 
      message: "This promo code is not yet active" 
    };
  }

  if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
    return { 
      found: true, 
      valid: false, 
      message: "This promo code has expired" 
    };
  }

  // Check global usage limit
  if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
    return { 
      found: true, 
      valid: false, 
      message: "This promo code has reached its usage limit" 
    };
  }

  // Check per-user usage limit
  const { count } = await supabase
    .from('promo_code_redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('promo_code_id', promoCode.id)
    .eq('user_id', userId);

  if (count >= promoCode.max_uses_per_user) {
    return { 
      found: true, 
      valid: false, 
      message: "You have already used this promo code" 
    };
  }

  // Check tier applicability
  if (promoCode.applicable_tiers && promoCode.applicable_tiers.length > 0) {
    if (!promoCode.applicable_tiers.includes(tier)) {
      return { 
        found: true, 
        valid: false, 
        message: `This code is not valid for the ${tier} plan` 
      };
    }
  }

  // Check billing cycle applicability
  if (promoCode.applicable_billing_cycles && promoCode.applicable_billing_cycles.length > 0) {
    if (!promoCode.applicable_billing_cycles.includes(billingCycle)) {
      return { 
        found: true, 
        valid: false, 
        message: `This code is not valid for ${billingCycle} billing` 
      };
    }
  }

  // Check minimum purchase
  if (promoCode.min_purchase_amount && baseAmount < promoCode.min_purchase_amount) {
    const minAmount = (promoCode.min_purchase_amount / 100).toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
    });
    return { 
      found: true, 
      valid: false, 
      message: `Minimum purchase of ${minAmount} required` 
    };
  }

  // Check first purchase only
  if (promoCode.first_purchase_only) {
    const { count: txCount } = await supabase
      .from('payment_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'success');

    if (txCount > 0) {
      return { 
        found: true, 
        valid: false, 
        message: "This code is only valid for first-time purchases" 
      };
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (promoCode.discount_type === 'percentage') {
    discountAmount = Math.floor(baseAmount * (promoCode.discount_value / 100));
    if (promoCode.max_discount_amount) {
      discountAmount = Math.min(discountAmount, promoCode.max_discount_amount);
    }
  } else {
    discountAmount = Math.min(promoCode.discount_value, baseAmount);
  }

  const finalAmount = baseAmount - discountAmount;

  return {
    found: true,
    valid: true,
    discountType: 'promo',
    discountPercentage: promoCode.discount_type === 'percentage' ? promoCode.discount_value : null,
    discountFixed: promoCode.discount_type === 'fixed' ? promoCode.discount_value : null,
    discountAmount,
    originalAmount: baseAmount,
    finalAmount,
    description: promoCode.description || `${promoCode.discount_value}${promoCode.discount_type === 'percentage' ? '%' : ' NGN'} off`,
    message: "Promo code applied successfully!",
  };
}

async function validateReferralCode(
  supabase: any,
  userId: string,
  code: string,
  baseAmount: number
) {
  const { data: referralCode, error } = await supabase
    .from('referral_discount_codes')
    .select('*')
    .eq('code', code)
    .eq('is_used', false)
    .single();

  if (error || !referralCode) {
    return { found: false };
  }

  // Check if code belongs to this user
  if (referralCode.owner_user_id !== userId) {
    return { 
      found: true, 
      valid: false, 
      message: "This referral code belongs to another user" 
    };
  }

  // Check expiration
  if (new Date(referralCode.expires_at) < new Date()) {
    return { 
      found: true, 
      valid: false, 
      message: "This referral code has expired" 
    };
  }

  const discountAmount = Math.floor(baseAmount * (referralCode.discount_percentage / 100));
  const finalAmount = baseAmount - discountAmount;

  return {
    found: true,
    valid: true,
    discountType: 'referral',
    discountPercentage: referralCode.discount_percentage,
    discountAmount,
    originalAmount: baseAmount,
    finalAmount,
    description: `${referralCode.discount_percentage}% referral discount`,
    message: "Referral discount applied!",
    expiresAt: referralCode.expires_at,
  };
}

async function validateLoyaltyCode(
  supabase: any,
  userId: string,
  code: string,
  baseAmount: number
) {
  const { data: loyaltyCode, error } = await supabase
    .from('loyalty_redemptions')
    .select('*')
    .eq('discount_code', code)
    .eq('user_id', userId)
    .eq('is_used', false)
    .single();

  if (error || !loyaltyCode) {
    return { found: false };
  }

  // Check expiration
  if (new Date(loyaltyCode.expires_at) < new Date()) {
    return { 
      found: true, 
      valid: false, 
      message: "This loyalty code has expired" 
    };
  }

  const discountAmount = Math.floor(baseAmount * (loyaltyCode.discount_percentage / 100));
  const finalAmount = baseAmount - discountAmount;

  return {
    found: true,
    valid: true,
    discountType: 'loyalty',
    discountPercentage: loyaltyCode.discount_percentage,
    discountAmount,
    originalAmount: baseAmount,
    finalAmount,
    pointsSpent: loyaltyCode.points_spent,
    description: `${loyaltyCode.discount_percentage}% loyalty discount`,
    message: "Loyalty points discount applied!",
    expiresAt: loyaltyCode.expires_at,
  };
}
