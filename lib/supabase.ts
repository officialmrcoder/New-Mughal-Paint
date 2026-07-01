import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing from .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// isSupabaseConfigured always returns true now — we use real Supabase always
export const isSupabaseConfigured = (): boolean => true;

// Deprecated: kept as a no-op for backward compatibility with old imports
export const getMockDatabase = () => {
  console.warn('getMockDatabase is deprecated — using real Supabase now.');
  return null;
};