import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Tax calculation logic (2026 rules)
const calculateTax = (params: {
  entityType: 'business_name' | 'company';
  turnover: number;
  expenses: number;
  vatableSales?: number;
  fixedAssets?: number;
  use2026Rules?: boolean;
}) => {
  const { entityType, turnover, expenses, vatableSales = 0, fixedAssets = 0, use2026Rules = true } = params;
  const taxableIncome = Math.max(0, turnover - expenses);
  
  let pit = 0;
  let cit = 0;
  let vat = 0;
  let developmentLevy = 0;
  
  if (entityType === 'company') {
    // Small company check (2026 rules)
    const isSmallCompany = use2026Rules && turnover <= 50000000 && fixedAssets <= 250000000;
    
    if (isSmallCompany) {
      cit = 0;
    } else {
    // CIT at 30% (standard rate for both regimes)
      cit = taxableIncome * 0.30;
    }
    
    // Development Levy (2026) / Education Levy (pre-2026)
    if (use2026Rules) {
      developmentLevy = isSmallCompany ? 0 : taxableIncome * 0.04;
    } else {
      developmentLevy = taxableIncome * 0.03;
    }
  } else {
    // Personal Income Tax (Business Name / Sole Prop)
    if (use2026Rules) {
      // 2026 PIT bands (NTA 2025)
      const exemption = 800000;
      const taxableAmount = Math.max(0, taxableIncome - exemption);
      
      if (taxableAmount <= 2200000) {
        pit = taxableAmount * 0.15;
      } else if (taxableAmount <= 11200000) {
        pit = 2200000 * 0.15 + (taxableAmount - 2200000) * 0.18;
      } else if (taxableAmount <= 24200000) {
        pit = 2200000 * 0.15 + 9000000 * 0.18 + (taxableAmount - 11200000) * 0.21;
      } else if (taxableAmount <= 49200000) {
        pit = 2200000 * 0.15 + 9000000 * 0.18 + 13000000 * 0.21 + (taxableAmount - 24200000) * 0.23;
      } else {
        pit = 2200000 * 0.15 + 9000000 * 0.18 + 13000000 * 0.21 + 25000000 * 0.23 + (taxableAmount - 49200000) * 0.25;
      }
    } else {
      // Old PIT bands
      const exemption = 300000;
      const taxableAmount = Math.max(0, taxableIncome - exemption);
      
      if (taxableAmount <= 300000) {
        pit = taxableAmount * 0.07;
      } else if (taxableAmount <= 600000) {
        pit = 300000 * 0.07 + (taxableAmount - 300000) * 0.11;
      } else if (taxableAmount <= 1100000) {
        pit = 300000 * 0.07 + 300000 * 0.11 + (taxableAmount - 600000) * 0.15;
      } else if (taxableAmount <= 1600000) {
        pit = 300000 * 0.07 + 300000 * 0.11 + 500000 * 0.15 + (taxableAmount - 1100000) * 0.19;
      } else if (taxableAmount <= 3200000) {
        pit = 300000 * 0.07 + 300000 * 0.11 + 500000 * 0.15 + 500000 * 0.19 + (taxableAmount - 1600000) * 0.21;
      } else {
        pit = 300000 * 0.07 + 300000 * 0.11 + 500000 * 0.15 + 500000 * 0.19 + 1600000 * 0.21 + (taxableAmount - 3200000) * 0.24;
      }
    }
  }
  
  // VAT calculation (if vatable sales provided)
  if (vatableSales > 0 && turnover > 25000000) {
    vat = vatableSales * 0.075;
  }
  
  const totalTax = pit + cit + vat + developmentLevy;
  const effectiveRate = turnover > 0 ? (totalTax / turnover) * 100 : 0;
  
  return {
    grossIncome: turnover,
    taxableIncome,
    pit: Math.round(pit),
    cit: Math.round(cit),
    vat: Math.round(vat),
    developmentLevy: Math.round(developmentLevy),
    totalTaxPayable: Math.round(totalTax),
    effectiveRate: effectiveRate.toFixed(2),
    entityType: entityType === 'company' ? 'Limited Company' : 'Business Name',
    rulesApplied: use2026Rules ? '2026 Nigeria Tax Act' : 'Pre-2026 Rules',
    calculatedAt: new Date().toISOString()
  };
};

