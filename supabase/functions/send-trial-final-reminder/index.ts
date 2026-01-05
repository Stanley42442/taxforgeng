import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-trial-final-reminder function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find users who signed up exactly 7 days ago (trial expires today)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startOfDay = new Date(sevenDaysAgo);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sevenDaysAgo);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Checking for users whose trial expires today (signed up between ${startOfDay.toISOString()} and ${endOfDay.toISOString()})`);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, subscription_tier, created_at')
      .eq('subscription_tier', 'free')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} users whose trial expires today`);

    const emailResults = [];

    for (const profile of profiles || []) {
      if (!profile.email) {
        console.log(`Skipping user ${profile.id} - no email`);
        continue;
      }

      const displayName = profile.full_name || "there";

      try {
        const emailResponse = await resend.emails.send({
          from: "TaxForge NG <onboarding@resend.dev>",
          to: [profile.email],
          subject: "🚨 Your TaxForge NG Trial Expires TODAY — Last Chance to Upgrade!",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Trial Expires Today</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <!-- Urgent Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="font-size: 56px; margin-bottom: 15px;">🚨</div>
              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 28px; font-weight: 700;">Your Trial Expires TODAY!</h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">This is your last chance to keep Business tier features</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${displayName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your 7-day free trial of TaxForge NG Business tier <strong>ends today</strong>. Once it expires, you'll be downgraded to the free plan and lose access to premium features.
              </p>
              
              <!-- Urgent Timer Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); border-radius: 12px; padding: 30px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #fecaca; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">⚡ EXPIRES IN</p>
                    <p style="margin: 0; color: #ffffff; font-size: 48px; font-weight: 800;">HOURS</p>
                    <p style="margin: 10px 0 0; color: #fca5a5; font-size: 14px;">Upgrade now to avoid losing your data</p>
                  </td>
                </tr>
              </table>
              
              <!-- What's At Stake -->
              <h2 style="margin: 30px 0 20px; color: #111827; font-size: 18px; font-weight: 600;">Here's what you're about to lose:</h2>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef2f2; border-radius: 12px; padding: 20px; border: 1px solid #fecaca;">
                <tr>
                  <td>
                    ${[
                      'Save and manage up to 10 businesses',
                      'Export professional PDF & CSV reports',
                      'Tax filing preparation for FIRS',
                      'CAC verification tools',
                      'Advanced scenario modeling',
                      'Priority AI tax assistant',
                    ].map(item => `
                    <p style="margin: 12px 0; color: #991b1b; font-size: 15px;">
                      <span style="margin-right: 10px;">❌</span>${item}
                    </p>
                    `).join('')}
                  </td>
                </tr>
              </table>
              
              <!-- Special Offer -->
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 5px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">UPGRADE TODAY</p>
                <p style="margin: 0 0 10px; color: #ffffff; font-size: 36px; font-weight: 800;">₦8,999<span style="font-size: 16px; font-weight: 400;">/month</span></p>
                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">Full Business features • Cancel anytime</p>
              </div>
              
              <!-- Primary CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://taxforge.lovable.app/pricing" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 20px 50px; border-radius: 8px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                      Upgrade Before Midnight →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #6b7280; font-size: 14px; text-align: center;">
                Not ready? No worries — you can continue with our free plan and unlimited tax calculations.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Thanks for being part of TaxForge NG!<br>
                <strong>The TaxForge NG Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                TaxForge NG — Smart Tax Advice for Nigerian Businesses
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 TaxForge NG. For educational purposes only.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
        });

        console.log(`Final trial reminder sent to ${profile.email}:`, emailResponse);
        emailResults.push({ email: profile.email, success: true });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${profile.email}:`, emailError);
        emailResults.push({ email: profile.email, success: false, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: profiles?.length || 0,
        results: emailResults 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in final trial reminder:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);