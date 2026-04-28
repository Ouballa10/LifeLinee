const { ensureMedicalProfileForUser } = require('../services/profileService');
const { buildQrPayload } = require('../services/qrService');

function isLocalFrontendUrl(value = '') {
  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '0.0.0.0', '::1', 'vercel.com', 'www.vercel.com'].includes(
      url.hostname
    );
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
