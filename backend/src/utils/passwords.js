const crypto = require('crypto');

function hashPassword(password = '') {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${hash}`;
}

function verifyPassword(password = '', storedPassword = '') {
  const [salt, storedHash] = String(storedPassword).split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');

  return crypto.timingSafeEqual(
    Buffer.from(storedHash, 'hex'),
    Buffer.from(computedHash, 'hex')
  );
}

module.exports = {
  hashPassword,
  verifyPassword,
};
