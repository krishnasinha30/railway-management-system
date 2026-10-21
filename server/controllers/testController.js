const { sendTestEmail } = require('../services/emailService');

/**
 * Diagnostic Test Email Controller
 * POST /api/tests/send-test-email
 * Body: { "email": "user@example.com" }
 */
exports.sendTestEmail = async (req, res) => {
  try {
    const result = await sendTestEmail(req.body.email);
    res.json({
      success: true,
      messageId: result.messageId,
      provider: result.provider,
      simulated: Boolean(result.simulated),
      message: result.simulated
        ? 'Email simulated (No RESEND_API_KEY or SMTP credentials configured)'
        : `Email dispatched successfully via ${result.provider}`
    });
  } catch (error) {
    console.error(`[email:test] Delivery failed: ${error.message}`);
    res.status(502).json({
      success: false,
      error: error.message
    });
  }
};
