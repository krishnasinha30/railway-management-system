const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true },
  pnrNumber: { type: String, unique: true, sparse: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  journeyDate: { type: Date, required: true },
  boardingStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  destinationStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  travelClass: { type: String, required: true },
  passengerCategory: { type: String, enum: ['General', 'Army', 'Senior Citizen'], default: 'General' },
  passengerCount: { type: Number, min: 1, max: 10, required: true },
  passengers: [{ fullName: String, age: Number, gender: String, berthPreference: String, coachNumber: String, seatNumber: String, bookingStatus: { type: String, enum: ['CNF', 'RAC', 'WL'], default: 'CNF' } }],
  totalFare: { type: Number, default: 0, min: 0 },
  walletAmountPaid: { type: Number, default: 0, min: 0 },
  autoUpgrade: { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ['Mock Wallet', 'Demo UPI', 'Demo Card', 'QR Code Demo', 'Pending'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Paid', 'Refunded', 'Pending'], default: 'Pending' },
  cancellationProtection: { type: Boolean, default: false },
  bookingStatus: { type: String, enum: ['Requested', 'Confirmed', 'Waitlisted', 'Cancelled'], default: 'Requested' },
}, { timestamps: true });
module.exports = mongoose.model('Booking', bookingSchema);
