const EmergencyLog = require('../models/EmergencyLog');
const MedicalProfile = require('../models/MedicalProfile');
const User = require('../models/User');
const { getSupabaseAdmin } = require('../config/supabase');

function buildEmergencyResponse(user, medicalProfile, qrVisibility) {
  const base = {
    fullName: user?.fullName || user?.full_name || '',
    bloodType: medicalProfile?.bloodType || medicalProfile?.blood_type || 'Unknown',
  };

  if (qrVisibility === 'minimal') {
    return base;
  }

  if (qrVisibility === 'contact') {
    return {
      ...base,
      emergencyContact: {
        name: medicalProfile?.emergencyContact?.name || medicalProfile?.emergency_contact_name || '',
        phone: medicalProfile?.emergencyContact?.phone || medicalProfile?.emergency_contact_phone || '',
      },
    };
  }

  // "full" — all emergency-relevant info
  return {
    ...base,
    allergies: medicalProfile?.allergies || [],
    chronicDiseases: medicalProfile?.chronicDiseases || medicalProfile?.chronic_diseases || [],
    medications: medicalProfile?.medications || [],
    emergencyContact: {
      name: medicalProfile?.emergencyContact?.name || medicalProfile?.emergency_contact_name || '',
      phone: medicalProfile?.emergencyContact?.phone || medicalProfile?.emergency_contact_phone || '',
    },
    doctorName: medicalProfile?.doctorName || medicalProfile?.doctor_name || '',
    doctorPhone: medicalProfile?.doctorPhone || medicalProfile?.doctor_phone || '',
    criticalInstructions: medicalProfile?.criticalInstructions || medicalProfile?.critical_instructions || '',
    weight: medicalProfile?.weight || '',
    height: medicalProfile?.height || '',
  };
}

exports.getEmergencyInfo = async (req, res) => {
  try {
    const qrToken = req.params.token;

    // Fetch medical profile with user info via service role (bypasses RLS)
    const { data: mpRow, error: mpError } = await getSupabaseAdmin()
      .from('medical_profiles')
      .select('*, user_profiles!inner(full_name, phone, city)')
      .eq('qr_token', qrToken)
      .maybeSingle();

    if (mpError) throw new Error(mpError.message);

    if (!mpRow) {
      return res.status(404).json({
        message: 'No emergency medical profile was found for this QR code.',
      });
    }

    const qrVisibility = mpRow.qr_visibility || 'full';
    const user = mpRow.user_profiles || {};
    const medicalProfile = {
      bloodType: mpRow.blood_type || 'Unknown',
      allergies: mpRow.allergies || [],
      chronicDiseases: mpRow.chronic_diseases || [],
      medications: mpRow.medications || [],
      emergencyContact: {
        name: mpRow.emergency_contact_name || '',
        phone: mpRow.emergency_contact_phone || '',
      },
      doctorName: mpRow.doctor_name || '',
      doctorPhone: mpRow.doctor_phone || '',
      criticalInstructions: mpRow.critical_instructions || '',
      weight: mpRow.weight || '',
      height: mpRow.height || '',
    };

    const profile = buildEmergencyResponse(user, medicalProfile, qrVisibility);

    return res.json({
      token: qrToken,
      visibility: qrVisibility,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Unable to load the emergency profile.',
    });
  }
};

exports.logEmergencyAccess = async (req, res) => {
  try {
    await EmergencyLog.create({
      qrToken: req.params.token,
      responder: req.body.responder || 'unknown',
      location: req.body.location || 'not provided',
    });

    return res.status(201).json({
      message: 'Emergency access log received.',
      payload: {
        qrToken: req.params.token,
        responder: req.body.responder || 'unknown',
        location: req.body.location || 'not provided',
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Unable to store the emergency access log.',
    });
  }
};
