const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT gives us a signed proof of who is logged in. We attach the decoded user to the request
// so protected routes can safely check identity before running controller logic.
const JWT_SECRET = process.env.JWT_SECRET || 'railway-dev-secret';

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required', errors: [] });
    }

    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = await User.findById(payload.id).populate('assignedStation').select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists', errors: [] });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({ success: false, message: 'This account has been blocked by an administrator', errors: [] });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token', errors: [] });
  }
};
