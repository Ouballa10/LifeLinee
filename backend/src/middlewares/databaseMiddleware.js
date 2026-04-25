const { assertSupabaseConfig } = require('../config/supabase');

module.exports = (req, res, next) => {
  try {
    assertSupabaseConfig();
    return next();
  } catch (error) {
    return res.status(503).json({
      message:
        'La base de donnees LifeLine est indisponible. Verifiez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY cote serveur.',
      code: 'DATABASE_UNAVAILABLE',
      detail: error.message,
    });
  }
};
