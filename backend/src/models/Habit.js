const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['good', 'bad'], default: 'good' },
  completedDates: { type: [String], default: [] },
  color: { type: String, default: '#3b82f6' },
  userId: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);
