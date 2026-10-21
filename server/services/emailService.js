const nodemailer = require('nodemailer');

const DEFAULT_FROM = 'Rail Center <onboarding@resend.dev>';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

// HTML entity escaping for XSS prevention in email rendering
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);

// Indian English date formatter
const formatDate = value => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? escapeHtml(value)
    : new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'full',
        timeZone: 'Asia/Kolkata'
      }).format(date);
};

// Currency formatter for Indian Rupees (₹)
const formatAmount = value => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
}).format(Number(value) || 0);

/**
 * Responsive, branded HTML email template for Rail Center
 */
const buildEmailTemplate = ({
  title,
  subtitle,
  badgeText,
  badgeBg = '#10b981',
  greeting,
  intro,
  referenceId,
  itemName,
  journeyDate,
  pickupLocation,
  totalAmount,
  actionNote,
  accentColor = '#4f46e5'
}) => {
  const formattedFare = formatAmount(totalAmount);
  const formattedDate = formatDate(journeyDate);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light">
    <title>${escapeHtml(title)}</title>
    <!--[if mso]>
    <style type="text/css">
      body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
    <div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${escapeHtml(subtitle || title)} - Reference: ${escapeHtml(referenceId || 'N/A')}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f1f5f9;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(15,23,42,0.04);">
            
            <!-- BRAND HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:32px 36px;color:#ffffff;text-align:left;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">
                        RAIL CENTER
                      </p>
                      <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
                        ${escapeHtml(title)}
                      </h1>
                    </td>
                    <td align="right" valign="top">
                      <span style="display:inline-block;padding:6px 14px;background-color:${badgeBg};color:#ffffff;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;border-radius:9999px;">
                        ${escapeHtml(badgeText)}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- MAIN BODY -->
            <tr>
              <td style="padding:36px;">
                <p style="margin:0 0 10px;font-size:16px;font-weight:700;color:#0f172a;">
                  Hi ${escapeHtml(greeting)},
                </p>
                <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                  ${escapeHtml(intro)}
                </p>

                <!-- AMOUNT & REFERENCE HIGHLIGHT BOX -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:28px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Reference ID</span>
                      <strong style="font-size:17px;font-weight:800;color:#0f172a;letter-spacing:0.5px;">${escapeHtml(referenceId || 'N/A')}</strong>
                    </td>
                    <td align="right" style="padding:18px 20px;">
                      <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Total Amount</span>
                      <strong style="font-size:22px;font-weight:800;color:${accentColor};">${escapeHtml(formattedFare)}</strong>
                    </td>
                  </tr>
                </table>

                <!-- DETAILS BREAKDOWN TABLE -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;border-collapse:collapse;">
                  <tr>
                    <td style="padding:12px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;">Train / Vehicle</td>
                    <td style="padding:12px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #f1f5f9;">${escapeHtml(itemName || 'Standard Express')}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;">Travel Date</td>
                    <td style="padding:12px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #f1f5f9;">${escapeHtml(formattedDate)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;">Pickup / Boarding</td>
                    <td style="padding:12px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #f1f5f9;">${escapeHtml(pickupLocation || 'Station')}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;color:#64748b;font-size:14px;">Total Paid in ₹</td>
                    <td style="padding:12px 0;color:#0f172a;font-size:15px;font-weight:800;text-align:right;">${escapeHtml(formattedFare)}</td>
                  </tr>
                </table>

                ${actionNote ? `
                <div style="background-color:#eff6ff;border-left:4px solid ${accentColor};padding:14px 16px;border-radius:8px;margin-top:20px;">
                  <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.5;">${escapeHtml(actionNote)}</p>
                </div>` : ''}

                <p style="margin:28px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">
                  This is an automated notification from Rail Center. Please keep this email for verification and records.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:22px 36px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0 0 4px;color:#475569;font-size:13px;font-weight:700;">Rail Center Railway System</p>
                <p style="margin:0;color:#94a3b8;font-size:12px;">Fast, secure, and modern railway journey management</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

/**
 * 1. Booking Confirmation Email
 */
const sendBookingConfirmationEmail = data => {
  const trainOrItem = data.trainName || data.vehicleName || data.itemName || 'Express Train';
  const pickup = data.pickupLocation || data.boardingStation || 'Not provided';
  const total = data.totalAmount || data.totalFare || 0;
  const refId = data.referenceId || data.bookingReference || 'N/A';
  const user = data.userName || data.passengerName || 'Traveler';

  return deliver({
    to: data.email,
    subject: `Booking Confirmed [${refId}] · Rail Center`,
    html: buildEmailTemplate({
      title: 'Booking Confirmed',
      subtitle: `Your booking ${refId} is confirmed`,
      badgeText: 'CONFIRMED',
      badgeBg: '#10b981',
      accentColor: '#059669',
      greeting: user,
      intro: 'Thank you for booking with Rail Center! Your journey is confirmed. Please review your booking details below.',
      referenceId: refId,
      itemName: trainOrItem,
      journeyDate: data.journeyDate,
      pickupLocation: pickup,
      totalAmount: total,
      actionNote: 'Please arrive at the boarding station at least 20 minutes prior to scheduled departure with a valid ID.'
    }),
    text: `Hi ${user},\n\nYour booking is confirmed!\n\nReference ID: ${refId}\nTrain / Item: ${trainOrItem}\nJourney Date: ${formatDate(data.journeyDate)}\nPickup Location: ${pickup}\nTotal Amount: ${formatAmount(total)}\n\nThank you for choosing Rail Center.`
  });
};

/**
 * 2. Booking Cancellation Email
 */
const sendBookingCancellationEmail = data => {
  const trainOrItem = data.trainName || data.vehicleName || data.itemName || 'Express Train';
  const pickup = data.pickupLocation || data.boardingStation || 'Not provided';
  const total = data.totalAmount || data.totalFare || 0;
  const refId = data.referenceId || data.bookingReference || 'N/A';
  const user = data.userName || data.passengerName || 'Traveler';

  return deliver({
    to: data.email,
    subject: `Booking Canceled [${refId}] · Rail Center`,
    html: buildEmailTemplate({
      title: 'Booking Canceled',
      subtitle: `Booking ${refId} has been canceled`,
      badgeText: 'CANCELED',
      badgeBg: '#ef4444',
      accentColor: '#dc2626',
      greeting: user,
      intro: 'Your booking has been successfully canceled. Here are the details of the canceled journey for your records.',
      referenceId: refId,
      itemName: trainOrItem,
      journeyDate: data.journeyDate,
      pickupLocation: pickup,
      totalAmount: total,
      actionNote: 'If eligible, the refund has been processed back to your Rail Center wallet or original payment source.'
    }),
    text: `Hi ${user},\n\nYour booking has been canceled.\n\nReference ID: ${refId}\nTrain / Item: ${trainOrItem}\nJourney Date: ${formatDate(data.journeyDate)}\nPickup Location: ${pickup}\nTotal Amount: ${formatAmount(total)}\n\nRail Center Notification.`
  });
};

/**
 * Wallet Credit Notification Email
 */
const sendWalletCreditEmail = data => {
  const amountStr = formatAmount(data.amount);
  const user = data.userName || 'Traveler';

  return deliver({
    to: data.email,
    subject: `Wallet Credited · ${amountStr}`,
    html: buildEmailTemplate({
      title: 'Wallet Credited',
      subtitle: `Credit of ${amountStr} added to your wallet`,
      badgeText: 'CREDITED',
      badgeBg: '#0284c7',
      accentColor: '#0284c7',
      greeting: user,
      intro: `A credit of ${amountStr} has been added to your Rail Center wallet.`,
      referenceId: data.reason || 'Wallet Credit',
      itemName: 'Wallet Balance Top-up',
      journeyDate: new Date(),
      pickupLocation: 'Digital Wallet',
      totalAmount: data.amount,
      actionNote: `Updated Wallet Balance: ${formatAmount(data.walletBalance)}`
    }),
    text: `Hi ${user},\n\n${amountStr} was credited to your Rail Center wallet.\nReason: ${data.reason || 'Wallet credit'}\nUpdated Balance: ${formatAmount(data.walletBalance)}.`
  });
};

/**
 * Diagnostic Test Email
 */
const sendTestEmail = email => deliver({
  to: email,
  subject: 'Rail Center · Email Delivery Test',
  html: buildEmailTemplate({
    title: 'Email Delivery Test',
    subtitle: 'Diagnostic test message',
    badgeText: 'OPERATIONAL',
    badgeBg: '#0ea5e9',
    accentColor: '#0ea5e9',
    greeting: 'Administrator',
    intro: 'This diagnostic test confirms that the Rail Center email notification engine is properly connected and delivering emails in real-time.',
    referenceId: `TEST-${Date.now().toString(36).toUpperCase()}`,
    itemName: 'Diagnostic Health Check',
    journeyDate: new Date(),
    pickupLocation: 'HTTPS Port 443 / SMTP Port 587',
    totalAmount: 0,
    actionNote: 'Your email system is production-ready. You can now receive booking confirmations and cancellation notices.'
  }),
  text: 'Rail Center email delivery test: Your email delivery engine is operational and successfully delivering messages.'
});

const isSmtpConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

/**
 * Resend Dispatcher via HTTPS POST (Port 443) using native fetch()
 * Bypasses cloud outbound port blocks (Render, AWS, DigitalOcean)
 */
async function sendWithResend(message) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.SMTP_FROM || DEFAULT_FROM,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text
    }),
    signal: AbortSignal.timeout(10000)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = result.message || result.error || `Resend HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  if (!result.id) {
    throw new Error('Resend accepted the request but did not return a message ID');
  }

  return { messageId: result.id, provider: 'resend' };
}

/**
 * Nodemailer SMTP Dispatcher with explicit IPv4 family configuration
 * Secondary fallback for local development or custom SMTP servers
 */
async function sendWithSmtp(message) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    family: 4, // Force IPv4 to prevent ENETUNREACH errors on cloud/container environments
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  const result = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text
  });

  return { messageId: result.messageId, provider: 'smtp' };
}

/**
 * Unified Deliver Pipeline:
 * 1. Resend (Primary HTTPS) if RESEND_API_KEY is present
 * 2. Nodemailer SMTP (Secondary Fallback) if SMTP credentials exist
 * 3. Simulation Mode if neither key is set (logs informative mock without crashing)
 */
async function deliver(message) {
  if (!message.to) {
    throw new Error('Cannot send email: recipient address is required');
  }

  // 1. Primary: Resend API via HTTPS
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await sendWithResend(message);
      console.info(`[email:resend] Delivered to ${message.to} (Message ID: ${res.messageId})`);
      return res;
    } catch (resendError) {
      if (!isSmtpConfigured()) {
        throw resendError;
      }
      console.warn(`[email:resend] Failed (${resendError.message}); falling back to SMTP...`);
      try {
        const res = await sendWithSmtp(message);
        console.info(`[email:smtp:fallback] Delivered to ${message.to} (Message ID: ${res.messageId})`);
        return res;
      } catch (smtpError) {
        throw new Error(`Resend failed: ${resendError.message}; SMTP fallback failed: ${smtpError.message}`);
      }
    }
  }

  // 2. Secondary: Nodemailer SMTP
  if (isSmtpConfigured()) {
    const res = await sendWithSmtp(message);
    console.info(`[email:smtp] Delivered to ${message.to} (Message ID: ${res.messageId})`);
    return res;
  }

  // 3. Simulation Mode (Server does NOT crash when keys are missing)
  const messageId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.info(`[email:simulation] No RESEND_API_KEY or SMTP configuration found.`);
  console.info(`[email:simulation] Mocking email "${message.subject}" to ${message.to} (ID: ${messageId})`);
  return { messageId, provider: 'simulation', simulated: true };
}

module.exports = {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  sendWalletCreditEmail,
  sendTestEmail
};
