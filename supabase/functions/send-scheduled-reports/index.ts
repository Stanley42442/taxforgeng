import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentDayOfWeek = now.getUTCDay(); // 0 = Sunday
    const currentDayOfMonth = now.getUTCDate();

    console.log(`Running scheduled reports check: hour=${currentHour}, dayOfWeek=${currentDayOfWeek}, dayOfMonth=${currentDayOfMonth}`);

    // Get all enabled report schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('is_enabled', true);

    if (schedulesError) {
      console.error("Error fetching schedules:", schedulesError);
      throw schedulesError;
    }

    console.log(`Found ${schedules?.length || 0} enabled schedules`);

    const reportsToSend = [];

    for (const schedule of schedules || []) {
      // Check if it's time to send
      if (schedule.preferred_hour !== currentHour) continue;

      if (schedule.schedule_type === 'weekly' && schedule.day_of_week !== currentDayOfWeek) continue;
      if (schedule.schedule_type === 'monthly' && schedule.day_of_month !== currentDayOfMonth) continue;

      // Check if already sent today
      if (schedule.last_sent_at) {
        const lastSent = new Date(schedule.last_sent_at);
        const hoursDiff = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
        if (hoursDiff < 12) continue; // Don't send twice in 12 hours
      }

      reportsToSend.push(schedule);
    }

    console.log(`${reportsToSend.length} reports to send`);

    for (const schedule of reportsToSend) {
      try {
        // Fetch user profile and email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', schedule.user_id)
          .single();

        if (profileError || !profile?.email) {
          console.log(`No email found for user ${schedule.user_id}`);
          continue;
        }

        // Fetch user's businesses
        const { data: businesses } = await supabase
          .from('businesses')
          .select('name, entity_type, turnover, sector')
          .eq('user_id', schedule.user_id);

        // Fetch expenses for the period
        const periodStart = schedule.schedule_type === 'weekly' 
          ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          : new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount, type, is_deductible')
          .eq('user_id', schedule.user_id)
          .gte('date', periodStart.toISOString().split('T')[0]);

        // Calculate summary
        const income = expenses?.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        const expenseTotal = expenses?.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        const deductible = expenses?.filter(e => e.is_deductible).reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        const netIncome = income - expenseTotal;
        const totalTurnover = businesses?.reduce((sum, b) => sum + Number(b.turnover), 0) || 0;

        // Fetch upcoming reminders
        const { data: reminders } = await supabase
          .from('reminders')
          .select('title, due_date')
          .eq('user_id', schedule.user_id)
          .eq('is_completed', false)
          .gte('due_date', now.toISOString())
          .order('due_date', { ascending: true })
          .limit(5);

        const periodLabel = schedule.schedule_type === 'weekly' ? 'Weekly' : 'Monthly';
        const userName = profile.full_name || 'TaxForge User';

        // Generate business list HTML
        const businessListHtml = businesses && businesses.length > 0 
          ? businesses.slice(0, 5).map(b => `
              <tr>
                <td style="padding: 8px 0; color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">${b.name}</td>
                <td style="padding: 8px 0; color: #374151; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(Number(b.turnover))}</td>
              </tr>
            `).join('')
          : `<tr><td colspan="2" style="padding: 12px; color: #6b7280; text-align: center;">No businesses registered yet</td></tr>`;

        // Generate reminders list HTML
        const remindersHtml = reminders && reminders.length > 0
          ? reminders.map(r => `
              <li style="padding: 4px 0; color: #374151; font-size: 14px;">
                ${r.title} - <span style="color: #10b981; font-weight: 600;">${new Date(r.due_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</span>
              </li>
            `).join('')
          : `<li style="color: #6b7280;">No upcoming reminders</li>`;

        // Send the email
        const emailResponse = await resend.emails.send({
          from: "TaxForge NG <onboarding@resend.dev>",
          to: [profile.email],
          subject: `Your ${periodLabel} TaxForge NG Financial Summary`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #1a4f3e 0%, #2d6a4f 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0 0 8px 0; font-size: 24px;">📊 ${periodLabel} Financial Summary</h1>
                  <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Hello, ${userName}!</p>
                </div>
                
                <div style="padding: 30px;">
                  <!-- Summary Cards -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div style="background: linear-gradient(135deg, #d4af37 0%, #b8962b 100%); border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="color: rgba(255,255,255,0.9); margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase;">Net Income</p>
                      <p style="color: white; margin: 0; font-size: 22px; font-weight: 700;">${formatCurrency(netIncome)}</p>
                    </div>
                    <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase;">Total Turnover</p>
                      <p style="color: #10b981; margin: 0; font-size: 22px; font-weight: 700;">${formatCurrency(totalTurnover)}</p>
                    </div>
                  </div>

                  <!-- Income/Expenses -->
                  <div style="background: #f8faf8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="color: #1a4f3e; margin: 0 0 16px 0; font-size: 16px;">Income & Expenses</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Income</td>
                        <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(income)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Expenses</td>
                        <td style="padding: 8px 0; color: #ef4444; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(expenseTotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Deductible Expenses</td>
                        <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(deductible)}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Businesses -->
                  <div style="background: #f8faf8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="color: #1a4f3e; margin: 0 0 16px 0; font-size: 16px;">Your Businesses (${businesses?.length || 0})</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Name</th>
                        <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Turnover</th>
                      </tr>
                      ${businessListHtml}
                    </table>
                  </div>

                  <!-- Reminders -->
                  <div style="background: #fffbeb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">📅 Upcoming Reminders</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                      ${remindersHtml}
                    </ul>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://taxforgeng.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      View Full Dashboard
                    </a>
                  </div>
                </div>

                <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} TaxForge NG | Operated by Gillespie Benjamin Mclee | Educational tool only
                    <br>
                    <a href="https://taxforgeng.com/settings" style="color: #10b981;">Manage preferences</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Report sent to ${profile.email}:`, emailResponse);

        // Update last_sent_at
        await supabase
          .from('report_schedules')
          .update({ last_sent_at: now.toISOString() })
          .eq('id', schedule.id);

      } catch (error) {
        console.error(`Error sending report for schedule ${schedule.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sentCount: reportsToSend.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-scheduled-reports:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
