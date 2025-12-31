import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRow {
  id: string;
  user_id: string;
  business_id: string | null;
  reminder_type: string;
  title: string;
  due_date: string;
  notify_email: boolean;
  description: string | null;
  is_completed: boolean;
}

interface ProfileRow {
  email: string | null;
}

interface BusinessRow {
  name: string;
}

// Calculate the next due date based on reminder type
function getNextDueDate(reminderType: string, currentDueDate: Date): Date {
  const now = new Date();
  let nextDate = new Date(currentDueDate);

  switch (reminderType) {
    case 'vat':
      nextDate.setDate(21);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
    case 'pit':
    case 'paye':
      nextDate.setDate(10);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
    case 'cit':
      nextDate.setMonth(5);
      nextDate.setDate(30);
      if (nextDate <= now) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      break;
    default:
      break;
  }

  return nextDate;
}

function isDueSoon(dueDate: Date, daysAhead: number = 3): boolean {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  // Include reminders that are due within the next X days OR just became due (within past 5 minutes)
  const pastBuffer = new Date(now);
  pastBuffer.setMinutes(pastBuffer.getMinutes() - 5);
  
  return dueDate >= pastBuffer && dueDate <= futureDate;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-NG', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Professional HTML email template
function generateEmailHtml(params: {
  businessName: string;
  reminderTitle: string;
  dueDate: string;
  daysUntilDue: number;
  description?: string;
  appUrl: string;
}): string {
  const { businessName, reminderTitle, dueDate, daysUntilDue, description, appUrl } = params;
  const urgencyText = daysUntilDue <= 0 ? "TODAY" : daysUntilDue === 1 ? "TOMORROW" : `in ${daysUntilDue} days`;
  const isUrgent = daysUntilDue <= 1;
  const bannerColor = isUrgent ? '#ef4444' : '#f59e0b';
  const bannerGradient = isUrgent 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Tax Deadline Reminder</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 24px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="color: #10b981; font-size: 28px; margin-right: 8px;">⚡</span>
                    <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">TaxForge NG</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background: ${bannerGradient}; padding: 40px 24px; text-align: center;">
              <div style="font-size: 56px; line-height: 1; margin-bottom: 12px;">⏰</div>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.2;">Tax Deadline Approaching!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 20px; font-weight: 500; margin: 0;">Your deadline is <strong>${urgencyText}</strong></p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              
              <!-- Deadline Card -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa; border-radius: 12px; border: 1px solid #e4e4e7; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="color: #71717a; font-size: 14px;">Business</td>
                              <td style="color: #18181b; font-size: 14px; font-weight: 600; text-align: right;">${businessName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="color: #71717a; font-size: 14px;">Reminder</td>
                              <td style="color: #18181b; font-size: 14px; font-weight: 600; text-align: right;">${reminderTitle}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="color: #71717a; font-size: 14px;">Due Date</td>
                              <td style="color: ${bannerColor}; font-size: 14px; font-weight: 700; text-align: right;">${dueDate}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${description ? `
              <!-- Note Section -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="color: #92400e; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">📝 Note</p>
                    <p style="color: #78350f; font-size: 14px; margin: 0; line-height: 1.5;">${description}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                Don't forget to file on time to avoid penalties and interest charges from the Federal Inland Revenue Service (FIRS).
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/reminders" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                      View All Reminders →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Tips Section -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">💡 Quick Tips</p>
                    <p style="color: #15803d; font-size: 13px; margin: 0 0 6px 0; line-height: 1.4;">• Prepare all required documents in advance</p>
                    <p style="color: #15803d; font-size: 13px; margin: 0 0 6px 0; line-height: 1.4;">• Double-check calculations before submission</p>
                    <p style="color: #15803d; font-size: 13px; margin: 0; line-height: 1.4;">• Keep copies of all filed returns</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 8px 0;">
                You received this email because you enabled tax reminders on TaxForge NG.
              </p>
              <p style="color: #71717a; font-size: 12px; margin: 0 0 16px 0;">
                <a href="${appUrl}/reminders" style="color: #71717a; text-decoration: underline;">Manage notification preferences</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 16px 0;">
              <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
                © 2025 TaxForge NG. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting reminder check...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appUrl = "https://taxforge.lovable.app";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .eq('notify_email', true)
      .eq('is_completed', false);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} active reminders`);

    const emailsSent: string[] = [];
    const remindersUpdated: string[] = [];

    for (const reminder of (reminders as ReminderRow[] || [])) {
      const dueDate = new Date(reminder.due_date);
      const now = new Date();
      
      // For custom reminders, only send email when the exact time is reached (within 5 min window)
      // For standard reminders, send 3 days ahead as before
      if (reminder.reminder_type === 'custom') {
        // Check if the reminder time has arrived (within 5 minutes of due time)
        const timeDiff = now.getTime() - dueDate.getTime();
        const isTimeToSend = timeDiff >= 0 && timeDiff <= 5 * 60 * 1000; // 0 to 5 minutes after due time
        
        if (!isTimeToSend) {
          continue;
        }
      } else {
        // Standard reminders: send if due within 3 days
        if (!isDueSoon(dueDate, 3)) {
          continue;
        }
      }

      // Check if we already sent a notification recently (within last hour) to prevent duplicates
      const lastNotified = (reminder as any).last_notified_at ? new Date((reminder as any).last_notified_at) : null;
      if (lastNotified) {
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        if (lastNotified > hourAgo) {
          console.log(`Skipping reminder ${reminder.id} - already notified at ${lastNotified.toISOString()}`);
          continue;
        }
      }

      console.log(`Processing reminder: ${reminder.title} (due: ${dueDate.toISOString()})`);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', reminder.user_id)
        .single();

      if (profileError || !profile?.email) {
        console.log(`No email found for user ${reminder.user_id}`);
        continue;
      }

      let businessName = "Your Business";
      if (reminder.business_id) {
        const { data: business } = await supabase
          .from('businesses')
          .select('name')
          .eq('id', reminder.business_id)
          .single();
        
        if (business) {
          businessName = (business as BusinessRow).name;
        }
      }

      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const urgencyText = daysUntilDue <= 0 ? "NOW" : daysUntilDue === 1 ? "TOMORROW" : `in ${daysUntilDue} days`;

      try {
        const html = generateEmailHtml({
          businessName,
          reminderTitle: reminder.title,
          dueDate: formatDate(dueDate),
          daysUntilDue,
          description: reminder.description || undefined,
          appUrl,
        });

        const emailResponse = await resend.emails.send({
          from: "TaxForge NG <onboarding@resend.dev>",
          to: [(profile as ProfileRow).email!],
          subject: `⚠️ Tax Reminder ${urgencyText}: ${reminder.title}`,
          html,
        });

        console.log(`Email sent to ${(profile as ProfileRow).email}:`, emailResponse);
        emailsSent.push((profile as ProfileRow).email!);

        // Update last_notified_at to prevent duplicate emails
        await supabase
          .from('reminders')
          .update({ last_notified_at: now.toISOString() })
          .eq('id', reminder.id);

        // For standard reminders that are past due, update to next occurrence
        if (reminder.reminder_type !== 'custom' && daysUntilDue <= 0) {
          const nextDueDate = getNextDueDate(reminder.reminder_type, dueDate);
          
          const { error: updateError } = await supabase
            .from('reminders')
            .update({ due_date: nextDueDate.toISOString() })
            .eq('id', reminder.id);

          if (!updateError) {
            remindersUpdated.push(reminder.id);
            console.log(`Updated reminder ${reminder.id} to next due date: ${nextDueDate.toISOString()}`);
          }
        }
      } catch (emailError) {
        console.error(`Failed to send email for reminder ${reminder.id}:`, emailError);
      }
    }

    const result = {
      success: true,
      emailsSent: emailsSent.length,
      remindersUpdated: remindersUpdated.length,
      details: {
        emails: emailsSent,
        updated: remindersUpdated,
      },
    };

    console.log("Reminder check complete:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in check-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);