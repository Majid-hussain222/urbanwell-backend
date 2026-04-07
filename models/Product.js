const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // linked to Category model
  price: { type: Number, required: true },
  image: String,
  nutritionalInfo: {
    calories: Number,
    fat: Number,
    protein: Number,
    carbs: Number
  },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
