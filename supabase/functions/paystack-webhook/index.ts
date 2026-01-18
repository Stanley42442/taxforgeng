import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

// HMAC-SHA512 verification using Web Crypto API
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    const signatureBuffer = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Constant-time comparison to prevent timing attacks
    if (computedSignature.length !== signature.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < computedSignature.length; i++) {
      result |= computedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return result === 0;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

// Log webhook event for auditing
async function logWebhookEvent(supabase: any, event: string, success: boolean, details: any) {
  try {
    await supabase.from('payment_audit_log').insert({
      action: `webhook_${event}`,
      entity_type: 'webhook',
      entity_id: details.reference || details.subscription_code || null,
      new_values: { event, success, ...details }
    });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    console.error(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature (REQUIRED in production)
    if (!signature) {
      console.error('Missing webhook signature');
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isValid = await verifySignature(body, signature, paystackSecretKey);
    if (!isValid) {
      console.error('Invalid webhook signature from IP:', clientIP);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const data = payload.data;

    console.log(`Processing webhook event: ${event}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log webhook start
    await logWebhookEvent(supabase, event, true, { reference: data.reference, ip: clientIP });

    switch (event) {
      case 'charge.success': {
        // Handle successful charge
        const reference = data.reference;
        const customerEmail = data.customer?.email;
        
        console.log(`Charge success for reference: ${reference}`);

        // Update transaction status
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({ 
            status: 'success',
            paystack_response: data,
            updated_at: new Date().toISOString()
          })
          .eq('reference', reference);

        if (updateError) {
          console.error('Failed to update transaction:', updateError);
        }

        // Send payment confirmation email via edge function
        try {
          await supabase.functions.invoke('send-payment-confirmation', {
            body: { reference }
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }

        break;
      }

      case 'subscription.create': {
        const subscriptionCode = data.subscription_code;
        const customerCode = data.customer?.customer_code;
        const customerEmail = data.customer?.email;
        const planCode = data.plan?.plan_code;
        const amount = data.amount / 100; // Convert from kobo
        const nextPaymentDate = data.next_payment_date;

        console.log(`Subscription created: ${subscriptionCode}`);

        // Get user by email
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();

        if (profile) {
          // Check if subscription already exists
          const { data: existingSub } = await supabase
            .from('paystack_subscriptions')
            .select('id')
            .eq('subscription_code', subscriptionCode)
            .single();

          if (!existingSub) {
            // Get plan details to determine tier
            const { data: plan } = await supabase
              .from('paystack_plans')
              .select('tier, billing_cycle')
              .eq('plan_code', planCode)
              .single();

            await supabase.from('paystack_subscriptions').insert({
              user_id: profile.id,
              subscription_code: subscriptionCode,
              customer_code: customerCode,
              plan_code: planCode,
              tier: plan?.tier || 'starter',
              billing_cycle: plan?.billing_cycle || 'monthly',
              amount: amount,
              status: 'active',
              next_payment_date: nextPaymentDate,
              authorization_code: data.authorization?.authorization_code,
              email_token: data.email_token,
            });

            // Update user's subscription tier
            await supabase
              .from('profiles')
              .update({ 
                subscription_tier: plan?.tier || 'starter',
                trial_expires_at: null,
                trial_started_at: null
              })
              .eq('id', profile.id);
          }
        }
        break;
      }

      case 'subscription.disable':
      case 'subscription.not_renew': {
        const subscriptionCode = data.subscription_code;
        console.log(`Subscription disabled/not renewing: ${subscriptionCode}`);

        // Update subscription status
        const { data: subscription } = await supabase
          .from('paystack_subscriptions')
          .update({ 
            status: event === 'subscription.disable' ? 'cancelled' : 'non_renewing',
            cancelled_at: new Date().toISOString(),
            cancel_at_period_end: true
          })
          .eq('subscription_code', subscriptionCode)
          .select('user_id, tier')
          .single();

        // Don't immediately downgrade - let them keep access until period ends
        break;
      }

      case 'invoice.payment_failed': {
        const subscriptionCode = data.subscription?.subscription_code;
        console.log(`Invoice payment failed for subscription: ${subscriptionCode}`);

        if (subscriptionCode) {
          // Increment failed payments count
          const { data: subscription } = await supabase
            .from('paystack_subscriptions')
            .select('failed_payments_count, user_id')
            .eq('subscription_code', subscriptionCode)
            .single();

          if (subscription) {
            const newCount = (subscription.failed_payments_count || 0) + 1;
            
            await supabase
              .from('paystack_subscriptions')
              .update({ 
                failed_payments_count: newCount,
                status: newCount >= 3 ? 'past_due' : 'active'
              })
              .eq('subscription_code', subscriptionCode);

            // If 3+ failed payments, consider downgrading
            if (newCount >= 3) {
              await supabase
                .from('profiles')
                .update({ subscription_tier: 'free' })
                .eq('id', subscription.user_id);
            }
          }
        }
        break;
      }

      case 'invoice.update':
      case 'invoice.create': {
        // Log invoice events for audit
        console.log(`Invoice event: ${event}`, data);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    await logWebhookEvent(supabase, event, true, { processed: true });

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
