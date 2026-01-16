import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TierChangeEmailRequest {
  email: string;
  userName?: string;
  previousTier: string;
  newTier: string;
  changeType: 'upgrade' | 'downgrade';
}

const TIER_DISPLAY_NAMES: Record<string, string> = {
  free: 'Individual (Free)',
  starter: 'Starter',
  basic: 'Basic',
  professional: 'Professional',
  business: 'Business',
  corporate: 'Corporate',
};

const TIER_FEATURES: Record<string, string[]> = {
  free: ['Basic tax calculator', 'Individual tax computations'],
  starter: ['1 saved business', 'PDF exports', 'No watermarks'],
  basic: ['2 saved businesses', 'All Starter features', 'Priority support'],
  professional: ['5 saved businesses', 'Scenario modeling', 'Multi-year projections'],
  business: ['10 saved businesses', 'CAC verification', 'E-filing support', 'Team access'],
  corporate: ['Unlimited businesses', 'API access', 'White-label options', 'Dedicated support'],
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName, previousTier, newTier, changeType }: TierChangeEmailRequest = await req.json();

    console.log(`Processing tier change email for ${email}: ${previousTier} -> ${newTier} (${changeType})`);

    if (!email) {
      throw new Error("Email is required");
    }

    const displayName = userName || 'Valued Customer';
    const previousTierName = TIER_DISPLAY_NAMES[previousTier] || previousTier;
    const newTierName = TIER_DISPLAY_NAMES[newTier] || newTier;
    const newFeatures = TIER_FEATURES[newTier] || [];

    const isUpgrade = changeType === 'upgrade';

    const subject = isUpgrade 
      ? `🎉 Welcome to ${newTierName} - Your TaxForge NG Account has been Upgraded!`
      : `Your TaxForge NG Plan has Changed to ${newTierName}`;

    const emailHtml = isUpgrade ? `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10B981 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your account has been upgraded</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
          
          <p>Great news! Your TaxForge NG subscription has been successfully upgraded from <strong>${previousTierName}</strong> to <strong>${newTierName}</strong>.</p>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #059669;">✨ Your New Features Include:</h3>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              ${newFeatures.map(feature => `<li style="margin: 8px 0;">${feature}</li>`).join('')}
            </ul>
          </div>
          
          <p>Start exploring your new capabilities right away!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://taxforgeng.lovable.app/dashboard" style="background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Dashboard</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">Thank you for choosing TaxForge NG for your tax management needs!</p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} TaxForge NG. All rights reserved.</p>
          <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 11px;">Questions? Reply to this email or visit our support center.</p>
        </div>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Plan Change Confirmation</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
          
          <p>Your TaxForge NG subscription has been changed from <strong>${previousTierName}</strong> to <strong>${newTierName}</strong>.</p>
          
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>🔒 Your Data is Safe</strong></p>
            <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">All your businesses, invoices, expenses, and calculations have been preserved. If you upgrade again, everything will be right where you left it.</p>
          </div>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #6366f1;">Your ${newTierName} Features:</h3>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              ${newFeatures.map(feature => `<li style="margin: 8px 0;">${feature}</li>`).join('')}
            </ul>
          </div>
          
          <p>Ready to unlock more features? Upgrade anytime to access premium capabilities.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://taxforgeng.lovable.app/pricing" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Plans</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">Thank you for being a TaxForge NG user!</p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} TaxForge NG. All rights reserved.</p>
          <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 11px;">Questions? Reply to this email or visit our support center.</p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "TaxForge NG <onboarding@resend.dev>",
      to: [email],
      subject,
      html: emailHtml,
    });

    console.log("Tier change email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-tier-change-email function:", error);
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
