import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && url.startsWith('https://') && key && key.length > 20);
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Missing or invalid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}
