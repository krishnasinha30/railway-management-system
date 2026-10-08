const crypto = require('crypto');
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const User = require('../models/User');
const wallet = require('./walletController');
const { success, failure } = require('../utils/apiResponse');
const { sendBookingConfirmationEmail, sendBookingCancellationEmail } = require('../services/emailService');
const { notifyUser, userRoom } = require('../services/notificationService');

const reference = () => `RMS-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
const pnr = () => String(Math.floor(1000000000 + Math.random() * 9000000000));
const journeyDay = value => { const [year, month, day] = String(value).slice(0, 10).split('-').map(Number); return new Date(year, month - 1, day); };
const queueBookingUpdate = (io, booking, { title, message }, emailSender, fallbackUser) => {
  setImmediate(async () => {
    let passenger;
    try {
      await booking.populate('train boardingStation destinationStation passenger');
      passenger = booking.passenger || fallbackUser;
      if (!passenger?.email) throw new Error(`Booking ${booking.bookingReference} has no passenger email address`);
      io.to(userRoom(passenger._id)).emit('bookingUpdated', booking);
      await notifyUser(io, passenger._id, {
        type: 'booking',
        title,
        message,
        metadata: {
          bookingId: booking._id,
          referenceId: booking.bookingReference,
          bookingStatus: booking.bookingStatus
        }
      });
    } catch (error) {
      console.error(`[notification] Could not publish booking update for ${booking.bookingReference}: ${error.message}`);
    }

    if (emailSender && passenger?.email) {
      try {
        const result = await emailSender({
          email: passenger.email,
          userName: passenger.name,
          referenceId: booking.bookingReference,
          trainName: booking.train?.trainName,
          journeyDate: booking.journeyDate,
          pickupLocation: booking.boardingStation?.name || booking.boardingStation?.stationCode || 'Not provided',
          totalAmount: booking.totalFare
        });
        console.info(`[email] ${result.provider} delivery ${result.messageId} for booking ${booking.bookingReference}`);
      } catch (error) {
        console.error(`[email] Could not send booking email for ${booking.bookingReference}: ${error.message}`);
      }
    }
  });
};

const normalizeCaptcha = (str = '') =>
  String(str)
    .trim()
    .toUpperCase()
    .replace(/0/g, 'O')
    .replace(/[1L]/g, 'I');

exports.create = async (req, res, next) => {
  try {
    const count = Number(req.body.passengerCount || req.body.passengers?.length || 1);
    const journeyDate = journeyDay(req.body.journeyDate);
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const latestDate = new Date(todayDate);
    latestDate.setMonth(latestDate.getMonth() + 2);

    if (req.body.boardingStation === req.body.destinationStation) return failure(res, 'Source and destination stations must be different', [], 400);
    if (journeyDate < todayDate || journeyDate > latestDate) return failure(res, 'Journey date cannot be in the past or more than two months ahead', [], 400);

    if (normalizeCaptcha(req.body.captchaAnswer) !== normalizeCaptcha(req.body.captchaChallenge)) {
      return failure(res, 'Captcha is incorrect. Please generate a new one.', [], 400);
    }

    const totalFare = Number(req.body.totalFare || count * 850);
    const paymentLabels = { 'UPI Simulation': 'Demo UPI', 'Card Simulation': 'Demo Card', 'QR Payment Simulation': 'QR Code Demo' };
    const paymentMethod = paymentLabels[req.body.paymentMethod] || req.body.paymentMethod || 'Pending';
    const walletAmountPaid = Math.min(Math.max(Number(req.body.walletAmountPaid || 0), 0), totalFare);

    if (paymentMethod === 'Mock Wallet' && walletAmountPaid < totalFare) return failure(res, 'Use the split-payment option or cover the full fare with your wallet', [], 400);
    if (walletAmountPaid > Number(req.user.walletBalance || 0)) return failure(res, 'Wallet contribution exceeds your available balance', [], 400);

    const train = await Train.findById(req.body.train);
    if (!train) return failure(res, 'Train not found', [], 404);

    if (journeyDate.getTime() === todayDate.getTime() && train.scheduledDeparture) {
      const [hours, minutes] = train.scheduledDeparture.split(':').map(Number);
      const departure = new Date(todayDate);
      departure.setHours(hours, minutes, 0, 0);
      if (departure <= today) return failure(res, 'This train has already departed for today. Choose a future journey date.', [], 400);
    }

    const selectedClass = train.availableClasses?.find(item => item.code === req.body.travelClass);
    if (selectedClass && selectedClass.availableSeats < count) return failure(res, 'Not enough seats are available in this class', [], 400);

    const passengers = (req.body.passengers || []).map((item, index) => ({
      ...item,
      coachNumber: item.coachNumber || 'C1',
      seatNumber: item.seatNumber || String(21 + index),
      bookingStatus: 'CNF'
    }));

    const booking = await Booking.create({
      ...req.body,
      passenger: req.user._id,
      passengerCount: count,
      passengers,
      totalFare,
      walletAmountPaid,
      paymentMethod,
      paymentStatus: paymentMethod === 'Pending' ? 'Pending' : 'Paid',
      bookingStatus: paymentMethod === 'Pending' ? 'Requested' : 'Confirmed',
      bookingReference: reference(),
      pnrNumber: pnr()
    });

    if (walletAmountPaid > 0) {
      await wallet.apply({
        io: req.app.get('io'),
        userId: req.user._id,
        type: 'Debit',
        amount: walletAmountPaid,
        reason: `Booking ${booking.bookingReference}`,
        referenceType: 'Booking',
        referenceId: booking._id,
        createdBy: req.user._id
      });
    }

    if (selectedClass && paymentMethod !== 'Pending') {
      await Train.updateOne(
        { _id: train._id, 'availableClasses.code': req.body.travelClass, 'availableClasses.availableSeats': { $gte: count } },
        { $inc: { 'availableClasses.$.availableSeats': -count } }
      );
    }

    success(res, booking, 'Booking created', 201);
    queueBookingUpdate(
      req.app.get('io'),
      booking,
      { title: 'Booking received', message: `Your booking ${booking.bookingReference} has been ${booking.bookingStatus.toLowerCase()}.` },
      sendBookingConfirmationEmail,
      req.user
    );
  } catch (e) { next(e); }
};

exports.mine = async (req, res, next) => {
  try {
    success(res, await Booking.find({ passenger: req.user._id }).populate('train boardingStation destinationStation').sort({ createdAt: -1 }));
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, passenger: req.user._id };
    const booking = await Booking.findOne(filter).populate('passenger train boardingStation destinationStation');
    if (!booking) return failure(res, 'Booking not found', [], 404);
    success(res, booking);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.bookingStatus = req.query.status;
    if (req.query.search) filter.$or = [{ bookingReference: new RegExp(req.query.search, 'i') }, { pnrNumber: new RegExp(req.query.search, 'i') }];
    success(res, await Booking.find(filter).populate('passenger train boardingStation destinationStation').sort({ createdAt: -1 }));
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return failure(res, 'Booking not found', [], 404);
    const previousStatus = booking.bookingStatus;
    booking.bookingStatus = req.body.bookingStatus;
    await booking.save();
    success(res, booking, 'Booking updated');
    if (previousStatus !== booking.bookingStatus) {
      const canceled = booking.bookingStatus === 'Cancelled';
      queueBookingUpdate(
        req.app.get('io'),
        booking,
        {
          title: canceled ? 'Booking canceled' : 'Booking status updated',
          message: canceled
            ? `Your booking ${booking.bookingReference} was canceled by the administrator.`
            : `Your booking ${booking.bookingReference} status is now ${booking.bookingStatus}.`
        },
        canceled ? sendBookingCancellationEmail : null
      );
    }
  } catch (e) { next(e); }
};

exports.cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, passenger: req.user._id });
    if (!booking || booking.bookingStatus === 'Cancelled') return failure(res, 'Booking cannot be cancelled', [], 400);
    booking.bookingStatus = 'Cancelled';
    const wasPaid = booking.paymentStatus === 'Paid';
    booking.paymentStatus = wasPaid ? 'Refunded' : booking.paymentStatus;
    await booking.save();

    if (wasPaid) {
      await wallet.apply({
        io: req.app.get('io'),
        userId: req.user._id,
        type: 'Refund',
        amount: booking.totalFare,
        reason: `Refund for ${booking.bookingReference}`,
        referenceType: 'Refund',
        referenceId: booking._id,
        createdBy: req.user._id
      });
      await Train.updateOne(
        { _id: booking.train, 'availableClasses.code': booking.travelClass },
        { $inc: { 'availableClasses.$.availableSeats': booking.passengerCount } }
      );
    }

    success(res, booking, 'Demo booking cancelled and refund processed');
    queueBookingUpdate(
      req.app.get('io'),
      booking,
      { title: 'Booking canceled', message: `Your booking ${booking.bookingReference} has been canceled.` },
      sendBookingCancellationEmail,
      req.user
    );
  } catch (e) { next(e); }
};

exports.pnr = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ pnrNumber: req.params.pnr, passenger: req.user._id }).populate('train boardingStation destinationStation');
    if (!booking) return failure(res, 'PNR not found in your simulated bookings', [], 404);
    const waitlisted = booking.bookingStatus === 'Waitlisted';
    success(res, { booking, simulationConfirmationChance: waitlisted ? Math.max(20, 90 - (booking.passengerCount * 8)) : 100 });
  } catch (e) { next(e); }
};
