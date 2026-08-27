const rateLimit = require("express-rate-limit");

/**
 * Strict Rate Limiter for Authentication Routes (Login, Register)
 * Prevents brute-force credential stuffing and automated abuse.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 authentication requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many authentication requests from this IP. Please try again after 15 minutes."
  }
});

module.exports = {
  authRateLimiter
};
