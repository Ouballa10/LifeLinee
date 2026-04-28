const User = require('../models/User');
const {
  ensureMedicalProfileForUser,
  serializePrivateProfile,
  updateMedicalProfileForUser,
} = require('../services/profileService');
const { normalizeMedicalProfile, normalizePhone } = require('../utils/validators');

function isLocalFrontendUrl(value = '') {
  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

function getFrontendBaseUrl(req) {
  const configuredUrl = process.env.FRONTEND_URL || '';
  const originUrl = req.get('origin') || '';

  return (
    configuredUrl && !isLocalFrontendUrl(configuredUrl)
      ? configuredUrl
      : originUrl || configuredUrl || 'http://localhost:5173'
  ).replace(/\/+$/, '');
}

exports.getCurrentUserProfile = async (req, res) => {
  try {
    const medicalProfile = await ensureMedicalProfileForUser(req.user.id);

    return res.json({
      profile: serializePrivateProfile(req.user, medicalProfile, getFrontendBaseUrl(req)),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Unable to load the profile.',
    });
  }
};

exports.updateCurrentUserProfile = async (req, res) => {
  try {
    const updates = req.body || {};
    const userUpdates = {};
    const email = String(updates.email || '').trim().toLowerCase();

    if (email && email !== req.user.email) {
      const emailOwner = await User.findEmailOwner(email, req.user.id);

      if (emailOwner) {
        return res.status(409).json({
          message: 'This email address is already used by another account.',
        });
      }

      userUpdates.email = email;
    }

    if (updates.fullName !== undefined) {
      const fullName = String(updates.fullName || '').trim();

      if (!fullName) {
        return res.status(400).json({
          message: 'Full name is required.',
        });
      }

      userUpdates.fullName = fullName;
    }

    if (updates.phone !== undefined) {
      userUpdates.phone = normalizePhone(updates.phone);
    }

    if (updates.city !== undefined) {
      userUpdates.city = String(updates.city || '').trim();
    }

    const nextUser = Object.keys(userUpdates).length
      ? await User.updateById(req.user.id, userUpdates)
      : req.user;

    const medicalUpdates = normalizeMedicalProfile(updates);
    const profileUpdates = {};

    if (updates.bloodType !== undefined) {
      profileUpdates.bloodType = medicalUpdates.bloodType;
    }

    if (updates.allergies !== undefined) {
      profileUpdates.allergies = medicalUpdates.allergies;
    }

    if (updates.chronicDiseases !== undefined || updates.conditions !== undefined) {
      profileUpdates.chronicDiseases = medicalUpdates.chronicDiseases;
    }

    if (updates.medications !== undefined) {
      profileUpdates.medications = medicalUpdates.medications;
    }

    if (updates.emergencyContact !== undefined) {
      profileUpdates.emergencyContact = medicalUpdates.emergencyContact;
    }

    if (updates.doctorName !== undefined || updates.doctor_name !== undefined) {
      profileUpdates.doctorName = medicalUpdates.doctorName;
    }

    if (updates.criticalInstructions !== undefined || updates.notes !== undefined) {
      profileUpdates.criticalInstructions = medicalUpdates.criticalInstructions;
    }

    const medicalProfile = Object.keys(profileUpdates).length
      ? await updateMedicalProfileForUser(nextUser.id, profileUpdates)
      : await ensureMedicalProfileForUser(nextUser.id);

    return res.json({
      message: 'Profile updated successfully.',
      profile: serializePrivateProfile(nextUser, medicalProfile, getFrontendBaseUrl(req)),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Unable to update the profile.',
    });
  }
};
