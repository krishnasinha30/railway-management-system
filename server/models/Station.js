const mongoose = require('mongoose');
const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  stationCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  city: { type: String, required: true, trim: true },
  totalPlatforms: { type: Number, required: true, min: 1 },
  platforms: [String],
}, { timestamps: true });
module.exports = mongoose.model('Station', stationSchema);
