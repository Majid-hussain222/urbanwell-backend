// models/WorkoutLog.js
const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
  },
  workoutName: String,
  exercises: [{
    name: String,
    sets: Number,
    reps: String,
    weight: Number,
    notes: String,
    completed: {
      type: Boolean,
      default: true,
    },
  }],
  duration: {
    type: Number, // minutes
    required: true,
  },
  caloriesBurned: Number,
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  mood: {
    type: String,
    enum: ['energized', 'good', 'tired', 'exhausted'],
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

workoutLogSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);