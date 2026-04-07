const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },

  // Body metrics
  weight: { type: Number },
  height: { type: Number },
  bmi: { type: Number },
  bodyFat: { type: Number },
  chest: { type: Number },
  waist: { type: Number },
  hips: { type: Number },

  // Calories
  caloriesConsumed: { type: Number },
  caloriesBurned: { type: Number },

  // Water (both field names accepted)
  water: { type: Number },
  waterIntake: { type: Number },

  // Macros
  protein: { type: Number },
  carbs: { type: Number },
  fat: { type: Number },

  // Activity
  steps: { type: Number },
  sleepHours: { type: Number },
  workoutCompleted: { type: Boolean, default: false },
  workoutPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan' },

  // Notes & mood
  notes: { type: String },
  mood: { type: String, enum: ['great', 'good', 'okay', 'bad'], default: 'good' },

}, { timestamps: true });

// Auto-calculate BMI
ProgressSchema.pre('save', function(next) {
  if (this.weight && this.height) {
    const h = this.height / 100;
    this.bmi = parseFloat((this.weight / (h * h)).toFixed(1));
  }
  // Sync water fields
  if (this.water && !this.waterIntake) this.waterIntake = this.water;
  if (this.waterIntake && !this.water) this.water = this.waterIntake;
  next();
});

module.exports = mongoose.model('Progress', ProgressSchema);