function requireFields(payload = {}, fields = []) {
  return fields.filter((field) => !payload[field]);
}

function splitCsv(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return String(value || '')
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePhone(value = '') {
  return String(value || '').trim();
}

function normalizeEmergencyContact(value = {}) {
  if (typeof value === 'string') {
    const parts = value
      .split(/\s*-\s*/)
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      name: parts[0] || '',
      phone: parts[1] || '',
      relationship: '',
    };
  }

  return {
    name: String(value?.name || '').trim(),
    phone: normalizePhone(value?.phone),
    relationship: String(value?.relationship || '').trim(),
  };
}

function normalizeMedicalProfile(payload = {}) {
  return {
    bloodType: payload.bloodType || payload.bloodGroup || 'Unknown',
    allergies: splitCsv(payload.allergies),
    chronicDiseases: splitCsv(payload.conditions || payload.chronicDiseases),
    medications: splitCsv(payload.medications),
    emergencyContact: normalizeEmergencyContact(payload.emergencyContact),
    criticalInstructions: String(
      payload.criticalInstructions || payload.notes || payload.medicalNotes || ''
    ).trim(),
  };
}

module.exports = {
  requireFields,
  splitCsv,
  normalizeEmergencyContact,
  normalizePhone,
  normalizeMedicalProfile,
};
