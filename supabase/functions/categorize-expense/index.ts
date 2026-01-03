import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expense categorization AI for Nigerian businesses. Analyze the receipt text and extract:
1. Amount (in Naira)
2. Description (vendor/merchant name or item)
3. Category (one of: income, rent, transport, marketing, salary, utilities, supplies, other)
4. Whether it's tax deductible

Categories explained:
- income: Payments received, credits, deposits
- rent: Office rent, lease payments, workspace costs
- transport: Uber, Bolt, fuel, flights, car expenses
- marketing: Advertising, promotions, Google/Facebook ads
- salary: Staff wages, payroll, employee payments
- utilities: MTN, Airtel, internet, electricity, water, DSTV
- supplies: Equipment, laptops, printers, office supplies
- other: Anything that doesn't fit above

Tax deductibility rules for Nigeria:
- Business-related expenses are generally deductible
- Personal expenses are NOT deductible
- Entertainment has limits (50% deductible)
- Donations to approved charities are deductible
- Capital items may qualify for capital allowances instead

Return ONLY valid JSON with this structure:
{
  "amount": number or null,
  "description": "string",
  "category": "string",
  "isDeductible": boolean,
  "confidence": number (0-100),
  "taxNote": "brief note about deductibility"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receiptText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!receiptText || typeof receiptText !== 'string') {
      return new Response(JSON.stringify({ error: "Receipt text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
          { role: "user", content: `Analyze this receipt text and categorize it:\n\n${receiptText}` },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Categorize expense error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});