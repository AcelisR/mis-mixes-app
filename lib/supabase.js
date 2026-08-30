import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gitnulqndxylshfhkogh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8GWffzHNEMNgHFs7EFdHow_BJ0FzsXb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
