const User = require('../models/User');
const {
  ensureMedicalProfileForUser,
  serializePrivateProfile,
} = require('../services/profileService');
const { verifyFirebaseIdToken } = require('../services/firebaseAuthService');
const { normalizeMedicalProfile } = require('../utils/validators');

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

async function syncFirebaseAccount(req, res, successMessage) {
  const firebaseAccount = await verifyFirebaseIdToken(req.body?.idToken, req);
  const user = await User.upsertFirebaseUser(firebaseAccount, {
    fullName: req.body?.fullName || firebaseAccount.fullName,
    email: firebaseAccount.email,
    phone: req.body?.phone,
    city: req.body?.city,
  });

  const medicalProfile = await ensureMedicalProfileForUser(
    user.id,
    normalizeMedicalProfile({
      bloodType: req.body?.bloodType,
      allergies: req.body?.allergies,
      chronicDiseases: req.body?.chronicDiseases,
      medications: req.body?.medications,
      emergencyContact: req.body?.emergencyContact || {
        name: req.body?.fullName || firebaseAccount.fullName,
        phone: req.body?.phone,
      },
      doctorName: req.body?.doctorName,
      criticalInstructions: req.body?.criticalInstructions,
    })
  );

  return res.json({
    message: successMessage,
    token: firebaseAccount.idToken,
    profile: serializePrivateProfile(user, medicalProfile, getFrontendBaseUrl(req)),
    firebaseProfile: {
      firebaseUid: firebaseAccount.firebaseUid,
      email: firebaseAccount.email,
      fullName: firebaseAccount.fullName,
      photoURL: firebaseAccount.photoURL,
    },
  });
}

exports.firebaseAuth = async (req, res) => {
  try {
    return await syncFirebaseAccount(req, res, 'Firebase session synced successfully.');
  } catch (error) {
    return res.status(401).json({
      message: error.message || 'Unable to sync the Firebase session.',
    });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    return await syncFirebaseAccount(req, res, 'Google sign-in successful.');
  } catch (error) {
    return res.status(401).json({
      message: error.message || 'Unable to sign in with Google.',
    });
  }
};

exports.register = async (req, res) => {
  if (req.body?.idToken) {
    try {
      return await syncFirebaseAccount(req, res, 'LifeLine account created successfully.');
    } catch (error) {
      return res.status(401).json({
        message: error.message || 'Unable to create the account.',
      });
    }
  }

  return res.status(400).json({
    message:
      'LifeLine now uses Firebase Auth for registration. Create the Firebase user first, then call /api/auth/firebase with its idToken.',
  });
};

exports.login = async (req, res) => {
  if (req.body?.idToken) {
    try {
      return await syncFirebaseAccount(req, res, 'Login successful.');
    } catch (error) {
      return res.status(401).json({
        message: error.message || 'Unable to log in.',
      });
    }
  }

  return res.status(400).json({
    message:
      'LifeLine now uses Firebase Auth for login. Sign in with Firebase first, then call /api/auth/firebase with its idToken.',
  });
};
