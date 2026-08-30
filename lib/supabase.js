import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gitnulqndxylshfhkogh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8GWffzHNEMNgHFs7EFdHow_BJ0FzsXb';

// Proxy seguro para inicializar Supabase solo cuando se use en runtime
let supabaseInstance = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabase();
    return typeof client[prop] === 'function' ? client[prop].bind(client) : client[prop];
  }
});