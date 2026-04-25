function buildQrPayload(qrToken, baseUrl = '') {
  const emergencyPath = `/emergency/${qrToken}`;

  return {
    qrToken,
    emergencyPath,
    emergencyUrl: baseUrl ? `${baseUrl}${emergencyPath}` : emergencyPath,
    shareUrl: baseUrl ? `${baseUrl}${emergencyPath}` : emergencyPath,
    status: 'ready',
  };
}

module.exports = {
  buildQrPayload,
};
