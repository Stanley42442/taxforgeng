import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash token for storage (first 16 chars of access token)
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Mask IP for privacy
function maskIP(ip: string | null): string {
  if (!ip) return 'Unknown';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip.substring(0, ip.length / 2) + '***';
}

// Extract OS from user agent
function extractOS(userAgent: string | null): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone')) return 'iOS';
  return 'Unknown';
}

// Extract browser from user agent
function extractBrowser(userAgent: string | null): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  return 'Unknown';
}

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
    const { operation } = body;

    switch (operation) {
      case 'list': {
        // List all active sessions for the user
        const { data: sessions, error } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .is('revoked_at', null)
          .order('last_active_at', { ascending: false });

        if (error) throw error;

        // Get current session token hash
        const currentTokenHash = await hashToken(token.substring(0, 16));

        const formattedSessions = (sessions || []).map(s => ({
          id: s.id,
          deviceName: s.device_name || 'Unknown Device',
          browser: extractBrowser(s.user_agent),
          os: extractOS(s.user_agent),
          location: s.location || {},
          ipAddress: maskIP(s.ip_address),
          lastActiveAt: s.last_active_at,
          createdAt: s.created_at,
          isCurrent: s.session_token_hash === currentTokenHash
        }));

        return new Response(
          JSON.stringify(formattedSessions),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'revoke_one': {
        const { sessionId } = body;
        
        if (!sessionId) {
          throw new Error('Session ID is required');
        }

        // Revoke specific session (with ownership check)
        const { data, error } = await supabase
          .from('user_sessions')
          .update({ 
            revoked_at: new Date().toISOString(), 
            revoked_reason: 'user_revoked' 
          })
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .is('revoked_at', null)
          .select();

        if (error) throw error;

        // Log security event
        await supabase.from('security_events').insert({
          event_type: 'session_revoked',
          severity: 'medium',
          user_id: user.id,
          ip_address: req.headers.get('x-forwarded-for'),
          details: { sessionId, revokedCount: data?.length || 0 }
        });

        return new Response(
          JSON.stringify({ success: true, sessionsRevoked: data?.length || 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'revoke_all': {
        const { excludeCurrent, reason } = body;
        const currentTokenHash = await hashToken(token.substring(0, 16));

        let query = supabase
          .from('user_sessions')
          .update({ 
            revoked_at: new Date().toISOString(), 
            revoked_reason: reason || 'user_revoked_all' 
          })
          .eq('user_id', user.id)
          .is('revoked_at', null);

        if (excludeCurrent) {
          query = query.neq('session_token_hash', currentTokenHash);
        }

        const { data, error } = await query.select();
        if (error) throw error;

        const revokedCount = data?.length || 0;

        // Update profile session_invalidated_at
        await supabase
          .from('profiles')
          .update({ session_invalidated_at: new Date().toISOString() })
          .eq('id', user.id);

        // Log security event
        await supabase.from('security_events').insert({
          event_type: 'all_sessions_revoked',
          severity: 'high',
          user_id: user.id,
          ip_address: req.headers.get('x-forwarded-for'),
          details: { 
            reason: reason || 'user_initiated', 
            sessionsRevoked: revokedCount,
            excludedCurrent: excludeCurrent 
          }
        });

        // Send security alert email
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', user.id)
            .single();

          await supabase.functions.invoke('send-security-alert', {
            body: {
              userEmail: profile?.email || user.email,
              userId: user.id,
              alertType: 'all_sessions_revoked',
              timestamp: new Date().toLocaleString(),
              sessionsRevoked: revokedCount,
              reason: reason || 'user_initiated'
            }
          });
        } catch (emailError) {
          console.error('Failed to send security alert:', emailError);
        }

        return new Response(
          JSON.stringify({ success: true, sessionsRevoked: revokedCount }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'register': {
        // Register current session
        const { deviceInfo, location } = body;
        const tokenHash = await hashToken(token.substring(0, 16));
        const clientIP = req.headers.get('x-forwarded-for');
        const userAgent = req.headers.get('user-agent');

        // Check if session already exists
        const { data: existing } = await supabase
          .from('user_sessions')
          .select('id')
          .eq('session_token_hash', tokenHash)
          .single();

        if (existing) {
          // Update last active
          await supabase
            .from('user_sessions')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          // Create new session
          await supabase
            .from('user_sessions')
            .insert({
              user_id: user.id,
              session_token_hash: tokenHash,
              device_fingerprint: deviceInfo?.fingerprint,
              device_name: deviceInfo?.deviceName,
              ip_address: clientIP,
              user_agent: userAgent,
              location: location,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            });
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'check_validity': {
        // Check if current session is still valid
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('session_invalidated_at')
          .eq('id', user.id)
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ valid: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get token issued at time
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const tokenIssuedAt = new Date(tokenPayload.iat * 1000);

          // If session was invalidated after token was issued, session is invalid
          if (profile?.session_invalidated_at) {
            const invalidatedAt = new Date(profile.session_invalidated_at);
            if (tokenIssuedAt < invalidatedAt) {
              return new Response(
                JSON.stringify({ valid: false, reason: 'session_invalidated' }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        } catch (e) {
          console.error('Error parsing token:', e);
        }

        return new Response(
          JSON.stringify({ valid: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

  } catch (error: unknown) {
    console.error("Error in manage-sessions:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
