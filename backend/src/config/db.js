const { getSupabaseAdmin } = require('./supabase');

async function connectDB() {
  const supabase = getSupabaseAdmin();
  console.log('Supabase client initialized');
  return supabase;
}

module.exports = connectDB;
