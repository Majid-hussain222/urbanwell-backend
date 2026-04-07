const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  specialty: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    }
  },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // linked to Category model
}, { timestamps: true });

// Add 2dsphere index for geospatial queries
TrainerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Trainer', TrainerSchema);
