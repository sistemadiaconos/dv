import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Missing Supabase environment variables! Check your .env file.');
    // Prevent crash, but requests will fail
}

export const supabase = createClient(supabaseUrl, supabaseKey);
