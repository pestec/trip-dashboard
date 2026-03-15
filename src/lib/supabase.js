import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,       // stores session in localStorage → "always logged in"
    autoRefreshToken: true,     // silently refreshes access token before expiry
    detectSessionInUrl: false,  // not needed for email+password auth
  },
});
