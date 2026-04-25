const { getSupabaseAdmin } = require('../config/supabase');

const TABLE = 'emergency_logs';

async function create(payload = {}) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert({
      qr_token: String(payload.qrToken || payload.qr_token || '').trim(),
      responder: String(payload.responder || 'unknown').trim() || 'unknown',
      location: String(payload.location || '').trim(),
      opened_at: payload.openedAt || payload.opened_at || new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Unable to store the emergency access log: ${error.message}`);
  }

  return data;
}

module.exports = {
  create,
};
