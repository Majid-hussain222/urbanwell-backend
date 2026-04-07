/**
 * ============================================================
 * GYM MODEL - Partner Gyms
 * ============================================================
 * 
 * Stores partner gym information with geolocation support
 * for nearby gym discovery feature.
 * 
 * ============================================================
 */

const mongoose = require('mongoose');

const GymSchema = new mongoose.Schema({
  // Basic Info
  name: { 
    type: String, 
    required: [true, 'Gym name is required'] 
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'] 
  },
  city: { 
    type: String, 
    required: [true, 'City is required'] 
  },
  phone: { 
    type: String 
  },
  email: { 
    type: String 
  },
  description: { 
    type: String 
  },
  
  // GeoJSON location for geospatial queries
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required']
    }
  },
  
  // Partner Information
  isPartner: { 
    type: Boolean, 
    default: true 
  },
  partnerStatus: { 
    type: String, 
    enum: ['active', 'pending', 'inactive'], 
    default: 'active' 
  },
  
  // Gym Details
  amenities: [String],
  openingHours: {
    weekdays: { type: String, default: '6:00 AM - 10:00 PM' },
    weekends: { type: String, default: '8:00 AM - 8:00 PM' }
  },
  
  // Images
  images: [String],
  logo: String,
  
  // Ratings
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: { 
    type: Number, 
    default: 0 
  },
  
  // Google Places Integration
  googlePlaceId: String,
  
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

// Create 2dsphere index for geospatial queries (find nearby gyms)
GymSchema.index({ location: '2dsphere' });

// Text index for search
GymSchema.index({ name: 'text', city: 'text', description: 'text' });

// Update timestamp on save
GymSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Gym', GymSchema);