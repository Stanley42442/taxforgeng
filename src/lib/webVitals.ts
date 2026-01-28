/**
 * Web Vitals Monitoring
 * 
 * Tracks Core Web Vitals (LCP, FID, CLS, INP, FCP, TTFB) and reports them
 * to the database for production performance monitoring.
 * 
 * Uses the official web-vitals library from Google Chrome team.
 * Batches writes with 5-second flush interval to reduce database load.
 */

import { onCLS, onLCP, onINP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';

interface WebVitalReport {
  metric_name: string;
  metric_value: number;
  metric_rating: 'good' | 'needs-improvement' | 'poor';
  metric_id: string;
  page_url: string;
  user_agent: string;
  connection_type?: string;
  user_id?: string;
}

// Batch vitals to reduce DB writes (5-second flush)
const vitalsQueue: WebVitalReport[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

async function flushVitals(): Promise<void> {
  if (vitalsQueue.length === 0) return;
  
  const batch = [...vitalsQueue];
  vitalsQueue.length = 0;
  
  try {
    const { error } = await supabase.from('web_vitals').insert(batch);
    if (error) {
      // Rate limiting is expected - don't log as error
      if (error.message?.includes('Rate limit exceeded')) {
        logger.debug('[WebVitals] Rate limited - skipping batch');
      } else {
        logger.error('[WebVitals] Insert failed:', error.message);
      }
    }
  } catch (e) {
    logger.error('[WebVitals] Flush error:', e);
  }
}

function queueVital(vital: WebVitalReport): void {
  vitalsQueue.push(vital);
  
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushVitals, 5000);
}

function reportVital(metric: Metric): void {
  // Get network connection info if available
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  
  const report: WebVitalReport = {
    metric_name: metric.name,
    // CLS is a decimal (e.g., 0.1), multiply by 1000 for storage as integer
    // All other metrics are in milliseconds
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    metric_id: metric.id,
    page_url: window.location.pathname,
    user_agent: navigator.userAgent.slice(0, 500), // Truncate for storage
    connection_type: connection?.effectiveType,
  };
  
  // Try to attach user ID if available
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) report.user_id = user.id;
    queueVital(report);
  }).catch(() => {
    // User not logged in - still queue the vital
    queueVital(report);
  });
}

/**
 * Initialize Web Vitals monitoring
 * 
 * Only runs in production to avoid polluting dev metrics.
 * Attaches listeners for all Core Web Vitals and flushes on page hide.
 */
export function initWebVitals(): void {
  // Skip in development
  if (import.meta.env.DEV) {
    logger.debug('[WebVitals] Skipping in development');
    return;
  }
  
  // Attach listeners for all Core Web Vitals
  // Note: FID is deprecated in web-vitals v4, replaced by INP
  onCLS(reportVital);  // Cumulative Layout Shift
  onLCP(reportVital);  // Largest Contentful Paint
  onINP(reportVital);  // Interaction to Next Paint (Core Web Vital since March 2024)
  onFCP(reportVital);  // First Contentful Paint
  onTTFB(reportVital); // Time to First Byte
  
  // Flush on page hide to capture all metrics before unload
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushVitals();
    }
  });
  
  logger.debug('[WebVitals] Initialized');
}
