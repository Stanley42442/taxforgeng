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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch partner by API key (service role bypasses RLS)
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, brand_name, logo_url, primary_color, secondary_color, accent_color, background_color, text_color, border_radius, font_family, show_powered_by, is_active, allowed_origins, embed_allowed_domains, requests_today, rate_limit_daily')
      .eq('api_key', apiKey)
      .maybeSingle();

    if (partnerError || !partner) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!partner.is_active) {
      return new Response(JSON.stringify({ error: 'API key is inactive' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Origin validation
    const origin = req.headers.get('origin') || '';
    const referer = req.headers.get('referer') || '';
    const requestOrigin = origin || (referer ? new URL(referer).origin : '');

    const allowedOrigins: string[] = partner.allowed_origins || partner.embed_allowed_domains || [];
    if (allowedOrigins.length > 0 && requestOrigin) {
      const isAllowed = allowedOrigins.some((allowed: string) => {
        const normalizedAllowed = allowed.replace(/\/$/, '').toLowerCase();
        const normalizedRequest = requestOrigin.replace(/\/$/, '').toLowerCase();
        return normalizedRequest === normalizedAllowed || normalizedRequest.endsWith('.' + normalizedAllowed.replace(/^https?:\/\//, ''));
      });

      if (!isAllowed) {
        return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Rate limiting
    if (partner.requests_today >= partner.rate_limit_daily) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Increment usage counter
    await supabase
      .from('partners')
      .update({
        requests_today: (partner.requests_today || 0) + 1,
        last_request_at: new Date().toISOString(),
      })
      .eq('id', partner.id);

    // Return only theme data
    return new Response(JSON.stringify({
      theme: {
        brandName: partner.brand_name || undefined,
        logoUrl: partner.logo_url || undefined,
        primaryColor: partner.primary_color || '#10b981',
        secondaryColor: partner.secondary_color || '#3b82f6',
        accentColor: partner.accent_color || '#f59e0b',
        backgroundColor: partner.background_color || '#ffffff',
        textColor: partner.text_color || '#1f2937',
        borderRadius: partner.border_radius || '12',
        fontFamily: partner.font_family || 'Inter',
        showPoweredBy: partner.show_powered_by ?? true,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('validate-embed-key error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
