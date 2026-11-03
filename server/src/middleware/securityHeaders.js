/**
 * Security Headers Middleware
 * Protects against MIME-sniffing, clickjacking, XSS, and information leakage.
 */

const securityHeaders = (req, res, next) => {
  // Prevent browsers from MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Disallow embedding this application in an iframe to prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable browser XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Restrict referrer data sent on outbound links
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Strict Transport Security (for production HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Remove Express fingerprint header
  res.removeHeader('X-Powered-By');

  next();
};

module.exports = securityHeaders;
