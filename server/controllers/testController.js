const { sendTestEmail } = require('../services/emailService');

exports.sendTestEmail = async (req, res) => {
  try {
    const result = await sendTestEmail(req.body.email);
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error(`[email:test] Delivery failed: ${error.message}`);
    res.status(502).json({ success: false, error: error.message });
  }
};
