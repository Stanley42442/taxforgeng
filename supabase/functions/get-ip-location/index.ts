import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LocationResponse {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ip } = await req.json();
    
    if (!ip) {
      return new Response(
        JSON.stringify({ error: "IP address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Getting location for IP:", ip);

    // Use ip-api.com (free, no API key required, 45 requests/minute limit)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,query`);
    
    if (!response.ok) {
      throw new Error(`IP API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'fail') {
      console.log("IP lookup failed:", data.message);
      return new Response(
        JSON.stringify({ 
          ip,
          city: null,
          region: null,
          country: null,
          country_code: null,
          error: data.message 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const locationData: LocationResponse = {
      ip: data.query || ip,
      city: data.city || null,
      region: data.regionName || null,
      country: data.country || null,
      country_code: data.countryCode || null,
      latitude: data.lat || null,
      longitude: data.lon || null,
      timezone: data.timezone || null,
      isp: data.isp || null,
    };

    console.log("Location data:", locationData);

    return new Response(JSON.stringify(locationData), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in get-ip-location function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
