const mongoose = require('mongoose');

const GymPackageSchema = new mongoose.Schema({
  gymName: {
    type: String,
    required: true,
  },
  trainerName: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  durationWeeks: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
  },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // linked to Category model
}, { timestamps: true });

module.exports = mongoose.model('GymPackage', GymPackageSchema);
