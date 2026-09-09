const mongoose = require('mongoose');
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
module.exports = mongoose.model('Announcement', announcementSchema);
