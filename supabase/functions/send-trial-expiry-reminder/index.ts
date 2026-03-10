import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-trial-expiry-reminder function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find users whose trial_expires_at is within 2 days from now
    const now = new Date();
    const twoDaysFromNow = new Date(now);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    console.log(`Checking for trials expiring between ${twoDaysFromNow.toISOString()} and ${threeDaysFromNow.toISOString()}`);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, subscription_tier, trial_expires_at')
      .not('trial_expires_at', 'is', null)
      .gte('trial_expires_at', twoDaysFromNow.toISOString())
      .lte('trial_expires_at', threeDaysFromNow.toISOString());

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} users with trials expiring in ~2 days`);

    const emailResults = [];

    for (const profile of profiles || []) {
      if (!profile.email) continue;

      const displayName = profile.full_name || "there";
      const trialEndDate = new Date(profile.trial_expires_at);
      const formattedDate = trialEndDate.toLocaleDateString('en-NG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const tierName = profile.subscription_tier?.charAt(0).toUpperCase() + profile.subscription_tier?.slice(1);

      // Create in-app notification
      await supabase.from('user_notifications').insert({
        user_id: profile.id,
        title: '⏰ Trial Ends in 2 Days',
        message: `Your ${tierName} trial ends on ${formattedDate}. Upgrade now to keep your features!`,
        type: 'subscription',
      });

      try {
        const emailResponse = await resend.emails.send({
          from: "TaxForge NG <onboarding@resend.dev>",
          to: [profile.email],
          subject: `⏰ Your TaxForge NG ${tierName} Trial Ends in 2 Days`,
          html: `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#f4f7fa;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:40px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">⏰</div>
<h1 style="margin:0 0 10px;color:#fff;font-size:26px;font-weight:700;">Your Trial Ends in 2 Days!</h1>
<p style="margin:0;color:rgba(255,255,255,.9);font-size:16px;">Keep your ${tierName} features</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#374151;font-size:16px;">Hi ${displayName},</p>
<p style="color:#374151;font-size:16px;">Your free ${tierName} trial at TaxForge NG is ending on <strong>${formattedDate}</strong>. After this date, you'll lose access to premium features unless you upgrade.</p>
<table width="100%" style="margin:30px 0;"><tr>
<td style="background:linear-gradient(135deg,#fef2f2,#fee2e2);border-radius:12px;padding:24px;text-align:center;border:2px solid #fca5a5;">
<p style="margin:0 0 5px;color:#991b1b;font-size:14px;font-weight:600;text-transform:uppercase;">Time Remaining</p>
<p style="margin:0;color:#7f1d1d;font-size:36px;font-weight:800;">2 Days</p>
</td></tr></table>
<div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:12px;padding:24px;margin:30px 0;text-align:center;border:1px solid #6ee7b7;">
<p style="margin:0 0 5px;color:#065f46;font-size:14px;font-weight:600;">UPGRADE TO KEEP YOUR FEATURES</p>
<p style="margin:0;color:#059669;font-size:14px;">Cancel anytime • Keep all your data</p>
</div>
<table width="100%" style="margin:30px 0;"><tr><td style="text-align:center;">
<a href="https://taxforgeng.com/pricing" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:18px 48px;border-radius:8px;font-size:18px;font-weight:700;box-shadow:0 4px 14px rgba(16,185,129,.4);">Upgrade Now →</a>
</td></tr></table>
<p style="color:#6b7280;font-size:14px;text-align:center;">Or continue with the free plan — you'll still have unlimited tax calculations!</p>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} TaxForge NG | Educational tool only</p>
</td></tr>
</table></td></tr></table></body></html>`,
        });

        console.log(`Trial reminder email sent to ${profile.email}:`, emailResponse);
        emailResults.push({ email: profile.email, success: true });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${profile.email}:`, emailError);
        emailResults.push({ email: profile.email, success: false, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: profiles?.length || 0, results: emailResults }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in trial expiry reminder:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

Deno.serve(handler);
