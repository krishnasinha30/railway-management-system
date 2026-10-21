const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { sendTestEmail } = require('../controllers/testController');

const validateEmail = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
};

/**
 * POST /api/tests/send-test-email
 * Diagnostic endpoint accepting { "email": "user@example.com" }
 * Returns deliverability status in real time
 */
router.post(
  '/send-test-email',
  body('email').trim().isEmail().withMessage('A valid recipient email is required'),
  validateEmail,
  sendTestEmail
);

module.exports = router;
