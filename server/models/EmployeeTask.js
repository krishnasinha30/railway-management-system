const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  dueDate: Date,
}, { timestamps: true });
module.exports = mongoose.model('EmployeeTask', taskSchema);
