const EmergencyLog = require('../models/EmergencyLog');
const MedicalProfile = require('../models/MedicalProfile');
const { serializeEmergencyProfile } = require('../services/profileService');

exports.getEmergencyInfo = async (req, res) => {
  try {
    const medicalProfile = await MedicalProfile.findOne({ qrToken: req.params.token }).populate(
      'userId',
      'fullName'
    );

    if (!medicalProfile || !medicalProfile.userId) {
      return res.status(404).json({
        message: 'No emergency medical profile was found for this QR code.',
      });
    }

    return res.json({
      token: req.params.token,
      profile: serializeEmergencyProfile(medicalProfile.userId, medicalProfile),
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
