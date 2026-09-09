const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true, default: '' },
  role: { type: String, enum: ['passenger', 'employee', 'admin'], default: 'passenger' },
  assignedStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
  profileImage: { type: String, default: '' },
  isBlocked: { type: Boolean, default: false },
  walletBalance: { type: Number, default: 0, min: 0 },
  walletCurrency: { type: String, default: 'INR' },
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Train' }],
  savedPassengers: [{
    fullName: { type: String, required: true }, age: { type: Number, min: 1, max: 120, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    berthPreference: { type: String, enum: ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'No Preference'], default: 'No Preference' },
    idType: String, idNumber: String,
  }],
}, { timestamps: true });

userSchema.pre('validate', function validateAssignedStation() {
  if (this.role === 'employee' && !this.assignedStation) {
    this.invalidate('assignedStation', 'Employees must be assigned to a station');
  }
});

userSchema.pre('save', async function save() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = function comparePassword(value) { return bcrypt.compare(value, this.password); };
userSchema.methods.toSafeJSON = function toSafeJSON() { const data = this.toObject(); delete data.password; return data; };
module.exports = mongoose.model('User', userSchema);
