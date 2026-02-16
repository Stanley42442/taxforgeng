import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BURST_LIMIT_PER_MINUTE = 60;

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

    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, brand_name, logo_url, primary_color, secondary_color, accent_color, background_color, text_color, border_radius, font_family, show_powered_by, is_active, allowed_origins, embed_allowed_domains, requests_today, requests_total, rate_limit_daily, rate_limit_window_start, requests_this_minute, minute_window_start')
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

    // Window-based daily rate limiting (auto-reset after 24h)
    const now = new Date();
    const windowStart = partner.rate_limit_window_start ? new Date(partner.rate_limit_window_start) : new Date(0);
    const hoursSinceWindowStart = (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60);
    
    let currentRequestsToday = partner.requests_today || 0;
    let newWindowStart = partner.rate_limit_window_start;

    if (hoursSinceWindowStart >= 24) {
      // Reset daily counter
      currentRequestsToday = 0;
      newWindowStart = now.toISOString();
    }

    // Check daily limit
    if (currentRequestsToday >= partner.rate_limit_daily) {
      const retryAfterSeconds = Math.ceil((24 - hoursSinceWindowStart) * 3600);
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': Math.max(1, retryAfterSeconds).toString() },
      });
    }

    // Per-minute burst protection
    const minuteStart = partner.minute_window_start ? new Date(partner.minute_window_start) : new Date(0);
    const secondsSinceMinuteStart = (now.getTime() - minuteStart.getTime()) / 1000;
    
    let currentRequestsThisMinute = partner.requests_this_minute || 0;
    let newMinuteStart = partner.minute_window_start;

    if (secondsSinceMinuteStart >= 60) {
      currentRequestsThisMinute = 0;
      newMinuteStart = now.toISOString();
    }

    if (currentRequestsThisMinute >= BURST_LIMIT_PER_MINUTE) {
      const retryAfterSeconds = Math.ceil(60 - secondsSinceMinuteStart);
      return new Response(JSON.stringify({ error: 'Too many requests. Please slow down.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': Math.max(1, retryAfterSeconds).toString() },
      });
    }

    // Increment counters
    await supabase
      .from('partners')
      .update({
        requests_today: currentRequestsToday + 1,
        requests_total: (partner.requests_total || 0) + 1,
        rate_limit_window_start: newWindowStart,
        requests_this_minute: currentRequestsThisMinute + 1,
        minute_window_start: newMinuteStart,
        last_request_at: now.toISOString(),
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
