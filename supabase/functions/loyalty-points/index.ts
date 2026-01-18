import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Points earning rates
const POINTS_CONFIG = {
  subscription_payment: 100, // Base points per payment
  referral_signup: 500,      // Points when referred user signs up
  referral_conversion: 1000, // Points when referred user becomes paid
  first_purchase: 250,       // Bonus for first purchase
  annual_subscription: 200,  // Bonus for choosing annual billing
  streak_bonus: 50,          // Monthly active streak bonus
};

// Redemption tiers
const REDEMPTION_TIERS = [
  { points: 500, discount: 5 },
  { points: 1000, discount: 10 },
  { points: 2000, discount: 15 },
  { points: 5000, discount: 25 },
];

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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { action, ...params } = await req.json();

    console.log(`Loyalty points action: ${action} for user ${user.id}`);

    switch (action) {
      case 'get_balance': {
        // Get current points balance
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('total_points')
          .eq('id', user.id)
          .single();

        // Get transaction history
        const { data: transactions } = await supabaseAdmin
          .from('loyalty_points_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        // Get available redemptions
        const { data: redemptions } = await supabaseAdmin
          .from('loyalty_redemptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_used', false)
          .gte('expires_at', new Date().toISOString());

        return new Response(JSON.stringify({
          success: true,
          balance: profile?.total_points || 0,
          transactions: transactions || [],
          availableRedemptions: redemptions || [],
          redemptionTiers: REDEMPTION_TIERS,
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'earn_points': {
        const { actionType, actionReference, metadata } = params;
        const pointsToEarn = POINTS_CONFIG[actionType as keyof typeof POINTS_CONFIG] || 0;

        if (pointsToEarn === 0) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid action type' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check for duplicate transaction
        const { data: existing } = await supabaseAdmin
          .from('loyalty_points_transactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('action_type', actionType)
          .eq('action_reference', actionReference || '')
          .maybeSingle();

        if (existing) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Points already earned for this action' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Add transaction
        await supabaseAdmin.from('loyalty_points_transactions').insert({
          user_id: user.id,
          points: pointsToEarn,
          action_type: actionType,
          action_reference: actionReference,
          description: getActionDescription(actionType),
          metadata,
        });

        // Update total points
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('total_points')
          .eq('id', user.id)
          .single();

        const newTotal = (profile?.total_points || 0) + pointsToEarn;

        await supabaseAdmin
          .from('profiles')
          .update({ total_points: newTotal })
          .eq('id', user.id);

        return new Response(JSON.stringify({
          success: true,
          pointsEarned: pointsToEarn,
          newBalance: newTotal,
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'redeem_points': {
        const { tierIndex } = params;
        const tier = REDEMPTION_TIERS[tierIndex];

        if (!tier) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid redemption tier' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check balance
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('total_points')
          .eq('id', user.id)
          .single();

        const currentBalance = profile?.total_points || 0;

        if (currentBalance < tier.points) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: `Insufficient points. Need ${tier.points}, have ${currentBalance}` 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Generate discount code
        const discountCode = `LOYALTY${tier.discount}-${generateRandomCode(6)}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

        // Create redemption record
        await supabaseAdmin.from('loyalty_redemptions').insert({
          user_id: user.id,
          points_spent: tier.points,
          discount_percentage: tier.discount,
          discount_code: discountCode,
          expires_at: expiresAt.toISOString(),
        });

        // Deduct points
        await supabaseAdmin.from('loyalty_points_transactions').insert({
          user_id: user.id,
          points: -tier.points,
          action_type: 'redemption',
          description: `Redeemed ${tier.discount}% discount code`,
        });

        const newBalance = currentBalance - tier.points;
        await supabaseAdmin
          .from('profiles')
          .update({ total_points: newBalance })
          .eq('id', user.id);

        return new Response(JSON.stringify({
          success: true,
          discountCode,
          discountPercentage: tier.discount,
          pointsSpent: tier.points,
          newBalance,
          expiresAt: expiresAt.toISOString(),
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Loyalty points error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getActionDescription(actionType: string): string {
  const descriptions: Record<string, string> = {
    subscription_payment: 'Points earned from subscription payment',
    referral_signup: 'Referral signed up',
    referral_conversion: 'Referral became a paid subscriber',
    first_purchase: 'First purchase bonus',
    annual_subscription: 'Annual subscription bonus',
    streak_bonus: 'Monthly active streak bonus',
    redemption: 'Points redeemed for discount',
  };
  return descriptions[actionType] || 'Points transaction';
}

function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
