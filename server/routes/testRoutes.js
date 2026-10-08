const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const roles = require('../middleware/roleMiddleware');
const { sendTestEmail } = require('../controllers/testController');

const validateEmail = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
};

router.post(
  '/send-test-email',
  auth,
  roles('admin'),
  body('email').trim().isEmail().withMessage('A valid recipient email is required'),
  validateEmail,
  sendTestEmail
);

module.exports = router;
