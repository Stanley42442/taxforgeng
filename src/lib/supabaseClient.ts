/**
 * Safe Supabase Client
 * 
 * This wrapper creates a Supabase client with a safe localStorage adapter
 * that prevents crashes on devices with restricted storage access
 * (private browsing, certain Android browsers, storage quota exceeded).
 * 
 * All files should import from this module instead of @/integrations/supabase/client
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Safe storage adapter that wraps localStorage with try-catch
 * to prevent crashes on devices with restricted storage access
 */
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail - user will need to re-login after browser restart
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },
};

/**
 * Safe Supabase client instance
 * Uses safe storage adapter to prevent initialization crashes
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      storage: safeStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
