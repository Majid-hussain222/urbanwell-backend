const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer',      required: false },
  nutritionist: { type: mongoose.Schema.Types.ObjectId, ref: 'Nutritionist', required: false },
  dietitian:    { type: mongoose.Schema.Types.ObjectId, ref: 'Dietitian',    required: false },
  gymPackage:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category',     required: false },
  type:         { type: String, default: 'trainer' },
  date:         { type: Date, required: true },
  bookingDate:  { type: Date },
  sessionType:  { type: String, default: 'General' },
  package:      { type: String },
  timeSlot:     { type: String },
  notes:        { type: String, default: '' },
  price:        { type: Number, default: 0 },
  totalAmount:  { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);