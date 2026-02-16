import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role using service role client
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: roleCheck } = await serviceClient.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate input
    const { partnerName, domains, rateLimit } = await req.json();

    if (!partnerName || typeof partnerName !== 'string' || partnerName.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Partner name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one domain is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedDomains = domains
      .filter((d: unknown) => typeof d === 'string' && d.trim().length > 0)
      .map((d: string) => d.trim());

    if (sanitizedDomains.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one valid domain is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dailyLimit = Math.min(Math.max(parseInt(String(rateLimit), 10) || 10000, 100), 100000);

    // Generate API key
    const apiKey = `txf_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;
    const apiSecretHash = crypto.randomUUID();

    // Insert using service role (bypasses RLS)
    const { data: partner, error: insertError } = await serviceClient
      .from('partners')
      .insert({
        user_id: userId,
        name: `[Partner] ${partnerName.trim()}`,
        api_key: apiKey,
        api_secret_hash: apiSecretHash,
        tier: 'partner',
        rate_limit_daily: dailyLimit,
        allowed_origins: sanitizedDomains,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create partner key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data: partner }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('create-partner-key error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