// Current tax rates
const getTaxRates = (use2026Rules: boolean = true) => {
  if (use2026Rules) {
    return {
      rulesVersion: '2026 Nigeria Tax Act',
      pit: {
        exemption: 800000,
        bands: [
          { from: 0, to: 2200000, rate: 0.15 },
          { from: 2200000, to: 11200000, rate: 0.18 },
          { from: 11200000, to: 24200000, rate: 0.21 },
          { from: 24200000, to: 49200000, rate: 0.23 },
          { from: 49200000, to: null, rate: 0.25 }
        ]
      },
      cit: {
        standardRate: 0.30,
        smallCompanyRate: 0,
        smallCompanyTurnoverLimit: 50000000,
        smallCompanyAssetLimit: 250000000
      },
      vat: {
        rate: 0.075,
        registrationThreshold: 25000000
      },
      developmentLevy: {
        rate: 0.04,
        replaces: 'Education Levy'
      }
    };
  }
  
  return {
    rulesVersion: 'Pre-2026 (Historical)',
    pit: {
      exemption: 300000,
      bands: [
        { from: 0, to: 300000, rate: 0.07 },
        { from: 300000, to: 600000, rate: 0.11 },
        { from: 600000, to: 1100000, rate: 0.15 },
        { from: 1100000, to: 1600000, rate: 0.19 },
        { from: 1600000, to: 3200000, rate: 0.21 },
        { from: 3200000, to: null, rate: 0.24 }
      ]
    },
    cit: {
      standardRate: 0.30,
      smallCompanyRate: 0,
      smallCompanyTurnoverLimit: 25000000,
      historical: {
        mediumCompanyRate: 0.20,
        mediumCompanyTurnoverLimit: 100000000,
        note: 'Medium company tier abolished under 2026 Nigeria Tax Act'
      }
    },
    vat: {
      rate: 0.075,
      registrationThreshold: 25000000
    },
    educationLevy: {
      rate: 0.03
    }
  };
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean).pop() || '';
  
  // Get API key from header
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Missing API key. Include x-api-key header or Authorization: Bearer <key>' 
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Create Supabase client with service role for partner validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (partnerError || !partner) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid or inactive API key' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check rate limit
    if (partner.requests_today >= partner.rate_limit_daily) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Rate limit exceeded. Upgrade your plan for higher limits.',
        limit: partner.rate_limit_daily,
        used: partner.requests_today
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let responseData: any;
    let statusCode = 200;

    // Route handling
    if (path === 'calculate' && req.method === 'POST') {
      const body = await req.json();
      
      // Validate required fields
      if (!body.entityType || body.turnover === undefined) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: entityType, turnover' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      responseData = {
        success: true,
        data: calculateTax({
          entityType: body.entityType,
          turnover: Number(body.turnover),
          expenses: Number(body.expenses || 0),
          vatableSales: Number(body.vatableSales || 0),
          fixedAssets: Number(body.fixedAssets || 0),
          use2026Rules: body.use2026Rules !== false
        })
      };
    } else if (path === 'rates' && req.method === 'GET') {
      const use2026 = url.searchParams.get('use2026Rules') !== 'false';
      responseData = {
        success: true,
        data: getTaxRates(use2026)
      };
    } else if (path === 'health' && req.method === 'GET') {
      responseData = {
        success: true,
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      };
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Unknown endpoint: ${path}`,
        availableEndpoints: [
          'POST /calculate - Calculate tax based on income',
          'GET /rates - Get current tax rates',
          'GET /health - Health check'
        ]
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const responseTime = Date.now() - startTime;

    // Update partner usage stats
    await supabase
      .from('partners')
      .update({
        requests_today: partner.requests_today + 1,
        requests_total: partner.requests_total + 1,
        last_request_at: new Date().toISOString()
      })
      .eq('id', partner.id);

    // Log the request
    await supabase
      .from('partner_api_logs')
      .insert({
        partner_id: partner.id,
        endpoint: path,
        method: req.method,
        status_code: statusCode,
        response_time_ms: responseTime
      });

    return new Response(JSON.stringify(responseData), {
      status: statusCode,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': partner.rate_limit_daily.toString(),
        'X-RateLimit-Remaining': (partner.rate_limit_daily - partner.requests_today - 1).toString()
      }
    });

  } catch (error) {
    console.error('Partner API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
