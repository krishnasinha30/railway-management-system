const nodemailer = require('nodemailer');

const DEFAULT_FROM = 'Rail Center <onboarding@resend.dev>';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);

const formatDate = value => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? escapeHtml(value)
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeZone: 'Asia/Kolkata' }).format(date);
};

const formatAmount = value => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
}).format(Number(value) || 0);

const emailLayout = ({ title, greeting, intro, rows, accent = '#4f46e5' }) => {
  const details = rows.map(([label, value]) => `
    <tr>
      <td style="padding:12px 0;color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;">${escapeHtml(label)}</td>
      <td style="padding:12px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #e2e8f0;">${escapeHtml(value)}</td>
    </tr>`).join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f1f5f9;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">
          <tr><td style="background:${accent};padding:26px 32px;color:#ffffff;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Rail Center</p>
            <h1 style="margin:0;font-size:25px;line-height:1.3;">${escapeHtml(title)}</h1>
          </td></tr>
          <tr><td style="padding:30px 32px;">
            <p style="margin:0 0 12px;font-size:16px;">Hi ${escapeHtml(greeting)},</p>
            <p style="margin:0 0 22px;color:#475569;font-size:15px;line-height:1.7;">${escapeHtml(intro)}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${details}</table>
            <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6;">This is an automated message from Rail Center. Please keep this email for your records.</p>
          </td></tr>
          <tr><td style="padding:18px 32px;background:#f8fafc;color:#64748b;font-size:12px;">Rail Center · Railway Management System</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
};

const bookingDetails = data => [
  ['Reference ID', data.referenceId || 'Not provided'],
  ['Train', data.trainName || 'Not provided'],
  ['Journey date', formatDate(data.journeyDate)],
  ['Pickup location', data.pickupLocation || 'Not provided'],
  ['Total amount', formatAmount(data.totalAmount)]
];

const sendBookingConfirmationEmail = data => deliver({
  to: data.email,
  subject: `Booking Confirmed · ${data.referenceId || 'Rail Center'}`,
  html: emailLayout({
    title: 'Booking Confirmed',
    greeting: data.userName || 'Traveler',
    intro: 'Your booking has been received. Here are the journey details for your records.',
    rows: bookingDetails(data)
  }),
  text: `Hi ${data.userName || 'Traveler'}, your booking is confirmed. Reference: ${data.referenceId || 'Not provided'}. Train: ${data.trainName || 'Not provided'}. Journey date: ${formatDate(data.journeyDate)}. Pickup location: ${data.pickupLocation || 'Not provided'}. Total amount: ${formatAmount(data.totalAmount)}.`
});

const sendBookingCancellationEmail = data => deliver({
  to: data.email,
  subject: `Booking Canceled · ${data.referenceId || 'Rail Center'}`,
  html: emailLayout({
    title: 'Booking Canceled',
    greeting: data.userName || 'Traveler',
    intro: 'Your booking has been canceled. The canceled journey details are included below.',
    rows: bookingDetails(data),
    accent: '#b45309'
  }),
  text: `Hi ${data.userName || 'Traveler'}, your booking has been canceled. Reference: ${data.referenceId || 'Not provided'}. Train: ${data.trainName || 'Not provided'}. Journey date: ${formatDate(data.journeyDate)}. Pickup location: ${data.pickupLocation || 'Not provided'}.`
});

const sendTestEmail = email => deliver({
  to: email,
  subject: 'Rail Center email delivery test',
  html: emailLayout({
    title: 'Email delivery test',
    greeting: 'there',
    intro: 'This sample message confirms that the Rail Center email delivery configuration is working.',
    rows: [['Status', 'Email delivery is configured']]
  }),
  text: 'This sample message confirms that the Rail Center email delivery configuration is working.'
});

const isSmtpConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

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
    throw new Error(result.message || result.error || `Resend request failed with HTTP ${response.status}`);
  }
  if (!result.id) throw new Error('Resend accepted the request without returning a message ID');
  return { messageId: result.id, provider: 'resend' };
}

async function sendWithSmtp(message) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    family: 4,
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

async function deliver(message) {
  if (!message.to) throw new Error('Cannot send email: recipient email address is missing');

  if (process.env.RESEND_API_KEY) {
    try {
      return await sendWithResend(message);
    } catch (resendError) {
      if (!isSmtpConfigured()) throw resendError;
      console.warn(`[email] Resend failed; attempting SMTP fallback: ${resendError.message}`);
      try {
        return await sendWithSmtp(message);
      } catch (smtpError) {
        throw new Error(`Resend failed: ${resendError.message}; SMTP fallback failed: ${smtpError.message}`);
      }
    }
  }

  if (isSmtpConfigured()) return sendWithSmtp(message);

  const messageId = `mock-${Date.now()}`;
  console.info(`[email:mock] No RESEND_API_KEY or complete SMTP configuration; simulated "${message.subject}" to ${message.to} (${messageId})`);
  return { messageId, provider: 'simulation', simulated: true };
}

module.exports = {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  sendTestEmail
};
