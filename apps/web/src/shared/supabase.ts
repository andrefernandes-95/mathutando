import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isConfigured = Boolean(url && key && !url.includes('YOUR-PROJECT'));
/** Null in demo mode: no accidental calls to an unconfigured project. */
export const supabase = isConfigured ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;

export function requireClient() {
  if (!supabase) throw new Error('Liga primeiro o projeto Supabase nas variáveis de ambiente.');
  return supabase;
}
