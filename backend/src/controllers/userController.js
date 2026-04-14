const User = require('../models/User');
const {
  ensureMedicalProfileForUser,
  serializePrivateProfile,
} = require('../services/profileService');
const { normalizeMedicalProfile, normalizePhone } = require('../utils/validators');

function getFrontendBaseUrl(req) {
  return (process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5173').replace(
    /\/+$/,
    ''
  );
}

exports.getCurrentUserProfile = async (req, res) => {
  try {
    const medicalProfile = await ensureMedicalProfileForUser(req.user._id);

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
    const email = String(updates.email || '').trim().toLowerCase();

    if (email && email !== req.user.email) {
      const emailOwner = await User.findOne({ email, _id: { $ne: req.user._id } });

      if (emailOwner) {
        return res.status(409).json({
          message: 'This email address is already used by another account.',
        });
      }

      req.user.email = email;
    }

    if (updates.fullName !== undefined) {
      const fullName = String(updates.fullName || '').trim();

      if (!fullName) {
        return res.status(400).json({
          message: 'Full name is required.',
        });
      }

      req.user.fullName = fullName;
    }

    if (updates.phone !== undefined) {
      req.user.phone = normalizePhone(updates.phone);
    }

    if (updates.city !== undefined) {
      req.user.city = String(updates.city || '').trim();
    }

    await req.user.save();

    const medicalProfile = await ensureMedicalProfileForUser(req.user._id);
    const medicalUpdates = normalizeMedicalProfile(updates);

    if (updates.bloodType !== undefined) {
      medicalProfile.bloodType = medicalUpdates.bloodType;
    }

    if (updates.allergies !== undefined) {
      medicalProfile.allergies = medicalUpdates.allergies;
    }

    if (updates.chronicDiseases !== undefined || updates.conditions !== undefined) {
      medicalProfile.chronicDiseases = medicalUpdates.chronicDiseases;
    }

    if (updates.medications !== undefined) {
      medicalProfile.medications = medicalUpdates.medications;
    }

    if (updates.emergencyContact !== undefined) {
      medicalProfile.emergencyContact = medicalUpdates.emergencyContact;
    }

    if (updates.criticalInstructions !== undefined || updates.notes !== undefined) {
      medicalProfile.criticalInstructions = medicalUpdates.criticalInstructions;
    }

    await medicalProfile.save();

    return res.json({
      message: 'Profile updated successfully.',
      profile: serializePrivateProfile(req.user, medicalProfile, getFrontendBaseUrl(req)),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Unable to update the profile.',
    });
  }
};
