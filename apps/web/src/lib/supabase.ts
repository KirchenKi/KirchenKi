import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
// Diese Werte werden aus Environment Variables geladen, oder verwenden Fallback-Werte
// Der anon key ist öffentlich und kann sicher im Frontend verwendet werden
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zuibxmswerhlipzpbjod.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_urbIEodqIO3S14xosvy1Kw_RJDI2Jed';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL oder Anon Key fehlt!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Accept: 'application/json',
    },
  },
});

