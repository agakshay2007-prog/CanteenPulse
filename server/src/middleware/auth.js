const crypto = require('crypto');

/**
 * Cryptographic helper functions for Admin Authentication
 * Uses HMAC-SHA256 to issue signed, tamper-proof bearer tokens with 24-hour expiration.
 */

const getSecretKey = () => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ [SECURITY WARNING] ADMIN_SECRET is not configured in production environment. A strong high-entropy secret must be set.');
    }
    return 'canteenpulse_secure_admin_hmac_secret_2026';
  }
  return secret;
};

const getConfiguredPasscode = () => {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ [SECURITY WARNING] ADMIN_PASSCODE is not configured in production environment. Default demo passcode disabled in production.');
      return '';
    }
    return 'admin123';
  }
  return passcode;
};

/**
 * Generate a signed token: base64(payload).signature
 */
function generateAdminToken(username = 'canteen_admin') {
  const secret = getSecretKey();
  const payload = {
    role: 'ADMIN',
    username,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours validity
  };

  const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('base64url');

  return `${payloadString}.${signature}`;
}

/**
 * Verify a signed token
 */
function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadString, signature] = parts;
  const secret = getSecretKey();

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('base64url');

  // Timing safe equality check for HMAC signature to prevent side-channel timing attacks
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadString, 'base64url').toString('utf8'));
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Timing-safe string comparison for admin passcode verification
 */
function verifyPasscode(inputPasscode) {
  if (!inputPasscode || typeof inputPasscode !== 'string') return false;

  const target = getConfiguredPasscode();
  const inputBuffer = Buffer.from(inputPasscode);
  const targetBuffer = Buffer.from(target);

  if (inputBuffer.length !== targetBuffer.length) {
    // Perform dummy comparison to equalize timing
    crypto.timingSafeEqual(targetBuffer, targetBuffer);
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
}

/**
 * Express Middleware: verifyAdmin
 */
const verifyAdmin = (req, res, next) => {
  const configuredPasscode = getConfiguredPasscode();
  const customSecret = getSecretKey();

  // Extract from header x-admin-token or Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'];

  let token = customHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (!token && authHeader) {
    token = authHeader.trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Admin authentication token or x-admin-token header required'
    });
  }

  // 1. Verify signed HMAC token
  const verifiedPayload = verifyAdminToken(token);
  if (verifiedPayload) {
    req.admin = verifiedPayload;
    req.isAdmin = true;
    return next();
  }

  // 2. Fallback check for direct passcode using constant-time comparison
  if (verifyPasscode(token)) {
    req.admin = { role: 'ADMIN', username: 'canteen_admin', directPasscode: true };
    req.isAdmin = true;
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Invalid or expired administrative credentials'
  });
};

module.exports = {
  generateAdminToken,
  verifyAdminToken,
  verifyPasscode,
  verifyAdmin
};
