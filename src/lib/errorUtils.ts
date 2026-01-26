/**
 * Error utility functions for consistent error handling across the application
 */

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('Failed to fetch') ||
           error.name === 'NetworkError';
  }
  return false;
}

/**
 * Check if error is a Supabase "no rows" error
 */
export function isNoRowsError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code: string }).code === 'PGRST116';
  }
  return false;
}

/**
 * Sanitize error for production display (remove stack traces, internal paths)
 */
export function sanitizeErrorForDisplay(error: unknown): string {
  const message = getErrorMessage(error);
  
  // Remove file paths and line numbers
  const sanitized = message
    .replace(/at\s+.*:\d+:\d+/g, '')
    .replace(/\(.*\.(?:ts|tsx|js|jsx):\d+:\d+\)/g, '')
    .replace(/\/[\w/.-]+\.(ts|tsx|js|jsx)/g, '')
    .trim();
  
  return sanitized || 'An unexpected error occurred';
}
