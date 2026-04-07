/**
 * ============================================================
 * PACKAGE MODEL - Gym Membership Packages
 * ============================================================
 */

const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  // Reference to gym
  gym: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Gym', 
    required: true 
  },
  
  // Package details
  name: { 
    type: String, 
    required: [true, 'Package name is required'] 
  },
  description: { 
    type: String 
  },
  
  // Pricing
  price: { 
    type: Number, 
    required: [true, 'Price is required'] 
  },
  currency: { 
    type: String, 
    default: 'PKR' 
  },
  
  // Duration
  duration: { 
    type: Number, 
    required: [true, 'Duration is required'] 
  },
  durationType: { 
    type: String, 
    enum: ['days', 'months', 'years'], 
    default: 'months' 
  },
  
  // Features included
  features: [String],
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save
PackageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Package', PackageSchema);