const crypto = require('crypto');
const MedicalProfile = require('../models/MedicalProfile');

function createQrToken() {
  return `ll_${crypto.randomBytes(10).toString('hex')}`;
}

async function ensureMedicalProfileForUser(userId, defaults = {}) {
  let profile = await MedicalProfile.findOne({ userId });

  if (!profile) {
    profile = await MedicalProfile.create({
      userId,
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
      criticalInstructions: defaults.criticalInstructions || '',
    });

    return profile;
  }

  if (!profile.qrToken) {
    profile.qrToken = createQrToken();
  }

  if (!profile.bloodType) {
    profile.bloodType = defaults.bloodType || 'Unknown';
  }

  await profile.save();
  return profile;
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
    id: medicalProfile._id,
    userId: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    city: user.city || '',
    bloodType: medicalProfile.bloodType || 'Unknown',
    allergies: medicalProfile.allergies || [],
    chronicDiseases: medicalProfile.chronicDiseases || [],
    medications: medicalProfile.medications || [],
    emergencyContact: serializeEmergencyContact(medicalProfile.emergencyContact),
    criticalInstructions: medicalProfile.criticalInstructions || '',
    qrToken: medicalProfile.qrToken,
    emergencyUrl: baseUrl ? `${baseUrl}/emergency/${medicalProfile.qrToken}` : '',
  };
}

function serializeEmergencyProfile(user, medicalProfile) {
  return {
    fullName: user.fullName,
    bloodType: medicalProfile.bloodType || 'Unknown',
    allergies: medicalProfile.allergies || [],
    chronicDiseases: medicalProfile.chronicDiseases || [],
    medications: medicalProfile.medications || [],
    emergencyContact: serializeEmergencyContact(medicalProfile.emergencyContact),
    criticalInstructions: medicalProfile.criticalInstructions || '',
  };
}

module.exports = {
  createQrToken,
  ensureMedicalProfileForUser,
  serializePrivateProfile,
  serializeEmergencyProfile,
};
