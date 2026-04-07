
const mongoose = require('mongoose');

const mealPlanRequestSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  dietType:      { type: String, default: 'balanced' },
  goal:          { type: String, default: 'general'  },
  caloriesPerDay:{ type: Number, default: 2000       },
  days:          { type: Number, default: 7          },
  gender:        { type: String, default: 'male'     },
  activityLevel: { type: String, default: 'moderate' },
  allergies:     [{ type: String }],
  dislikes:      [{ type: String }],
  generatedPlan: { type: mongoose.Schema.Types.Mixed }, // stores the full AI JSON
}, { timestamps: true });

mealPlanRequestSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('MealPlanRequest', mealPlanRequestSchema);