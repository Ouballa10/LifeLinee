const { getSupabaseAdmin } = require('../config/supabase');

const TABLE = 'medical_profiles';
const PUBLIC_VIEW = 'public_emergency_profiles';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function mapProfile(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    _id: row.id,
    userId: row.user_profile_id,
    userProfileId: row.user_profile_id,
    qrToken: row.qr_token || '',
    bloodType: row.blood_type || 'Unknown',
    allergies: asArray(row.allergies),
    chronicDiseases: asArray(row.chronic_diseases),
    medications: asArray(row.medications),
    emergencyContact: {
      name: row.emergency_contact_name || '',
      phone: row.emergency_contact_phone || '',
      relationship: row.emergency_contact_relationship || '',
    },
    doctorName: row.doctor_name || '',
    criticalInstructions: row.critical_instructions || '',
  };
}

function mapPublicEmergencyProfile(row) {
  if (!row) {
    return null;
  }

  return {
    fullName: row.full_name || '',
    bloodType: row.blood_type || 'Unknown',
    allergies: asArray(row.allergies),
    chronicDiseases: asArray(row.chronic_diseases),
    medications: asArray(row.medications),
    emergencyContact: {
      name: row.emergency_contact_name || '',
      phone: row.emergency_contact_phone || '',
      relationship: '',
    },
    criticalInstructions: row.critical_instructions || '',
    qrToken: row.qr_token || '',
  };
}

function toInsertPayload(payload = {}) {
  return {
    user_profile_id: payload.userProfileId || payload.user_profile_id,
    qr_token: payload.qrToken || payload.qr_token,
    blood_type: payload.bloodType || payload.blood_type || 'Unknown',
    allergies: asArray(payload.allergies),
    chronic_diseases: asArray(payload.chronicDiseases || payload.chronic_diseases),
    medications: asArray(payload.medications),
    emergency_contact_name:
      payload.emergencyContact?.name || payload.emergency_contact_name || '',
    emergency_contact_phone:
      payload.emergencyContact?.phone || payload.emergency_contact_phone || '',
    emergency_contact_relationship:
      payload.emergencyContact?.relationship || payload.emergency_contact_relationship || '',
    doctor_name: payload.doctorName || payload.doctor_name || '',
    critical_instructions:
      payload.criticalInstructions || payload.critical_instructions || '',
  };
}

function toUpdatePayload(updates = {}) {
  const payload = {};

  if (updates.qrToken !== undefined || updates.qr_token !== undefined) {
    payload.qr_token = updates.qrToken || updates.qr_token;
  }

  if (updates.bloodType !== undefined || updates.blood_type !== undefined) {
    payload.blood_type = updates.bloodType ?? updates.blood_type ?? 'Unknown';
  }

  if (updates.allergies !== undefined) {
    payload.allergies = asArray(updates.allergies);
  }

  if (updates.chronicDiseases !== undefined || updates.chronic_diseases !== undefined) {
    payload.chronic_diseases = asArray(updates.chronicDiseases || updates.chronic_diseases);
  }

  if (updates.medications !== undefined) {
    payload.medications = asArray(updates.medications);
  }

  if (updates.emergencyContact !== undefined) {
    payload.emergency_contact_name = updates.emergencyContact?.name || '';
    payload.emergency_contact_phone = updates.emergencyContact?.phone || '';
    payload.emergency_contact_relationship = updates.emergencyContact?.relationship || '';
  }

  if (updates.doctorName !== undefined || updates.doctor_name !== undefined) {
    payload.doctor_name = updates.doctorName ?? updates.doctor_name ?? '';
  }

  if (
    updates.criticalInstructions !== undefined ||
    updates.critical_instructions !== undefined
  ) {
    payload.critical_instructions =
      updates.criticalInstructions ?? updates.critical_instructions ?? '';
  }

  return payload;
}

function throwIfSupabaseError(error, fallbackMessage) {
  if (error) {
    throw new Error(`${fallbackMessage}: ${error.message}`);
  }
}

async function findByUserProfileId(userProfileId) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('user_profile_id', userProfileId)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load the medical profile');
  return mapProfile(data);
}

async function findPublicByQrToken(qrToken) {
  const { data, error } = await getSupabaseAdmin()
    .from(PUBLIC_VIEW)
    .select('*')
    .eq('qr_token', qrToken)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load the emergency profile');
  return mapPublicEmergencyProfile(data);
}

async function create(payload) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert(toInsertPayload(payload))
    .select('*')
    .single();

  throwIfSupabaseError(error, 'Unable to create the medical profile');
  return mapProfile(data);
}

async function updateById(id, updates) {
  const payload = toUpdatePayload(updates);

  if (!Object.keys(payload).length) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();

    throwIfSupabaseError(error, 'Unable to reload the medical profile');
    return mapProfile(data);
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  throwIfSupabaseError(error, 'Unable to update the medical profile');
  return mapProfile(data);
}

module.exports = {
  create,
  findByUserProfileId,
  findPublicByQrToken,
  updateById,
};
