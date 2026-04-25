const { ensureMedicalProfileForUser } = require('../services/profileService');
const { buildQrPayload } = require('../services/qrService');

function getFrontendBaseUrl(req) {
  return (process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5173').replace(
    /\/+$/,
    ''
  );
}

exports.getMyQRCode = async (req, res) => {
  try {
    const medicalProfile = await ensureMedicalProfileForUser(req.user.id);

    return res.json({
      message: 'QR payload generated.',
      qr: buildQrPayload(medicalProfile.qrToken, getFrontendBaseUrl(req)),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Unable to generate the QR payload.',
    });
  }
};
