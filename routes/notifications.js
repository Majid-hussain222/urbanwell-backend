// ============================================================
// routes/notifications.js
// ============================================================
const express = require('express');
const router  = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/notificationController');

router.get   ('/',              requireAuth, ctrl.getNotifications);
router.put   ('/mark-all-read', requireAuth, ctrl.markAllRead);
router.delete('/clear-all',     requireAuth, ctrl.clearAll);
router.put   ('/:id/read',      requireAuth, ctrl.markRead);
router.delete('/:id',           requireAuth, ctrl.deleteNotification);

module.exports = router;