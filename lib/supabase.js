import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gitnulqndxylshfhkogh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8GWffzHNEMNgHFs7EFdHow_BJ0FzsXb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});