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
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!paystackSecretKey) {
      return new Response(JSON.stringify({ success: false, error: 'Payment configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    const { reason, feedback } = await req.json();
    console.log(`User ${user.id} requesting cancellation`);

    // Get admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's active subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('paystack_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !subscription) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No active subscription found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Disable subscription via Paystack API
    const disableResponse = await fetch('https://api.paystack.co/subscription/disable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: subscription.subscription_code,
        token: subscription.email_token,
      }),
    });

    const disableResult = await disableResponse.json();
    console.log('Paystack disable response:', disableResult);

    if (!disableResult.status) {
      // Log the error but don't fail - we'll update our DB anyway
      console.error('Paystack disable failed:', disableResult.message);
    }

    // Update subscription in database
    await supabaseAdmin
      .from('paystack_subscriptions')
      .update({
        status: 'cancelled',
        cancel_at_period_end: true,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', subscription.id);

    // Store cancellation feedback
    await supabaseAdmin.from('cancellation_feedback').insert({
      user_id: user.id,
      subscription_id: subscription.id,
      previous_tier: subscription.tier,
      reason: reason || 'Not specified',
      reason_category: feedback?.category,
      suggestions: feedback?.suggestions,
      would_return: feedback?.wouldReturn,
    });

    // Log in subscription history
    await supabaseAdmin.from('subscription_history').insert({
      user_id: user.id,
      previous_tier: subscription.tier,
      new_tier: 'free',
      change_type: 'cancellation',
      reason: reason,
      metadata: {
        subscription_code: subscription.subscription_code,
        cancelled_at: new Date().toISOString(),
        access_until: subscription.current_period_end || subscription.next_payment_date,
      }
    });

    // Note: We don't immediately downgrade - user keeps access until period ends
    // The webhook will handle the actual downgrade when subscription expires

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription cancelled successfully',
      accessUntil: subscription.current_period_end || subscription.next_payment_date,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Cancellation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cancel subscription' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
