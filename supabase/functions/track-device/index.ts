import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Validate JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await userClient.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders });
  }

  const userId = user.id;
  const userEmail = user.email || '';

  // Admin client - uses service role key, no token refresh issues
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = await req.json();
    const { deviceInfo, clientIP } = body;

    const fingerprint = deviceInfo?.fingerprint || 'unknown';
    const userAgent = deviceInfo?.userAgent || req.headers.get('user-agent') || '';

    // --- Get location from IP ---
    let location: { city?: string; region?: string; country?: string; country_code?: string } | null = null;
    if (clientIP) {
      try {
        const locRes = await fetch(`http://ip-api.com/json/${clientIP}?fields=city,regionName,country,countryCode`);
        if (locRes.ok) {
          const locData = await locRes.json();
          location = {
            city: locData.city,
            region: locData.regionName,
            country: locData.country,
            country_code: locData.countryCode,
          };
        }
      } catch {
        // Location lookup failed, continue without it
      }
    }

    // --- Check if device is blocked ---
    const { data: deviceData } = await admin
      .from('known_devices')
      .select('id, is_blocked, is_trusted, last_country')
      .eq('user_id', userId)
      .eq('device_fingerprint', fingerprint)
      .maybeSingle();

    if (deviceData?.is_blocked) {
      console.warn('Login from blocked device detected for user:', userId);
      return new Response(JSON.stringify({ blocked: true, ipBlocked: false, timeBlocked: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Check IP whitelist ---
    let ipBlocked = false;
    if (clientIP) {
      const { data: ipAllowed } = await admin.rpc('check_ip_whitelist', {
        check_user_id: userId,
        check_ip: clientIP,
      });
      if (ipAllowed === false) {
        ipBlocked = true;
        console.warn('Login from non-whitelisted IP for user:', userId);

        // Get whatsapp number for alert
        const { data: profile } = await admin.from('profiles').select('whatsapp_number').eq('id', userId).maybeSingle();

        // Send IP blocked alert (fire-and-forget via admin client edge function invoke)
        fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            userEmail,
            userId,
            alertType: 'ip_blocked',
            timestamp: new Date().toLocaleString(),
            deviceInfo: {
              browser: `${deviceInfo?.browser || ''} ${deviceInfo?.browserVersion || ''}`.trim(),
              os: `${deviceInfo?.os || ''} ${deviceInfo?.osVersion || ''}`.trim(),
              deviceName: deviceInfo?.deviceName || 'Unknown',
            },
            locationInfo: location ? { city: location.city, region: location.region, country: location.country } : undefined,
            ipAddress: clientIP,
            whatsappNumber: profile?.whatsapp_number || null,
          }),
        }).catch(() => {});

        return new Response(JSON.stringify({ blocked: false, ipBlocked: true, timeBlocked: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // --- Check time restrictions ---
    const { data: timeAllowed } = await admin.rpc('check_time_restrictions', { check_user_id: userId });
    if (timeAllowed === false) {
      console.warn('Login outside allowed time window for user:', userId);

      const { data: profile } = await admin.from('profiles').select('whatsapp_number').eq('id', userId).maybeSingle();

      fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          userEmail,
          userId,
          alertType: 'time_restricted',
          timestamp: new Date().toLocaleString(),
          deviceInfo: {
            browser: `${deviceInfo?.browser || ''} ${deviceInfo?.browserVersion || ''}`.trim(),
            os: `${deviceInfo?.os || ''} ${deviceInfo?.osVersion || ''}`.trim(),
            deviceName: deviceInfo?.deviceName || 'Unknown',
          },
          timeInfo: {
            hour: new Date().getHours(),
            timezone: deviceInfo?.timezone || 'UTC',
          },
          whatsappNumber: profile?.whatsapp_number || null,
        }),
      }).catch(() => {});

      return new Response(JSON.stringify({ blocked: false, ipBlocked: false, timeBlocked: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Log auth event ---
    await admin.from('auth_events').insert([{
      user_id: userId,
      event_type: 'login_success',
      user_agent: userAgent,
      ip_address: clientIP || null,
      location: location || null,
      metadata: { device: deviceInfo?.deviceName || 'Unknown' },
    }]);

    // --- Get previous known countries ---
    const { data: previousDevices } = await admin
      .from('known_devices')
      .select('last_country')
      .eq('user_id', userId)
      .not('last_country', 'is', null);

    const knownCountries = new Set(previousDevices?.map((d: { last_country: string | null }) => d.last_country).filter(Boolean) || []);
    const currentCountry = location?.country || null;
    const isNewCountry = currentCountry && knownCountries.size > 0 && !knownCountries.has(currentCountry);

    const alertDeviceInfo = {
      browser: `${deviceInfo?.browser || ''} ${deviceInfo?.browserVersion || ''}`.trim(),
      os: `${deviceInfo?.os || ''} ${deviceInfo?.osVersion || ''}`.trim(),
      deviceName: deviceInfo?.deviceName || 'Unknown',
    };

    if (deviceData) {
      // Update existing device
      await admin
        .from('known_devices')
        .update({
          last_seen_at: new Date().toISOString(),
          browser: deviceInfo?.browser || null,
          browser_version: deviceInfo?.browserVersion || null,
          os: deviceInfo?.os || null,
          os_version: deviceInfo?.osVersion || null,
          device_type: deviceInfo?.deviceType || null,
          device_model: deviceInfo?.deviceModel || null,
          screen_resolution: deviceInfo?.screenResolution || null,
          timezone: deviceInfo?.timezone || null,
          language: deviceInfo?.language || null,
          last_country: currentCountry,
          last_city: location?.city || null,
        })
        .eq('id', deviceData.id);

      // New country alert
      if (isNewCountry && deviceData.last_country && deviceData.last_country !== currentCountry) {
        fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceRoleKey}` },
          body: JSON.stringify({
            userEmail,
            alertType: 'new_location',
            timestamp: new Date().toLocaleString(),
            locationInfo: { city: location?.city, region: location?.region, country: currentCountry, previousCountry: deviceData.last_country },
            deviceInfo: alertDeviceInfo,
          }),
        }).catch(() => {});
      }
    } else {
      // Insert new device
      await admin
        .from('known_devices')
        .insert({
          user_id: userId,
          device_fingerprint: fingerprint,
          device_name: deviceInfo?.deviceName || 'Unknown Device',
          browser: deviceInfo?.browser || null,
          browser_version: deviceInfo?.browserVersion || null,
          os: deviceInfo?.os || null,
          os_version: deviceInfo?.osVersion || null,
          device_type: deviceInfo?.deviceType || null,
          device_model: deviceInfo?.deviceModel || null,
          screen_resolution: deviceInfo?.screenResolution || null,
          timezone: deviceInfo?.timezone || null,
          language: deviceInfo?.language || null,
          last_country: currentCountry,
          last_city: location?.city || null,
          is_trusted: false,
          is_blocked: false,
        });

      // New device alert
      fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceRoleKey}` },
        body: JSON.stringify({
          userEmail,
          alertType: 'new_device',
          timestamp: new Date().toLocaleString(),
          deviceInfo: alertDeviceInfo,
        }),
      }).catch(() => {});

      // New country from new device
      if (isNewCountry) {
        const previousCountry = Array.from(knownCountries)[0] as string;
        fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceRoleKey}` },
          body: JSON.stringify({
            userEmail,
            alertType: 'new_location',
            timestamp: new Date().toLocaleString(),
            locationInfo: { city: location?.city, region: location?.region, country: currentCountry, previousCountry },
            deviceInfo: alertDeviceInfo,
          }),
        }).catch(() => {});
      }
    }

    // --- Unusual login time check ---
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 6) {
      fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceRoleKey}` },
        body: JSON.stringify({
          userEmail,
          alertType: 'unusual_time',
          timestamp: new Date().toLocaleString(),
          timeInfo: { hour, timezone: deviceInfo?.timezone || 'UTC' },
          deviceInfo: alertDeviceInfo,
        }),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({ blocked: false, ipBlocked: false, timeBlocked: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('track-device error:', error);
    // Don't block login on tracking errors
    return new Response(JSON.stringify({ blocked: false, ipBlocked: false, timeBlocked: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
