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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all users with expired trials
    const { data: expiredTrials, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, trial_expires_at')
      .eq('subscription_tier', 'business')
      .not('trial_expires_at', 'is', null)
      .lt('trial_expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired trials:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredTrials?.length || 0} expired trials`);

    let downgraded = 0;

    // Downgrade each expired trial
    for (const profile of expiredTrials || []) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          trial_started_at: null,
          trial_expires_at: null,
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`Error downgrading user ${profile.id}:`, updateError);
        continue;
      }

      downgraded++;
      console.log(`Downgraded user ${profile.id} from business trial to free`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${expiredTrials?.length || 0} expired trials, downgraded ${downgraded}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in check-trial-expiry:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
