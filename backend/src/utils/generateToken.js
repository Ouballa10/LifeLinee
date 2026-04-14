const crypto = require('crypto');

function getSecret() {
  return process.env.JWT_SECRET || 'lifeline-secret';
}

function sign(encodedPayload) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(encodedPayload)
    .digest('base64url');
}

function generateToken(payload = {}) {
  const tokenPayload = {
    sub: payload.sub,
    email: payload.email,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyToken(token = '') {
  const [encodedPayload, signature] = String(token).split('.');

  if (!encodedPayload || !signature) {
    throw new Error('Invalid token.');
  }

  if (sign(encodedPayload) !== signature) {
    throw new Error('Invalid token signature.');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));

  if (payload.exp && payload.exp < Date.now()) {
    throw new Error('Token expired.');
  }

  return payload;
}

module.exports = generateToken;
module.exports.verifyToken = verifyToken;
