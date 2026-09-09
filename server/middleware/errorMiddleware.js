module.exports = (error, req, res, next) => {
  const status = error.statusCode || (error.code === 11000 ? 409 : error.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ success: false, message: error.message || 'Server error', errors: error.errors ? Object.values(error.errors).map(item => item.message) : [] });
};
