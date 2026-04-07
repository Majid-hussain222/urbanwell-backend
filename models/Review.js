const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  nutritionist: { type: mongoose.Schema.Types.ObjectId, ref: 'Nutritionist' },
  gymPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'GymPackage' },
}, { timestamps: true });

ReviewSchema.index({ user: 1, trainer: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user: 1, nutritionist: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user: 1, gymPackage: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', ReviewSchema);