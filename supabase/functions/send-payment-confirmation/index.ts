import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      userName,
      amount,
      tier,
      billingCycle,
      receiptNumber,
      transactionDate,
      discountApplied,
      discountAmount,
    } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Sending payment confirmation to ${email}`);

    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);

    const formattedDate = new Date(transactionDate || Date.now()).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
    const cycleText = billingCycle === 'annually' ? 'Annual' : 'Monthly';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful! ✓</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Thank you for your subscription</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <p style="font-size: 16px;">Hi ${userName || 'there'},</p>
    
    <p>Your payment has been processed successfully. Here's your receipt:</p>
    
    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Receipt Number</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600;">${receiptNumber || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Date</td>
          <td style="padding: 10px 0; text-align: right;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Plan</td>
          <td style="padding: 10px 0; text-align: right;">${tierName} (${cycleText})</td>
        </tr>
        ${discountApplied ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Discount</td>
          <td style="padding: 10px 0; text-align: right; color: #10b981;">-₦${discountAmount?.toLocaleString() || 0}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #e2e8f0;">
          <td style="padding: 15px 0; font-weight: 600; font-size: 18px;">Total Paid</td>
          <td style="padding: 15px 0; text-align: right; font-weight: 700; font-size: 18px; color: #10b981;">${formattedAmount}</td>
        </tr>
      </table>
    </div>
    
    <p>Your ${tierName} subscription is now active. You can access all premium features immediately.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://taxforgeng.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600;">Go to Dashboard</a>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">
      Need help? Reply to this email or contact us at support@taxforgeng.com
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p>© ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee</p>
    <p>This is a transaction receipt for your records.</p>
  </div>
</body>
</html>
    `;

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'TaxForge NG <noreply@taxforgeng.com>',
          to: [email],
          subject: `Payment Confirmed - ${tierName} Plan`,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('Resend error:', error);
        throw new Error(`Failed to send email: ${error}`);
      }

      console.log('Payment confirmation email sent successfully');
    } else {
      console.log('RESEND_API_KEY not configured, skipping email');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Send payment confirmation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send confirmation' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
