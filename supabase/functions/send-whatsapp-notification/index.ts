import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  phone: string;
  message: string;
  userId: string;
  alertType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { phone, message, userId, alertType }: WhatsAppRequest = await req.json();

    console.log(`Sending WhatsApp notification to ${phone} for ${alertType}`);

    // Check if user has WhatsApp verified
    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp_verified, whatsapp_number")
      .eq("id", userId)
      .single();

    if (!profile?.whatsapp_verified) {
      console.log("WhatsApp not verified for user");
      return new Response(
        JSON.stringify({ error: "WhatsApp not verified" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Termii API key from secrets
    const termiiApiKey = Deno.env.get("TERMII_API_KEY");
    
    if (!termiiApiKey) {
      console.log("Termii API key not configured, simulating send");
      
      // Log the notification attempt
      await supabase.from("notification_deliveries").insert({
        user_id: userId,
        alert_type: alertType,
        delivery_method: "whatsapp",
        recipient: phone,
        status: "simulated",
        message_preview: message.substring(0, 100),
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          simulated: true,
          message: "WhatsApp notification simulated (API key not configured)" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via Termii API (Nigeria-focused messaging)
    const termiiResponse = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: termiiApiKey,
        to: phone,
        from: "TaxForge",
        sms: message,
        type: "plain",
        channel: "whatsapp",
      }),
    });

    const result = await termiiResponse.json();
    console.log("Termii response:", result);

    // Log the delivery
    await supabase.from("notification_deliveries").insert({
      user_id: userId,
      alert_type: alertType,
      delivery_method: "whatsapp",
      recipient: phone,
      status: termiiResponse.ok ? "sent" : "failed",
      message_preview: message.substring(0, 100),
      error_message: !termiiResponse.ok ? JSON.stringify(result) : null,
    });

    if (!termiiResponse.ok) {
      throw new Error(`Termii API error: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.message_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending WhatsApp notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
