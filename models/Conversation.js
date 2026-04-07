// ============================================================
// models/Conversation.js
// ============================================================
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // The regular user (member)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // The professional (either trainer OR nutritionist — one will be set)
  trainer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer',      default: null },
  nutritionist: { type: mongoose.Schema.Types.ObjectId, ref: 'Nutritionist', default: null },

  // Derived from booking if linked
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },

  lastMessage:   { type: String,  default: '' },
  lastMessageAt: { type: Date,    default: Date.now },
  unreadUser:    { type: Number,  default: 0 },  // unread count for the user
  unreadPro:     { type: Number,  default: 0 },  // unread count for the professional
}, { timestamps: true });

// A user can have only one conversation per trainer / per nutritionist
conversationSchema.index({ user: 1, trainer: 1 },      { unique: true, sparse: true });
conversationSchema.index({ user: 1, nutritionist: 1 }, { unique: true, sparse: true });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);