const crypto = require('crypto');
const MedicalProfile = require('../models/MedicalProfile');

function createQrToken() {
  return `ll_${crypto.randomBytes(10).toString('hex')}`;
}

async function ensureMedicalProfileForUser(userId, defaults = {}) {
  const existingProfile = await MedicalProfile.findByUserProfileId(userId);

  if (existingProfile) {
    const repairUpdates = {};

    if (!existingProfile.qrToken) {
      repairUpdates.qrToken = createQrToken();
    }

    if (!existingProfile.bloodType) {
      repairUpdates.bloodType = defaults.bloodType || 'Unknown';
    }

    if (Object.keys(repairUpdates).length) {
      return MedicalProfile.updateById(existingProfile.id, repairUpdates);
    }

    return existingProfile;
  }

  return MedicalProfile.create({
    userProfileId: userId,
    qrToken: createQrToken(),
    bloodType: defaults.bloodType || 'Unknown',
    allergies: defaults.allergies || [],
    chronicDiseases: defaults.chronicDiseases || [],
    medications: defaults.medications || [],
    emergencyContact: defaults.emergencyContact || {
      name: '',
      phone: '',
      relationship: '',
    },
    doctorName: defaults.doctorName || '',
    criticalInstructions: defaults.criticalInstructions || '',
  });
}

async function updateMedicalProfileForUser(userId, updates = {}) {
  const profile = await ensureMedicalProfileForUser(userId);
  return MedicalProfile.updateById(profile.id, updates);
}

function serializeEmergencyContact(contact = {}) {
  return {
    name: contact?.name || '',
    phone: contact?.phone || '',
    relationship: contact?.relationship || '',
  };
}

function serializePrivateProfile(user, medicalProfile, baseUrl = '') {
  return {
    id: medicalProfile.id,
    userId: user.id,
    firebaseUid: user.firebaseUid || '',
    fullName: user.fullName,
    email: user.email || '',
    phone: user.phone || '',
    city: user.city || '',
    bloodType: medicalProfile.bloodType || 'Unknown',
    allergies: medicalProfile.allergies || [],
    chronicDiseases: medicalProfile.chronicDiseases || [],
    medications: medicalProfile.medications || [],
    emergencyContact: serializeEmergencyContact(medicalProfile.emergencyContact),
    doctorName: medicalProfile.doctorName || '',
    criticalInstructions: medicalProfile.criticalInstructions || '',
    qrToken: medicalProfile.qrToken,
    emergencyUrl: baseUrl ? `${baseUrl}/emergency/${medicalProfile.qrToken}` : '',
  };
}

function serializeEmergencyProfile(profile = {}) {
  return {
    fullName: profile.fullName || '',
    bloodType: profile.bloodType || 'Unknown',
    allergies: profile.allergies || [],
    chronicDiseases: profile.chronicDiseases || [],
    medications: profile.medications || [],
    emergencyContact: serializeEmergencyContact(profile.emergencyContact),
    criticalInstructions: profile.criticalInstructions || '',
  };
}

module.exports = {
  createQrToken,
  ensureMedicalProfileForUser,
  serializePrivateProfile,
  serializeEmergencyProfile,
  updateMedicalProfileForUser,
};
