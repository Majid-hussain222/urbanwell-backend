// ============================================================
// controllers/notificationController.js
// ============================================================
const Notification = require('../models/Notification');

const err = (res, msg, status = 400) => res.status(status).json({ success: false, message: msg });

// ─── GET /api/notifications ───────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const page    = parseInt(req.query.page)  || 1;
    const limit   = parseInt(req.query.limit) || 30;
    const unread  = req.query.unread === 'true' ? { read: false } : {};
    const typeFilter = req.query.type ? { type: req.query.type } : {};

    const filter = { user: req.user._id, ...unread, ...typeFilter };
    const total  = await Notification.countDocuments(filter);

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({
      success: true,
      unreadCount,
      data: notifications,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── PUT /api/notifications/:id/read ─────────────────────────
exports.markRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!notif) return err(res, 'Not found', 404);
    res.json({ success: true, data: notif });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── PUT /api/notifications/mark-all-read ────────────────────
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── DELETE /api/notifications/:id ───────────────────────────
exports.deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notif) return err(res, 'Not found', 404);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── DELETE /api/notifications/clear-all ─────────────────────
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── INTERNAL: Create notification (called from other controllers) ─
exports.createNotification = async ({ userId, type, title, body, action, refModel, refId }) => {
  try {
    const notif = await Notification.create({ user: userId, type, title, body, action, refModel, refId });
    return notif;
  } catch (e) {
    console.error('Notification create error:', e.message);
  }
};