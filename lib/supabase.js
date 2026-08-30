import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gitnulqndxylshfhkogh.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8GWffzHNEMNgHFs7EFdHow_BJ0FzsXb';

let client = null;

export const supabase = {
  get from() {
    if (!client) {
      client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    }
    return client.from.bind(client);
  },
  get storage() {
    if (!client) {
      client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    }
    return client.storage;
  },
  get auth() {
    if (!client) {
      client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    }
    return client.auth;
  }
};