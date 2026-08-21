import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://klzpmakufpfhjbokzaof.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_YeLrbDTr4sqcvnXb5dn7pQ_NwORCvoD';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.info(
    'Supabase production URL active: https://klzpmakufpfhjbokzaof.supabase.co'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'bank_clerk_supabase_auth_token',
  },
});
