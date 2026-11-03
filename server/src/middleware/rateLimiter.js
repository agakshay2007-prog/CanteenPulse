/**
 * Lightweight in-memory sliding-window rate limiter
 * Protects endpoints from brute-force attempts and denial-of-service spikes.
 */

function createRateLimiter({ windowMs = 60 * 1000, max = 60, message = 'Too many requests, please try again later.' }) {
  const requests = new Map();

  // Periodic cleanup of stale entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requests.entries()) {
      const active = timestamps.filter((time) => now - time < windowMs);
      if (active.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, active);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    // Skip rate limiting during automated test suite runs
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const now = Date.now();
    const timestamps = requests.get(ip) || [];

    // Filter timestamps within current sliding window
    const recent = timestamps.filter((time) => now - time < windowMs);

    if (recent.length >= max) {
      const oldest = recent[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds
      });
    }

    recent.push(now);
    requests.set(ip, recent);
    next();
  };
}

// Pre-configured rate limiters
const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  message: 'High traffic detected from your IP. Please wait a moment before retrying.'
});

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: 'Too many admin login attempts. For security, please wait 15 minutes before trying again.'
});

const orderLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 orders per 10 minutes
  message: 'Order creation limit reached. Please wait a few minutes before placing another order.'
});

const crowdLimiter = createRateLimiter({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 5, // 5 requests per 3 minutes
  message: 'Crowd feedback submission limit reached. Please wait before submitting another report.'
});

module.exports = {
  createRateLimiter,
  generalLimiter,
  loginLimiter,
  orderLimiter,
  crowdLimiter
};
