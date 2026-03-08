/**
 * Safe Supabase Client
 * 
 * Re-exports the auto-generated Supabase client to ensure a single
 * client instance across the entire app. This prevents auth session
 * conflicts caused by multiple independent createClient() calls.
 */
export { supabase } from '@/integrations/supabase/client';
