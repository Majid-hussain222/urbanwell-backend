const mongoose = require("mongoose");

const NutritionistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  specialization: String,
  experience: Number, // years of experience
  location: String,
  price: Number,
  availableDays: [String],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // linked to Category model
}, { timestamps: true });

module.exports = mongoose.model("Nutritionist", NutritionistSchema);
