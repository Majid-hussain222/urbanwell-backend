const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config();

const GymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  isPartner: { type: Boolean, default: true },
  partnerStatus: { type: String, enum: ['active', 'pending', 'inactive'], default: 'active' },
  amenities: [String],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
GymSchema.index({ location: '2dsphere' });
const Gym = mongoose.model('Gym', GymSchema);

const PackageSchema = new mongoose.Schema({
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  duration: { type: Number, required: true },
  durationType: { type: String, enum: ['days', 'months', 'years'], default: 'months' },
  features: [String],
  isActive: { type: Boolean, default: true }
});
const Package = mongoose.model('Package', PackageSchema);

const partnerGyms = [
  { name: 'Spicers Fitness Hub - Gulberg', address: 'Main Boulevard, Gulberg III', city: 'Lahore', phone: '+92-42-35761234', description: 'Premium fitness center', location: { type: 'Point', coordinates: [74.3436, 31.5204] }, amenities: ['Cardio', 'Weights', 'Pool'], isPartner: true, partnerStatus: 'active', rating: 4.8, totalReviews: 245 },
  { name: 'Spicers Fitness Hub - DHA', address: 'Phase 5, DHA', city: 'Lahore', phone: '+92-42-35889900', description: 'Modern gym in DHA', location: { type: 'Point', coordinates: [74.4077, 31.4697] }, amenities: ['CrossFit', 'Yoga', 'Cardio'], isPartner: true, partnerStatus: 'active', rating: 4.7, totalReviews: 189 },
  { name: 'PowerZone Gym', address: 'Model Town Link Road', city: 'Lahore', phone: '+92-42-35432100', description: 'Bodybuilding focused', location: { type: 'Point', coordinates: [74.3089, 31.4834] }, amenities: ['Weights', 'Cardio'], isPartner: true, partnerStatus: 'active', rating: 4.5, totalReviews: 156 },
  { name: 'FitLife Wellness', address: 'Johar Town, Block E', city: 'Lahore', phone: '+92-42-35271800', description: 'Gym and spa', location: { type: 'Point', coordinates: [74.2723, 31.4687] }, amenities: ['Gym', 'Spa', 'Steam'], isPartner: true, partnerStatus: 'active', rating: 4.6, totalReviews: 203 },
  { name: 'Iron Paradise', address: 'Faisal Town', city: 'Lahore', phone: '+92-42-35167890', description: 'Hardcore gym', location: { type: 'Point', coordinates: [74.3001, 31.5123] }, amenities: ['Heavy Weights', 'Powerlifting'], isPartner: true, partnerStatus: 'active', rating: 4.4, totalReviews: 98 }
];

const packageTemplates = [
  { name: 'Basic Monthly', description: 'Gym floor access', price: 5000, duration: 1, durationType: 'months', features: ['Gym Access', 'Locker'] },
  { name: 'Standard Monthly', description: 'Full access with classes', price: 8000, duration: 1, durationType: 'months', features: ['Full Access', 'Classes'] },
  { name: 'Premium Monthly', description: 'All-inclusive', price: 15000, duration: 1, durationType: 'months', features: ['Full Access', '4 PT Sessions'] }
];

async function seed() {
  try {
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');
    
    await Gym.deleteMany({});
    await Package.deleteMany({});
    
    const gyms = await Gym.insertMany(partnerGyms);
    console.log('Inserted ' + gyms.length + ' gyms');
    
    let pkgCount = 0;
    for (const gym of gyms) {
      const pkgs = packageTemplates.map(p => ({ ...p, gym: gym._id }));
      await Package.insertMany(pkgs);
      pkgCount += pkgs.length;
    }
    console.log('Inserted ' + pkgCount + ' packages');
    
    console.log('DONE!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

seed();