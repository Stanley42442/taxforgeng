import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlertRequest {
  userEmail: string;
  alertType: 'failed_backup_codes' | 'suspicious_login' | 'account_locked' | 'new_device';
  attemptCount?: number;
  timestamp: string;
  deviceInfo?: {
    browser: string;
    os: string;
    deviceName: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, alertType, attemptCount, timestamp, deviceInfo }: SecurityAlertRequest = await req.json();

    console.log("Sending security alert to:", userEmail, "type:", alertType);

    let subject = "🚨 Security Alert: Suspicious Activity Detected";
    let alertTitle = "Suspicious Activity Detected";
    let alertMessage = "";
    let actionMessage = "";
    let extraInfo = "";

    switch (alertType) {
      case 'failed_backup_codes':
        subject = "🚨 Security Alert: Multiple Failed Backup Code Attempts";
        alertTitle = "Failed Backup Code Attempts";
        alertMessage = `We detected ${attemptCount || 0} failed attempts to use a backup code on your account. This could indicate someone is trying to access your account.`;
        actionMessage = "If this wasn't you, we recommend changing your password immediately and generating new backup codes.";
        break;
      case 'account_locked':
        subject = "🔒 Security Alert: Account Temporarily Locked";
        alertTitle = "Account Temporarily Locked";
        alertMessage = `Your account has been temporarily locked after ${attemptCount || 0} failed backup code attempts.`;
        actionMessage = "If this was you, please wait 15 minutes before trying again. If this wasn't you, change your password immediately.";
        break;
      case 'new_device':
        subject = "🆕 Security Alert: New Device Login Detected";
        alertTitle = "New Device Login";
        alertMessage = "A new device was used to sign in to your account.";
        actionMessage = "If this was you, you can safely ignore this email. If you don't recognize this login, please change your password immediately.";
        if (deviceInfo) {
          extraInfo = `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Device:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${deviceInfo.deviceName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Browser:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${deviceInfo.browser}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Operating System:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${deviceInfo.os}</td>
            </tr>
          `;
        }
        break;
      default:
        alertMessage = "Unusual activity was detected on your account.";
        actionMessage = "Please review your recent account activity.";
    }

    const emailResponse = await resend.emails.send({
      from: "TaxForge NG Security <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Security Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🚨 ${alertTitle}</h1>
            </div>
            <div style="padding: 30px;">
              <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 600;">
                  ⚠️ Security Warning
                </p>
                <p style="color: #7f1d1d; font-size: 14px; margin: 8px 0 0 0;">
                  ${alertMessage}
                </p>
              </div>
              
              <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${timestamp}</td>
                  </tr>
                  ${alertType === 'new_device' ? extraInfo : `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Failed Attempts:</td>
                    <td style="padding: 8px 0; color: #dc2626; font-size: 14px; font-weight: 600; text-align: right;">${attemptCount || 0}</td>
                  </tr>
                  `}
                </table>
              </div>
              
              <p style="color: #374151; font-size: 14px; margin-bottom: 24px;">
                ${actionMessage}
              </p>
              
              <a href="https://taxforge-ng.lovable.app/settings" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-right: 12px;">
                Review Account Security
              </a>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated security notification from TaxForge NG. If you did not request this, please secure your account immediately.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Security alert email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-security-alert function:", error);
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
