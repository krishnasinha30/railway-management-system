const { jsPDF } = require('jspdf');

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const COLORS = {
  plum: [36, 8, 48],
  purple: [116, 54, 145],
  ink: [35, 29, 43],
  muted: [101, 94, 111],
  border: [229, 222, 234],
  pale: [248, 245, 250],
  white: [255, 255, 255]
};

const formatDate = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not provided'
    : new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'long',
        timeZone: 'Asia/Kolkata'
      }).format(date);
};

const formatAmount = value => `INR ${new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(Number(value) || 0)}`;

const stationName = station => station?.name || station?.stationCode || 'Not provided';

const createBookingReceiptPdf = booking => {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  let y = 116;

  const startPage = continued => {
    pdf.addPage();
    pdf.setFillColor(...COLORS.plum);
    pdf.rect(0, 0, PAGE_WIDTH, 86, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(...COLORS.white);
    pdf.text('RC Rail Center', PAGE_WIDTH / 2, 39, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(224, 211, 231);
    pdf.text(continued ? 'E-TICKET / RECEIPT (CONTINUED)' : 'E-TICKET / RECEIPT', PAGE_WIDTH / 2, 59, { align: 'center' });
    y = 112;
  };

  const ensureSpace = height => {
    if (y + height > PAGE_HEIGHT - 82) startPage(true);
  };

  const drawSection = title => {
    ensureSpace(28);
    pdf.setFillColor(...COLORS.purple);
    pdf.roundedRect(PAGE_MARGIN, y, 4, 17, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(...COLORS.ink);
    pdf.text(title.toUpperCase(), PAGE_MARGIN + 13, y + 12);
    y += 25;
  };

  const addField = (label, value) => {
    const text = pdf.splitTextToSize(String(value || 'Not provided'), CONTENT_WIDTH - 18);
    const height = 14 + text.length * 12;
    ensureSpace(height);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(label.toUpperCase(), PAGE_MARGIN + 9, y + 9);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.ink);
    pdf.text(text, PAGE_MARGIN + 9, y + 21);
    y += height;
  };

  pdf.setFillColor(...COLORS.plum);
  pdf.rect(0, 0, PAGE_WIDTH, 86, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(...COLORS.white);
  pdf.text('RC Rail Center', PAGE_WIDTH / 2, 39, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(224, 211, 231);
  pdf.text('E-TICKET / RECEIPT - ACADEMIC SIMULATION', PAGE_WIDTH / 2, 59, { align: 'center' });

  pdf.setFillColor(...COLORS.pale);
  pdf.setDrawColor(...COLORS.border);
  pdf.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 58, 8, 8, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...COLORS.muted);
  pdf.text('PNR / BOOKING REFERENCE', PAGE_MARGIN + 13, y + 17);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(...COLORS.plum);
  pdf.text(String(booking.pnrNumber || 'PNR pending'), PAGE_MARGIN + 13, y + 39);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...COLORS.ink);
  pdf.text(`Reference: ${booking.bookingReference || 'Not provided'}`, PAGE_WIDTH - PAGE_MARGIN - 13, y + 32, { align: 'right' });
  y += 75;

  drawSection('Journey details');
  addField('Train', `${booking.train?.trainNumber || ''} ${booking.train?.trainName || ''}`.trim() || 'Not provided');
  addField('From', `${stationName(booking.boardingStation)}${booking.boardingStation?.stationCode ? ` (${booking.boardingStation.stationCode})` : ''}`);
  addField('To', `${stationName(booking.destinationStation)}${booking.destinationStation?.stationCode ? ` (${booking.destinationStation.stationCode})` : ''}`);
  addField('Journey date', formatDate(booking.journeyDate));
  addField('Departure / arrival', `${booking.train?.scheduledDeparture || 'Not provided'} / ${booking.train?.scheduledArrival || 'Not provided'}`);
  addField('Travel class / category', `${booking.travelClass || 'Not provided'} / ${booking.passengerCategory || 'General'}`);
  addField('Booking status', booking.bookingStatus || 'Not provided');

  drawSection('Passenger details');
  const passengers = booking.passengers?.length
    ? booking.passengers
    : [{ fullName: booking.passenger?.name || 'Passenger' }];
  passengers.forEach((passenger, index) => {
    addField(
      `Passenger ${index + 1}`,
      `${passenger.fullName || booking.passenger?.name || 'Passenger'}; Age: ${passenger.age || 'Not provided'}; Gender: ${passenger.gender || 'Not provided'}; Coach: ${passenger.coachNumber || 'Not allocated'}; Seat: ${passenger.seatNumber || 'Not allocated'}; Status: ${passenger.bookingStatus || booking.bookingStatus || 'Not provided'}`
    );
  });

  drawSection('Payment receipt');
  const walletPaid = Number(booking.walletAmountPaid) || 0;
  const totalFare = Number(booking.totalFare) || 0;
  [
    ['Payment status', booking.paymentStatus || 'Not provided'],
    ['Payment method', booking.paymentMethod || 'Not provided'],
    ['Wallet amount', formatAmount(walletPaid)],
    ['Other payment amount', formatAmount(Math.max(totalFare - walletPaid, 0))],
    ['Total fare', formatAmount(totalFare)]
  ].forEach(([label, value]) => addField(label, value));
  addField('Account holder', booking.passenger?.name || 'Not provided');
  addField('Email address', booking.passenger?.email || 'Not provided');

  const pageCount = pdf.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    pdf.setPage(pageNumber);
    pdf.setDrawColor(...COLORS.border);
    pdf.line(PAGE_MARGIN, PAGE_HEIGHT - 60, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 60);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...COLORS.muted);
    pdf.text('Academic simulation only - not valid for travel or real payment.', PAGE_MARGIN, PAGE_HEIGHT - 42);
    pdf.text(String(pageNumber), PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 42, { align: 'right' });
  }

  return Buffer.from(pdf.output('arraybuffer'));
};

module.exports = { createBookingReceiptPdf };
