import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Thresholds for suspicious activity
const THRESHOLDS = {
  failed_payments_1h: 3,      // 3 failed payments in 1 hour
  failed_2fa_15m: 5,          // 5 failed 2FA attempts in 15 minutes
  card_changes_24h: 3,        // 3 card changes in 24 hours
  different_ips_1h: 5,        // 5 different IPs in 1 hour
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    const body = await req.json();
    const { operation, activityType, metadata } = body;

    if (operation !== 'check') {
      throw new Error('Invalid operation');
    }

    const reasons: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Check failed payment attempts
    const { count: failedPayments } = await supabase
      .from('payment_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'failed')
      .gte('created_at', oneHourAgo);

    if (failedPayments && failedPayments >= THRESHOLDS.failed_payments_1h) {
      reasons.push(`${failedPayments} failed payment attempts in the last hour`);
      severity = 'high';
    }

    // Check 2FA failures
    const { count: failed2FA } = await supabase
      .from('payment_verification_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('attempts', 3)
      .is('verified_at', null)
      .gte('created_at', fifteenMinutesAgo);

    if (failed2FA && failed2FA >= THRESHOLDS.failed_2fa_15m) {
      reasons.push(`${failed2FA} failed 2FA verification attempts`);
      severity = 'critical';
    }

    // Check card changes
    const { count: cardChanges } = await supabase
      .from('payment_audit_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('action', ['add_payment_method', 'remove_payment_method', 'set_default_payment_method'])
      .gte('created_at', twentyFourHoursAgo);

    if (cardChanges && cardChanges >= THRESHOLDS.card_changes_24h) {
      reasons.push(`${cardChanges} payment method changes in 24 hours`);
      severity = severity === 'critical' ? 'critical' : 'high';
    }

    // Check different IPs
    const { data: recentIPs } = await supabase
      .from('payment_audit_log')
      .select('ip_address')
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)
      .not('ip_address', 'is', null);

    const uniqueIPs = new Set(recentIPs?.map(r => r.ip_address).filter(Boolean) || []);
    if (uniqueIPs.size >= THRESHOLDS.different_ips_1h) {
      reasons.push(`Activity from ${uniqueIPs.size} different IP addresses`);
      severity = severity === 'critical' ? 'critical' : 'high';
    }

    const isSuspicious = reasons.length > 0;

    if (isSuspicious) {
      // Log the suspicious activity
      await supabase.from('security_events').insert({
        event_type: 'suspicious_payment_activity',
        severity: severity,
        user_id: user.id,
        ip_address: req.headers.get('x-forwarded-for'),
        details: {
          activityType,
          reasons,
          metadata
        }
      });

      // If critical, invalidate all sessions immediately
      if (severity === 'critical') {
        await supabase.rpc('invalidate_user_sessions', {
          target_user_id: user.id,
          reason: 'suspicious_payment_activity'
        });

        // Get user profile for email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name, whatsapp_number')
          .eq('id', user.id)
          .single();

        // Send critical security alert
        await supabase.functions.invoke('send-security-alert', {
          body: {
            userEmail: profile?.email || user.email,
            userId: user.id,
            alertType: 'suspicious_activity_lockout',
            timestamp: new Date().toLocaleString(),
            reasons: reasons,
            whatsappNumber: profile?.whatsapp_number
          }
        });
      }
    }

    return new Response(
      JSON.stringify({
        isSuspicious,
        reasons,
        severity
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in detect-suspicious-activity:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ isSuspicious: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
