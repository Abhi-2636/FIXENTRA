const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

// Admin client — bypasses RLS, used server-side
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Public client — respects RLS (for auth flows)
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabaseAdmin, supabasePublic, supabaseUrl, supabaseAnonKey };
