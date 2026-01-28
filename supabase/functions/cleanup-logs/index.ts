/**
 * Cleanup Logs Edge Function
 * 
 * Automatically cleans up old error logs and web vitals to prevent database bloat.
 * 
 * Retention policy:
 * - Error logs: 30 days
 * - Web vitals: 90 days
 * 
 * Schedule: Daily at 3:00 AM UTC (configured via cron)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  success: boolean;
  cleanedAt: string;
  errorLogsDeleted?: number;
  webVitalsDeleted?: number;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    console.log('[cleanup-logs] Starting cleanup...');
    
    // Calculate cutoff dates
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    
    // Delete error logs older than 30 days
    const { error: errorLogsError, count: errorLogsCount } = await supabase
      .from('error_logs')
      .delete({ count: 'exact' })
      .lt('created_at', thirtyDaysAgo);
    
    if (errorLogsError) {
      console.error('[cleanup-logs] Error deleting error_logs:', errorLogsError.message);
      throw errorLogsError;
    }
    
    console.log(`[cleanup-logs] Deleted ${errorLogsCount || 0} error logs`);
    
    // Delete web vitals older than 90 days
    const { error: vitalsError, count: vitalsCount } = await supabase
      .from('web_vitals')
      .delete({ count: 'exact' })
      .lt('created_at', ninetyDaysAgo);
    
    if (vitalsError) {
      console.error('[cleanup-logs] Error deleting web_vitals:', vitalsError.message);
      throw vitalsError;
    }
    
    console.log(`[cleanup-logs] Deleted ${vitalsCount || 0} web vitals`);
    
    const result: CleanupResult = {
      success: true,
      cleanedAt: new Date().toISOString(),
      errorLogsDeleted: errorLogsCount || 0,
      webVitalsDeleted: vitalsCount || 0,
    };
    
    console.log('[cleanup-logs] Cleanup complete:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[cleanup-logs] Cleanup failed:', error);
    
    const result: CleanupResult = {
      success: false,
      cleanedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
