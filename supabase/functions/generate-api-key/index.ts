import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Domain format validation
const DOMAIN_REGEX = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*(\.[a-zA-Z]{2,})(:\d{1,5})?(\/.*)?$/;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Verify subscription tier server-side
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: subscription } = await serviceClient
      .from('paystack_subscriptions')
      .select('tier, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const userTier = subscription?.tier || 'free';
    if (!['business', 'corporate'].includes(userTier)) {
      return new Response(JSON.stringify({ error: 'API access requires Business or Corporate plan' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate input
    const body = await req.json();
    const { name, domains } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Key name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (name.trim().length > 100) {
      return new Response(JSON.stringify({ error: 'Key name must be 100 characters or less' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate domains if provided
    let sanitizedDomains: string[] | null = null;
    if (domains && Array.isArray(domains) && domains.length > 0) {
      sanitizedDomains = domains
        .filter((d: unknown) => typeof d === 'string' && d.trim().length > 0)
        .map((d: string) => d.trim());

      for (const domain of sanitizedDomains) {
        if (!DOMAIN_REGEX.test(domain)) {
          return new Response(JSON.stringify({ error: `Invalid domain format: ${domain}. Use https://example.com` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Generate API key server-side
    const apiKey = `txf_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;
    const apiSecretHash = crypto.randomUUID();

    // Tier-based rate limits
    const rateLimit = userTier === 'corporate' ? 100000 : 10000;
    const keyTier = userTier === 'corporate' ? 'pro' : 'basic';

    // Insert using service role (bypasses RLS for server-side creation)
    const { data: partner, error: insertError } = await serviceClient
      .from('partners')
      .insert({
        user_id: userId,
        name: name.trim(),
        api_key: apiKey,
        api_secret_hash: apiSecretHash,
        tier: keyTier,
        rate_limit_daily: rateLimit,
        allowed_origins: sanitizedDomains,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create API key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data: partner }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-api-key error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
