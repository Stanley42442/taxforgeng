import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting - prevent payment spam
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 payment attempts per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

interface InitializeRequest {
  tier: string;
  billingCycle: 'monthly' | 'annually';
  email: string;
  callbackUrl: string;
  discountCode?: string;
  discountType?: 'promo' | 'referral' | 'loyalty';
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

function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `TFN-${timestamp}-${randomPart}`.toUpperCase();
}

serve(async (req) => {
  const startTime = Date.now();
  console.log(`[paystack-init] Request started`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;

    // Parse body early to check for ping request
    const body: InitializeRequest & { ping?: boolean } = await req.json();
    
    // Handle ping request for pre-warming (fast path)
    if (body.ping) {
      console.log(`[paystack-init] Ping received - function warm: ${Date.now() - startTime}ms`);
      return new Response(
        JSON.stringify({ pong: true, warmTime: Date.now() - startTime }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log(`[paystack-init] Supabase client created: ${Date.now() - startTime}ms`);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log(`[paystack-init] Auth check completed: ${Date.now() - startTime}ms`);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    console.log(`[paystack-init] User authenticated: ${user.id}`);

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      console.log(`[paystack-init] Rate limit exceeded for user: ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Too many payment attempts. Please wait a minute and try again.' }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    console.log(`[paystack-init] Request body parsed: ${Date.now() - startTime}ms, tier: ${body.tier}, cycle: ${body.billingCycle}`);
    const { tier, billingCycle, email, callbackUrl, discountCode, discountType } = body;

    // Validate tier
    if (!TIER_PRICING[tier]) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    // Get base amount
    let originalAmount = TIER_PRICING[tier][billingCycle];
    let discountAmount = 0;
    let appliedDiscountCode: string | null = null;
    let appliedDiscountType: string | null = null;

    // Validate and apply discount code if provided
    if (discountCode && discountType) {
      const discountResult = await validateAndCalculateDiscount(
        supabase,
        user.id,
        discountCode,
        discountType,
        tier,
        billingCycle,
        originalAmount
      );

      if (discountResult.valid) {
        discountAmount = discountResult.discountAmount;
        appliedDiscountCode = discountCode;
        appliedDiscountType = discountType;
      }
    }

    const finalAmount = Math.max(originalAmount - discountAmount, 0);

    // Generate unique reference
    const reference = generateReference();

    // Create pending transaction record
    const { error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        reference,
        amount: finalAmount,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        discount_code: appliedDiscountCode,
        discount_type: appliedDiscountType,
        tier,
        billing_cycle: billingCycle,
        status: 'pending',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
      });

    if (txError) {
      console.error('[paystack-init] Transaction insert error:', txError);
      throw new Error('Failed to create transaction record');
    }
    console.log(`[paystack-init] Transaction record created: ${Date.now() - startTime}ms`);

    // Initialize payment with Paystack
    console.log(`[paystack-init] Calling Paystack API...`);
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: finalAmount, // Amount in kobo
        reference,
        callback_url: callbackUrl,
        metadata: {
          user_id: user.id,
          tier,
          billing_cycle: billingCycle,
          discount_code: appliedDiscountCode,
          discount_type: appliedDiscountType,
          original_amount: originalAmount,
          discount_amount: discountAmount,
        },
      }),
    });
    console.log(`[paystack-init] Paystack API responded: ${Date.now() - startTime}ms`);

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error(`[paystack-init] Paystack error: ${paystackData.message}`);
      // Update transaction as failed
      await supabase
        .from('payment_transactions')
        .update({ 
          status: 'failed',
          paystack_response: paystackData,
        })
        .eq('reference', reference);

      throw new Error(paystackData.message || 'Failed to initialize payment');
    }

    // Log to audit trail (non-blocking for speed)
    Promise.resolve(
      supabase
        .from('payment_audit_log')
        .insert({
          user_id: user.id,
          action: 'payment_initialized',
          entity_type: 'transaction',
          entity_id: reference,
          new_values: {
            tier,
            billing_cycle: billingCycle,
            amount: finalAmount,
            discount_applied: discountAmount > 0,
          },
        })
    )
      .then(() => console.log(`[paystack-init] Audit log saved`))
      .catch((err: unknown) => console.error(`[paystack-init] Audit log error:`, err));

    console.log(`[paystack-init] SUCCESS - Total time: ${Date.now() - startTime}ms, reference: ${reference}`);

    console.log(`[paystack-init] SUCCESS - Total time: ${Date.now() - startTime}ms, reference: ${reference}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        authorizationUrl: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        accessCode: paystackData.data.access_code,
        amount: finalAmount,
        originalAmount,
        discountAmount,
        discountApplied: discountAmount > 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error(`[paystack-init] ERROR after ${Date.now() - startTime}ms:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function validateAndCalculateDiscount(
  supabase: any,
  userId: string,
  code: string,
  type: string,
  tier: string,
  billingCycle: string,
  amount: number
): Promise<{ valid: boolean; discountAmount: number; message?: string }> {
  try {
    if (type === 'promo') {
      const { data: promoCode, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !promoCode) {
        return { valid: false, discountAmount: 0, message: 'Invalid promo code' };
      }

      // Check expiration
      if (promoCode.valid_until && new Date(promoCode.valid_until) < new Date()) {
        return { valid: false, discountAmount: 0, message: 'Promo code expired' };
      }

      // Check usage limit
      if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
        return { valid: false, discountAmount: 0, message: 'Promo code usage limit reached' };
      }

      // Check user usage limit
      const { count } = await supabase
        .from('promo_code_redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('promo_code_id', promoCode.id)
        .eq('user_id', userId);

      if (count >= promoCode.max_uses_per_user) {
        return { valid: false, discountAmount: 0, message: 'You have already used this promo code' };
      }

      // Check tier applicability
      if (promoCode.applicable_tiers && !promoCode.applicable_tiers.includes(tier)) {
        return { valid: false, discountAmount: 0, message: 'Promo code not valid for this tier' };
      }

      // Calculate discount
      let discountAmount = 0;
      if (promoCode.discount_type === 'percentage') {
        discountAmount = Math.floor(amount * (promoCode.discount_value / 100));
        if (promoCode.max_discount_amount) {
          discountAmount = Math.min(discountAmount, promoCode.max_discount_amount);
        }
      } else {
        discountAmount = promoCode.discount_value;
      }

      return { valid: true, discountAmount };

    } else if (type === 'referral') {
      const { data: referralCode, error } = await supabase
        .from('referral_discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !referralCode) {
        return { valid: false, discountAmount: 0, message: 'Invalid or expired referral code' };
      }

      // Check if user owns this code
      if (referralCode.owner_user_id !== userId) {
        return { valid: false, discountAmount: 0, message: 'This referral code belongs to another user' };
      }

      const discountAmount = Math.floor(amount * (referralCode.discount_percentage / 100));
      return { valid: true, discountAmount };

    } else if (type === 'loyalty') {
      const { data: loyaltyCode, error } = await supabase
        .from('loyalty_redemptions')
        .select('*')
        .eq('discount_code', code.toUpperCase())
        .eq('user_id', userId)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !loyaltyCode) {
        return { valid: false, discountAmount: 0, message: 'Invalid or expired loyalty code' };
      }

      const discountAmount = Math.floor(amount * (loyaltyCode.discount_percentage / 100));
      return { valid: true, discountAmount };
    }

    return { valid: false, discountAmount: 0, message: 'Unknown discount type' };
  } catch (error) {
    console.error('Discount validation error:', error);
    return { valid: false, discountAmount: 0, message: 'Error validating discount' };
  }
}
