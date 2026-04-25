const User = require('../models/User');
const { verifyFirebaseIdToken } = require('../services/firebaseAuthService');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    const firebaseAccount = await verifyFirebaseIdToken(token, req);
    const user = await User.upsertFirebaseUser(firebaseAccount, {
      email: firebaseAccount.email,
      fullName: firebaseAccount.fullName,
    });

    req.auth = {
      sub: firebaseAccount.firebaseUid,
      email: firebaseAccount.email,
      provider: 'firebase',
    };
    req.firebaseUser = firebaseAccount;
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Invalid authentication token.' });
  }
};
