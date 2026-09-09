const jwt = require('jsonwebtoken');

// Every successful login or registration creates a signed JWT. The browser stores it in
// localStorage and sends it back as a Bearer token on later API requests.
module.exports = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET || 'railway-dev-secret',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);
