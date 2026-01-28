import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BackupCodeAlertRequest {
  userEmail: string;
  remainingCodes: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, remainingCodes }: BackupCodeAlertRequest = await req.json();

    console.log("Sending backup code alert to:", userEmail, "remaining codes:", remainingCodes);

    const emailResponse = await resend.emails.send({
      from: "TaxForge NG <onboarding@resend.dev>",
      to: [userEmail],
      subject: "⚠️ Security Alert: Your Backup Codes Are Running Low",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Backup Codes Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Backup Codes Alert</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                Your two-factor authentication backup codes are running low. You currently have:
              </p>
              
              <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <p style="font-size: 48px; font-weight: bold; color: #d97706; margin: 0;">${remainingCodes}</p>
                <p style="font-size: 14px; color: #92400e; margin: 8px 0 0 0;">backup code${remainingCodes !== 1 ? 's' : ''} remaining</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                Backup codes are one-time use codes that let you sign in when you don't have access to your authenticator app. 
                We recommend generating new codes to ensure you always have a way to access your account.
              </p>
              
              <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #991b1b; font-size: 14px; margin: 0;">
                  <strong>⚠️ Important:</strong> If you run out of backup codes and lose access to your authenticator app, 
                  you may be locked out of your account.
                </p>
              </div>
              
              <a href="https://taxforgeng.com/settings" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Generate New Backup Codes
              </a>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee | Educational tool only
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Backup code alert email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-backup-code-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
