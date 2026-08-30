import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gitnulqndxylshfhkogh.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8GWffzHNEMNgHFs7EFdHow_BJ0FzsXb';

export const supabase = createClient(
  SUPABASE_URL.startsWith('http') ? SUPABASE_URL : 'https://gitnulqndxylshfhkogh.supabase.co',
  SUPABASE_KEY || 'sb_publishable_8GWffzHNEMNgHFs7EFdHow_BJ0FzsXb',
  {
    auth: {
      persistSession: false
    }
  }
);