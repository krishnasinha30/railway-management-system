const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Credit', 'Debit', 'Refund'], required: true },
  amount: { type: Number, required: true, min: 0 }, reason: { type: String, required: true },
  referenceType: { type: String, enum: ['Booking', 'FoodOrder', 'AdminAdjustment', 'Refund', 'Withdrawal', 'PromoCode'], required: true },
  referenceId: mongoose.Schema.Types.ObjectId, balanceAfterTransaction: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('WalletTransaction', schema);
