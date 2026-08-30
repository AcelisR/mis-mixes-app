import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gitnulqndxylshfhkogh.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8GWffzHNEMNgHFs7EFdHow_BJ0FzsXb';

export const getSupabase = () => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
};

export const supabase = {
  from: (...args) => getSupabase().from(...args),
  storage: {
    from: (...args) => getSupabase().storage.from(...args),
  },
  auth: {
    getUser: (...args) => getSupabase().auth.getUser(...args),
    getSession: (...args) => getSupabase().auth.getSession(...args),
  },
};