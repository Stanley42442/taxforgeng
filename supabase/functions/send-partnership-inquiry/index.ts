import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PartnershipInquiry {
  name: string;
  organization: string;
  websiteUrl: string;
  monthlyPageviews: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, organization, websiteUrl, monthlyPageviews, message }: PartnershipInquiry = await req.json();

    // Basic validation
    if (!name || !organization || !websiteUrl) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("New partnership inquiry from:", organization, websiteUrl);

    const emailResponse = await resend.emails.send({
      from: "TaxForge NG <onboarding@resend.dev>",
      to: ["hello@taxforgeng.com"],
      subject: `New Partnership Request from ${organization}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🤝 New Partnership Request</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                A new partnership request has been submitted via taxforgeng.com/embed-partner.
              </p>
              
              <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Contact Name:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Organization:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${organization}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Website URL:</td>
                    <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 600;">
                      <a href="${websiteUrl}" style="color: #10b981;">${websiteUrl}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Monthly Pageviews:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${monthlyPageviews || 'Not specified'}</td>
                  </tr>
                </table>
              </div>
              
              ${message ? `
              <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
                <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.6;">${message}</p>
              </div>
              ` : ''}
              
              <div style="margin-top: 24px;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">To create an API key for this partner, log in to the admin panel:</p>
                <a href="https://taxforgeng.com/api-docs" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Go to API Docs (Admin)
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} TaxForge NG — Partnership Inquiry via /embed-partner
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Partnership inquiry email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-partnership-inquiry:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
