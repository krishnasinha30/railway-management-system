const assert = require('node:assert/strict');
const test = require('node:test');
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
  const previousApiKey = process.env.RESEND_API_KEY;
  let requestBody;
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
    if (previousApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousApiKey;
  }
});
