const { getSupabaseAdmin } = require('../config/supabase');

const TABLE = 'user_profiles';

function normalizeEmail(email = '') {
  return String(email || '').trim().toLowerCase();
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    _id: row.id,
    fullName: row.full_name || '',
    firebaseUid: row.firebase_uid || '',
    authUserId: row.auth_user_id || '',
    phone: row.phone || '',
    city: row.city || '',
  };
}

function toInsertPayload(payload = {}) {
  return {
    firebase_uid: payload.firebaseUid || payload.firebase_uid || null,
    auth_user_id: payload.authUserId || payload.auth_user_id || null,
    full_name: String(payload.fullName || payload.full_name || '').trim(),
    email: normalizeEmail(payload.email) || null,
    phone: String(payload.phone || '').trim(),
    city: String(payload.city || '').trim(),
  };
}

function toUpdatePayload(updates = {}) {
  const payload = {};

  if (updates.firebaseUid !== undefined || updates.firebase_uid !== undefined) {
    payload.firebase_uid = updates.firebaseUid || updates.firebase_uid || null;
  }

  if (updates.authUserId !== undefined || updates.auth_user_id !== undefined) {
    payload.auth_user_id = updates.authUserId || updates.auth_user_id || null;
  }

  if (updates.fullName !== undefined || updates.full_name !== undefined) {
    payload.full_name = String(updates.fullName ?? updates.full_name ?? '').trim();
  }

  if (updates.email !== undefined) {
    payload.email = normalizeEmail(updates.email) || null;
  }

  if (updates.phone !== undefined) {
    payload.phone = String(updates.phone || '').trim();
  }

  if (updates.city !== undefined) {
    payload.city = String(updates.city || '').trim();
  }

  return payload;
}

function throwIfSupabaseError(error, fallbackMessage) {
  if (error) {
    throw new Error(`${fallbackMessage}: ${error.message}`);
  }
}

async function findById(id) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load the user profile');
  return mapUser(data);
}

async function findByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load the user profile by email');
  return mapUser(data);
}

async function findByFirebaseUid(firebaseUid) {
  const normalizedUid = String(firebaseUid || '').trim();

  if (!normalizedUid) {
    return null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('firebase_uid', normalizedUid)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load the Firebase user profile');
  return mapUser(data);
}

async function findEmailOwner(email, excludedUserId = '') {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  let query = getSupabaseAdmin().from(TABLE).select('*').eq('email', normalizedEmail);

  if (excludedUserId) {
    query = query.neq('id', excludedUserId);
  }

  const { data, error } = await query.limit(1).maybeSingle();

  throwIfSupabaseError(error, 'Unable to check the email owner');
  return mapUser(data);
}

async function create(payload) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert(toInsertPayload(payload))
    .select('*')
    .single();

  throwIfSupabaseError(error, 'Unable to create the user profile');
  return mapUser(data);
}

async function updateById(id, updates) {
  const payload = toUpdatePayload(updates);

  if (!Object.keys(payload).length) {
    return findById(id);
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  throwIfSupabaseError(error, 'Unable to update the user profile');
  return mapUser(data);
}

async function upsertFirebaseUser(firebaseAccount = {}, defaults = {}) {
  const firebaseUid = String(firebaseAccount.firebaseUid || firebaseAccount.localId || '').trim();
  const email = normalizeEmail(firebaseAccount.email || defaults.email);

  let user = firebaseUid ? await findByFirebaseUid(firebaseUid) : null;

  if (!user && email) {
    user = await findByEmail(email);
  }

  const fullName = String(
    defaults.fullName || firebaseAccount.fullName || firebaseAccount.displayName || ''
  ).trim();

  const updates = {
    firebaseUid: firebaseUid || user?.firebaseUid || null,
    email: email || user?.email || null,
    phone: defaults.phone ?? user?.phone ?? '',
    city: defaults.city ?? user?.city ?? '',
  };

  if (fullName || !user?.fullName) {
    updates.fullName = fullName || user?.fullName || 'Utilisateur LifeLine';
  }

  if (user) {
    return updateById(user.id, updates);
  }

  return create(updates);
}

module.exports = {
  create,
  findByEmail,
  findByFirebaseUid,
  findById,
  findEmailOwner,
  normalizeEmail,
  updateById,
  upsertFirebaseUser,
};
