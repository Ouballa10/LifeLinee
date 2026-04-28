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

function extractPhoneNumber(value = '') {
  const text = String(value || '').trim();
  const matches = text.match(/\+?\d[\d\s().-]{5,}\d/g) || [];

  return (
    matches.find((candidate) => candidate.replace(/\D/g, '').length >= 6)?.trim() || ''
  );
}

function removePhoneFromText(value = '', phone = '') {
  return String(value || '')
    .replace(phone, '')
    .replace(/[-:|,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEmergencyContact(value = {}) {
  if (typeof value === 'string') {
    const phone = extractPhoneNumber(value);
    const parts = value
      .split(/\s*-\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
    const phonePart = parts.find((part) => extractPhoneNumber(part)) || '';
    const namePart =
      parts.find((part) => part !== phonePart && !extractPhoneNumber(part)) || '';

    return {
      name: namePart || removePhoneFromText(value, phone) || (!phone ? parts[0] || '' : ''),
      phone: phone || parts[1] || '',
      relationship: '',
    };
  }

  const name = String(value?.name || '').trim();
  const relationship = String(value?.relationship || '').trim();
  const explicitPhone = normalizePhone(value?.phone);
  const fallbackPhone = extractPhoneNumber([name, relationship].filter(Boolean).join(' '));
  const phone = explicitPhone || fallbackPhone;

  return {
    name: explicitPhone ? name : removePhoneFromText(name, fallbackPhone) || (!fallbackPhone ? name : ''),
    phone,
    relationship,
  };
}

function normalizeMedicalProfile(payload = {}) {
  return {
    bloodType: payload.bloodType || payload.bloodGroup || 'Unknown',
    allergies: splitCsv(payload.allergies),
    chronicDiseases: splitCsv(payload.conditions || payload.chronicDiseases),
    medications: splitCsv(payload.medications),
    emergencyContact: normalizeEmergencyContact(payload.emergencyContact),
    doctorName: String(payload.doctorName || payload.doctor_name || '').trim(),
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
