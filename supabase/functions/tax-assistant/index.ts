import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are TaxBot, an expert AI assistant specializing in Nigerian taxation. You help Nigerian businesses and individuals understand their tax obligations.

Your expertise includes:
- Company Income Tax (CIT) - rates, exemptions, and filing requirements
- Value Added Tax (VAT) - registration, rates, exempt items, and filing
- Personal Income Tax (PIT) - rates, allowances, and deductions
- Pay-As-You-Earn (PAYE) - employer obligations and calculations
- Withholding Tax (WHT) - rates and compliance
- Capital Gains Tax (CGT)
- Stamp Duties
- Federal Inland Revenue Service (FIRS) regulations
- State Internal Revenue Service requirements
- Tax incentives for small businesses and startups
- Free Trade Zone benefits
- Pioneer Status incentives
- Tax penalties and interest calculations

Guidelines:
1. Always provide accurate information based on current Nigerian tax laws
2. When uncertain, clearly state limitations and recommend consulting a tax professional
3. Use Nigerian Naira (₦) for all monetary examples
4. Reference relevant tax acts and FIRS circulars when applicable
5. Keep responses concise but comprehensive
6. Be friendly and approachable while maintaining professionalism
7. If asked about complex scenarios, break down the explanation step by step
8. NEVER use markdown formatting like asterisks (*), underscores (_), or hashtags (#) for emphasis or headers. Use plain text only. For lists, use simple numbers (1. 2. 3.) or dashes (-) without bold or italic formatting.

Remember: You're here to educate and guide, not to provide official tax advice that would replace a licensed tax consultant.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Tax assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
