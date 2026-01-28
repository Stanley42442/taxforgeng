import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  senderEmail?: string;
  reportType: 'tax-calculation' | 'business-report' | 'expenses' | 'invoice' | 'general';
  reportTitle: string;
  attachmentData: string; // Base64 encoded PDF
  attachmentName: string;
  message?: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  'tax-calculation': 'Tax Calculation Report',
  'business-report': 'Business Report',
  'expenses': 'Expense Report',
  'invoice': 'Invoice',
  'general': 'Report',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token for logging
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    const {
      recipientEmail,
      recipientName,
      senderName,
      senderEmail,
      reportType,
      reportTitle,
      attachmentData,
      attachmentName,
      message,
    }: ReportEmailRequest = await req.json();

    // Validate required fields
    if (!recipientEmail || !reportType || !attachmentData || !attachmentName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const reportTypeLabel = REPORT_TYPE_LABELS[reportType] || 'Report';
    const recipientGreeting = recipientName ? `Dear ${recipientName}` : 'Hello';
    const senderSignature = senderName || 'TaxForge NG User';
    const customMessage = message ? `<p style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #008751; font-style: italic;">${message}</p>` : '';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Nigerian colors -->
          <tr>
            <td style="background: linear-gradient(135deg, #008751 0%, #006644 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px;">
                      <span style="color: #ffffff; font-size: 24px; font-weight: bold;">TF</span>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <span style="color: #D4AF37; font-size: 14px; font-weight: 500;">${reportTypeLabel}</span>
                  </td>
                </tr>
              </table>
              <h1 style="color: #ffffff; margin: 20px 0 0 0; font-size: 28px; font-weight: 600;">${reportTitle}</h1>
            </td>
          </tr>
          
          <!-- Gold accent bar -->
          <tr>
            <td style="background-color: #D4AF37; height: 4px;"></td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${recipientGreeting},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${senderSignature} has shared a ${reportTypeLabel.toLowerCase()} with you from TaxForge NG.
              </p>
              
              ${customMessage}
              
              <div style="background-color: #f8fdf9; border: 1px solid #008751; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="50">
                      <div style="width: 40px; height: 40px; background-color: #008751; border-radius: 8px; text-align: center; line-height: 40px;">
                        <span style="color: #ffffff; font-size: 20px;">📎</span>
                      </div>
                    </td>
                    <td style="padding-left: 15px;">
                      <p style="margin: 0; color: #333333; font-weight: 600; font-size: 14px;">${attachmentName}</p>
                      <p style="margin: 5px 0 0 0; color: #666666; font-size: 12px;">PDF Document attached to this email</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
                This document was generated by <strong>TaxForge NG</strong>, Nigeria's trusted tax calculation platform.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #666666; font-size: 12px;">
                      © ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee
                    </p>
                    <p style="margin: 5px 0 0 0; color: #999999; font-size: 11px;">
                      This email was sent on behalf of a TaxForge NG user.
                    </p>
                  </td>
                  <td style="text-align: right;">
                    <a href="https://taxforgeng.lovable.app" style="color: #008751; text-decoration: none; font-size: 12px; font-weight: 500;">
                      Visit TaxForge NG →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email with attachment
    const emailResponse = await resend.emails.send({
      from: "TaxForge NG <reports@resend.dev>",
      to: [recipientEmail],
      reply_to: senderEmail,
      subject: `${reportTitle} - Shared via TaxForge NG`,
      html: emailHtml,
      attachments: [
        {
          filename: attachmentName,
          content: attachmentData,
        },
      ],
    });

    console.log("Report email sent successfully:", emailResponse);

    // Log the email if user is authenticated
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabaseAdmin.from('email_logs').insert({
        user_id: userId,
        recipient_email: recipientEmail,
        report_type: reportType,
        report_title: reportTitle,
        status: 'sent',
      });
    }

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-report-email function:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
