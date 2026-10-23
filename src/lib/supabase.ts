import { createClient } from '@supabase/supabase-js';

const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && import.meta?.env ? (import.meta.env as Record<string, string | undefined>) : {};

const rawUrl = env.VITE_SUPABASE_URL;
const supabaseUrl =
  rawUrl && !rawUrl.includes('placeholder-project')
    ? rawUrl
    : 'https://klzpmakufpfhjbokzaof.supabase.co';

const rawKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY;

const supabaseKey =
  rawKey && !rawKey.includes('placeholder')
    ? rawKey
    : 'sb_publishable_YeLrbDTr4sqcvnXb5dn7pQ_NwORCvoD';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'bank_clerk_supabase_auth_token',
  },
});
