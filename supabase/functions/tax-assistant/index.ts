import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Query categorization keywords
const QUERY_CATEGORIES: Record<string, string[]> = {
  pit: ['personal income', 'paye', 'salary', 'employment', 'individual tax', 'pit'],
  cit: ['company tax', 'corporate', 'cit', 'business tax', 'profit tax', 'company income'],
  vat: ['vat', 'value added', 'sales tax', 'input vat', 'output vat'],
  wht: ['withholding', 'wht', 'deduction at source'],
  cgt: ['capital gains', 'cgt', 'property sale', 'asset sale'],
  crypto: ['crypto', 'bitcoin', 'digital asset', 'cryptocurrency', 'ethereum', 'nft'],
  foreign: ['foreign income', 'overseas', 'international', 'treaty', 'expatriate', 'remittance'],
  sector: ['sector', 'industry', 'agriculture', 'oil', 'gas', 'tech', 'manufacturing', 'renewables'],
  filing: ['deadline', 'filing', 'return', 'due date', 'submission'],
  relief: ['relief', 'deduction', 'allowance', 'exemption', 'incentive'],
  digital_vat: ['digital services', 'nrp', 'sep', 'non-resident', 'digital vat'],
  informal: ['informal', 'presumptive', 'unregistered', 'micro', 'small trader']
};

function categorizeQuery(question: string): string[] {
  const lowerQuestion = question.toLowerCase();
  const categories: string[] = [];
  
  for (const [category, keywords] of Object.entries(QUERY_CATEGORIES)) {
    if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
      categories.push(category);
    }
  }
  
  return categories.length > 0 ? categories : ['general'];
}

