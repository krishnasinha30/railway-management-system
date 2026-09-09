const mongoose = require('mongoose');
const routeStopSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  arrivalTime: String,
  departureTime: String,
  platformNumber: String,
}, { _id: false });
const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true, trim: true },
  trainName: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Vande Bharat', 'Rajdhani', 'Shatabdi', 'Tejas', 'Duronto', 'Express'], default: 'Express' },
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  routeStops: [routeStopSchema],
  totalDurationMinutes: { type: Number, default: 0, min: 0 },
  operatingDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  scheduledArrival: String,
  scheduledDeparture: String,
  estimatedArrival: String,
  estimatedDeparture: String,
  platformNumber: String,
  status: { type: String, enum: ['On Time', 'Delayed', 'Arrived', 'Departed', 'Cancelled'], default: 'On Time' },
  currentStatus: { type: String, enum: ['On Time', 'Delayed', 'Arrived', 'Departed', 'Cancelled'], default: 'On Time' },
  delayMinutes: { type: Number, default: 0, min: 0 },
  delayReason: { type: String, default: '' },
  currentLocation: { station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' }, progressPercent: { type: Number, min: 0, max: 100, default: 0 }, updatedAt: Date },
  classesAvailable: [String],
  availableClasses: [{ code: String, name: String, baseFare: Number, totalSeats: Number, availableSeats: Number }],
}, { timestamps: true });
trainSchema.pre('validate', function syncStatus() { if (this.isModified('status')) this.currentStatus = this.status; else if (this.isModified('currentStatus')) this.status = this.currentStatus; });
module.exports = mongoose.model('Train', trainSchema);
