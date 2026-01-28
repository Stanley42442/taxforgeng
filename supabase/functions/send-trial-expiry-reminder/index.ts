import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-trial-expiry-reminder function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find users who signed up 5 days ago (2 days remaining in trial)
    // Trial is 7 days, so 7 - 2 = 5 days ago
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const startOfDay = new Date(fiveDaysAgo);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fiveDaysAgo);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Checking for users who signed up between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

    // Get profiles with free tier who signed up 5 days ago
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

    console.log(`Found ${profiles?.length || 0} users with expiring trials`);

    const emailResults = [];

    for (const profile of profiles || []) {
      if (!profile.email) {
        console.log(`Skipping user ${profile.id} - no email`);
        continue;
      }

      const displayName = profile.full_name || "there";
      const trialEndDate = new Date(profile.created_at);
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      const formattedDate = trialEndDate.toLocaleDateString('en-NG', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      try {
        const emailResponse = await resend.emails.send({
          from: "TaxForge NG <onboarding@resend.dev>",
          to: [profile.email],
          subject: "⏰ Your TaxForge NG Trial Ends in 2 Days — Don't Lose Your Features!",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Trial is Ending Soon</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <!-- Header with Urgency -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 26px; font-weight: 700;">Your Trial Ends in 2 Days!</h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Keep your Business tier features</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${displayName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your free 7-day Business tier trial at TaxForge NG is ending on <strong>${formattedDate}</strong>. After this date, you'll lose access to premium features unless you upgrade.
              </p>
              
              <!-- Countdown Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 24px; text-align: center; border: 2px solid #fca5a5;">
                    <p style="margin: 0 0 5px; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Time Remaining</p>
                    <p style="margin: 0; color: #7f1d1d; font-size: 36px; font-weight: 800;">2 Days</p>
                  </td>
                </tr>
              </table>
              
              <!-- What You'll Lose Section -->
              <h2 style="margin: 30px 0 20px; color: #111827; font-size: 18px; font-weight: 600;">What You'll Lose After Trial:</h2>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${[
                  { icon: '❌', text: 'Ability to save and manage multiple businesses' },
                  { icon: '❌', text: 'PDF & CSV export for tax reports' },
                  { icon: '❌', text: 'Tax filing preparation tools' },
                  { icon: '❌', text: 'CAC verification capabilities' },
                  { icon: '❌', text: 'Scenario modeling features' },
                ].map(item => `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="40" style="vertical-align: middle;">
                          <span style="font-size: 18px;">${item.icon}</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0; color: #6b7280; font-size: 15px; text-decoration: line-through;">${item.text}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `).join('')}
              </table>
              
              <!-- Pricing Highlight -->
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center; border: 1px solid #6ee7b7;">
                <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: 600;">BUSINESS PLAN</p>
                <p style="margin: 0 0 5px; color: #047857; font-size: 32px; font-weight: 800;">₦8,999<span style="font-size: 16px; font-weight: 400;">/month</span></p>
                <p style="margin: 0; color: #059669; font-size: 14px;">Keep all your features • Cancel anytime</p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://taxforge.lovable.app/pricing" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                      Upgrade Now →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #6b7280; font-size: 14px; text-align: center;">
                Or continue with the free plan — you'll still have unlimited tax calculations!
              </p>
              
              <p style="margin: 30px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Thanks for trying TaxForge NG!<br>
                <strong>Gillespie Benjamin Mclee</strong><br>
                <span style="font-size: 14px; color: #6b7280;">Founder, TaxForge NG</span>
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
                © ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee | Educational tool only
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

        console.log(`Trial reminder email sent to ${profile.email}:`, emailResponse);
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
    console.error("Error in trial expiry reminder:", error);
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