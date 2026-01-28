import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatOperationType(type: string): string {
  const labels: Record<string, string> = {
    'subscription_change': 'change your subscription plan',
    'add_payment_method': 'add a new payment method',
    'remove_payment_method': 'remove a payment method',
    'set_default_payment_method': 'change your default payment method',
  };
  return labels[type] || 'perform a sensitive operation';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { email, code, operationType, userName } = await req.json();

    if (!email || !code) {
      throw new Error("Email and code are required");
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Verification Required</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #1f2937;">Hi ${userName || 'there'},</p>
    
    <p style="color: #4b5563;">You've requested to <strong>${formatOperationType(operationType)}</strong>. 
    Please enter this verification code to proceed:</p>
    
    <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 25px; text-align: center; border-radius: 12px; margin: 25px 0; border: 2px dashed #10b981;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1f2937; font-family: monospace;">${code}</span>
    </div>
    
    <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="color: #92400e; font-size: 14px; margin: 0;">
        ⏱️ This code expires in <strong>10 minutes</strong>.<br>
        🔒 If you didn't request this, please ignore this email and secure your account.
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      This is an automated security email from TaxForge NG.<br>
      <strong>Never share this code with anyone.</strong> TaxForge will never ask for it.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 11px;">
    <p>© ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee | Educational tool only</p>
  </div>
</body>
</html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TaxForge Security <security@taxforgeng.com>",
        to: [email],
        subject: `🔐 Your TaxForge Verification Code: ${code}`,
        html: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error sending 2FA code:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
