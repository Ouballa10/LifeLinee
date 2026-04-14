const User = require('../models/User');
const { verifyToken } = require('../utils/generateToken');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'User not found for this token.' });
    }

    req.auth = payload;
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Invalid authentication token.' });
  }
};
