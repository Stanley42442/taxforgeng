import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PartnerDecisionPayload {
  requestId: string;
  decision: "approved" | "rejected";
  partnerEmail: string;
  partnerName: string;
  organization: string;
  reviewerNote?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, decision, partnerEmail, partnerName, organization, reviewerNote }: PartnerDecisionPayload = await req.json();

    if (!requestId || !decision || !partnerEmail || !partnerName || !organization) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Sending ${decision} email to ${partnerEmail} for org: ${organization}`);

    const year = new Date().getFullYear();

    let subject: string;
    let html: string;

    if (decision === "approved") {
      subject = `🎉 Your TaxForge NG Partnership Request Has Been Approved — ${organization}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Partnership Approved!</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Welcome to the TaxForge NG Partner Network</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 36px 30px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">Hi ${partnerName},</p>
              
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
                Great news — your partnership request for <strong>${organization}</strong> has been <strong style="color: #10b981;">approved</strong>! 
                We're excited to have you as an official TaxForge NG embed partner.
              </p>

              <!-- What happens next -->
              <div style="background: #f0fdf4; border-radius: 10px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h2 style="color: #065f46; font-size: 16px; margin: 0 0 16px; font-weight: 700;">📋 What Happens Next</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 14px; vertical-align: top; width: 28px;">
                      <strong style="color: #10b981;">1.</strong>
                    </td>
                    <td style="padding: 8px 0; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>API Key Coming Shortly</strong> — Your personal partner API key will be generated and sent to this email address within <strong>24 hours</strong>. It will include your allowed domains and usage limits.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 14px; vertical-align: top;">
                      <strong style="color: #10b981;">2.</strong>
                    </td>
                    <td style="padding: 8px 0; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>Embed the Widget</strong> — Once you have your key, replace <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 12px;">YOUR_API_KEY_HERE</code> in either snippet below and paste it into your site.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 14px; vertical-align: top;">
                      <strong style="color: #10b981;">3.</strong>
                    </td>
                    <td style="padding: 8px 0; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>Keep the Attribution Link</strong> — The "Powered by TaxForge NG" link in the widget footer must remain visible as per the partnership agreement.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Embed Snippets Preview -->
              <h2 style="color: #111827; font-size: 15px; font-weight: 700; margin: 0 0 12px;">🔌 Embed Snippets (requires your API key)</h2>
              
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;"><strong>JS SDK (recommended):</strong></p>
              <div style="background: #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 16px; overflow-x: auto;">
                <pre style="color: #d1fae5; font-size: 12px; margin: 0; white-space: pre-wrap; font-family: 'Courier New', monospace;">&lt;div id="taxforge-calculator"&gt;&lt;/div&gt;
&lt;script src="https://taxforgeng.com/embed.js"&gt;&lt;/script&gt;
&lt;script&gt;
  TaxForge.init({
    container: '#taxforge-calculator',
    apiKey: 'YOUR_API_KEY_HERE'
  });
&lt;/script&gt;</pre>
              </div>

              <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;"><strong>iFrame (for CMS platforms like WordPress, Webflow):</strong></p>
              <div style="background: #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 24px; overflow-x: auto;">
                <pre style="color: #d1fae5; font-size: 12px; margin: 0; white-space: pre-wrap; font-family: 'Courier New', monospace;">&lt;iframe
  src="https://taxforgeng.com/embed/calculator?key=YOUR_API_KEY_HERE"
  width="100%" height="820"
  style="border:none; border-radius:12px;"
  title="Nigeria Tax Calculator by TaxForge NG"
  loading="lazy"&gt;
&lt;/iframe&gt;</pre>
              </div>

              ${reviewerNote ? `
              <div style="background: #fefce8; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #eab308;">
                <p style="color: #713f12; font-size: 13px; margin: 0;"><strong>Note from our team:</strong> ${reviewerNote}</p>
              </div>
              ` : ''}

              <!-- CTA -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="https://taxforgeng.com/embed-partner#guide" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                  📖 View Integration Guide
                </a>
              </div>

              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                Questions? Reply to this email or contact us at <a href="mailto:hello@taxforgeng.com" style="color: #10b981;">hello@taxforgeng.com</a>.
                We're here to make your integration as smooth as possible.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${year} TaxForge NG — Partner approval for ${organization}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // rejected
      subject = `Your TaxForge NG Partnership Request — ${organization}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Partnership Request Update</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 15px;">TaxForge NG Embed Partner Program</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 36px 30px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">Hi ${partnerName},</p>
              
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
                Thank you for your interest in the TaxForge NG partner embed program, and for taking the time to apply on behalf of <strong>${organization}</strong>.
              </p>

              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
                After reviewing your application, we're unfortunately unable to approve the partnership at this time. We review each request carefully against our partner criteria, and unfortunately your site didn't meet our requirements for this round.
              </p>

              ${reviewerNote ? `
              <div style="background: #f3f4f6; border-radius: 10px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #9ca3af;">
                <p style="color: #374151; font-size: 14px; margin: 0 0 6px;"><strong>Additional context from our team:</strong></p>
                <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.6;">${reviewerNote}</p>
              </div>
              ` : ''}

              <!-- What you can do -->
              <div style="background: #f0f9ff; border-radius: 10px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
                <h2 style="color: #1e3a5f; font-size: 15px; margin: 0 0 14px; font-weight: 700;">💡 What You Can Still Do</h2>
                <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.9;">
                  <li>Try the <strong>free sandbox demo</strong> at <a href="https://taxforgeng.com/embed-partner#demo" style="color: #3b82f6;">taxforgeng.com/embed-partner</a> — no key required</li>
                  <li>Reapply in <strong>3 months</strong> if you've grown your audience or changed your site</li>
                  <li>Share our calculator link directly with your readers: <a href="https://taxforgeng.com" style="color: #3b82f6;">taxforgeng.com</a></li>
                </ul>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="https://taxforgeng.com/embed-partner" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                  Try the Free Sandbox Demo
                </a>
              </div>

              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                We appreciate your interest and hope to work together in the future. If you have any questions, feel free to reach out at 
                <a href="mailto:hello@taxforgeng.com" style="color: #10b981;">hello@taxforgeng.com</a>.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${year} TaxForge NG — Partnership update for ${organization}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "TaxForge NG <onboarding@resend.dev>",
      to: [partnerEmail],
      subject,
      html,
    });

    console.log(`Partner decision email sent (${decision}):`, emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-partner-decision:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
