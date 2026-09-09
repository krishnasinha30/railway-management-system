// Role middleware checks the identity already loaded by authMiddleware and only allows
// the roles listed for this route. This keeps employee-only and admin-only APIs protected.
module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You are not authorized for this action', errors: [] });
  }

  next();
};
