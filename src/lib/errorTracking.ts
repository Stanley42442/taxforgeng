import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";
import { sanitizeErrorForDisplay, getErrorMessage } from "@/lib/errorUtils";

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
}

// Debounce to prevent error flooding
let lastErrorTime = 0;
let lastErrorMessage = '';
const ERROR_THROTTLE_MS = 5000;

/**
 * Report an error to the tracking system.
 * In development, logs to console. In production, stores in database.
 */
export async function reportError(error: Error, componentStack?: string): Promise<void> {
  const now = Date.now();
  const errorMessage = sanitizeErrorForDisplay(error);
  
  // Throttle duplicate errors
  if (now - lastErrorTime < ERROR_THROTTLE_MS && errorMessage === lastErrorMessage) {
    logger.debug('[ErrorTracking] Throttled duplicate error');
    return;
  }
  
  lastErrorTime = now;
  lastErrorMessage = errorMessage;

  const report: ErrorReport = {
    message: errorMessage,
    stack: error.stack?.slice(0, 2000), // Limit stack trace size
    componentStack: componentStack?.slice(0, 1000),
    url: window.location.href,
    userAgent: navigator.userAgent.slice(0, 500),
    timestamp: new Date().toISOString(),
  };

  // Try to get user ID if authenticated
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      report.userId = user.id;
    }
  } catch {
    // Ignore auth errors during error reporting
  }

  // In development, just log to console
  if (import.meta.env.DEV) {
    logger.error('[ErrorTracking] Would report:', report);
    return;
  }

  // In production, store in database
  try {
    const { error: insertError } = await supabase.from('error_logs').insert({
      error_message: report.message,
      error_stack: report.stack,
      component_stack: report.componentStack,
      page_url: report.url,
      user_agent: report.userAgent,
      user_id: report.userId,
    });
    
    if (insertError) {
      logger.error('[ErrorTracking] Failed to insert error log:', insertError.message);
    }
  } catch (e: unknown) {
    logger.error('[ErrorTracking] Failed to report error:', getErrorMessage(e));
  }
}

/**
 * Initialize global error handlers for unhandled exceptions and promise rejections.
 * Call this once at app startup.
 */
export function initGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    reportError(error).catch(() => {
      // Silently fail - we don't want error reporting to cause more errors
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    if (event.error) {
      reportError(event.error).catch(() => {
        // Silently fail
      });
    }
  });

  logger.debug('[ErrorTracking] Global error handlers initialized');
}
