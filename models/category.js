const mongoose = require('mongoose');

const CATEGORY_TYPES = [
  'product',
  'supplement',
  'trainer',
  'gymPackage',
  'mealPlan',
  'nutritionist',
  'dietitian',
  'article' // blogs/articles included here
];

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  nameLower: { type: String, index: true },
  type: { type: String, required: true, enum: CATEGORY_TYPES },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  description: { type: String, trim: true, maxlength: 500 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Unique combination of nameLower + type
CategorySchema.index({ nameLower: 1, type: 1 }, { unique: true });

CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) this.nameLower = this.name.trim().toLowerCase();
  next();
});

CategorySchema.statics.allowedTypes = () => CATEGORY_TYPES;

module.exports = mongoose.model('Category', CategorySchema);
