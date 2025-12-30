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
    case 'vat_monthly':
      // 21st of each month
      nextDate.setDate(21);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
    case 'pit_monthly':
    case 'paye_monthly':
      // 10th of each month
      nextDate.setDate(10);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
    case 'cit_annual':
      // June 30th annually
      nextDate.setMonth(5); // June
      nextDate.setDate(30);
      if (nextDate <= now) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      break;
    default:
      // Custom reminder - don't auto-advance
      break;
  }

  return nextDate;
}

// Check if a reminder is due within the next N days
function isDueSoon(dueDate: Date, daysAhead: number = 3): boolean {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return dueDate >= now && dueDate <= futureDate;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting reminder check...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all active reminders with email notifications enabled
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
      
      // Check if reminder is due within 3 days
      if (!isDueSoon(dueDate, 3)) {
        continue;
      }

      console.log(`Processing reminder: ${reminder.title} (due: ${dueDate.toISOString()})`);

      // Get user email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', reminder.user_id)
        .single();

      if (profileError || !profile?.email) {
        console.log(`No email found for user ${reminder.user_id}`);
        continue;
      }

      // Get business name if applicable
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

      // Calculate days until due
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const urgencyText = daysUntilDue <= 1 ? "TOMORROW" : `in ${daysUntilDue} days`;

      // Send the reminder email
      try {
        const emailResponse = await resend.emails.send({
          from: "TaxForge NG <onboarding@resend.dev>",
          to: [(profile as ProfileRow).email!],
          subject: `⚠️ Tax Deadline ${urgencyText}: ${reminder.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Tax Deadline Approaching!</h1>
                </div>
                <div style="padding: 30px;">
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                    <p style="color: #92400e; font-weight: 600; margin: 0;">
                      Your deadline is ${urgencyText}!
                    </p>
                  </div>
                  
                  <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Business:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${businessName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Reminder:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${reminder.title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date:</td>
                        <td style="padding: 8px 0; color: #f59e0b; font-size: 14px; font-weight: 600; text-align: right;">${dueDate.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      </tr>
                    </table>
                  </div>
                  
                  ${reminder.description ? `<p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;"><strong>Note:</strong> ${reminder.description}</p>` : ''}
                  
                  <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">
                    Don't forget to file on time to avoid penalties and interest charges.
                  </p>
                  
                  <a href="https://taxforge.lovable.app/reminders" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    View Reminders
                  </a>
                </div>
                <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    You received this email because you enabled tax reminders on TaxForge NG.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to ${(profile as ProfileRow).email}:`, emailResponse);
        emailsSent.push((profile as ProfileRow).email!);

        // For recurring reminders, update to next due date after the current one passes
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
