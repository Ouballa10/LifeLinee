const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { hashPassword, verifyPassword } = require('../utils/passwords');
const {
  ensureMedicalProfileForUser,
  serializePrivateProfile,
} = require('../services/profileService');
const { normalizeMedicalProfile, requireFields } = require('../utils/validators');

function getFrontendBaseUrl(req) {
  return (process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5173').replace(
    /\/+$/,
    ''
  );
}

exports.register = async (req, res) => {
  try {
    const missingFields = requireFields(req.body, ['fullName', 'email', 'password']);

    if (missingFields.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const existingUser = await User.findOne({ email: req.body.email.trim().toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account already exists with this email.',
      });
    }

    const user = await User.create({
      fullName: req.body.fullName.trim(),
      email: req.body.email.trim().toLowerCase(),
      password: hashPassword(req.body.password),
      phone: String(req.body.phone || '').trim(),
      city: String(req.body.city || '').trim(),
    });

    const medicalProfile = await ensureMedicalProfileForUser(
      user._id,
      normalizeMedicalProfile({
        bloodType: req.body.bloodType,
        allergies: req.body.allergies,
        chronicDiseases: req.body.chronicDiseases,
        medications: req.body.medications,
        emergencyContact: req.body.emergencyContact || {
          name: req.body.fullName,
          phone: req.body.phone,
        },
        criticalInstructions: req.body.criticalInstructions,
      })
    );

    return res.status(201).json({
      message: 'LifeLine account created successfully.',
      token: generateToken({ sub: String(user._id), email: user.email }),
      profile: serializePrivateProfile(user, medicalProfile, getFrontendBaseUrl(req)),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Unable to create the account.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const missingFields = requireFields(req.body, ['email', 'password']);

    if (missingFields.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });

    if (!user || !verifyPassword(req.body.password, user.password)) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const medicalProfile = await ensureMedicalProfileForUser(user._id);

    return res.json({
      message: 'Login successful.',
      token: generateToken({ sub: String(user._id), email: user.email }),
      profile: serializePrivateProfile(user, medicalProfile, getFrontendBaseUrl(req)),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Unable to log in.',
    });
  }
};
