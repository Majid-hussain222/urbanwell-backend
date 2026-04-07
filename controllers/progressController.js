const Progress = require('../models/Progress')

function getAuthedUserId(req) {
  return req.user?.id || req.user?._id
}

function parseLimit(v, fallback = 50) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(n, 1), 200)
}

function parsePage(v, fallback = 1) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(n, 1)
}

function parseDateOnly(dateStr) {
  // expects 'YYYY-MM-DD'
  if (!dateStr || typeof dateStr !== 'string') return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null
  const start = new Date(`${dateStr}T00:00:00.000Z`)
  if (isNaN(start.getTime())) return null
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return { start, end }
}

/**
 * POST /api/progress
 * Logs a progress entry for the authenticated user.
 * If a progress entry already exists for the same date (day), updates it instead of creating duplicate.
 */
exports.logProgress = async (req, res) => {
  try {
    const userId = getAuthedUserId(req)
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    // Accept either date-only "YYYY-MM-DD" or full ISO; normalize to a Date.
    // Frontend should send YYYY-MM-DD, but we support both.
    let dateValue = req.body?.date
    let dateObj = null

    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      dateObj = new Date(`${dateValue}T00:00:00.000Z`)
    } else if (dateValue) {
      const tmp = new Date(dateValue)
      dateObj = isNaN(tmp.getTime()) ? null : tmp
    }

    // default: now
    if (!dateObj) dateObj = new Date()

    // Build payload (never trust req.body.user)
    const payload = { ...req.body }
    delete payload.user

    // OPTIONAL (recommended): upsert per-day entry to avoid duplicates
    // Determine day range for dateObj (UTC-based)
    const dayStart = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 0, 0, 0, 0))
    const dayEnd = new Date(dayStart)
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1)

    const existing = await Progress.findOne({
      user: userId,
      date: { $gte: dayStart, $lt: dayEnd },
    })

    let saved
    if (existing) {
      Object.assign(existing, payload, { date: dateObj, user: userId })
      saved = await existing.save()
    } else {
      const progress = new Progress({ ...payload, user: userId, date: dateObj })
      saved = await progress.save()
    }

    return res.status(201).json({ success: true, data: saved })
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/progress
 * Returns authenticated user's progress.
 * Supports:
 * - ?date=YYYY-MM-DD (returns entries for that day)
 * - ?limit=1
 * - ?page=1
 * - ?sort=desc|asc (default desc)
 */
exports.getUserProgress = async (req, res) => {
  try {
    const userId = getAuthedUserId(req)
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const limit = parseLimit(req.query.limit, 50)
    const page = parsePage(req.query.page, 1)
    const sortDir = String(req.query.sort || 'desc').toLowerCase() === 'asc' ? 1 : -1

    const query = { user: userId }

    // date filter (day range)
    const dateRange = parseDateOnly(req.query.date)
    if (dateRange) {
      query.date = { $gte: dateRange.start, $lt: dateRange.end }
    }

    const cursor = Progress.find(query)
      .populate('workoutPlan', 'title')
      .sort({ date: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)

    const progress = await cursor
    return res.json({ success: true, data: progress })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/progress/:id
 * Only owner can view.
 */
exports.getProgressById = async (req, res) => {
  try {
    const userId = getAuthedUserId(req)
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const progress = await Progress.findOne({ _id: req.params.id, user: userId }).populate('workoutPlan', 'title')
    if (!progress) return res.status(404).json({ success: false, error: 'Progress entry not found' })

    return res.json({ success: true, data: progress })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/progress/:id
 * Only owner can update.
 */
exports.updateProgress = async (req, res) => {
  try {
    const userId = getAuthedUserId(req)
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const payload = { ...req.body }
    delete payload.user

    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      payload,
      { new: true, runValidators: true }
    )

    if (!progress) return res.status(404).json({ success: false, error: 'Progress entry not found' })
    return res.json({ success: true, data: progress })
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/progress/:id
 * Only owner can delete.
 */
exports.deleteProgress = async (req, res) => {
  try {
    const userId = getAuthedUserId(req)
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const progress = await Progress.findOneAndDelete({ _id: req.params.id, user: userId })
    if (!progress) return res.status(404).json({ success: false, error: 'Progress entry not found' })

    return res.json({ success: true, message: 'Progress entry deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/progress/stats
 * Basic stats for authenticated user.
 */
exports.getProgressStats = async (req, res) => {
  try {
    const userId = getAuthedUserId(req)
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const entries = await Progress.find({ user: userId }).sort({ date: 1 })
    if (!entries.length) return res.json({ success: true, data: { message: 'No progress data yet' } })

    const latest = entries[entries.length - 1]
    const first = entries[0]

    const stats = {
      totalEntries: entries.length,
      firstEntry: first.date,
      latestEntry: latest.date,
      weightChange: latest.weight && first.weight ? (latest.weight - first.weight).toFixed(1) : null,
      currentBMI: latest.bmi,
      currentWeight: latest.weight,
      workoutsCompleted: entries.filter((e) => e.workoutCompleted).length,
    }

    return res.json({ success: true, data: stats })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}