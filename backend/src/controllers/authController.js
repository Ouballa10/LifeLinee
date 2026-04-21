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

function normalizeApiKey(req) {
  return String(
    process.env.FIREBASE_API_KEY ||
      process.env.VITE_FIREBASE_API_KEY ||
      req.body?.apiKey ||
      ''
  ).trim();
}

async function verifyGoogleAccount(req) {
  const idToken = String(req.body?.idToken || '').trim();

  if (!idToken) {
    throw new Error('Google token is required.');
  }

  const apiKey = normalizeApiKey(req);

  if (!apiKey) {
    throw new Error('Firebase API key is missing for Google sign-in.');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Unable to verify the Google session.');
  }

  const account = payload?.users?.[0];

  if (!account?.email) {
    throw new Error('No email address was returned by Google.');
  }

  if (account.emailVerified === false) {
    throw new Error('The Google email address must be verified before using LifeLine.');
  }

  return {
    email: String(account.email).trim().toLowerCase(),
    fullName: String(account.displayName || req.body?.fullName || '').trim(),
    photoURL: String(account.photoUrl || req.body?.photoURL || '').trim(),
    googleUid: String(account.localId || '').trim(),
  };
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

exports.googleAuth = async (req, res) => {
  try {
    const googleAccount = await verifyGoogleAccount(req);
    let user = await User.findOne({ email: googleAccount.email });

    if (!user) {
      user = await User.create({
        fullName: googleAccount.fullName || 'Utilisateur Google',
        email: googleAccount.email,
        password: hashPassword(
          `google:${googleAccount.googleUid || googleAccount.email}:${Date.now()}`
        ),
        phone: '',
        city: '',
      });
    } else {
      let shouldSaveUser = false;

      if (!String(user.fullName || '').trim() && googleAccount.fullName) {
        user.fullName = googleAccount.fullName;
        shouldSaveUser = true;
      }

      if (shouldSaveUser) {
        await user.save();
      }
    }

    const medicalProfile = await ensureMedicalProfileForUser(user._id);

    return res.json({
      message: 'Google sign-in successful.',
      token: generateToken({ sub: String(user._id), email: user.email }),
      profile: serializePrivateProfile(user, medicalProfile, getFrontendBaseUrl(req)),
      googleProfile: {
        email: googleAccount.email,
        fullName: googleAccount.fullName,
        photoURL: googleAccount.photoURL,
        googleUid: googleAccount.googleUid,
      },
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message || 'Unable to sign in with Google.',
    });
  }
};
