// models/WorkoutPlan.js
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: String,
  duration: String,
  rest: String,
  notes: String,
  alternative: String,
}, { _id: false });

const daySchema = new mongoose.Schema({
  day: Number,
  name: String,
  focus: String,
  exercises: [exerciseSchema],
}, { _id: false });

const weekSchema = new mongoose.Schema({
  week: Number,
  focus: String,
  days: [daySchema],
}, { _id: false });

const workoutPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general', 'athletic', 'toning'],
    default: 'general',
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  },
  duration: {
    type: Number,
    default: 45,
  },
  focusArea: {
    type: String,
    default: 'full_body',
  },
  daysPerWeek: {
    type: Number,
    default: 4,
  },
  weeks: [weekSchema],
  warmup: {
    duration: Number,
    exercises: [{
      name: String,
      duration: String,
      notes: String,
    }],
  },
  cooldown: {
    duration: Number,
    exercises: [{
      name: String,
      duration: String,
      notes: String,
    }],
  },
  tips: [String],
  equipment: [String],
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);