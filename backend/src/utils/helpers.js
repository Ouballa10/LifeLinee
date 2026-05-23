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
  const configuredUrl = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL || '';
  const originUrl = req.get('origin') || '';

  return (
    configuredUrl && !isLocalFrontendUrl(configuredUrl)
      ? configuredUrl
      : originUrl || configuredUrl || 'http://localhost:5173'
  ).replace(/\/+$/, '');
}

module.exports = {
  getFrontendBaseUrl,
  isLocalFrontendUrl,
};
