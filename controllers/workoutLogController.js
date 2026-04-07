// ============================================================
// controllers/workoutLogController.js
// ============================================================
const WorkoutLog   = require('../models/WorkoutLog');
const { createNotification } = require('./notificationController');

const err = (res, msg, status = 400) => res.status(status).json({ success: false, message: msg });

// ─── GET /api/workouts/history ────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const muscle = req.query.muscle;
    const from   = req.query.from;
    const to     = req.query.to;

    const filter = { user: req.user._id };
    if (muscle) filter.muscleGroups = muscle;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }

    const total = await WorkoutLog.countDocuments(filter);
    const logs  = await WorkoutLog.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Stats
    const allLogs = await WorkoutLog.find({ user: req.user._id }).select('date duration caloriesBurned');
    const totalMins = allLogs.reduce((s, l) => s + (l.duration || 0), 0);
    const totalCals = allLogs.reduce((s, l) => s + (l.caloriesBurned || 0), 0);

    // Streak
    const dates = [...new Set(allLogs.map(l => new Date(l.date).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]); d.setHours(0,0,0,0);
      const diff = Math.round((today - d) / 86400000);
      if (diff <= i + 1) streak++; else break;
    }

    res.json({
      success: true,
      stats: { total: allLogs.length, totalMins, totalCals, streak },
      data: logs,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── GET /api/workouts/history/:id ───────────────────────────
exports.getOne = async (req, res) => {
  try {
    const log = await WorkoutLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return err(res, 'Not found', 404);
    res.json({ success: true, data: log });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── POST /api/workouts/history ──────────────────────────────
exports.createLog = async (req, res) => {
  try {
    const { name, date, duration, caloriesBurned, muscleGroups, difficulty, mood, notes, exercises } = req.body;
    if (!name) return err(res, 'Workout name is required');

    const log = await WorkoutLog.create({
      user: req.user._id,
      name, date, duration, caloriesBurned, muscleGroups, difficulty, mood, notes,
      exercises: exercises || [],
    });

    // Fire achievement notifications
    const total = await WorkoutLog.countDocuments({ user: req.user._id });
    const milestones = [1, 5, 10, 25, 50, 100];
    if (milestones.includes(total)) {
      await createNotification({
        userId:   req.user._id,
        type:     'achievement',
        title:    `🏆 ${total} Workout${total > 1 ? 's' : ''} Logged!`,
        body:     `You've completed ${total} workout session${total > 1 ? 's' : ''} on UrbanWell. Keep going!`,
        action:   { label: 'View History', href: '/workouts/history' },
        refModel: 'WorkoutLog',
        refId:    log._id,
      });
    }

    res.status(201).json({ success: true, data: log });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── PUT /api/workouts/history/:id ───────────────────────────
exports.updateLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!log) return err(res, 'Not found', 404);
    res.json({ success: true, data: log });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── DELETE /api/workouts/history/:id ────────────────────────
exports.deleteLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) return err(res, 'Not found', 404);
    res.json({ success: true, message: 'Workout log deleted' });
  } catch (e) {
    err(res, e.message, 500);
  }
};