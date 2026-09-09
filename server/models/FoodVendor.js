const mongoose = require('mongoose');
const menuSchema = new mongoose.Schema({ itemName: { type: String, required: true }, description: String, category: String, isVeg: Boolean, price: { type: Number, min: 0, required: true }, image: String }, { _id: true });
const schema = new mongoose.Schema({ name: { type: String, required: true }, station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true }, cuisineTypes: [String], rating: { type: Number, min: 0, max: 5, default: 4 }, isActive: { type: Boolean, default: true }, menu: [menuSchema] }, { timestamps: true });
module.exports = mongoose.model('FoodVendor', schema);