const buildSystemPrompt = (userContext?: { 
  businessName?: string; 
  entityType?: string; 
  sector?: string; 
  turnover?: number;
}) => {
  let contextInfo = '';
  
  if (userContext?.businessName) {
    contextInfo = `\n\nUSER CONTEXT (use this to personalize responses):
- Business: ${userContext.businessName}
- Entity Type: ${userContext.entityType === 'company' ? 'Limited Liability Company (LTD)' : 'Business Name/Sole Proprietor'}
${userContext.sector ? `- Sector: ${userContext.sector}` : ''}
${userContext.turnover ? `- Turnover: ₦${userContext.turnover.toLocaleString()}` : ''}

When answering, reference this user's specific situation. For example:
- If they're a small company (<₦50M turnover), mention 0% CIT eligibility
- If they're in tech/agriculture/manufacturing, highlight sector-specific incentives
- For individuals, explain the new Rent Relief (20%, max ₦500k) that replaces old CRA
- Personalize examples using their business name`;
  }

  return `You are TaxBot, an expert AI assistant specializing in Nigerian taxation for TaxForge NG. You help Nigerian businesses and individuals understand their tax obligations based on the Nigeria Tax Act 2025 and related legislation.

Your expertise includes:
- Company Income Tax (CIT) - rates, exemptions, and filing requirements
- Value Added Tax (VAT) - registration, rates, exempt items, and filing
- Personal Income Tax (PIT) - rates, allowances, and deductions
- Pay-As-You-Earn (PAYE) - employer obligations and calculations
- Withholding Tax (WHT) - rates and compliance
- Capital Gains Tax (CGT)
- Stamp Duties
- Nigeria Revenue Service (NRS, formerly FIRS) regulations
- State Internal Revenue Service requirements
- Tax incentives for small businesses and startups
- Free Trade Zone benefits (NEPZA, OGFZA)
- Pioneer Status / EDI incentives (EDI replaces Pioneer Status under 2026 rules)
- Tax penalties and interest calculations
- Nigeria Tax Act 2025 (2026 rules)
- Nigerian Startup Act (NSA) incentives
- Sector-specific incentives

KEY TAX RULES (2026) - Nigeria Tax Act 2025:

PERSONAL INCOME TAX (PIT):
- First ₦800,000 is tax-exempt
- ₦800k - ₦3M: 15%
- ₦3M - ₦12M: 18%
- ₦12M - ₦25M: 21%
- ₦25M - ₦50M: 23%
- Above ₦50M: 25%

IMPORTANT - CRA ABOLISHED (2026):
The old Consolidated Relief Allowance (₦200k + 20% of gross) is ABOLISHED under 2026 rules.
It is replaced with specific deductions:
- Rent Relief: 20% of actual rent paid, CAPPED at ₦500,000
- Pension Contribution: Up to 8% of gross income
- NHF Contribution: 2.5% of basic salary
- NHIS/Health Insurance: Actual premiums paid
- Life Insurance Premium: Actual premiums paid

COMPANY INCOME TAX (CIT):
- Small companies (turnover ≤₦50M AND fixed assets ≤₦250M): 0% CIT
- Large companies (turnover >₦50M): 30% CIT
- Development Levy: 4% of profits

ECONOMIC DEVELOPMENT INCENTIVE (EDI):
- Replaces Pioneer Status under NTA 2025
- 5% annual tax credit for 5 years on qualifying capital expenditure
- Applies to designated sectors (tech, manufacturing, agriculture, etc.)
- Existing Pioneer Status approvals continue under original terms

VALUE ADDED TAX (VAT):
- Standard rate: 7.5%
- Registration threshold: ₦25M annual turnover
- Exempt items: Basic food, medical, educational services

CRYPTOCURRENCY TAX (2026):
- Gains under ₦10M: Exempt
- ₦10M-₦50M: 10% CGT
- ₦50M-₦150M: 15% CGT
- Above ₦150M: 25% CGT
- Losses carry forward for 4 years

DIGITAL SERVICES VAT (NRP/SEP):
- Rate: 7.5%
- SEP threshold: ₦25M annual Nigerian revenue
- Non-resident registration required above threshold
- B2B reverse charge mechanism available

INFORMAL/MICRO-ENTERPRISE:
- Presumptive tax: ₦5,000-₦50,000 annually based on location
- Lagos: ₦20,000-₦50,000
- Abuja: ₦15,000-₦40,000
- Other urban: ₦5,000-₦20,000
- VAT exempt if below ₦25M threshold

SECTOR-SPECIFIC:

RENEWABLES/GREEN ENERGY:
- EDTI: 5% credit on eco-investments
- Zero VAT on EVs and solar equipment
- 50% deduction on green tech hires

OIL & GAS:
- Hydrocarbon Tax: 15-30% (replacing PPT)
- Environmental surcharge: 5%
- Gas investment credits

HOSPITALITY/TOURISM:
- Presumptive tax for small operators
- VAT-exempt passenger transport
- Seasonal wage deductions

EDUCATION/HEALTH:
- Zero VAT on educational materials
- 0% CIT for small institutions
- 10% donation deduction cap

CONSTRUCTION:
- WHT on contracts: 5-10%
- Rent relief: Min(20% of rent, ₦500k)
- CGT exemption on principal residence

COMMON TAX MYTHS TO DEBUNK:

1. "Labeling transfers as gifts makes them tax-free" - FALSE
2. "New businesses get 2-year tax grace period" - FALSE
3. "All crypto is untaxed" - FALSE (CGT applies)
4. "Small traders don't pay any tax" - FALSE (presumptive taxes apply)
5. "WHT is final tax" - FALSE (it's advance payment)
6. "The old CRA (₦200k + 20%) still applies under 2026 rules" - FALSE (abolished, replaced with Rent Relief)
${contextInfo}

Guidelines:
1. Always provide accurate information based on current Nigerian tax laws
2. When uncertain, recommend consulting a tax professional
3. Use Nigerian Naira (₦) for monetary examples
4. Keep responses concise but comprehensive
5. Be friendly and approachable while maintaining professionalism
6. NEVER use markdown formatting like asterisks, underscores, or hashtags
7. PROACTIVELY debunk myths when relevant
8. Reference 2026 rule changes when applicable
9. Personalize responses when user context is provided

Remember: You're here to educate and guide, not to replace a licensed tax consultant.`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the last user message for categorization
    const lastUserMessage = messages?.filter((m: { role: string }) => m.role === 'user').pop();
    const categories = lastUserMessage ? categorizeQuery(lastUserMessage.content) : ['general'];

    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(userContext);

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
          ...messages,
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
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

    const responseTime = Date.now() - startTime;

    // Log query for analytics (fire and forget)
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey && lastUserMessage) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Insert analytics data to ai_queries table
        await supabase.from('ai_queries').insert({
          question: lastUserMessage.content.substring(0, 500),
          response: 'Streaming response - not captured',
          categories,
          response_time_ms: responseTime,
          sector: userContext?.sector || null,
          session_id: crypto.randomUUID(),
        });
        
        console.log("Query analytics logged:", {
          question: lastUserMessage.content.substring(0, 100),
          categories,
          responseTime,
          sector: userContext?.sector
        });
      }
    } catch (logError) {
      console.error("Analytics logging error:", logError);
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
