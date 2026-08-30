import { createClient } from '@supabase/supabase-js';

const getEnv = (key, fallback) => {
  const val = process.env[key];
  if (val && typeof val === 'string' && val.trim().startsWith('http')) {
    return val.trim();
  }
  return fallback;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://gitnulqndxylshfhkogh.supabase.co');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || 'sb_publishable_8GWffzHNEMNgHFs7EFdHow_BJ0FzsXb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});