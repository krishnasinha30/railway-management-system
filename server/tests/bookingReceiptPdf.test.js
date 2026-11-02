const assert = require('node:assert/strict');
const test = require('node:test');
const dns = require('node:dns/promises');
const { createBookingReceiptPdf } = require('../services/bookingReceiptPdf');
const { sendBookingConfirmationEmail } = require('../services/emailService');

const sampleBooking = () => ({
    bookingReference: 'RMS-2026-ABC123',
    pnrNumber: '1234567890',
    journeyDate: '2026-12-10',
    travelClass: 'AC 3 Tier',
    passengerCategory: 'General',
    passengerCount: 1,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Demo UPI',
    walletAmountPaid: 200,
    totalFare: 850,
    passenger: { name: 'Test Passenger', email: 'passenger@example.com' },
    train: { trainNumber: '12345', trainName: 'Sample Express', scheduledDeparture: '10:30' },
    boardingStation: { name: 'Central', stationCode: 'CTR' },
    destinationStation: { name: 'Terminal', stationCode: 'TML' },
    passengers: [{ fullName: 'Test Passenger', age: 30, gender: 'Other', coachNumber: 'C1', seatNumber: '21' }]
  });

test('creates a PDF ticket and receipt with booking details', () => {
  const receipt = createBookingReceiptPdf(sampleBooking());

  assert.ok(Buffer.isBuffer(receipt));
  assert.equal(receipt.subarray(0, 5).toString(), '%PDF-');
  assert.ok(receipt.toString('latin1').includes('%%EOF'));
});

