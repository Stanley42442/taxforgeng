import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get user from auth token
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's current subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('paystack_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'non_renewing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get billing history (payment transactions)
    const { data: transactions } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get profile for tier info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier, trial_expires_at, trial_started_at')
      .eq('id', user.id)
      .single();

    // Calculate subscription status
    let subscriptionStatus = 'none';
    let isActive = false;
    let willCancel = false;
    let currentPeriodEnd = null;

    if (subscription) {
      subscriptionStatus = subscription.status;
      isActive = subscription.status === 'active' || subscription.status === 'non_renewing';
      willCancel = subscription.cancel_at_period_end || false;
      currentPeriodEnd = subscription.current_period_end || subscription.next_payment_date;
    } else if (profile?.trial_expires_at) {
      subscriptionStatus = 'trial';
      isActive = new Date(profile.trial_expires_at) > new Date();
      currentPeriodEnd = profile.trial_expires_at;
    }

    return new Response(JSON.stringify({
      success: true,
      subscription: subscription ? {
        id: subscription.id,
        tier: subscription.tier,
        billingCycle: subscription.billing_cycle,
        status: subscription.status,
        amount: subscription.amount,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: currentPeriodEnd,
        nextPaymentDate: subscription.next_payment_date,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelledAt: subscription.cancelled_at,
        cancellationReason: subscription.cancellation_reason,
        failedPaymentsCount: subscription.failed_payments_count,
      } : null,
      profile: {
        tier: profile?.subscription_tier || 'free',
        trialExpiresAt: profile?.trial_expires_at,
        trialStartedAt: profile?.trial_started_at,
      },
      billingHistory: (transactions || []).map(t => ({
        id: t.id,
        reference: t.reference,
        amount: t.amount,
        originalAmount: t.original_amount,
        discountAmount: t.discount_amount,
        discountCode: t.discount_code,
        tier: t.tier,
        billingCycle: t.billing_cycle,
        status: t.status,
        receiptNumber: t.receipt_number,
        createdAt: t.created_at,
      })),
      status: {
        isActive,
        subscriptionStatus,
        willCancel,
        currentPeriodEnd,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get subscription' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
