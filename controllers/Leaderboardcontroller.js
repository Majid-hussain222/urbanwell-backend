// ============================================================
// controllers/leaderboardController.js
// ============================================================
const Progress   = require('../models/Progress');
const WorkoutLog = require('../models/WorkoutLog');
const User       = require('../models/User');

const err = (res, msg, status = 400) =>
  res.status(status).json({ success: false, message: msg });

// ─── GET /api/leaderboard?type=streak|workouts|calories|water&period=week|month|alltime
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'streak', period = 'week' } = req.query;
    const limit = 50;

    const now    = new Date();
    let fromDate = null;
    if (period === 'week')  { fromDate = new Date(now); fromDate.setDate(fromDate.getDate() - 7); }
    if (period === 'month') { fromDate = new Date(now); fromDate.setMonth(fromDate.getMonth() - 1); }

    const dateFilter = fromDate ? { date: { $gte: fromDate } } : {};

    let entries = [];

    if (type === 'streak') {
      // Compute streak per user from Progress logs
      const allProgress = await Progress.find(dateFilter)
        .select('user date')
        .sort({ user: 1, date: -1 });

      // Group by user
      const byUser = {};
      allProgress.forEach(p => {
        const uid = p.user.toString();
        if (!byUser[uid]) byUser[uid] = [];
        byUser[uid].push(new Date(p.date));
      });

      const today = new Date(); today.setHours(0,0,0,0);
      const streaks = Object.entries(byUser).map(([uid, dates]) => {
        const unique = [...new Set(dates.map(d => { const x = new Date(d); x.setHours(0,0,0,0); return x.getTime(); }))]
          .sort((a, b) => b - a);
        let streak = 0;
        for (let i = 0; i < unique.length; i++) {
          const diff = Math.round((today.getTime() - unique[i]) / 86400000);
          if (diff <= i + 1) streak++; else break;
        }
        return { userId: uid, value: streak };
      });

      entries = streaks.sort((a, b) => b.value - a.value).slice(0, limit);
    }

    else if (type === 'workouts') {
      const pipeline = [
        ...(fromDate ? [{ $match: { date: { $gte: fromDate } } }] : []),
        { $group: { _id: '$user', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: limit },
      ];
      const results = await WorkoutLog.aggregate(pipeline);
      entries = results.map(r => ({ userId: r._id.toString(), value: r.value }));
    }

    else if (type === 'calories' || type === 'water') {
      const field = type === 'calories' ? 'caloriesConsumed' : 'water';
      const pipeline = [
        ...(fromDate ? [{ $match: { date: { $gte: fromDate } } }] : []),
        { $match: { [field]: { $gt: 0 } } },
        { $group: { _id: '$user', total: { $sum: `$${field}` }, count: { $sum: 1 } } },
        { $project: { value: { $round: [{ $divide: ['$total', '$count'] }, 0] } } },
        { $sort: { value: -1 } },
        { $limit: limit },
      ];
      const results = await Progress.aggregate(pipeline);
      entries = results.map(r => ({ userId: r._id.toString(), value: r.value }));
    }

    // Hydrate with user info (name, avatar, fitnessGoal)
    const userIds = entries.map(e => e.userId);
    const users   = await User.find({ _id: { $in: userIds } }).select('name avatar fitnessGoal');
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    const result = entries
      .map(e => ({ ...e, ...userMap[e.userId] ? { name: userMap[e.userId].name, avatar: userMap[e.userId].avatar, fitnessGoal: userMap[e.userId].fitnessGoal } : { name: 'Anonymous' } }))
      .filter(e => e.value > 0);

    res.json({ success: true, count: result.length, data: result });
  } catch (e) {
    err(res, e.message, 500);
  }
};