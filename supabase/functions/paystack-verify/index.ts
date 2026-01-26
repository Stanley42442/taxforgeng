import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;

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

    const { reference } = await req.json();

    if (!reference) {
      throw new Error("Reference is required");
    }

    // Check if transaction exists and belongs to user
    const { data: existingTx, error: txCheckError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('reference', reference)
      .eq('user_id', user.id)
      .single();

    if (txCheckError || !existingTx) {
      throw new Error("Transaction not found");
    }

    // Check if already processed
    if (existingTx.status === 'success') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Transaction already verified',
          tier: existingTx.tier,
          alreadyProcessed: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Payment verification failed');
    }

    const paymentData = paystackData.data;

    // Update transaction with Paystack response
    await supabase
      .from('payment_transactions')
      .update({
        status: paymentData.status === 'success' ? 'success' : 'failed',
        paystack_response: paymentData,
        receipt_number: paymentData.receipt_number,
      })
      .eq('reference', reference);

    if (paymentData.status !== 'success') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Payment was not successful',
          status: paymentData.status,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Payment successful - update user subscription
    const metadata = paymentData.metadata || {};
    const tier = metadata.tier || existingTx.tier;
    const billingCycle = metadata.billing_cycle || existingTx.billing_cycle;

    // Get current user profile for subscription history
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('subscription_tier, full_name, email')
      .eq('id', user.id)
      .single();

    const previousTier = currentProfile?.subscription_tier || 'free';

    // Update user's subscription tier using UPSERT to handle missing profiles
    console.log(`[paystack-verify] Updating profile for user ${user.id} to tier: ${tier}`);
    const { error: profileUpsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        subscription_tier: tier,
        has_selected_initial_tier: true,
        trial_expires_at: null,
        trial_started_at: null,
      }, {
        onConflict: 'id',
      });

    if (profileUpsertError) {
      console.error('[paystack-verify] Failed to update profile:', profileUpsertError);
      throw new Error('Failed to update subscription tier');
    }
    console.log(`[paystack-verify] Profile updated successfully for user ${user.id}`);

    // Record subscription history
    const changeType = previousTier === 'free' ? 'new_subscription' : 
      (TIER_ORDER[tier] > TIER_ORDER[previousTier] ? 'upgrade' : 'downgrade');

    await supabase
      .from('subscription_history')
      .insert({
        user_id: user.id,
        previous_tier: previousTier,
        new_tier: tier,
        change_type: changeType,
        reason: 'payment',
        metadata: {
          reference,
          amount: paymentData.amount,
          billing_cycle: billingCycle,
        },
      });

    // Store/update payment method from authorization
    const authorization = paymentData.authorization;
    if (authorization?.authorization_code) {
      // Check if payment method already exists
      const { data: existingMethod } = await supabase
        .from('user_payment_methods')
        .select('id')
        .eq('user_id', user.id)
        .eq('authorization_code', authorization.authorization_code)
        .single();

      if (!existingMethod) {
        // If this is a new payment method, check for existing default
        const { data: existingDefault } = await supabase
          .from('user_payment_methods')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        await supabase
          .from('user_payment_methods')
          .insert({
            user_id: user.id,
            authorization_code: authorization.authorization_code,
            card_type: authorization.card_type || 'unknown',
            last_four: authorization.last4 || '****',
            exp_month: parseInt(authorization.exp_month, 10) || 0,
            exp_year: parseInt(authorization.exp_year, 10) || 0,
            bank: authorization.bank || null,
            country_code: authorization.country_code || 'NG',
            is_default: !existingDefault, // Make default if no existing default
            is_active: true,
          });
      }
    }

    // Create or update subscription record
    const customerCode = paymentData.customer?.customer_code || '';
    const authorizationCode = paymentData.authorization?.authorization_code || '';

    await supabase
      .from('paystack_subscriptions')
      .upsert({
        user_id: user.id,
        subscription_code: `SUB-${reference}`,
        plan_code: `${tier}-${billingCycle}`,
        customer_code: customerCode,
        authorization_code: authorizationCode,
        tier,
        billing_cycle: billingCycle,
        amount: paymentData.amount,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: calculatePeriodEnd(billingCycle),
        next_payment_date: calculatePeriodEnd(billingCycle),
      }, {
        onConflict: 'user_id',
      });

    // Mark discount codes as used if applicable
    if (existingTx.discount_code && existingTx.discount_type) {
      await markDiscountAsUsed(
        supabase,
        user.id,
        existingTx.discount_code,
        existingTx.discount_type,
        reference,
        existingTx
      );
    }

    // Log to audit trail
    await supabase
      .from('payment_audit_log')
      .insert({
        user_id: user.id,
        action: 'payment_verified',
        entity_type: 'transaction',
        entity_id: reference,
        old_values: { tier: previousTier },
        new_values: { 
          tier, 
          amount: paymentData.amount,
          billing_cycle: billingCycle,
        },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
      });

    // Log analytics event
    await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_type: 'payment_completed',
        event_data: {
          reference,
          amount: paymentData.amount / 100,
          previous_tier: previousTier,
          new_tier: tier,
          change_type: changeType,
          discount_applied: !!existingTx.discount_code,
          discount_amount: existingTx.discount_amount || 0,
        },
        tier,
        billing_cycle: billingCycle,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      });

    // Send payment confirmation email with receipt
    try {
      await supabase.functions.invoke('send-payment-confirmation', {
        body: {
          email: user.email,
          userName: currentProfile?.full_name || user.user_metadata?.full_name,
          amount: paymentData.amount / 100, // Convert from kobo to Naira
          tier,
          billingCycle,
          receiptNumber: paymentData.receipt_number || reference,
          transactionDate: new Date().toISOString(),
          discountApplied: !!existingTx.discount_code,
          discountAmount: existingTx.discount_amount ? existingTx.discount_amount / 100 : 0,
          reference,
        }
      });
      console.log('Payment confirmation email sent');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the payment verification if email fails
    }

    // Create a user notification
    await supabase
      .from('user_notifications')
      .insert({
        user_id: user.id,
        title: 'Payment Successful',
        message: `Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan subscription is now active. Receipt: ${paymentData.receipt_number || reference}`,
        type: 'payment',
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        tier,
        billingCycle,
        previousTier,
        changeType,
        receiptNumber: paymentData.receipt_number,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

const TIER_ORDER: Record<string, number> = {
  free: 0,
  starter: 1,
  basic: 2,
  professional: 3,
  business: 4,
  corporate: 5,
};

function calculatePeriodEnd(billingCycle: string): string {
  const now = new Date();
  if (billingCycle === 'annually') {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}

async function markDiscountAsUsed(
  supabase: any,
  userId: string,
  code: string,
  type: string,
  reference: string,
  transaction: any
) {
  try {
    if (type === 'promo') {
      // Get promo code
      const { data: promoCode } = await supabase
        .from('promo_codes')
        .select('id')
        .eq('code', code.toUpperCase())
        .single();

      if (promoCode) {
        // Increment usage count
        await supabase.rpc('increment_promo_usage', { promo_id: promoCode.id });

        // Record redemption
        await supabase
          .from('promo_code_redemptions')
          .insert({
            promo_code_id: promoCode.id,
            user_id: userId,
            transaction_reference: reference,
            tier: transaction.tier,
            original_amount: transaction.original_amount,
            discount_amount: transaction.discount_amount,
            final_amount: transaction.amount,
          });
      }

    } else if (type === 'referral') {
      await supabase
        .from('referral_discount_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          used_for_transaction: reference,
        })
        .eq('code', code.toUpperCase())
        .eq('owner_user_id', userId);

    } else if (type === 'loyalty') {
      await supabase
        .from('loyalty_redemptions')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          transaction_reference: reference,
        })
        .eq('discount_code', code.toUpperCase())
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Error marking discount as used:', error);
    // Don't throw - payment was successful, discount tracking is secondary
  }
}
