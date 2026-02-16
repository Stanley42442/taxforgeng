import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { summaryData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a financial analyst AI assistant for Nigerian businesses. Analyze spending data and provide actionable insights.

Your analysis should:
1. Identify spending trends and patterns
2. Highlight potential cost-saving opportunities
3. Suggest budget optimizations specific to Nigerian business context
4. Provide 2-3 specific, actionable recommendations
5. Be concise but insightful (max 200 words)

Format your response in plain text with clear sections. Use Nigerian Naira (₦) for currency.`;

    const userPrompt = `Analyze this business expense data for ${summaryData.businessName}:

**Recent Monthly Performance:**
${summaryData.monthlyData.map((m: { month: string; income: number; expenses: number; net: number }) => 
  `- ${m.month}: Income ₦${m.income.toLocaleString()}, Expenses ₦${m.expenses.toLocaleString()}, Net ${m.net >= 0 ? '+' : ''}₦${m.net.toLocaleString()}`
).join('\n')}

**Key Metrics:**
- Savings Rate: ${summaryData.metrics.savingsRate}%
- Income Growth: ${summaryData.metrics.incomeGrowth}%
- Expense Growth: ${summaryData.metrics.expenseGrowth}%
${summaryData.metrics.topCategory ? `- Top Spending: ${summaryData.metrics.topCategory.name} (₦${summaryData.metrics.topCategory.amount.toLocaleString()})` : ''}

**Top Spending Patterns:**
${summaryData.topPatterns.map((p: { category: string; trend: string; avgMonthly: number; percentChange: number }) => 
  `- ${p.category}: ₦${p.avgMonthly.toLocaleString()}/month (${p.trend}, ${p.percentChange >= 0 ? '+' : ''}${p.percentChange.toFixed(0)}%)`
).join('\n')}

Total transactions analyzed: ${summaryData.totalTransactions}

Provide insights and recommendations for improving financial health.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Service is busy. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "Unable to generate insights at this time.";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in expense-insights:", error);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
