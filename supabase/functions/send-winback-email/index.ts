import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-winback-email function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find users who signed up 10 days ago (trial expired 3 days ago)
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const startOfDay = new Date(tenDaysAgo);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(tenDaysAgo);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Checking for users who signed up 10 days ago (trial expired 3 days ago): ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    // Get profiles still on free tier who signed up 10 days ago
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

    console.log(`Found ${profiles?.length || 0} users for win-back campaign`);

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
          subject: "💚 We Miss You! Here's 20% Off Your First Month at TaxForge NG",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Miss You at TaxForge NG</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <!-- Friendly Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 50px 40px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 15px;">💚</div>
              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 28px; font-weight: 700;">We Miss You!</h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Come back and get 20% off your first month</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${displayName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                It's been a few days since your TaxForge NG trial ended, and we wanted to check in. We noticed you haven't upgraded yet, and we'd love to have you back!
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                To sweeten the deal, here's a <strong>special offer just for you</strong>:
              </p>
              
              <!-- Special Offer Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 30px; text-align: center; border: 2px dashed #f59e0b;">
                    <p style="margin: 0 0 5px; color: #92400e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">EXCLUSIVE COMEBACK OFFER</p>
                    <p style="margin: 0 0 10px; color: #78350f; font-size: 48px; font-weight: 800;">20% OFF</p>
                    <p style="margin: 0 0 15px; color: #92400e; font-size: 16px;">Your first month of Business Plan</p>
                    <div style="background-color: #ffffff; border-radius: 8px; padding: 12px 20px; display: inline-block;">
                      <p style="margin: 0; color: #78350f; font-size: 14px;">
                        <span style="text-decoration: line-through; color: #9ca3af;">₦8,999</span>
                        <span style="font-size: 24px; font-weight: 700; margin-left: 10px;">₦7,199</span>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- What You're Missing -->
              <h2 style="margin: 30px 0 20px; color: #111827; font-size: 18px; font-weight: 600;">Remember what you're missing?</h2>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${[
                  { icon: '💼', title: 'Multi-Business Management', desc: 'Save and track up to 10 businesses' },
                  { icon: '📊', title: 'Professional Reports', desc: 'Export beautiful PDF & CSV reports' },
                  { icon: '📝', title: 'Tax Filing Made Easy', desc: 'Pre-filled FIRS forms for TaxProMax' },
                  { icon: '✅', title: 'CAC Verification', desc: 'Instantly verify RC/BN numbers' },
                  { icon: '🤖', title: 'AI Tax Assistant', desc: 'Get instant answers to tax questions' },
                ].map(feature => `
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 10px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="50" style="vertical-align: top;">
                          <span style="font-size: 28px;">${feature.icon}</span>
                        </td>
                        <td style="vertical-align: top; padding-left: 10px;">
                          <p style="margin: 0 0 4px; color: #111827; font-size: 16px; font-weight: 600;">${feature.title}</p>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">${feature.desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                `).join('')}
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0 30px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://taxforge.lovable.app/pricing" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 18px; font-weight: 700; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);">
                      Claim Your 20% Discount →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #6b7280; font-size: 14px; text-align: center;">
                This offer expires in 48 hours. Don't miss out!
              </p>
              
              <!-- Testimonial -->
              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin: 30px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0 0 10px; color: #166534; font-size: 15px; font-style: italic; line-height: 1.6;">
                  "TaxForge NG saved me over ₦500,000 in tax optimization last year. The Business plan pays for itself in the first month!"
                </p>
                <p style="margin: 0; color: #15803d; font-size: 14px; font-weight: 600;">
                  — Chidi O., Lagos Tech Entrepreneur
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Questions? Just reply to this email — we're here to help!<br><br>
                Warm regards,<br>
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

        console.log(`Win-back email sent to ${profile.email}:`, emailResponse);
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
    console.error("Error in win-back email:", error);
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