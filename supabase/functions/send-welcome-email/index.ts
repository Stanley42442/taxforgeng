import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-welcome-email function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();
    console.log(`Sending welcome email to: ${email}`);

    const displayName = name || "there";
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const formattedDate = trialEndDate.toLocaleDateString('en-NG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailResponse = await resend.emails.send({
      from: "TaxForge NG <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 Welcome to TaxForge NG — Your 7-Day Business Trial Starts Now!",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TaxForge NG</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to TaxForge NG! 🚀</h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Your 7-day Business tier trial has started</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${displayName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for joining TaxForge NG! You now have <strong>full Business tier access</strong> for the next 7 days — completely free, no credit card required.
              </p>
              
              <!-- Trial Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #f59e0b;">
                    <p style="margin: 0 0 5px; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Trial Expires</p>
                    <p style="margin: 0; color: #78350f; font-size: 20px; font-weight: 700;">${formattedDate}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Features Section -->
              <h2 style="margin: 30px 0 20px; color: #111827; font-size: 20px; font-weight: 600;">What's Included in Your Trial:</h2>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${[
                  { icon: '📊', title: 'Save up to 10 Businesses', desc: 'Track and manage multiple businesses in one dashboard' },
                  { icon: '📄', title: 'Export Reports (PDF & CSV)', desc: 'Download professional tax reports for record-keeping' },
                  { icon: '📝', title: 'Tax Filing Preparation', desc: 'Generate pre-filled FIRS forms ready for TaxProMax' },
                  { icon: '✅', title: 'CAC Verification Tools', desc: 'Verify RC/BN numbers instantly with official records' },
                  { icon: '📈', title: 'Scenario Modeling', desc: 'Compare different business structures and tax strategies' },
                  { icon: '🤖', title: 'Priority AI Assistant', desc: 'Get instant answers to your Nigerian tax questions' },
                ].map(feature => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="50" style="vertical-align: top;">
                          <span style="font-size: 24px;">${feature.icon}</span>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0 0 4px; color: #111827; font-size: 15px; font-weight: 600;">${feature.title}</p>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">${feature.desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `).join('')}
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0 30px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://taxforge.lovable.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                      Go to Your Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Tips Section -->
              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px; color: #166534; font-size: 16px; font-weight: 600;">💡 Quick Tips to Get Started:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                  <li>Add your first business in the <strong>Dashboard</strong></li>
                  <li>Use the <strong>Tax Calculator</strong> to estimate your obligations</li>
                  <li>Ask the <strong>AI Assistant</strong> any tax questions you have</li>
                  <li>Export a report to see the professional PDF format</li>
                </ol>
              </div>
              
              <p style="margin: 20px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                If you have any questions, just reply to this email or use the AI assistant in the app — we're here to help!
              </p>
              
              <p style="margin: 30px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
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

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
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