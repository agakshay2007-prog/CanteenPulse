/**
 * Admin Authentication Middleware
 * Validates request header token against server environment passcode
 */

const verifyAdmin = (req, res, next) => {
  const adminSecret = process.env.ADMIN_PASSCODE || 'admin123';
  const customSecret = process.env.ADMIN_SECRET || 'canteenpulse_secret_key_2026';

  const providedToken =
    req.headers['x-admin-token'] ||
    (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));

  if (!providedToken) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Admin credentials or x-admin-token header required'
    });
  }

  if (providedToken === adminSecret || providedToken === customSecret) {
    req.isAdmin = true;
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Invalid administrative credentials'
  });
};

module.exports = {
  verifyAdmin
};

