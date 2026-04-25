const { createClient } = require('@supabase/supabase-js');

let cachedAdminClient = null;

function getSupabaseConfig() {
  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not set.');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  }

  return {
    supabaseUrl,
    serviceRoleKey,
  };
}

function getSupabaseAdmin() {
  if (!cachedAdminClient) {
    const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();

    cachedAdminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cachedAdminClient;
}

function assertSupabaseConfig() {
  getSupabaseConfig();
}

module.exports = {
  assertSupabaseConfig,
  getSupabaseAdmin,
};
