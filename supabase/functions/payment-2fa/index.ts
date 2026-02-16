import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate 6-digit OTP
function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, '0');
}

// Hash token for storage
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Mask delivery target for display
function maskTarget(target: string): string {
  if (target.includes('@')) {
    // Email
    const [local, domain] = target.split('@');
    const maskedLocal = local.substring(0, 2) + '***';
    return `${maskedLocal}@${domain}`;
  } else {
    // Phone
    return target.substring(0, 4) + '****' + target.slice(-2);
  }
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
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const body = await req.json();
    const { operation } = body;

    switch (operation) {
      case 'send_code': {
        const { tokenType, deliveryMethod, operationData } = body;

        // Validate token type
        const validTokenTypes = ['subscription_change', 'add_payment_method', 'remove_payment_method', 'set_default_payment_method'];
        if (!validTokenTypes.includes(tokenType)) {
          throw new Error('Invalid token type');
        }

        // Rate limit check - max 3 codes per 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('payment_verification_tokens')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', tenMinutesAgo);

        if (count && count >= 3) {
          throw new Error('Too many verification requests. Please wait 10 minutes.');
        }

        // Get user's email/phone
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, whatsapp_number, full_name')
          .eq('id', user.id)
          .single();

        const deliveryTarget = deliveryMethod === 'email' 
          ? user.email 
          : profile?.whatsapp_number;

        if (!deliveryTarget) {
          throw new Error(`No ${deliveryMethod} configured for this account`);
        }

        // Generate OTP
        const otp = generateOTP();
        const tokenHash = await hashToken(otp);

        // Store token
        const { data: tokenData, error: insertError } = await supabase
          .from('payment_verification_tokens')
          .insert({
            user_id: user.id,
            token_hash: tokenHash,
            token_type: tokenType,
            operation_data: operationData,
            delivery_method: deliveryMethod,
            delivery_target: deliveryTarget,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 mins
            ip_address: req.headers.get('x-forwarded-for'),
            user_agent: req.headers.get('user-agent'),
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        // Send OTP via email or SMS
        if (deliveryMethod === 'email') {
          await supabase.functions.invoke('send-2fa-code', {
            body: { 
              email: deliveryTarget, 
              code: otp,
              operationType: tokenType,
              userName: profile?.full_name || 'User',
            }
          });
        } else {
          // SMS via WhatsApp
          await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              phone: deliveryTarget,
              message: `Your TaxForge verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
            }
          });
        }

        // Audit log
        await supabase.from('payment_audit_log').insert({
          user_id: user.id,
          action: '2fa_code_sent',
          entity_type: 'verification',
          entity_id: tokenData.id,
          new_values: { tokenType, deliveryMethod, deliveryTarget: maskTarget(deliveryTarget) },
          ip_address: req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent'),
        });

        return new Response(
          JSON.stringify({ 
            success: true,
            tokenId: tokenData.id, 
            deliveryMethod, 
            maskedTarget: maskTarget(deliveryTarget) 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'verify_code': {
        const { tokenId, code } = body;

        if (!tokenId || !code) {
          throw new Error('Token ID and code are required');
        }

        // Get token
        const { data: tokenData, error } = await supabase
          .from('payment_verification_tokens')
          .select('*')
          .eq('id', tokenId)
          .eq('user_id', user.id)
          .single();

        if (error || !tokenData) {
          throw new Error('Invalid verification request');
        }

        // Check expiry
        if (new Date(tokenData.expires_at) < new Date()) {
          throw new Error('Verification code has expired');
        }

        // Check attempts
        if (tokenData.attempts >= tokenData.max_attempts) {
          // Check for suspicious activity
          await supabase.functions.invoke('detect-suspicious-activity', {
            body: {
              operation: 'check',
              activityType: '2fa_failure',
              metadata: { tokenType: tokenData.token_type, attempts: tokenData.attempts }
            }
          });
          throw new Error('Maximum verification attempts exceeded');
        }

        // Increment attempts
        await supabase
          .from('payment_verification_tokens')
          .update({ attempts: tokenData.attempts + 1 })
          .eq('id', tokenId);

        // Verify hash
        const codeHash = await hashToken(code);
        if (codeHash !== tokenData.token_hash) {
          // Audit failed attempt
          await supabase.from('payment_audit_log').insert({
            user_id: user.id,
            action: '2fa_verification_failed',
            entity_type: 'verification',
            entity_id: tokenId,
            new_values: { attempt: tokenData.attempts + 1 },
            ip_address: req.headers.get('x-forwarded-for'),
          });
          throw new Error('Invalid verification code');
        }

        // Mark as verified
        await supabase
          .from('payment_verification_tokens')
          .update({ verified_at: new Date().toISOString() })
          .eq('id', tokenId);

        // Audit success
        await supabase.from('payment_audit_log').insert({
          user_id: user.id,
          action: '2fa_verification_success',
          entity_type: 'verification',
          entity_id: tokenId,
          ip_address: req.headers.get('x-forwarded-for'),
        });

        return new Response(
          JSON.stringify({ 
            success: true,
            verified: true, 
            operationData: tokenData.operation_data,
            tokenType: tokenData.token_type,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'check_required': {
        // Check if 2FA is required for the user (always required for payment operations)
        return new Response(
          JSON.stringify({ required: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid operation" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error: unknown) {
    console.error("Error in payment-2fa:", error);
    // Map known user-facing errors, hide everything else
    const msg = error instanceof Error ? error.message : '';
    const safeErrors: Record<string, string> = {
      'Unauthorized': 'Authentication required',
      'Invalid verification request': 'Invalid verification request',
      'Verification code has expired': 'Verification code has expired',
      'Maximum verification attempts exceeded': 'Maximum verification attempts exceeded',
      'Invalid verification code': 'Invalid verification code',
      'Too many verification requests. Please wait 10 minutes.': 'Too many verification requests. Please wait 10 minutes.',
      'Token ID and code are required': 'Verification code is required',
    };
    const safeMessage = safeErrors[msg] || 'Verification service temporarily unavailable';
    const status = msg === 'Unauthorized' ? 401 : 400;
    return new Response(
      JSON.stringify({ success: false, error: safeMessage }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