test('attaches the PDF receipt to a Resend booking email', async () => {
  const previousFetch = global.fetch;
  const previousEnvironment = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    GMAIL_API_USER: process.env.GMAIL_API_USER,
    GMAIL_API_CLIENT_ID: process.env.GMAIL_API_CLIENT_ID,
    GMAIL_API_CLIENT_SECRET: process.env.GMAIL_API_CLIENT_SECRET,
    GMAIL_API_REFRESH_TOKEN: process.env.GMAIL_API_REFRESH_TOKEN
  };
  let requestBody;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.GMAIL_API_USER;
  delete process.env.GMAIL_API_CLIENT_ID;
  delete process.env.GMAIL_API_CLIENT_SECRET;
  delete process.env.GMAIL_API_REFRESH_TOKEN;
  process.env.RESEND_API_KEY = 'test-key';
  global.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({ id: 'test-message-id' }) };
  };

  try {
    const result = await sendBookingConfirmationEmail({
      email: 'passenger@example.com',
      userName: 'Test Passenger',
      referenceId: 'RMS-2026-ABC123',
      journeyDate: '2026-12-10',
      totalFare: 850,
      booking: sampleBooking()
    });

    assert.equal(result.provider, 'resend');
    assert.equal(requestBody.attachments[0].filename, 'RMS-2026-ABC123-ticket.pdf');
    assert.equal(
      Buffer.from(requestBody.attachments[0].content, 'base64').subarray(0, 5).toString(),
      '%PDF-'
    );
  } finally {
    global.fetch = previousFetch;
    for (const [name, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test('sends booking emails and PDF receipts using the Gmail API', async () => {
  const previousFetch = global.fetch;
  const previousEnvironment = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    GMAIL_API_USER: process.env.GMAIL_API_USER,
    GMAIL_API_CLIENT_ID: process.env.GMAIL_API_CLIENT_ID,
    GMAIL_API_CLIENT_SECRET: process.env.GMAIL_API_CLIENT_SECRET,
    GMAIL_API_REFRESH_TOKEN: process.env.GMAIL_API_REFRESH_TOKEN
  };
  const requests = [];
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  Object.assign(process.env, {
    RESEND_API_KEY: 'resend-must-not-be-used',
    SMTP_FROM: 'Rail Center <sender@gmail.com>',
    GMAIL_API_USER: 'sender@gmail.com',
    GMAIL_API_CLIENT_ID: 'test-client-id',
    GMAIL_API_CLIENT_SECRET: 'test-client-secret',
    GMAIL_API_REFRESH_TOKEN: 'test-refresh-token'
  });
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    if (url === 'https://oauth2.googleapis.com/token') {
      return { ok: true, json: async () => ({ access_token: 'test-access-token' }) };
    }
    return { ok: true, json: async () => ({ id: 'gmail-message-id' }) };
  };

  try {
    const result = await sendBookingConfirmationEmail({
      email: 'passenger@example.com',
      userName: 'Test Passenger',
      referenceId: 'RMS-2026-ABC123',
      journeyDate: '2026-12-10',
      totalFare: 850,
      booking: sampleBooking()
    });

    assert.equal(result.provider, 'gmail-api');
    assert.equal(requests.length, 2);
    assert.equal(requests[0].url, 'https://oauth2.googleapis.com/token');
    assert.equal(requests[1].url, 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
    assert.equal(requests[1].options.headers.Authorization, 'Bearer test-access-token');
    const mime = Buffer.from(JSON.parse(requests[1].options.body).raw, 'base64url').toString('utf8');
    assert.ok(mime.includes('To: passenger@example.com'));
    assert.ok(mime.includes('filename="RMS-2026-ABC123-ticket.pdf"'));
    assert.ok(mime.includes(Buffer.from(createBookingReceiptPdf(sampleBooking())).toString('base64').slice(0, 40)));
    assert.ok(!requests.some(request => request.url === 'https://api.resend.com/emails'));
  } finally {
    global.fetch = previousFetch;
    for (const [name, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test('prefers SMTP over Gmail API and Resend when SMTP is configured', async () => {
  const nodemailer = require('nodemailer');
  const originalCreateTransport = nodemailer.createTransport;
  const originalLookup = dns.lookup;
  const previousEnvironment = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    GMAIL_API_USER: process.env.GMAIL_API_USER,
    GMAIL_API_CLIENT_ID: process.env.GMAIL_API_CLIENT_ID,
    GMAIL_API_CLIENT_SECRET: process.env.GMAIL_API_CLIENT_SECRET,
    GMAIL_API_REFRESH_TOKEN: process.env.GMAIL_API_REFRESH_TOKEN
  };
  let smtpOptions;
  let sentMessage;
  let lookupOptions;
  Object.assign(process.env, {
    RESEND_API_KEY: 'resend-must-not-be-used',
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    SMTP_USER: 'sender@gmail.com',
    SMTP_PASS: 'test-app-password',
    SMTP_FROM: 'Rail Center <sender@gmail.com>',
    GMAIL_API_USER: 'sender@gmail.com',
    GMAIL_API_CLIENT_ID: 'test-client-id',
    GMAIL_API_CLIENT_SECRET: 'test-client-secret',
    GMAIL_API_REFRESH_TOKEN: 'test-refresh-token'
  });
  nodemailer.createTransport = options => {
    smtpOptions = options;
    return {
      sendMail: async message => {
        sentMessage = message;
        return { messageId: 'smtp-message-id' };
      }
    };
  };
  dns.lookup = async (_host, options) => {
    lookupOptions = options;
    return { address: '142.250.72.5', family: 4 };
  };

  try {
    const result = await sendBookingConfirmationEmail({
      email: 'passenger@example.com',
      userName: 'Test Passenger',
      referenceId: 'RMS-2026-ABC123',
      journeyDate: '2026-12-10',
      totalFare: 850,
      booking: sampleBooking()
    });

    assert.equal(result.provider, 'smtp');
    assert.equal(result.messageId, 'smtp-message-id');
    assert.equal(smtpOptions.host, '142.250.72.5');
    assert.equal(smtpOptions.port, 587);
    assert.deepEqual(lookupOptions, { family: 4 });
    assert.equal(smtpOptions.tls.servername, 'smtp.gmail.com');
    assert.equal(smtpOptions.auth.user, 'sender@gmail.com');
    assert.equal(sentMessage.to, 'passenger@example.com');
    assert.equal(sentMessage.attachments[0].filename, 'RMS-2026-ABC123-ticket.pdf');
    assert.equal(sentMessage.attachments[0].content.subarray(0, 5).toString(), '%PDF-');
  } finally {
    nodemailer.createTransport = originalCreateTransport;
    dns.lookup = originalLookup;
    for (const [name, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
