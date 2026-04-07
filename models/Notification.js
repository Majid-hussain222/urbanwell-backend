// ============================================================
// models/Notification.js
// ============================================================
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:  {
    type: String,
    enum: ['booking', 'workout', 'nutrition', 'progress', 'message', 'reminder', 'achievement', 'system'],
    default: 'system',
  },
  title:  { type: String, required: true, maxlength: 200 },
  body:   { type: String, required: true, maxlength: 1000 },
  read:   { type: Boolean, default: false },
  readAt: { type: Date },
  action: {
    label: { type: String },
    href:  { type: String },
  },
  // Optional reference to source entity
  refModel: { type: String },
  refId:    { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);