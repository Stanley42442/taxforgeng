import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRACE_PERIOD_DAYS = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const now = new Date();
    const results = { reminders7d: 0, reminders1d: 0, graceStarted: 0, downgraded: 0 };

    // ── 1. Send 7-day renewal reminders ──
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sixDaysFromNow = new Date(now);
    sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);

    const { data: subs7d } = await supabase
      .from('paystack_subscriptions')
      .select('id, user_id, tier, next_payment_date, amount')
      .in('status', ['active'])
      .gte('next_payment_date', sixDaysFromNow.toISOString())
      .lte('next_payment_date', sevenDaysFromNow.toISOString())
      .is('grace_period_ends_at', null);

    for (const sub of subs7d || []) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', sub.user_id)
        .single();

      if (profile?.email) {
        // Create in-app notification
        await supabase.from('user_notifications').insert({
          user_id: sub.user_id,
          title: 'Subscription Renewal in 7 Days',
          message: `Your ${sub.tier} subscription (₦${(sub.amount || 0).toLocaleString()}) will renew on ${new Date(sub.next_payment_date).toLocaleDateString('en-NG', { dateStyle: 'long' })}. Ensure your payment method is up to date.`,
          type: 'subscription',
        });

        // Send email
        if (resend) {
          try {
            await resend.emails.send({
              from: 'TaxForge NG <onboarding@resend.dev>',
              to: [profile.email],
              subject: `Your ${sub.tier} subscription renews in 7 days`,
              html: buildRenewalEmail(profile.full_name || 'there', sub.tier, sub.amount || 0, new Date(sub.next_payment_date), 7),
            });
          } catch (e) { console.error('Email send error (7d):', e); }
        }
        results.reminders7d++;
      }
    }

    // ── 2. Send 1-day renewal reminders ──
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    const twoDaysFromNow = new Date(now);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const { data: subs1d } = await supabase
      .from('paystack_subscriptions')
      .select('id, user_id, tier, next_payment_date, amount')
      .in('status', ['active'])
      .gte('next_payment_date', oneDayFromNow.toISOString())
      .lte('next_payment_date', twoDaysFromNow.toISOString())
      .is('grace_period_ends_at', null);

    for (const sub of subs1d || []) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', sub.user_id)
        .single();

      if (profile?.email) {
        await supabase.from('user_notifications').insert({
          user_id: sub.user_id,
          title: '⚠️ Subscription Renews Tomorrow',
          message: `Your ${sub.tier} subscription (₦${(sub.amount || 0).toLocaleString()}) renews tomorrow. Make sure your payment method is current.`,
          type: 'subscription',
        });

        if (resend) {
          try {
            await resend.emails.send({
              from: 'TaxForge NG <onboarding@resend.dev>',
              to: [profile.email],
              subject: `⚠️ Your ${sub.tier} subscription renews TOMORROW`,
              html: buildRenewalEmail(profile.full_name || 'there', sub.tier, sub.amount || 0, new Date(sub.next_payment_date), 1),
            });
          } catch (e) { console.error('Email send error (1d):', e); }
        }
        results.reminders1d++;
      }
    }

    // ── 3. Start grace period for lapsed subscriptions ──
    const { data: lapsedSubs } = await supabase
      .from('paystack_subscriptions')
      .select('id, user_id, tier, next_payment_date, subscription_code')
      .in('status', ['active', 'non_renewing'])
      .lt('next_payment_date', now.toISOString())
      .is('grace_period_ends_at', null);

    for (const sub of lapsedSubs || []) {
      const graceEnd = new Date(now);
      graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS);

      await supabase
        .from('paystack_subscriptions')
        .update({
          grace_period_ends_at: graceEnd.toISOString(),
          status: 'past_due',
        })
        .eq('id', sub.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', sub.user_id)
        .single();

      if (profile?.email) {
        await supabase.from('user_notifications').insert({
          user_id: sub.user_id,
          title: '🚨 Subscription Payment Overdue',
          message: `Your ${sub.tier} subscription payment is overdue. You have ${GRACE_PERIOD_DAYS} days to update your payment method before being downgraded to the free plan.`,
          type: 'subscription',
        });

        if (resend) {
          try {
            await resend.emails.send({
              from: 'TaxForge NG <onboarding@resend.dev>',
              to: [profile.email],
              subject: `🚨 Action Required: Your ${sub.tier} subscription payment is overdue`,
              html: buildGracePeriodEmail(profile.full_name || 'there', sub.tier, graceEnd),
            });
          } catch (e) { console.error('Email send error (grace):', e); }
        }
        results.graceStarted++;
      }
    }

    // ── 4. Auto-downgrade expired grace periods ──
    const { data: expiredGrace } = await supabase
      .from('paystack_subscriptions')
      .select('id, user_id, tier, subscription_code')
      .lt('grace_period_ends_at', now.toISOString())
      .not('grace_period_ends_at', 'is', null)
      .neq('status', 'expired');

    for (const sub of expiredGrace || []) {
      // Downgrade profile to free
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'free' })
        .eq('id', sub.user_id);

      // Mark subscription as expired
      await supabase
        .from('paystack_subscriptions')
        .update({ status: 'expired' })
        .eq('id', sub.id);

      // Log subscription history
      await supabase.from('subscription_history').insert({
        user_id: sub.user_id,
        previous_tier: sub.tier,
        new_tier: 'free',
        change_type: 'downgrade',
        reason: 'grace_period_expired',
        metadata: { subscription_code: sub.subscription_code },
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', sub.user_id)
        .single();

      if (profile?.email) {
        await supabase.from('user_notifications').insert({
          user_id: sub.user_id,
          title: 'Subscription Downgraded',
          message: `Your ${sub.tier} subscription has been downgraded to Free due to non-payment. Upgrade anytime to restore your features.`,
          type: 'subscription',
        });

        if (resend) {
          try {
            await resend.emails.send({
              from: 'TaxForge NG <onboarding@resend.dev>',
              to: [profile.email],
              subject: `Your TaxForge NG ${sub.tier} subscription has been downgraded`,
              html: buildDowngradeEmail(profile.full_name || 'there', sub.tier),
            });
          } catch (e) { console.error('Email send error (downgrade):', e); }
        }
        results.downgraded++;
      }
    }

    console.log('Subscription lifecycle check complete:', results);

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('check-subscription-expiry error:', error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// ── Email Templates ──

function buildRenewalEmail(name: string, tier: string, amount: number, date: Date, daysLeft: number): string {
  const formattedDate = date.toLocaleDateString('en-NG', { dateStyle: 'long' });
  const isUrgent = daysLeft <= 1;
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#f4f7fa;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,${isUrgent ? '#f59e0b,#d97706' : '#3b82f6,#2563eb'});padding:40px;text-align:center;">
<h1 style="color:#fff;font-size:24px;margin:0;">Subscription Renewal ${isUrgent ? 'Tomorrow' : `in ${daysLeft} Days`}</h1>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#374151;font-size:16px;">Hi ${name},</p>
<p style="color:#374151;font-size:16px;">Your <strong>${tier.charAt(0).toUpperCase() + tier.slice(1)}</strong> subscription (₦${amount.toLocaleString()}) will automatically renew on <strong>${formattedDate}</strong>.</p>
<p style="color:#374151;font-size:16px;">Please ensure your payment method is up to date to avoid any interruption in service.</p>
<table width="100%" style="margin:30px 0;"><tr><td style="text-align:center;">
<a href="https://taxforgeng.com/settings" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;">Manage Subscription</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} TaxForge NG</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildGracePeriodEmail(name: string, tier: string, graceEnd: Date): string {
  const formattedDate = graceEnd.toLocaleDateString('en-NG', { dateStyle: 'long' });
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#f4f7fa;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px;text-align:center;">
<h1 style="color:#fff;font-size:24px;margin:0;">Payment Overdue — Action Required</h1>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#374151;font-size:16px;">Hi ${name},</p>
<p style="color:#374151;font-size:16px;">Your <strong>${tier.charAt(0).toUpperCase() + tier.slice(1)}</strong> subscription payment has failed. You have a <strong>${GRACE_PERIOD_DAYS}-day grace period</strong> until <strong>${formattedDate}</strong> to update your payment method.</p>
<p style="color:#374151;font-size:16px;">After this date, your account will be downgraded to the Free plan and you'll lose access to premium features.</p>
<table width="100%" style="margin:30px 0;"><tr><td style="text-align:center;">
<a href="https://taxforgeng.com/pricing" style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;">Update Payment Now</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} TaxForge NG</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildDowngradeEmail(name: string, previousTier: string): string {
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#f4f7fa;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,#6b7280,#4b5563);padding:40px;text-align:center;">
<h1 style="color:#fff;font-size:24px;margin:0;">Subscription Downgraded</h1>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#374151;font-size:16px;">Hi ${name},</p>
<p style="color:#374151;font-size:16px;">Your <strong>${previousTier.charAt(0).toUpperCase() + previousTier.slice(1)}</strong> subscription has been downgraded to the <strong>Free</strong> plan due to non-payment after the grace period ended.</p>
<p style="color:#374151;font-size:16px;">You still have access to unlimited tax calculations. Upgrade anytime to restore your premium features.</p>
<table width="100%" style="margin:30px 0;"><tr><td style="text-align:center;">
<a href="https://taxforgeng.com/pricing" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;">Resubscribe Now</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} TaxForge NG</p>
</td></tr>
</table></td></tr></table></body></html>`;
}
